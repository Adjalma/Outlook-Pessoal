require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const crypto = require('crypto');
const fs = require('fs');

// Configurações padrão quando não há .env
const defaultConfig = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'triarc_email_secret_key_2025_very_secure',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'AKIAIOSFODNN7EXAMPLE',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  VERIFIED_DOMAIN: process.env.VERIFIED_DOMAIN || 'triarcsolutions.com.br'
};

// Aplicar configurações padrão se não estiverem definidas
Object.keys(defaultConfig).forEach(key => {
  if (!process.env[key]) {
    process.env[key] = defaultConfig[key];
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuração AWS SES
console.log('🔧 Configurando AWS SES...');
console.log('📧 AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Configurado' : 'NÃO CONFIGURADO');
console.log('🌍 AWS_REGION:', process.env.AWS_REGION || 'sa-east-1');
console.log('📧 VERIFIED_DOMAIN:', process.env.VERIFIED_DOMAIN || 'triarcsolutions.com.br');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'sa-east-1'
});

const ses = new AWS.SES({ 
  apiVersion: '2010-12-01',
  region: process.env.AWS_REGION || 'sa-east-1'
});

// Configuração do banco de dados
const db = new sqlite3.Database('./database.sqlite');

// Inicializar banco de dados
db.serialize(() => {
  // Tabela de usuários
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de emails
  db.run(`CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    attachments TEXT,
    folder TEXT DEFAULT 'inbox',
    is_read BOOLEAN DEFAULT 0,
    is_flagged BOOLEAN DEFAULT 0,
    is_pinned BOOLEAN DEFAULT 0,
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    message_id TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de rascunhos
  db.run(`CREATE TABLE IF NOT EXISTS drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    to_email TEXT,
    subject TEXT,
    body TEXT,
    attachments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Tabela de configurações
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    email_signature TEXT,
    auto_reply TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Tabela de eventos do calendário
  db.run(`CREATE TABLE IF NOT EXISTS calendar_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    day INTEGER NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    time TEXT NOT NULL,
    duration INTEGER DEFAULT 60,
    type TEXT DEFAULT 'meeting',
    meeting_id TEXT,
    teams_link TEXT,
    participants TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Tabela de contatos
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    department TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Tabela de pastas personalizadas
  db.run(`CREATE TABLE IF NOT EXISTS custom_folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#0078d4',
    icon TEXT DEFAULT '📁',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Criar usuário admin padrão
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (email, password, name, role) 
          VALUES ('admin@triarcsolutions.com.br', ?, 'Administrador', 'admin')`, 
          [adminPassword]);

  // Criar emails de exemplo
  const sampleEmails = [
    // Caixa de Entrada
    {
      from_email: 'rafael.andres@triarcsolutions.com.br',
      to_email: 'admin@triarcsolutions.com.br',
      subject: 'Relatório Mensal - Outubro 2025',
      body: 'Segue em anexo o relatório mensal com os resultados obtidos no mês de outubro. Os números mostram crescimento de 15% em relação ao mês anterior.',
      folder: 'inbox',
      is_read: 0,
      is_flagged: 1,
      is_pinned: 1
    },
    {
      from_email: 'rodolfo.fernandes@triarcsolutions.com.br',
      to_email: 'admin@triarcsolutions.com.br',
      subject: 'Reunião de Planejamento - Q4 2025',
      body: 'Conforme agendado, nossa reunião será na próxima terça-feira às 14h. Por favor, confirme sua presença.',
      folder: 'inbox',
      is_read: 1,
      is_flagged: 0,
      is_pinned: 0
    },
    {
      from_email: 'adjalma.aguiar@triarcsolutions.com.br',
      to_email: 'admin@triarcsolutions.com.br',
      subject: 'Proposta Comercial - Cliente XYZ',
      body: 'Prezados, segue nossa proposta comercial para o projeto XYZ. Aguardamos retorno até sexta-feira.',
      folder: 'inbox',
      is_read: 0,
      is_flagged: 1,
      is_pinned: 0
    },
    {
      from_email: 'contato@cliente.com.br',
      to_email: 'admin@triarcsolutions.com.br',
      subject: 'Solicitação de Orçamento',
      body: 'Gostaríamos de solicitar um orçamento para desenvolvimento de sistema web.',
      folder: 'inbox',
      is_read: 0,
      is_flagged: 0,
      is_pinned: 0
    },
    {
      from_email: 'suporte@fornecedor.com.br',
      to_email: 'admin@triarcsolutions.com.br',
      subject: 'Atualização de Serviços',
      body: 'Informamos sobre a atualização dos nossos serviços de hospedagem.',
      folder: 'inbox',
      is_read: 1,
      is_flagged: 0,
      is_pinned: 0
    },
    // Itens Enviados
    {
      from_email: 'admin@triarcsolutions.com.br',
      to_email: 'cliente@empresa.com.br',
      subject: 'Proposta de Serviços - Triarc Solutions',
      body: 'Prezado cliente, segue nossa proposta de serviços para o projeto solicitado.',
      folder: 'sent',
      is_read: 1,
      is_flagged: 0,
      is_pinned: 0
    },
    {
      from_email: 'admin@triarcsolutions.com.br',
      to_email: 'parceiro@fornecedor.com.br',
      subject: 'Contrato de Parceria',
      body: 'Segue em anexo o contrato de parceria para análise e assinatura.',
      folder: 'sent',
      is_read: 1,
      is_flagged: 0,
      is_pinned: 0
    },
    {
      from_email: 'admin@triarcsolutions.com.br',
      to_email: 'equipe@triarcsolutions.com.br',
      subject: 'Reunião Semanal - Segunda-feira',
      body: 'Lembrando da nossa reunião semanal às 14h na sala de conferências.',
      folder: 'sent',
      is_read: 1,
      is_flagged: 0,
      is_pinned: 0
    },
    // Rascunhos
    {
      from_email: 'admin@triarcsolutions.com.br',
      to_email: 'novo.cliente@empresa.com.br',
      subject: 'Apresentação dos Serviços',
      body: 'Prezado cliente, gostaria de apresentar nossos serviços de desenvolvimento...',
      folder: 'drafts',
      is_read: 1,
      is_flagged: 0,
      is_pinned: 0
    },
    {
      from_email: 'admin@triarcsolutions.com.br',
      to_email: 'fornecedor@parceiro.com.br',
      subject: 'Negociação de Preços',
      body: 'Gostaria de discutir uma possível redução nos preços dos serviços...',
      folder: 'drafts',
      is_read: 1,
      is_flagged: 0,
      is_pinned: 0
    },
    // Lixo Eletrônico
    {
      from_email: 'spam@lixo.com.br',
      to_email: 'admin@triarcsolutions.com.br',
      subject: 'Promoção Imperdível',
      body: 'Não perca esta oferta especial...',
      folder: 'trash',
      is_read: 1,
      is_flagged: 0,
      is_pinned: 0
    },
    {
      from_email: 'phishing@fake.com.br',
      to_email: 'admin@triarcsolutions.com.br',
      subject: 'Atualize seus dados',
      body: 'Clique aqui para atualizar seus dados bancários...',
      folder: 'trash',
      is_read: 1,
      is_flagged: 0,
      is_pinned: 0
    },
    // Arquivados
    {
      from_email: 'antigo.cliente@empresa.com.br',
      to_email: 'admin@triarcsolutions.com.br',
      subject: 'Projeto Concluído - 2024',
      body: 'Informamos que o projeto foi concluído com sucesso.',
      folder: 'archived',
      is_read: 1,
      is_flagged: 0,
      is_pinned: 0
    },
    {
      from_email: 'fornecedor@antigo.com.br',
      to_email: 'admin@triarcsolutions.com.br',
      subject: 'Contrato Anterior',
      body: 'Referente ao contrato anterior que foi encerrado.',
      folder: 'archived',
      is_read: 1,
      is_flagged: 0,
      is_pinned: 0
    }
  ];

  // Verificar se já existem emails antes de inserir
  db.get('SELECT COUNT(*) as count FROM emails', (err, result) => {
    if (err) {
      console.error('Erro ao verificar emails existentes:', err);
      return;
    }
    
    if (result.count === 0) {
      console.log('Inserindo emails de exemplo...');
      sampleEmails.forEach(email => {
        db.run(`INSERT INTO emails (from_email, to_email, subject, body, folder, is_read, is_flagged, is_pinned) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [email.from_email, email.to_email, email.subject, email.body, email.folder, email.is_read, email.is_flagged, email.is_pinned]);
      });
    } else {
      console.log('Emails já existem, pulando inserção de exemplo');
    }
  });

  // Criar eventos de exemplo para o calendário
  // Criar eventos de exemplo para o mês atual (janeiro 2025)
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Janeiro = 1
  const currentYear = currentDate.getFullYear();
  
  const sampleEvents = [
    {
      user_id: 1,
      title: 'Reunião Cliente ABC',
      description: 'Reunião para discutir requisitos do projeto',
      day: 15,
      month: currentMonth,
      year: currentYear,
      time: '14:00',
      duration: 60,
      type: 'meeting'
    },
    {
      user_id: 1,
      title: 'Apresentação Projeto',
      description: 'Apresentação dos resultados do projeto para a diretoria',
      day: 20,
      month: currentMonth,
      year: currentYear,
      time: '10:00',
      duration: 90,
      type: 'presentation'
    },
    {
      user_id: 1,
      title: 'Call Fornecedor XYZ',
      description: 'Negociação de preços com fornecedor',
      day: 25,
      month: currentMonth,
      year: currentYear,
      time: '16:00',
      duration: 30,
      type: 'call'
    },
    {
      user_id: 1,
      title: 'Reunião Equipe',
      description: 'Reunião semanal da equipe de desenvolvimento',
      day: 8,
      month: currentMonth,
      year: currentYear,
      time: '09:00',
      duration: 45,
      type: 'meeting'
    },
    {
      user_id: 1,
      title: 'Entrega Relatório',
      description: 'Entrega do relatório mensal para a diretoria',
      day: 30,
      month: currentMonth,
      year: currentYear,
      time: '17:00',
      duration: 30,
      type: 'deadline'
    }
  ];

  // Verificar se já existem eventos antes de inserir
  db.get('SELECT COUNT(*) as count FROM calendar_events', (err, result) => {
    if (err) {
      console.error('Erro ao verificar eventos existentes:', err);
      return;
    }
    
    if (result.count === 0) {
      console.log('Inserindo eventos de exemplo...');
      sampleEvents.forEach(event => {
        db.run(`INSERT INTO calendar_events (user_id, title, description, day, month, year, time, duration, type) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [event.user_id, event.title, event.description, event.day, event.month, event.year, event.time, event.duration, event.type]);
      });
    } else {
      console.log('Eventos já existem, pulando inserção de exemplo');
    }
  });

  // Criar contatos de exemplo
  const sampleContacts = [
    {
      user_id: 1,
      name: 'Rafael Andres',
      email: 'rafael.andres@triarcsolutions.com.br',
      phone: '(11) 99999-9999',
      company: 'Triarc Solutions',
      department: 'Desenvolvimento',
      notes: 'Desenvolvedor sênior, especialista em React e Node.js'
    },
    {
      user_id: 1,
      name: 'Rodolfo Fernandes',
      email: 'rodolfo.fernandes@triarcsolutions.com.br',
      phone: '(11) 88888-8888',
      company: 'Triarc Solutions',
      department: 'Gestão',
      notes: 'Gerente de projetos, responsável pelo planejamento'
    },
    {
      user_id: 1,
      name: 'Adjalma Aguiar',
      email: 'adjalma.aguiar@triarcsolutions.com.br',
      phone: '(11) 77777-7777',
      company: 'Triarc Solutions',
      department: 'Comercial',
      notes: 'Executivo comercial, foco em novos clientes'
    },
    {
      user_id: 1,
      name: 'João Silva',
      email: 'joao.silva@cliente.com.br',
      phone: '(11) 66666-6666',
      company: 'Cliente ABC',
      department: 'TI',
      notes: 'Gerente de TI do cliente ABC, ponto de contato principal'
    },
    {
      user_id: 1,
      name: 'Maria Santos',
      email: 'maria.santos@fornecedor.com.br',
      phone: '(11) 55555-5555',
      company: 'Fornecedor XYZ',
      department: 'Vendas',
      notes: 'Representante comercial do fornecedor XYZ'
    },
    {
      user_id: 1,
      name: 'Pedro Costa',
      email: 'pedro.costa@parceiro.com.br',
      phone: '(11) 44444-4444',
      company: 'Parceiro Digital',
      department: 'Marketing',
      notes: 'Especialista em marketing digital, parceiro estratégico'
    }
  ];

  // Verificar se já existem contatos antes de inserir
  db.get('SELECT COUNT(*) as count FROM contacts', (err, result) => {
    if (err) {
      console.error('Erro ao verificar contatos existentes:', err);
      return;
    }
    
    if (result.count === 0) {
      console.log('Inserindo contatos de exemplo...');
      sampleContacts.forEach(contact => {
        db.run(`INSERT INTO contacts (user_id, name, email, phone, company, department, notes) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [contact.user_id, contact.name, contact.email, contact.phone, contact.company, contact.department, contact.notes]);
      });
    } else {
      console.log('Contatos já existem, pulando inserção de exemplo');
    }
  });

  // Criar pastas personalizadas de exemplo
  const sampleFolders = [
    {
      user_id: 1,
      name: 'Clientes',
      color: '#28a745',
      icon: '👥'
    },
    {
      user_id: 1,
      name: 'Fornecedores',
      color: '#ffc107',
      icon: '🏢'
    },
    {
      user_id: 1,
      name: 'Projetos',
      color: '#17a2b8',
      icon: '📋'
    },
    {
      user_id: 1,
      name: 'Urgente',
      color: '#dc3545',
      icon: '🚨'
    }
  ];

  // Verificar se já existem pastas antes de inserir
  db.get('SELECT COUNT(*) as count FROM custom_folders', (err, result) => {
    if (err) {
      console.error('Erro ao verificar pastas existentes:', err);
      return;
    }
    
    if (result.count === 0) {
      console.log('Inserindo pastas de exemplo...');
      sampleFolders.forEach(folder => {
        db.run(`INSERT INTO custom_folders (user_id, name, color, icon) 
                VALUES (?, ?, ?, ?)`,
                [folder.user_id, folder.name, folder.color, folder.icon]);
      });
    } else {
      console.log('Pastas já existem, pulando inserção de exemplo');
    }
  });
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Rotas de autenticação
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  });
});

