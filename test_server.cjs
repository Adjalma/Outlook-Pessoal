const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!', timestamp: new Date().toISOString() });
});

// Rota de login simples
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@triarcsolutions.com.br' && password === 'admin123') {
    res.json({
      token: 'test-token-123',
      user: {
        id: 1,
        email: 'admin@triarcsolutions.com.br',
        name: 'Administrador',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

// Rota de verificação de token
app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  if (token === 'test-token-123') {
    res.json({ valid: true, message: 'Token válido' });
  } else {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Rota de emails simples
app.get('/api/emails/:folder', (req, res) => {
  const { folder } = req.params;
  
  const emails = {
    inbox: [
      { id: 1, from_email: 'rafael.andres@triarcsolutions.com.br', subject: 'Relatório Mensal - Outubro 2025', body: 'Segue em anexo o relatório mensal...', folder: 'inbox', is_read: 0 },
      { id: 2, from_email: 'rodolfo.fernandes@triarcsolutions.com.br', subject: 'Reunião de Planejamento - Q4 2025', body: 'Conforme agendado, nossa reunião...', folder: 'inbox', is_read: 1 },
      { id: 3, from_email: 'adjalma.aguiar@triarcsolutions.com.br', subject: 'Proposta Comercial - Cliente XYZ', body: 'Prezados, segue nossa proposta...', folder: 'inbox', is_read: 0 },
      { id: 4, from_email: 'contato@cliente.com.br', subject: 'Solicitação de Orçamento', body: 'Gostaríamos de solicitar um orçamento...', folder: 'inbox', is_read: 0 },
      { id: 5, from_email: 'suporte@fornecedor.com.br', subject: 'Atualização de Serviços', body: 'Informamos sobre a atualização...', folder: 'inbox', is_read: 1 }
    ],
    sent: [
      { id: 6, from_email: 'admin@triarcsolutions.com.br', to_email: 'cliente@empresa.com.br', subject: 'Proposta de Serviços', body: 'Prezado cliente, segue nossa proposta...', folder: 'sent', is_read: 1 },
      { id: 7, from_email: 'admin@triarcsolutions.com.br', to_email: 'parceiro@fornecedor.com.br', subject: 'Contrato de Parceria', body: 'Segue em anexo o contrato...', folder: 'sent', is_read: 1 },
      { id: 8, from_email: 'admin@triarcsolutions.com.br', to_email: 'equipe@triarcsolutions.com.br', subject: 'Reunião Semanal', body: 'Lembrando da nossa reunião...', folder: 'sent', is_read: 1 }
    ],
    drafts: [
      { id: 9, from_email: 'admin@triarcsolutions.com.br', to_email: 'novo.cliente@empresa.com.br', subject: 'Apresentação dos Serviços', body: 'Prezado cliente, gostaria de apresentar...', folder: 'drafts', is_read: 1 },
      { id: 10, from_email: 'admin@triarcsolutions.com.br', to_email: 'fornecedor@parceiro.com.br', subject: 'Negociação de Preços', body: 'Gostaria de discutir uma possível redução...', folder: 'drafts', is_read: 1 }
    ],
    trash: [
      { id: 11, from_email: 'spam@lixo.com.br', subject: 'Promoção Imperdível', body: 'Não perca esta oferta especial...', folder: 'trash', is_read: 1 },
      { id: 12, from_email: 'phishing@fake.com.br', subject: 'Atualize seus dados', body: 'Clique aqui para atualizar seus dados...', folder: 'trash', is_read: 1 },
      { id: 13, from_email: 'marketing@spam.com.br', subject: 'Oferta Limitada', body: 'Aproveite esta oferta por tempo limitado...', folder: 'trash', is_read: 1 },
      { id: 14, from_email: 'fake@scam.com.br', subject: 'Você ganhou!', body: 'Parabéns! Você foi selecionado...', folder: 'trash', is_read: 1 },
      { id: 15, from_email: 'virus@malware.com.br', subject: 'Arquivo importante', body: 'Abra este arquivo urgentemente...', folder: 'trash', is_read: 1 }
    ],
    archived: [
      { id: 16, from_email: 'antigo.cliente@empresa.com.br', subject: 'Projeto Concluído - 2024', body: 'Informamos que o projeto foi concluído...', folder: 'archived', is_read: 1 },
      { id: 17, from_email: 'fornecedor@antigo.com.br', subject: 'Contrato Anterior', body: 'Referente ao contrato anterior...', folder: 'archived', is_read: 1 },
      { id: 18, from_email: 'ex.funcionario@empresa.com.br', subject: 'Rescisão Contratual', body: 'Comunicamos a rescisão do contrato...', folder: 'archived', is_read: 1 },
      { id: 19, from_email: 'projeto.antigo@cliente.com.br', subject: 'Relatório Final - 2023', body: 'Segue o relatório final do projeto...', folder: 'archived', is_read: 1 },
      { id: 20, from_email: 'parceria.encerrada@fornecedor.com.br', subject: 'Encerramento de Parceria', body: 'Informamos o encerramento da parceria...', folder: 'archived', is_read: 1 }
    ],
    notes: [
      { id: 21, from_email: 'admin@triarcsolutions.com.br', subject: 'Nota: Reunião com Cliente ABC', body: 'Lembrar de preparar proposta para cliente ABC...', folder: 'notes', is_read: 1 },
      { id: 22, from_email: 'admin@triarcsolutions.com.br', subject: 'Nota: Follow-up Fornecedor XYZ', body: 'Entrar em contato com fornecedor XYZ na próxima semana...', folder: 'notes', is_read: 1 },
      { id: 23, from_email: 'admin@triarcsolutions.com.br', subject: 'Nota: Atualizar Documentação', body: 'Revisar e atualizar documentação técnica...', folder: 'notes', is_read: 1 },
      { id: 24, from_email: 'admin@triarcsolutions.com.br', subject: 'Nota: Backup Sistema', body: 'Verificar backup automático do sistema...', folder: 'notes', is_read: 1 },
      { id: 25, from_email: 'admin@triarcsolutions.com.br', subject: 'Nota: Treinamento Equipe', body: 'Agendar treinamento para nova equipe...', folder: 'notes', is_read: 1 }
    ],
    outbox: [
      { id: 26, from_email: 'admin@triarcsolutions.com.br', to_email: 'novo.cliente@empresa.com.br', subject: 'Email Pendente de Envio', body: 'Este email está aguardando envio...', folder: 'outbox', is_read: 1 }
    ],
    conversations: [
      { id: 27, from_email: 'cliente@empresa.com.br', subject: 'Conversa: Projeto Web - Cliente ABC', body: 'Histórico completo da conversa sobre o projeto...', folder: 'conversations', is_read: 1 },
      { id: 28, from_email: 'fornecedor@parceiro.com.br', subject: 'Conversa: Contrato de Serviços', body: 'Histórico da negociação do contrato...', folder: 'conversations', is_read: 1 },
      { id: 29, from_email: 'equipe@triarcsolutions.com.br', subject: 'Conversa: Reunião Semanal', body: 'Discussões da reunião semanal...', folder: 'conversations', is_read: 1 },
      { id: 30, from_email: 'suporte@cliente.com.br', subject: 'Conversa: Suporte Técnico', body: 'Histórico do atendimento de suporte...', folder: 'conversations', is_read: 1 },
      { id: 31, from_email: 'financeiro@fornecedor.com.br', subject: 'Conversa: Pagamentos', body: 'Discussões sobre pagamentos e faturas...', folder: 'conversations', is_read: 1 }
    ]
  };
  
  const folderEmails = emails[folder] || [];
  
  console.log(`Enviando ${folderEmails.length} emails para pasta: ${folder}`);
  
  res.json({
    emails: folderEmails,
    total: folderEmails.length,
    page: 1,
    limit: 50
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`📧 Sistema de Email Triarc - Modo Teste`);
});
