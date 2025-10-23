const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('📧 Adicionando emails para as 3 pastas finais...\n');

// Emails para Observações (8 emails)
const notesEmails = [
  { from_email: 'admin@triarcsolutions.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Nota: Reunião Cliente ABC', body: 'Lembrar de preparar proposta para cliente ABC.', folder: 'notes', is_read: 1, is_flagged: 1, is_pinned: 0 },
  { from_email: 'admin@triarcsolutions.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Nota: Follow-up Fornecedor', body: 'Entrar em contato com fornecedor XYZ.', folder: 'notes', is_read: 1, is_flagged: 0, is_pinned: 1 },
  { from_email: 'admin@triarcsolutions.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Nota: Atualizar Documentação', body: 'Revisar documentação técnica do projeto.', folder: 'notes', is_read: 0, is_flagged: 1, is_pinned: 0 },
  { from_email: 'admin@triarcsolutions.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Nota: Backup Sistema', body: 'Verificar backup automático do sistema.', folder: 'notes', is_read: 1, is_flagged: 0, is_pinned: 0 },
  { from_email: 'admin@triarcsolutions.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Nota: Treinamento Equipe', body: 'Agendar treinamento para nova equipe.', folder: 'notes', is_read: 0, is_flagged: 0, is_pinned: 1 },
  { from_email: 'admin@triarcsolutions.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Nota: Revisão Código', body: 'Revisar código do módulo de autenticação.', folder: 'notes', is_read: 1, is_flagged: 1, is_pinned: 0 },
  { from_email: 'admin@triarcsolutions.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Nota: Configuração DNS', body: 'Configurar registros DNS para novo domínio.', folder: 'notes', is_read: 0, is_flagged: 0, is_pinned: 0 },
  { from_email: 'admin@triarcsolutions.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Nota: Teste Performance', body: 'Executar testes de performance no sistema.', folder: 'notes', is_read: 1, is_flagged: 0, is_pinned: 0 }
];

// Emails para Caixa de Saída (1 email)
const outboxEmails = [
  { from_email: 'admin@triarcsolutions.com.br', to_email: 'novo.cliente@empresa.com.br', subject: 'Email Pendente de Envio', body: 'Este email está aguardando envio automático.', folder: 'outbox', is_read: 1, is_flagged: 0, is_pinned: 0 }
];

// Emails para Histórico de Conversa (15 emails)
const conversationsEmails = [
  { from_email: 'cliente@empresa.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Conversa: Projeto Web - Cliente ABC', body: 'Histórico completo da conversa sobre o projeto web.', folder: 'conversations', is_read: 1, is_flagged: 0, is_pinned: 0 },
  { from_email: 'fornecedor@parceiro.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Conversa: Contrato de Serviços', body: 'Histórico da negociação do contrato de serviços.', folder: 'conversations', is_read: 1, is_flagged: 1, is_pinned: 0 },
  { from_email: 'equipe@triarcsolutions.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Conversa: Reunião Semanal', body: 'Discussões da reunião semanal da equipe.', folder: 'conversations', is_read: 0, is_flagged: 0, is_pinned: 1 },
  { from_email: 'suporte@cliente.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Conversa: Suporte Técnico', body: 'Histórico do atendimento de suporte técnico.', folder: 'conversations', is_read: 1, is_flagged: 0, is_pinned: 0 },
  { from_email: 'financeiro@fornecedor.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Conversa: Pagamentos', body: 'Discussões sobre pagamentos e faturas.', folder: 'conversations', is_read: 0, is_flagged: 1, is_pinned: 0 },
  { from_email: 'marketing@cliente.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Conversa: Campanha Digital', body: 'Histórico da conversa sobre campanha digital.', folder: 'conversations', is_read: 1, is_flagged: 0, is_pinned: 0 },
  { from_email: 'desenvolvimento@parceiro.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Conversa: Integração API', body: 'Discussões sobre integração de API entre sistemas.', folder: 'conversations', is_read: 0, is_flagged: 0, is_pinned: 0 },
  { from_email: 'qualidade@cliente.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Conversa: Testes de Qualidade', body: 'Histórico dos testes de qualidade realizados.', folder: 'conversations', is_read: 1, is_flagged: 0, is_pinned: 0 },
  { from_email: 'infraestrutura@fornecedor.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Conversa: Configuração Servidor', body: 'Discussões sobre configuração do servidor.', folder: 'conversations', is_read: 0, is_flagged: 1, is_pinned: 0 },
  { from_email: 'seguranca@cliente.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Conversa: Auditoria de Segurança', body: 'Histórico da auditoria de segurança realizada.', folder: 'conversations', is_read: 1, is_flagged: 0, is_pinned: 0 },
  { from_email: 'compliance@empresa.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Conversa: Conformidade LGPD', body: 'Discussões sobre conformidade com LGPD.', folder: 'conversations', is_read: 0, is_flagged: 0, is_pinned: 1 },
  { from_email: 'treinamento@fornecedor.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Conversa: Capacitação Equipe', body: 'Histórico do treinamento da equipe.', folder: 'conversations', is_read: 1, is_flagged: 0, is_pinned: 0 },
  { from_email: 'manutencao@cliente.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Conversa: Manutenção Preventiva', body: 'Discussões sobre manutenção preventiva do sistema.', folder: 'conversations', is_read: 0, is_flagged: 1, is_pinned: 0 },
  { from_email: 'backup@empresa.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Conversa: Estratégia de Backup', body: 'Histórico da estratégia de backup implementada.', folder: 'conversations', is_read: 1, is_flagged: 0, is_pinned: 0 },
  { from_email: 'monitoramento@fornecedor.com.br', to_email: 'admin@triarcsolutions.com.br', subject: 'Conversa: Monitoramento Sistema', body: 'Discussões sobre monitoramento do sistema.', folder: 'conversations', is_read: 0, is_flagged: 0, is_pinned: 0 }
];

// Inserir emails
notesEmails.forEach(email => {
  db.run(`INSERT INTO emails (from_email, to_email, subject, body, folder, is_read, is_flagged, is_pinned) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [email.from_email, email.to_email, email.subject, email.body, email.folder, email.is_read, email.is_flagged, email.is_pinned]);
});

outboxEmails.forEach(email => {
  db.run(`INSERT INTO emails (from_email, to_email, subject, body, folder, is_read, is_flagged, is_pinned) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [email.from_email, email.to_email, email.subject, email.body, email.folder, email.is_read, email.is_flagged, email.is_pinned]);
});

conversationsEmails.forEach(email => {
  db.run(`INSERT INTO emails (from_email, to_email, subject, body, folder, is_read, is_flagged, is_pinned) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [email.from_email, email.to_email, email.subject, email.body, email.folder, email.is_read, email.is_flagged, email.is_pinned]);
});

console.log('✅ Emails adicionados com sucesso!');
console.log(`📋 Observações: ${notesEmails.length} emails`);
console.log(`📤 Caixa de Saída: ${outboxEmails.length} emails`);
console.log(`💬 Histórico de Conversa: ${conversationsEmails.length} emails`);

db.close();