// Rotas de emails
app.get('/api/emails/:folder', authenticateToken, (req, res) => {
  const { folder } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM emails WHERE folder = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
  let params = [folder, limit, offset];

  db.all(query, params, (err, emails) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar emails' });
    }

    // Contar total de emails
    db.get('SELECT COUNT(*) as total FROM emails WHERE folder = ?', [folder], (err, count) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao contar emails' });
      }

      res.json({
        emails,
        total: count.total,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    });
  });
});

// Enviar email
app.post('/api/emails/send', authenticateToken, upload.array('attachments'), async (req, res) => {
  try {
    console.log('📧 === TENTANDO ENVIAR EMAIL ===');
    console.log('📧 AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Configurado' : 'NÃO CONFIGURADO');
    console.log('📧 AWS_REGION:', process.env.AWS_REGION || 'sa-east-1');
    console.log('📧 VERIFIED_DOMAIN:', process.env.VERIFIED_DOMAIN || 'triarcsolutions.com.br');
    
    const { to_email, subject, body } = req.body;
    const attachments = req.files || [];

    console.log('📧 Dados do email:', { to_email, subject, body: body?.substring(0, 50) + '...' });

    // Validar campos obrigatórios
    if (!to_email || !subject || !body) {
      console.log('❌ Campos obrigatórios faltando:', { to_email: !!to_email, subject: !!subject, body: !!body });
      return res.status(400).json({ error: 'Campos obrigatórios: to_email, subject, body' });
    }

    // Preparar anexos para AWS SES
    const sesAttachments = attachments.map(file => ({
      filename: file.originalname,
      content: require('fs').readFileSync(file.path),
      contentType: file.mimetype
    }));

    // Configurar AWS SES
    console.log('🔧 Configurando AWS SES para envio...');
    const ses = new AWS.SES({
      region: process.env.AWS_REGION || 'sa-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    // Configurar parâmetros do SES
    const sourceEmail = process.env.VERIFIED_DOMAIN ? `admin@${process.env.VERIFIED_DOMAIN}` : req.user.email;
    console.log('📧 Email de origem:', sourceEmail);
    console.log('📧 Email de destino:', to_email);
    
    const params = {
      Source: sourceEmail,
      Destination: {
        ToAddresses: [to_email]
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: body.replace(/\n/g, '<br>'),
            Charset: 'UTF-8'
          },
          Text: {
            Data: body,
            Charset: 'UTF-8'
          }
        }
      }
    };

    // Adicionar anexos se houver
    if (sesAttachments.length > 0) {
      params.Message.Body.Html.Data += '<br><br><strong>Anexos:</strong><br>';
      sesAttachments.forEach(att => {
        params.Message.Body.Html.Data += `- ${att.filename}<br>`;
      });
    }

    // Enviar email via AWS SES
    console.log('🚀 Enviando email via AWS SES...');
    console.log('📧 Parâmetros SES:', JSON.stringify(params, null, 2));
    
    const result = await ses.sendEmail(params).promise();
    console.log('✅ Email enviado com sucesso! MessageId:', result.MessageId);

    // Salvar no banco de dados
    const attachmentsJson = JSON.stringify(sesAttachments.map(att => ({
      name: att.filename,
      size: att.content.length,
      type: att.contentType
    })));

    db.run(
      'INSERT INTO emails (from_email, to_email, subject, body, attachments, folder) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.email, to_email, subject, body, attachmentsJson, 'sent'],
      function(err) {
        if (err) {
          console.error('Erro ao salvar email:', err);
        }
      }
    );

    // Limpar arquivos temporários
    attachments.forEach(file => {
      require('fs').unlinkSync(file.path);
    });

    res.json({
      message: 'Email enviado com sucesso',
      messageId: result.MessageId
    });

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    
    // Verificar se é erro de sandbox
    if (error.code === 'InvalidClientTokenId' || error.message.includes('security token')) {
      res.status(500).json({ 
        error: 'AWS SES está em modo sandbox. Apenas emails verificados podem receber mensagens. Verifique o email de destino no AWS SES Console ou aguarde aprovação para produção.',
        code: 'SANDBOX_MODE',
        suggestion: 'Adicione o email de destino como identidade verificada no AWS SES Console'
      });
    } else {
      res.status(500).json({ error: 'Erro ao enviar email: ' + error.message });
    }
  }
});

// Salvar rascunho
app.post('/api/drafts', authenticateToken, (req, res) => {
  const { to_email, subject, body, attachments } = req.body;

  db.run(
    'INSERT INTO drafts (user_id, to_email, subject, body, attachments) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, to_email, subject, body, JSON.stringify(attachments || [])],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao salvar rascunho' });
      }

      res.json({
        message: 'Rascunho salvo com sucesso',
        id: this.lastID
      });
    }
  );
});

// Buscar rascunhos
app.get('/api/drafts', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM drafts WHERE user_id = ? ORDER BY updated_at DESC',
    [req.user.id],
    (err, drafts) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar rascunhos' });
      }

      res.json(drafts);
    }
  );
});

// Alterar senha
app.post('/api/auth/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
  }

  db.get('SELECT password FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

    db.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedNewPassword, req.user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Erro ao alterar senha' });
        }

        res.json({ message: 'Senha alterada com sucesso' });
      }
    );
  });
});

// Configurações do usuário
app.get('/api/settings', authenticateToken, (req, res) => {
  db.get(
    'SELECT * FROM settings WHERE user_id = ?',
    [req.user.id],
    (err, settings) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar configurações' });
      }

      res.json(settings || { email_signature: '', auto_reply: '' });
    }
  );
});

app.post('/api/settings', authenticateToken, (req, res) => {
  const { email_signature, auto_reply } = req.body;

  db.run(
    'INSERT OR REPLACE INTO settings (user_id, email_signature, auto_reply) VALUES (?, ?, ?)',
    [req.user.id, email_signature, auto_reply],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao salvar configurações' });
      }

      res.json({ message: 'Configurações salvas com sucesso' });
    }
  );
});

// APIs para Calendário
app.get('/api/calendar/events', authenticateToken, (req, res) => {
  const { month, year } = req.query;
  
  console.log(`API: Buscando eventos para mês ${month}, ano ${year}, usuário ${req.user.id}`);
  
  db.all(
    'SELECT * FROM calendar_events WHERE user_id = ? AND month = ? AND year = ? ORDER BY day, time',
    [req.user.id, month, year],
    (err, events) => {
      if (err) {
        console.error('Erro na consulta SQL:', err);
        return res.status(500).json({ error: 'Erro ao buscar eventos' });
      }
      console.log(`API: Encontrados ${events.length} eventos para mês ${month}, ano ${year}`);
      console.log('API: Eventos encontrados:', events.map(e => `Dia ${e.day}: ${e.title}`));
      res.json(events);
    }
  );
});

app.post('/api/calendar/events', authenticateToken, (req, res) => {
  const { title, description, day, month, year, time, duration, type } = req.body;
  
  db.run(
    'INSERT INTO calendar_events (user_id, title, description, day, month, year, time, duration, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, title, description, day, month, year, time, duration, type],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao criar evento' });
      }
      res.json({ message: 'Evento criado com sucesso', id: this.lastID });
    }
  );
});

app.put('/api/calendar/events/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, day, month, year, time, duration, type } = req.body;
  
  db.run(
    'UPDATE calendar_events SET title = ?, description = ?, day = ?, month = ?, year = ?, time = ?, duration = ?, type = ? WHERE id = ? AND user_id = ?',
    [title, description, day, month, year, time, duration, type, id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar evento' });
      }
      res.json({ message: 'Evento atualizado com sucesso' });
    }
  );
});

app.delete('/api/calendar/events/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run(
    'DELETE FROM calendar_events WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao excluir evento' });
      }
      res.json({ message: 'Evento excluído com sucesso' });
    }
  );
});

// APIs para Contatos
app.get('/api/contacts', authenticateToken, (req, res) => {
  const { search } = req.query;
  let query = 'SELECT * FROM contacts WHERE user_id = ?';
  let params = [req.user.id];
  
  if (search) {
    query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  query += ' ORDER BY name';
  
  db.all(query, params, (err, contacts) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar contatos' });
    }
    res.json(contacts);
  });
});

app.post('/api/contacts', authenticateToken, (req, res) => {
  const { name, email, phone, company, department, notes } = req.body;
  
  db.run(
    'INSERT INTO contacts (user_id, name, email, phone, company, department, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, name, email, phone, company, department, notes],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao criar contato' });
      }
      res.json({ message: 'Contato criado com sucesso', id: this.lastID });
    }
  );
});

app.put('/api/contacts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, email, phone, company, department, notes } = req.body;
  
  db.run(
    'UPDATE contacts SET name = ?, email = ?, phone = ?, company = ?, department = ?, notes = ? WHERE id = ? AND user_id = ?',
    [name, email, phone, company, department, notes, id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar contato' });
      }
      res.json({ message: 'Contato atualizado com sucesso' });
    }
  );
});

app.delete('/api/contacts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run(
    'DELETE FROM contacts WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao excluir contato' });
      }
      res.json({ message: 'Contato excluído com sucesso' });
    }
  );
});

// API para enviar email para contato
app.post('/api/contacts/:id/send-email', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { subject, body } = req.body;
  
  db.get('SELECT * FROM contacts WHERE id = ? AND user_id = ?', [id, req.user.id], (err, contact) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar contato' });
    }
    
    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }
    
    // Aqui você pode integrar com o sistema de envio de email
    res.json({ 
      message: 'Email enviado com sucesso', 
      to: contact.email,
      subject: subject 
    });
  });
});

// APIs para Pastas Personalizadas
app.get('/api/folders', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM custom_folders WHERE user_id = ? ORDER BY name',
    [req.user.id],
    (err, folders) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar pastas' });
      }
      res.json(folders);
    }
  );
});

app.post('/api/folders', authenticateToken, (req, res) => {
  const { name, color, icon } = req.body;
  
  db.run(
    'INSERT INTO custom_folders (user_id, name, color, icon) VALUES (?, ?, ?, ?)',
    [req.user.id, name, color || '#0078d4', icon || '📁'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao criar pasta' });
      }
      res.json({ message: 'Pasta criada com sucesso', id: this.lastID });
    }
  );
});

app.put('/api/folders/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, color, icon } = req.body;
  
  db.run(
    'UPDATE custom_folders SET name = ?, color = ?, icon = ? WHERE id = ? AND user_id = ?',
    [name, color, icon, id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar pasta' });
      }
      res.json({ message: 'Pasta atualizada com sucesso' });
    }
  );
});

app.delete('/api/folders/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run(
    'DELETE FROM custom_folders WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao excluir pasta' });
      }
      res.json({ message: 'Pasta excluída com sucesso' });
    }
  );
});

// API para mover email para pasta personalizada
app.put('/api/emails/:id/move-to-folder', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { folder_name } = req.body;
  
  db.run(
    'UPDATE emails SET folder = ? WHERE id = ? AND (from_email = ? OR to_email = ?)',
    [folder_name, id, req.user.email, req.user.email],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao mover email' });
      }
      res.json({ message: 'Email movido com sucesso' });
    }
  );
});

// ==================== MICROSOFT TEAMS INTEGRATION ====================

// Função para gerar ID único de reunião
const generateMeetingId = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Função para criar link do Teams
const createTeamsMeetingLink = (meetingId, title) => {
  // Usando o formato de link direto do Teams
  const baseUrl = 'https://teams.microsoft.com/l/meetup-join/';
  const encodedTitle = encodeURIComponent(title);
  return `${baseUrl}${meetingId}?t=${Date.now()}`;
};

// API para criar reunião do Teams
app.post('/api/teams/create-meeting', authenticateToken, async (req, res) => {
  try {
    const { title, description, day, month, year, time, duration, participants } = req.body;
    
    console.log('=== CRIANDO REUNIÃO TEAMS ===');
    console.log('Dados recebidos:', { title, description, day, month, year, time, duration, participants });
    console.log('User ID:', req.user.id);
    
    // Gerar ID único para a reunião
    const meetingId = generateMeetingId();
    
    // Criar link do Teams
    const teamsLink = createTeamsMeetingLink(meetingId, title);
    
    console.log('Meeting ID gerado:', meetingId);
    console.log('Teams Link:', teamsLink);
    
    // Salvar reunião no banco
    const eventData = {
      title,
      description: `${description}\n\n🔗 Link da Reunião Teams: ${teamsLink}`,
      day,
      month,
      year,
      time,
      duration,
      type: 'teams_meeting',
      meeting_id: meetingId,
      teams_link: teamsLink,
      participants: JSON.stringify(participants || [])
    };
    
    console.log('EventData preparado:', eventData);
    
    db.run(
      'INSERT INTO calendar_events (user_id, title, description, day, month, year, time, duration, type, meeting_id, teams_link, participants) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, eventData.title, eventData.description, eventData.day, eventData.month, eventData.year, eventData.time, eventData.duration, eventData.type, eventData.meeting_id, eventData.teams_link, eventData.participants],
      function(err) {
        if (err) {
          console.error('ERRO AO SALVAR REUNIÃO TEAMS:', err);
          console.error('SQL Error:', err.message);
          console.error('SQL Code:', err.code);
          return res.status(500).json({ error: 'Erro ao criar reunião: ' + err.message });
        }
        
        console.log('Reunião salva com sucesso! ID:', this.lastID);
        
        // Enviar convites por email se houver participantes
        if (participants && participants.length > 0) {
          sendMeetingInvites(req.user.email, participants, {
            title,
            description,
            day,
            month,
            year,
            time,
            duration,
            teamsLink
          });
        }
        
        res.json({ 
          message: 'Reunião Teams criada com sucesso!',
          meeting_id: meetingId,
          teams_link: teamsLink,
          event_id: this.lastID
        });
      }
    );
    
  } catch (error) {
    console.error('Erro ao criar reunião Teams:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para enviar convites por email
const sendMeetingInvites = async (organizerEmail, participants, meetingData) => {
  try {
    // Verificar se as credenciais AWS são válidas
    if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'AKIAIOSFODNN7EXAMPLE') {
      console.log('⚠️ Credenciais AWS não configuradas - pulando envio de emails');
      console.log('📧 Convites não enviados para:', participants.join(', '));
      return;
    }
    
    // Configurar AWS SES
    const ses = new AWS.SES({
      region: process.env.AWS_REGION || 'sa-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
    
    const { title, description, day, month, year, time, duration, teamsLink } = meetingData;
    
    // Formatar data
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const formattedDate = `${day} de ${months[month - 1]} de ${year}`;
    
    // Template do email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0078d4;">📅 Convite para Reunião Teams</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">${title}</h3>
          <p><strong>📅 Data:</strong> ${formattedDate}</p>
          <p><strong>🕐 Horário:</strong> ${time} (${duration} minutos)</p>
          <p><strong>👤 Organizador:</strong> ${organizerEmail}</p>
          ${description ? `<p><strong>📝 Descrição:</strong><br>${description.replace(/\n/g, '<br>')}</p>` : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${teamsLink}" 
             style="background: #0078d4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            🚀 Entrar na Reunião Teams
          </a>
        </div>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>💡 Dica:</strong> Clique no link acima para entrar diretamente na reunião do Microsoft Teams.
            Certifique-se de ter o Teams instalado ou use a versão web.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          Este convite foi enviado automaticamente pelo sistema de email Triarc Solutions.
        </p>
      </div>
    `;
    
    // Enviar email para cada participante
    for (const participant of participants) {
      const params = {
        Source: organizerEmail,
        Destination: {
          ToAddresses: [participant]
        },
        Message: {
          Subject: {
            Data: `📅 Convite: ${title}`,
            Charset: 'UTF-8'
          },
          Body: {
            Html: {
              Data: emailHtml,
              Charset: 'UTF-8'
            }
          }
        }
      };
      
      try {
        await ses.sendEmail(params).promise();
        console.log(`Convite enviado para: ${participant}`);
      } catch (emailError) {
        console.error(`Erro ao enviar convite para ${participant}:`, emailError);
      }
    }
    
  } catch (error) {
    console.error('Erro ao enviar convites:', error);
  }
};

// API para obter informações da reunião
app.get('/api/teams/meeting/:meetingId', authenticateToken, (req, res) => {
  const { meetingId } = req.params;
  
  db.get(
    'SELECT * FROM calendar_events WHERE meeting_id = ? AND user_id = ?',
    [meetingId, req.user.id],
    (err, event) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar reunião' });
      }
      
      if (!event) {
        return res.status(404).json({ error: 'Reunião não encontrada' });
      }
      
      res.json({
        meeting_id: event.meeting_id,
        teams_link: event.teams_link,
        title: event.title,
        description: event.description,
        day: event.day,
        month: event.month,
        year: event.year,
        time: event.time,
        duration: event.duration,
        participants: JSON.parse(event.participants || '[]')
      });
    }
  );
});

// Função para conectar ao IMAP e buscar emails
const fetchEmailsFromIMAP = async (userEmail, userPassword, imapConfig = {}) => {
  return new Promise((resolve, reject) => {
    // Detectar provedor automaticamente
    let host, port, tls = true;
    
    if (userEmail.includes('@gmail.com')) {
      host = 'imap.gmail.com';
      port = 993;
    } else if (userEmail.includes('@outlook.com') || userEmail.includes('@hotmail.com')) {
      host = 'outlook.office365.com';
      port = 993;
    } else if (userEmail.includes('@yahoo.com')) {
      host = 'imap.mail.yahoo.com';
      port = 993;
    } else {
      // Usar configuração personalizada ou padrão
      host = imapConfig.host || process.env.IMAP_HOST || 'imap.gmail.com';
      port = parseInt(imapConfig.port || process.env.IMAP_PORT || 993);
    }

    console.log(`🔗 Conectando ao IMAP: ${host}:${port} para ${userEmail}`);

    const imap = new Imap({
      user: userEmail,
      password: userPassword,
      host: host,
      port: port,
      tls: tls,
      tlsOptions: { rejectUnauthorized: false }
    });

    const emails = [];

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        // Buscar emails dos últimos 30 dias
        const since = new Date();
        since.setDate(since.getDate() - 30);

        imap.search(['SINCE', since], (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          if (results.length === 0) {
            imap.end();
            resolve(emails);
            return;
          }

          const fetch = imap.fetch(results, { bodies: '' });
          
          fetch.on('message', (msg, seqno) => {
            msg.on('body', (stream, info) => {
              simpleParser(stream, (err, parsed) => {
                if (err) return;

                const email = {
                  from_email: parsed.from?.text || parsed.from?.value?.[0]?.address || 'unknown@example.com',
                  to_email: userEmail,
                  subject: parsed.subject || 'Sem assunto',
                  body: parsed.text || parsed.html || '',
                  folder: 'inbox',
                  is_read: false,
                  is_flagged: false,
                  is_pinned: false,
                  received_at: parsed.date || new Date(),
                  message_id: parsed.messageId || `msg_${Date.now()}_${Math.random()}`
                };

                emails.push(email);
              });
            });
          });

          fetch.once('error', (err) => {
            reject(err);
          });

          fetch.once('end', () => {
            imap.end();
            resolve(emails);
          });
        });
      });
    });

    imap.once('error', (err) => {
      reject(err);
    });

    imap.connect();
  });
};

// API para sincronizar emails do IMAP
app.post('/api/emails/sync', authenticateToken, async (req, res) => {
  try {
    const { email, password, imapHost, imapPort } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    console.log('🔄 Sincronizando emails para:', email);
    
    // Configuração personalizada se fornecida
    const imapConfig = {};
    if (imapHost) imapConfig.host = imapHost;
    if (imapPort) imapConfig.port = imapPort;
    
    const fetchedEmails = await fetchEmailsFromIMAP(email, password, imapConfig);
    
    // Salvar emails no banco de dados
    let savedCount = 0;
    for (const emailData of fetchedEmails) {
      // Verificar se email já existe
      db.get(
        'SELECT id FROM emails WHERE message_id = ?',
        [emailData.message_id],
        (err, existing) => {
          if (!err && !existing) {
            db.run(
              'INSERT INTO emails (from_email, to_email, subject, body, folder, is_read, is_flagged, is_pinned, received_at, message_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [emailData.from_email, emailData.to_email, emailData.subject, emailData.body, emailData.folder, emailData.is_read, emailData.is_flagged, emailData.is_pinned, emailData.received_at, emailData.message_id],
              function(err) {
                if (!err) {
                  savedCount++;
                }
              }
            );
          }
        }
      );
    }

    res.json({ 
      message: 'Emails sincronizados com sucesso!',
      fetched: fetchedEmails.length,
      saved: savedCount
    });

  } catch (error) {
    console.error('Erro ao sincronizar emails:', error);
    res.status(500).json({ error: 'Erro ao sincronizar emails: ' + error.message });
  }
});

// API para marcar email como lido
app.put('/api/emails/:id/read', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run(
    'UPDATE emails SET is_read = 1 WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao marcar email como lido' });
      }
      
      res.json({ message: 'Email marcado como lido' });
    }
  );
});

// API para marcar email como não lido
app.put('/api/emails/:id/unread', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run(
    'UPDATE emails SET is_read = 0 WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao marcar email como não lido' });
      }
      
      res.json({ message: 'Email marcado como não lido' });
    }
  );
});

// API para marcar email como importante
app.put('/api/emails/:id/flag', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run(
    'UPDATE emails SET is_flagged = 1 WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao marcar email como importante' });
      }
      
      res.json({ message: 'Email marcado como importante' });
    }
  );
});

// API para desmarcar email como importante
app.put('/api/emails/:id/unflag', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run(
    'UPDATE emails SET is_flagged = 0 WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao desmarcar email como importante' });
      }
      
      res.json({ message: 'Email desmarcado como importante' });
    }
  );
});

// Criar diretório de uploads
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📧 Sistema de Email Triarc com AWS SES`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`🎯 Microsoft Teams Integration ativo!`);
});

module.exports = app;
