import React, { useState, useEffect } from 'react';

// Estilos básicos para simular o layout do Outlook
const styles = {
  dashboardContainer: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: '#f6f6f6', // Fundo levemente cinza
    color: '#1f1f1f',
  },
  // 1. Barra Lateral Principal (App Bar - Ícones)
  appBar: {
    width: '50px',
    backgroundColor: '#0078d4', // Azul do Office
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '10px',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    zIndex: 10,
  },
  appIcon: {
    fontSize: '24px',
    color: 'white',
    padding: '12px 0',
    cursor: 'pointer',
    opacity: 0.8,
  },
  appIconActive: {
    opacity: 1,
    borderLeft: '3px solid white',
  },
  // 2. Painel de Navegação (Pastas)
  navPanel: {
    width: '250px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
  },
  navHeader: {
    padding: '15px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  folderList: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '10px 0',
  },
  folderItem: {
    padding: '10px 15px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  folderItemActive: {
    backgroundColor: '#e0e0e0',
    fontWeight: 'bold',
  },
  // 3. Área Principal (Lista de Emails + Painel de Leitura)
  mainArea: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  // 3a. Header Principal (Busca e Ações)
  mainHeader: {
    height: '60px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  searchBar: {
    flexGrow: 1,
    padding: '8px 15px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginRight: '20px',
    fontSize: '14px',
  },
  actionButton: {
    backgroundColor: '#0078d4',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px',
    fontSize: '14px',
  },
  // 3b. Conteúdo (Lista de Emails + Leitura)
  contentArea: {
    flexGrow: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  // 4. Lista de Emails
  emailListPanel: {
    width: '350px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e0e0e0',
    overflowY: 'auto',
  },
  emailListItem: {
    padding: '15px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
  },
  emailListItemUnread: {
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
  },
  emailSubject: {
    fontSize: '16px',
    marginBottom: '5px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  emailSnippet: {
    fontSize: '12px',
    color: '#666',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 5. Painel de Leitura
  readingPanel: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    padding: '20px',
    overflowY: 'auto',
  },
  readingPanelPlaceholder: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: '#aaa',
    fontSize: '18px',
  },
  // Estilos para o compositor de email
  composerPanel: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    padding: '20px',
    overflowY: 'auto',
  },
  composerHeader: {
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e0e0e0',
  },
  composerField: {
    marginBottom: '15px',
  },
  composerLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#333',
  },
  composerInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  composerTextarea: {
    width: '100%',
    height: '300px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  attachmentArea: {
    marginTop: '15px',
    padding: '15px',
    border: '2px dashed #ccc',
    borderRadius: '4px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  attachmentList: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#666',
  },
  buttonGroup: {
    marginTop: '20px',
    display: 'flex',
    gap: '10px',
  },
  secondaryButton: {
    backgroundColor: '#e0e0e0',
    color: '#1f1f1f',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  // Estilos para configurações
  settingsPanel: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    padding: '20px',
    overflowY: 'auto',
  },
  settingsSection: {
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e0e0e0',
  },
  settingsTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
  },
  settingsField: {
    marginBottom: '15px',
  },
  settingsLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#333',
  },
  settingsInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
};

// Dados de exemplo
const folders = [
  { id: 1, name: 'Caixa de Entrada', count: 5, icon: '📥' },
  { id: 2, name: 'Itens Enviados', count: 3, icon: '📤' },
  { id: 3, name: 'Rascunhos', count: 2, icon: '📝' },
  { id: 4, name: 'Lixo Eletrônico', count: 12, icon: '🗑️' },
  { id: 5, name: 'Arquivados', count: 50, icon: '📦' },
  { id: 6, name: 'Observações', count: 8, icon: '📋' },
  { id: 7, name: 'Caixa de Saída', count: 1, icon: '📤' },
  { id: 8, name: 'Histórico de Conversa', count: 15, icon: '💬' },
];

const emails = [
  { id: 1, from: 'rafael.andres@triarcsolutions.com.br', subject: 'Relatório Mensal - Outubro 2025', snippet: 'Segue em anexo o relatório mensal com os resultados obtidos...', date: '09:00', unread: true, folder: 'inbox' },
  { id: 2, from: 'rodolfo.fernandes@triarcsolutions.com.br', subject: 'Reunião de Planejamento - Q4 2025', snippet: 'Conforme agendado, nossa reunião será na próxima terça-feira...', date: '08:30', unread: false, folder: 'inbox' },
  { id: 3, from: 'adjalma.aguiar@triarcsolutions.com.br', subject: 'Proposta Comercial - Cliente XYZ', snippet: 'Prezados, segue nossa proposta comercial para o projeto...', date: 'Ontem', unread: true, folder: 'inbox' },
  { id: 4, from: 'contato@cliente.com.br', subject: 'Solicitação de Orçamento', snippet: 'Gostaríamos de solicitar um orçamento para desenvolvimento...', date: '2 dias atrás', unread: false, folder: 'inbox' },
];

const sentEmails = [
  { id: 5, to: 'cliente@empresa.com.br', subject: 'Proposta de Serviços - Triarc Solutions', snippet: 'Prezado cliente, segue nossa proposta de serviços...', date: 'Ontem', folder: 'sent' },
  { id: 6, to: 'parceiro@fornecedor.com.br', subject: 'Contrato de Parceria', snippet: 'Segue em anexo o contrato de parceria para análise...', date: '3 dias atrás', folder: 'sent' },
  { id: 7, to: 'equipe@triarcsolutions.com.br', subject: 'Reunião Semanal - Segunda-feira', snippet: 'Lembrando da nossa reunião semanal às 14h...', date: '1 semana atrás', folder: 'sent' },
];

const drafts = [
  { id: 8, to: 'novo.cliente@empresa.com.br', subject: 'Apresentação dos Serviços', snippet: 'Prezado cliente, gostaria de apresentar nossos serviços...', date: 'Hoje', folder: 'drafts' },
  { id: 9, to: 'fornecedor@parceiro.com.br', subject: 'Negociação de Preços', snippet: 'Gostaria de discutir uma possível redução nos preços...', date: 'Ontem', folder: 'drafts' },
];

const trashEmails = [
  { id: 10, from: 'spam@lixo.com.br', subject: 'Promoção Imperdível', snippet: 'Não perca esta oferta especial...', date: '1 semana atrás', folder: 'trash' },
  { id: 11, from: 'phishing@fake.com.br', subject: 'Atualize seus dados', snippet: 'Clique aqui para atualizar seus dados...', date: '2 semanas atrás', folder: 'trash' },
];

const archivedEmails = [
  { id: 12, from: 'antigo.cliente@empresa.com.br', subject: 'Projeto Concluído - 2024', snippet: 'Informamos que o projeto foi concluído com sucesso...', date: '1 mês atrás', folder: 'archived' },
  { id: 13, from: 'fornecedor@antigo.com.br', subject: 'Contrato Anterior', snippet: 'Referente ao contrato anterior que foi encerrado...', date: '2 meses atrás', folder: 'archived' },
];

// Componente de item da lista de emails
const EmailListItem = ({ email, isSelected, onClick, folderType = 'inbox' }) => {
  const getTimeDisplay = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getDisplayName = () => {
    if (folderType === 'sent') {
      return email.to_email;
    }
    return email.from_email;
  };

  // Estilo para emails não lidos (negrito)
  const unreadStyle = !email.is_read ? {
    fontWeight: 'bold',
    backgroundColor: '#f8f9fa'
  } : {};

  return (
    <div
      style={{
        ...styles.emailListItem,
        ...(email.is_read ? {} : styles.emailListItemUnread),
        ...(isSelected ? { backgroundColor: '#cce6ff', borderLeft: '3px solid #0078d4' } : {}),
        ...unreadStyle
      }}
      onClick={() => onClick(email)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{
          fontWeight: !email.is_read ? 'bold' : 'normal',
          display: 'flex',
          alignItems: 'center'
        }}>
          {email.is_pinned && <span style={{ marginRight: '5px' }}>📌</span>}
          {email.is_flagged && <span style={{ marginRight: '5px' }}>🚩</span>}
          {!email.is_read && <span style={{ marginRight: '5px', color: '#0078d4' }}>●</span>}
          {getDisplayName()}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {getTimeDisplay(email.created_at)}
        </div>
      </div>
      <div style={{
        ...styles.emailSubject,
        fontWeight: !email.is_read ? 'bold' : 'normal'
      }}>
        {email.subject}
      </div>
      <div style={styles.emailSnippet}>
        {email.body.substring(0, 100)}...
      </div>
    </div>
  );
};

// Componente para compositor de email
const EmailComposer = ({ onClose, onSend, onSaveDraft, replyEmail = null, forwardEmail = null }) => {
  const [to, setTo] = useState(replyEmail ? replyEmail.from : forwardEmail ? '' : '');
  const [subject, setSubject] = useState(
    replyEmail ? `Re: ${replyEmail.subject}` : 
    forwardEmail ? `Fwd: ${forwardEmail.subject}` : 
    ''
  );
  const [body, setBody] = useState(
    replyEmail ? `\n\n--- Mensagem Original ---\nDe: ${replyEmail.from}\nData: ${replyEmail.date}\nAssunto: ${replyEmail.subject}\n\n${replyEmail.snippet}` :
    forwardEmail ? `\n\n--- Mensagem Encaminhada ---\nDe: ${forwardEmail.from}\nData: ${forwardEmail.date}\nAssunto: ${forwardEmail.subject}\n\n${forwardEmail.snippet}` :
    ''
  );
  const [attachments, setAttachments] = useState([]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const handleSend = () => {
    if (to && subject && body) {
      onSend({ to, subject, body, attachments });
      onClose();
    } else {
      alert('Preencha todos os campos obrigatórios');
    }
  };

  const handleSaveDraft = () => {
    if (subject || body) {
      onSaveDraft({ to, subject, body, attachments });
      onClose();
    } else {
      alert('Não há conteúdo para salvar como rascunho');
    }
  };

  const getComposerTitle = () => {
    if (replyEmail) return 'Responder Email';
    if (forwardEmail) return 'Encaminhar Email';
    return 'Novo Email';
  };

  return (
    <div style={styles.composerPanel}>
      <div style={styles.composerHeader}>
        <h2 style={{ margin: 0 }}>{getComposerTitle()}</h2>
      </div>

      <div style={styles.composerField}>
        <label style={styles.composerLabel}>Para:</label>
        <input
          type="email"
          style={styles.composerInput}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Digite o email do destinatário"
        />
      </div>

      <div style={styles.composerField}>
        <label style={styles.composerLabel}>Assunto:</label>
        <input
          type="text"
          style={styles.composerInput}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Digite o assunto do email"
        />
      </div>

      <div style={styles.composerField}>
        <label style={styles.composerLabel}>Mensagem:</label>
        <textarea
          style={styles.composerTextarea}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Digite sua mensagem aqui..."
        />
      </div>

      <div style={styles.attachmentArea}>
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
          📎 Clique aqui para anexar arquivos
        </label>
        {attachments.length > 0 && (
          <div style={styles.attachmentList}>
            {attachments.map(att => (
              <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                <span>{att.name} ({(att.size / 1024).toFixed(1)} KB)</span>
                <button onClick={() => removeAttachment(att.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.buttonGroup}>
        <button style={styles.actionButton} onClick={handleSend}>
          Enviar
        </button>
        <button style={styles.secondaryButton} onClick={handleSaveDraft}>
          Salvar Rascunho
        </button>
        <button style={styles.secondaryButton} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

// Componente para configurações
const SettingsPanel = ({ user, onLogout }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailSignature, setEmailSignature] = useState('');

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    if (newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    alert('Senha alterada com sucesso!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div style={styles.settingsPanel}>
      <div style={styles.settingsSection}>
        <h2 style={styles.settingsTitle}>Configurações da Conta</h2>
        
        <div style={styles.settingsField}>
          <label style={styles.settingsLabel}>Email:</label>
          <input
            type="email"
            style={styles.settingsInput}
            value={user?.email || 'admin@triarcsolutions.com.br'}
            disabled
          />
        </div>

        <div style={styles.settingsField}>
          <label style={styles.settingsLabel}>Nome:</label>
          <input
            type="text"
            style={styles.settingsInput}
            defaultValue="Administrador"
          />
        </div>
      </div>

      <div style={styles.settingsSection}>
        <h2 style={styles.settingsTitle}>Alterar Senha</h2>
        
        <div style={styles.settingsField}>
          <label style={styles.settingsLabel}>Senha Atual:</label>
          <input
            type="password"
            style={styles.settingsInput}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Digite sua senha atual"
          />
        </div>

        <div style={styles.settingsField}>
          <label style={styles.settingsLabel}>Nova Senha:</label>
          <input
            type="password"
            style={styles.settingsInput}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Digite sua nova senha"
          />
        </div>

        <div style={styles.settingsField}>
          <label style={styles.settingsLabel}>Confirmar Nova Senha:</label>
          <input
            type="password"
            style={styles.settingsInput}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme sua nova senha"
          />
        </div>

        <button style={styles.actionButton} onClick={handleChangePassword}>
          Alterar Senha
        </button>
      </div>

      <div style={styles.settingsSection}>
        <h2 style={styles.settingsTitle}>Assinatura do Email</h2>
        
        <div style={styles.settingsField}>
          <label style={styles.settingsLabel}>Assinatura:</label>
          <textarea
            style={{...styles.settingsInput, height: '100px'}}
            value={emailSignature}
            onChange={(e) => setEmailSignature(e.target.value)}
            placeholder="Digite sua assinatura de email..."
          />
        </div>

        <button style={styles.actionButton} onClick={() => alert('Assinatura salva com sucesso!')}>
          Salvar Assinatura
        </button>
      </div>

      <div style={styles.settingsSection}>
        <button style={{...styles.actionButton, backgroundColor: '#dc3545'}} onClick={onLogout}>
          Sair da Conta
        </button>
      </div>
    </div>
  );
};

const ReadingPanel = ({ email, onReply, onForward }) => {
  if (!email) {
    return <div style={styles.readingPanelPlaceholder}>Selecione um email para ler</div>;
  }

  const handleReply = () => {
    if (onReply) {
      onReply(email);
    }
  };

  const handleForward = () => {
    if (onForward) {
      onForward(email);
    }
  };

  return (
    <div style={styles.readingPanel}>
      <h2 style={{ margin: '0 0 10px 0' }}>{email.subject}</h2>
      <div style={{ color: '#666', marginBottom: '20px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
        De: {email.from || email.to} | Data: {email.date}
      </div>
      <p>
        Este é o conteúdo detalhado do email com o assunto **{email.subject}**.
        Aqui você integraria a lógica para carregar o corpo real da mensagem.
        O design é limpo e focado na leitura, similar ao Outlook.
      </p>
      <p>
        Para sua integração com AWS, você pode usar o AWS SDK para buscar emails
        do seu serviço de email (como o Amazon SES ou um backend que use o Amazon S3 para armazenamento de emails)
        e preencher este painel.
      </p>
      <div style={{ marginTop: '30px', paddingTop: '15px', borderTop: '1px solid #f0f0f0' }}>
        <button style={styles.actionButton} onClick={handleReply}>Responder</button>
        <button style={{ ...styles.actionButton, backgroundColor: '#e0e0e0', color: '#1f1f1f' }} onClick={handleForward}>Encaminhar</button>
      </div>
    </div>
  );
};

const Dashboard = ({ user, onLogout }) => {
  const [selectedFolder, setSelectedFolder] = useState(folders[0]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [currentView, setCurrentView] = useState('inbox'); // inbox, composer, settings
  const [allEmails, setAllEmails] = useState([]);
  const [replyEmail, setReplyEmail] = useState(null);
  const [forwardEmail, setForwardEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customFolders, setCustomFolders] = useState([]);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);

  // Carregar pastas personalizadas do backend
  const loadCustomFolders = async () => {
    try {
      const token = localStorage.getItem('triarc_email_token');
      
      const response = await fetch('http://localhost:5000/api/folders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomFolders(data);
      } else {
        console.error('Erro ao carregar pastas personalizadas');
      }
    } catch (error) {
      console.error('Erro ao carregar pastas personalizadas:', error);
    }
  };

  // Criar nova pasta personalizada
  const createCustomFolder = async (folderData) => {
    try {
      const token = localStorage.getItem('triarc_email_token');
      
      const response = await fetch('http://localhost:5000/api/folders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(folderData),
      });

      if (response.ok) {
        await loadCustomFolders();
        alert('Pasta criada com sucesso!');
        setShowCreateFolderModal(false);
      } else {
        alert('Erro ao criar pasta');
      }
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      alert('Erro ao criar pasta');
    }
  };

  // Carregar emails do backend
  const loadEmails = async (folder) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('triarc_email_token');
      
      const folderMap = {
        1: 'inbox',        // Caixa de Entrada
        2: 'sent',         // Itens Enviados
        3: 'drafts',       // Rascunhos
        4: 'trash',        // Lixo Eletrônico
        5: 'archived',     // Arquivados
        6: 'notes',        // Observações
        7: 'outbox',       // Caixa de Saída
        8: 'conversations'  // Histórico de Conversa
      };

      const folderName = folderMap[folder.id] || 'inbox';
      
      console.log(`Carregando emails da pasta: ${folderName}`);
      
      const response = await fetch(`http://localhost:5000/api/emails/${folderName}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Resposta da API:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Dados recebidos:', data);
        setAllEmails(data.emails || []);
        if (data.emails && data.emails.length > 0) {
          setSelectedEmail(data.emails[0]);
        } else {
          setSelectedEmail(null);
        }
        setError(null);
      } else {
        const errorText = await response.text();
        console.error('Erro na resposta:', errorText);
        throw new Error('Erro ao carregar emails');
      }
    } catch (error) {
      console.error('Erro ao carregar emails:', error);
      setError('Erro ao carregar emails. Verifique se o servidor está rodando.');
      setAllEmails([]);
      setSelectedEmail(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentEmails = () => {
    return allEmails;
  };

  const getFolderType = () => {
    switch (selectedFolder.id) {
      case 2: return 'sent'; // Itens Enviados
      default: return 'inbox';
    }
  };

  const handleNewEmail = () => {
    setCurrentView('composer');
  };

  const handleSendEmail = async (emailData) => {
    try {
      const token = localStorage.getItem('triarc_email_token');
      const formData = new FormData();
      
      formData.append('to_email', emailData.to);
      formData.append('subject', emailData.subject);
      formData.append('body', emailData.body);
      
      // Adicionar anexos se houver
      if (emailData.attachments && emailData.attachments.length > 0) {
        emailData.attachments.forEach(attachment => {
          formData.append('attachments', attachment.file);
        });
      }

      const response = await fetch('http://localhost:5000/api/emails/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert('Email enviado com sucesso!');
        // Recarregar emails enviados
        loadEmails({ id: 2 });
      } else {
        const error = await response.json();
        alert('Erro ao enviar email: ' + error.error);
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      alert('Erro ao enviar email. Verifique se o servidor está rodando.');
    }
  };

  const handleSaveDraft = async (emailData) => {
    try {
      const token = localStorage.getItem('triarc_email_token');
      
      const response = await fetch('http://localhost:5000/api/drafts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_email: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          attachments: emailData.attachments || []
        }),
      });

      if (response.ok) {
        alert('Rascunho salvo com sucesso!');
        // Recarregar rascunhos
        loadEmails({ id: 3 });
      } else {
        const error = await response.json();
        alert('Erro ao salvar rascunho: ' + error.error);
      }
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      alert('Erro ao salvar rascunho. Verifique se o servidor está rodando.');
    }
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    setCurrentView('inbox');
    loadEmails(folder);
  };

  // Carregar emails iniciais e pastas personalizadas
  useEffect(() => {
    loadEmails(selectedFolder);
    loadCustomFolders();
  }, []);

  const handleSettingsClick = () => {
    setCurrentView('settings');
  };

  // Funções para os cards da barra azul
  const handleEmailClick = () => {
    setCurrentView('inbox');
    setSelectedFolder(folders[0]); // Caixa de Entrada
    loadEmails(folders[0]);
  };

  const handleCalendarClick = () => {
    setCurrentView('calendar');
  };

  const handleContactsClick = () => {
    setCurrentView('contacts');
  };

  const handleReply = (email) => {
    setReplyEmail(email);
    setForwardEmail(null);
    setCurrentView('composer');
  };

  const handleForward = (email) => {
    setForwardEmail(email);
    setReplyEmail(null);
    setCurrentView('composer');
  };

  const handleCloseComposer = () => {
    setCurrentView('inbox');
    setReplyEmail(null);
    setForwardEmail(null);
  };

  return (
    <div style={styles.dashboardContainer}>
      {/* 1. Barra Lateral Principal (App Bar) */}
      <div style={styles.appBar}>
        <div 
          style={{
            ...styles.appIcon, 
            ...(currentView === 'inbox' ? styles.appIconActive : {}),
            cursor: 'pointer'
          }} 
          onClick={handleEmailClick}
          title="Email"
        >
          📧
        </div>
        <div 
          style={{
            ...styles.appIcon,
            ...(currentView === 'calendar' ? styles.appIconActive : {}),
            cursor: 'pointer'
          }}
          onClick={handleCalendarClick}
          title="Calendário"
        >
          📅
        </div>
        <div 
          style={{
            ...styles.appIcon,
            ...(currentView === 'contacts' ? styles.appIconActive : {}),
            cursor: 'pointer'
          }}
          onClick={handleContactsClick}
          title="Contatos"
        >
          👥
        </div>
        <div 
          style={{...styles.appIcon, marginTop: 'auto', marginBottom: '10px'}} 
          onClick={handleSettingsClick}
        >
          ⚙️
        </div>
      </div>

      {/* 2. Painel de Navegação (Pastas) */}
      <div style={styles.navPanel}>
        <div style={styles.navHeader}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Triarc Email</h3>
          <span 
            style={{ color: '#0078d4', cursor: 'pointer' }}
            onClick={() => setShowCreateFolderModal(true)}
          >
            + Nova Pasta
          </span>
        </div>
        <div style={styles.folderList}>
          {/* Pastas padrão */}
          {folders.map(folder => (
            <div
              key={folder.id}
              style={{
                ...styles.folderItem,
                ...(selectedFolder.id === folder.id ? styles.folderItemActive : {})
              }}
              onClick={() => handleFolderClick(folder)}
            >
              <span>{folder.icon} {folder.name}</span>
              {folder.count > 0 && <span>({folder.count})</span>}
            </div>
          ))}
          
          {/* Separador */}
          {customFolders.length > 0 && (
            <div style={{ 
              padding: '10px 15px', 
              fontSize: '12px', 
              color: '#666', 
              fontWeight: 'bold',
              borderTop: '1px solid #e0e0e0',
              marginTop: '10px'
            }}>
              Pastas Personalizadas
            </div>
          )}
          
          {/* Pastas personalizadas */}
          {customFolders.map(folder => (
            <div
              key={`custom-${folder.id}`}
              style={{
                ...styles.folderItem,
                ...(selectedFolder.id === `custom-${folder.id}` ? styles.folderItemActive : {}),
                color: folder.color
              }}
              onClick={() => {
                // Criar objeto de pasta personalizada
                const customFolder = {
                  id: `custom-${folder.id}`,
                  name: folder.name,
                  icon: folder.icon,
                  count: 0,
                  color: folder.color,
                  isCustom: true
                };
                handleFolderClick(customFolder);
              }}
            >
              <span>{folder.icon} {folder.name}</span>
              <span>(0)</span>
            </div>
          ))}
        </div>
        
        {/* User Info */}
        <div style={{ padding: '15px', borderTop: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
            Logado como:
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
            {user?.email || 'admin@triarcsolutions.com.br'}
          </div>
          <button 
            onClick={onLogout}
            style={{ 
              marginTop: '10px', 
              fontSize: '12px', 
              color: '#0078d4', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer' 
            }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* 3. Área Principal */}
      <div style={styles.mainArea}>
        {/* 3a. Header Principal */}
        <div style={styles.mainHeader}>
          <input type="text" placeholder="Buscar emails..." style={styles.searchBar} />
          <button style={styles.actionButton} onClick={handleNewEmail}>+ Novo Email</button>
        </div>
        
        {/* 3b. Conteúdo */}
        <div style={styles.contentArea}>
          {currentView === 'composer' ? (
            <EmailComposer 
              onClose={handleCloseComposer}
              onSend={handleSendEmail}
              onSaveDraft={handleSaveDraft}
              replyEmail={replyEmail}
              forwardEmail={forwardEmail}
            />
          ) : currentView === 'settings' ? (
            <SettingsPanel user={user} onLogout={onLogout} />
          ) : currentView === 'calendar' ? (
            <CalendarPanel onBack={() => setCurrentView('inbox')} />
          ) : currentView === 'contacts' ? (
            <ContactsPanel onBack={() => setCurrentView('inbox')} />
          ) : (
            <>
              {/* 4. Lista de Emails */}
              <div style={styles.emailListPanel}>
                {getCurrentEmails().map(email => (
                  <EmailListItem
                    key={email.id}
                    email={email}
                    isSelected={selectedEmail && selectedEmail.id === email.id}
                    onClick={setSelectedEmail}
                    folderType={getFolderType()}
                  />
                ))}
              </div>

              {/* 5. Painel de Leitura */}
              <ReadingPanel 
                email={selectedEmail} 
                onReply={handleReply}
                onForward={handleForward}
              />
            </>
          )}
        </div>
      </div>

      {/* Modal para criar pasta personalizada */}
      {showCreateFolderModal && (
        <CreateFolderModal
          onSave={createCustomFolder}
          onClose={() => setShowCreateFolderModal(false)}
        />
      )}
    </div>
  );
};

// Modal para criar pasta personalizada
const CreateFolderModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#0078d4',
    icon: '📁'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
    }
  };

  const iconOptions = ['📁', '📂', '🗂️', '📋', '📊', '📈', '📉', '📌', '🏷️', '⭐', '🔥', '💼', '👥', '🏢', '📞', '📧', '📱', '💻', '🔧', '⚙️'];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '400px',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <h2>Criar Nova Pasta</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Nome da Pasta:
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              placeholder="Ex: Clientes, Projetos, Urgente..."
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Cor:
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['#0078d4', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#fd7e14', '#20c997'].map(color => (
                <div
                  key={color}
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: color,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: formData.color === color ? '3px solid #333' : '1px solid #ccc',
                  }}
                  onClick={() => setFormData({...formData, color})}
                />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Ícone:
            </label>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {iconOptions.map(icon => (
                <span
                  key={icon}
                  style={{
                    fontSize: '20px',
                    padding: '5px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    backgroundColor: formData.icon === icon ? '#e0e0e0' : 'transparent',
                  }}
                  onClick={() => setFormData({...formData, icon})}
                >
                  {icon}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button 
              type="button" 
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Criar Pasta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente de Calendário
const CalendarPanel = ({ onBack }) => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('month'); // month, week, day
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, meeting, teams_meeting, call, presentation

  const calendarStyles = {
    container: {
      flexGrow: 1,
      backgroundColor: '#ffffff',
      padding: '20px',
      overflowY: 'auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: '15px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f1f1f',
      margin: 0,
    },
    backButton: {
      backgroundColor: '#0078d4',
      color: 'white',
      border: 'none',
      padding: '8px 15px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
    },
    navButtons: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
    },
    navButton: {
      backgroundColor: '#f0f0f0',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
    },
    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '1px',
      backgroundColor: '#e0e0e0',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    dayHeader: {
      backgroundColor: '#f5f5f5',
      padding: '10px',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '12px',
      color: '#666',
    },
    dayCell: {
      backgroundColor: '#ffffff',
      padding: '10px',
      minHeight: '80px',
      border: '1px solid #f0f0f0',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      position: 'relative',
    },
    dayCellToday: {
      backgroundColor: '#e3f2fd',
      border: '2px solid #0078d4',
    },
    dayCellSelected: {
      backgroundColor: '#fff3cd',
      border: '2px solid #ffc107',
    },
    eventItem: {
      backgroundColor: '#0078d4',
      color: 'white',
      padding: '2px 6px',
      borderRadius: '3px',
      fontSize: '10px',
      marginBottom: '2px',
      cursor: 'pointer',
    },
    eventItemMeeting: {
      backgroundColor: '#28a745',
    },
    eventItemCall: {
      backgroundColor: '#ffc107',
      color: '#000',
    },
    eventItemPresentation: {
      backgroundColor: '#dc3545',
    },
    addEventButton: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      marginBottom: '20px',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      width: '400px',
      maxHeight: '80vh',
      overflowY: 'auto',
    },
    formGroup: {
      marginBottom: '15px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
    },
    input: {
      width: '100%',
      padding: '8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
    },
    textarea: {
      width: '100%',
      padding: '8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
    },
    select: {
      width: '100%',
      padding: '8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end',
      marginTop: '20px',
    },
    saveButton: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    cancelButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
    },
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Carregar eventos do backend
  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('triarc_email_token');
      
      console.log('Carregando eventos para:', currentMonth + 1, currentYear);
      
      const response = await fetch(`http://localhost:5000/api/calendar/events?month=${currentMonth + 1}&year=${currentYear}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Resposta da API eventos:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Eventos carregados:', data);
        console.log('Total de eventos:', data.length);
        console.log('Eventos por dia:', data.map(e => `Dia ${e.day}: ${e.title}`));
        setEvents(data);
      } else {
        const errorText = await response.text();
        console.error('Erro ao carregar eventos:', errorText);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar evento
  const saveEvent = async (eventData) => {
    try {
      const token = localStorage.getItem('triarc_email_token');
      const url = editingEvent 
        ? `http://localhost:5000/api/calendar/events/${editingEvent.id}`
        : 'http://localhost:5000/api/calendar/events';
      
      const method = editingEvent ? 'PUT' : 'POST';
      
      console.log('Enviando evento:', eventData);
      console.log('Token:', token);
      console.log('URL:', url);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      console.log('Resposta:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Resultado:', result);
        await loadEvents();
        setShowEventForm(false);
        setEditingEvent(null);
        alert(editingEvent ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
      } else {
        const errorText = await response.text();
        console.error('Erro na resposta:', errorText);
        alert(`Erro ao salvar evento: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      alert(`Erro ao salvar evento: ${error.message}`);
    }
  };

  // Função para selecionar evento específico
  const handleEventClick = (event, e) => {
    e.stopPropagation(); // Evitar que o clique no dia seja acionado
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  // Função para fechar detalhes do evento
  const closeEventDetails = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  // Função para editar evento
  const editEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
    setShowEventDetails(false);
  };

  // Função para filtrar eventos por tipo
  const getFilteredEvents = () => {
    if (filterType === 'all') return events;
    return events.filter(event => event.type === filterType);
  };

  // Função para obter eventos do dia
  const getDayEvents = (day) => {
    const filteredEvents = getFilteredEvents();
    return filteredEvents.filter(event => 
      event.day === day && 
      event.month === currentMonth + 1 && 
      event.year === currentYear
    );
  };

  // Função para imprimir calendário
  const printCalendar = () => {
    window.print();
  };

  // Função para compartilhar calendário
  const shareCalendar = () => {
    const shareData = {
      title: `Calendário Triarc Solutions - ${monthNames[currentMonth]} ${currentYear}`,
      text: `Visualize meu calendário de ${monthNames[currentMonth]} ${currentYear}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback: copiar para clipboard
      navigator.clipboard.writeText(shareData.url);
      alert('Link do calendário copiado para a área de transferência!');
    }
  };

  // Excluir evento
  const deleteEvent = async (eventId) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    
    try {
      const token = localStorage.getItem('triarc_email_token');
      
      const response = await fetch(`http://localhost:5000/api/calendar/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await loadEvents();
        setShowEventForm(false);
        setEditingEvent(null);
        alert('Evento excluído com sucesso!');
      } else {
        alert('Erro ao excluir evento');
      }
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      alert('Erro ao excluir evento');
    }
  };

  // Navegar meses
  const navigateMonth = async (direction) => {
    let newMonth = currentMonth;
    let newYear = currentYear;
    
    if (direction === 'prev') {
      if (currentMonth === 0) {
        newMonth = 11;
        newYear = currentYear - 1;
      } else {
        newMonth = currentMonth - 1;
      }
    } else {
      if (currentMonth === 11) {
        newMonth = 0;
        newYear = currentYear + 1;
      } else {
        newMonth = currentMonth + 1;
      }
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    
    // Carregar eventos do novo mês
    console.log(`Navegando para mês ${newMonth + 1}, ano ${newYear}`);
    await loadEvents();
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const today = new Date();
  const currentDay = today.getDate();
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

  // Função para renderizar visualização por semana
  const renderWeekView = () => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay()); // Domingo
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      
      const dayEvents = getFilteredEvents().filter(event => 
        event.day === day.getDate() && 
        event.month === day.getMonth() + 1 && 
        event.year === day.getFullYear()
      );
      
      weekDays.push(
        <div key={i} style={{
          ...calendarStyles.dayCell,
          minHeight: '200px',
          backgroundColor: day.getDay() === today.getDay() ? '#e3f2fd' : '#ffffff'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '16px' }}>
            {dayNames[day.getDay()]} {day.getDate()}
          </div>
          {dayEvents.map(event => (
            <div 
              key={event.id} 
              style={{
                ...calendarStyles.eventItem,
                ...(event.type === 'meeting' ? calendarStyles.eventItemMeeting : {}),
                ...(event.type === 'call' ? calendarStyles.eventItemCall : {}),
                ...(event.type === 'presentation' ? calendarStyles.eventItemPresentation : {}),
                ...(event.type === 'teams_meeting' ? { backgroundColor: '#0078d4', color: 'white' } : {}),
                marginBottom: '5px',
                fontSize: '12px',
                padding: '4px 8px'
              }}
              onClick={(e) => handleEventClick(event, e)}
            >
              {event.type === 'teams_meeting' ? '🎯 ' : ''}{event.time} - {event.title}
            </div>
          ))}
        </div>
      );
    }
    
    return weekDays;
  };

  // Função para renderizar visualização por dia
  const renderDayView = () => {
    const today = new Date();
    const dayEvents = getFilteredEvents().filter(event => 
      event.day === today.getDate() && 
      event.month === today.getMonth() + 1 && 
      event.year === today.getFullYear()
    );
    
    return (
      <div style={{ padding: '20px' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>
          📅 {dayNames[today.getDay()]}, {today.getDate()} de {monthNames[today.getMonth()]} de {today.getFullYear()}
        </h2>
        
        <div style={{ display: 'grid', gap: '15px' }}>
          {dayEvents.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#666',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              📅 Nenhum evento agendado para hoje
            </div>
          ) : (
            dayEvents.map(event => (
              <div 
                key={event.id} 
                style={{
                  padding: '15px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s'
                }}
                onClick={(e) => handleEventClick(event, e)}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{event.title}</h3>
                    <p style={{ margin: '0', color: '#666' }}>
                      🕐 {event.time} ({event.duration} min) | 
                      📝 {event.type === 'teams_meeting' ? 'Reunião Teams' : event.type}
                    </p>
                  </div>
                  {event.type === 'teams_meeting' && (
                    <div style={{
                      backgroundColor: '#0078d4',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      🎯 Teams
                    </div>
                  )}
                </div>
                {event.description && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#555'
                  }}>
                    {event.description}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const days = [];
    
    // Dias vazios no início do mês
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={calendarStyles.dayCell}></div>);
    }
    
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === currentDay;
      const isSelected = selectedDate && selectedDate.day === day;
      const dayEvents = getDayEvents(day);
      
      if (dayEvents.length > 0) {
        console.log(`Dia ${day} tem ${dayEvents.length} eventos:`, dayEvents);
      }
      
      days.push(
        <div 
          key={day} 
          style={{
            ...calendarStyles.dayCell,
            ...(isToday ? calendarStyles.dayCellToday : {}),
            ...(isSelected ? calendarStyles.dayCellSelected : {})
          }}
          onClick={() => setSelectedDate({ day, month: currentMonth + 1, year: currentYear })}
          onDoubleClick={() => {
            setSelectedDate({ day, month: currentMonth + 1, year: currentYear });
            setEditingEvent(null);
            setShowEventForm(true);
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{day}</div>
          {dayEvents.map(event => {
            console.log(`Renderizando evento ${event.id} para dia ${day}:`, event.title);
            return (
              <div 
                key={event.id} 
                style={{
                  ...calendarStyles.eventItem,
                  ...(event.type === 'meeting' ? calendarStyles.eventItemMeeting : {}),
                  ...(event.type === 'call' ? calendarStyles.eventItemCall : {}),
                  ...(event.type === 'presentation' ? calendarStyles.eventItemPresentation : {}),
                  zIndex: 10,
                  position: 'relative'
                }}
                onClick={(e) => handleEventClick(event, e)}
              >
                {event.type === 'teams_meeting' ? '🎯 ' : ''}{event.time} - {event.title}
              </div>
            );
          })}
        </div>
      );
    }
    
    return days;
  };

  // Carregar eventos quando o componente monta ou mês muda
  useEffect(() => {
    loadEvents();
  }, [currentMonth, currentYear]);

  return (
    <div style={calendarStyles.container}>
      <div style={calendarStyles.header}>
        <div style={calendarStyles.navButtons}>
          <button style={calendarStyles.navButton} onClick={() => navigateMonth('prev')}>
            ←
          </button>
          <h1 style={calendarStyles.title}>
            📅 Calendário - {monthNames[currentMonth]} {currentYear}
          </h1>
          <button style={calendarStyles.navButton} onClick={() => navigateMonth('next')}>
            →
          </button>
        </div>
        <button style={calendarStyles.backButton} onClick={onBack}>
          ← Voltar
        </button>
      </div>
      
      {/* Barra de Ferramentas */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Visualizações */}
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            style={{
              ...calendarStyles.addEventButton,
              backgroundColor: currentView === 'month' ? '#007bff' : '#28a745',
              fontSize: '12px',
              padding: '8px 12px'
            }}
            onClick={() => setCurrentView('month')}
          >
            📅 Mês
          </button>
          <button
            style={{
              ...calendarStyles.addEventButton,
              backgroundColor: currentView === 'week' ? '#007bff' : '#28a745',
              fontSize: '12px',
              padding: '8px 12px'
            }}
            onClick={() => setCurrentView('week')}
          >
            📊 Semana
          </button>
          <button
            style={{
              ...calendarStyles.addEventButton,
              backgroundColor: currentView === 'day' ? '#007bff' : '#28a745',
              fontSize: '12px',
              padding: '8px 12px'
            }}
            onClick={() => setCurrentView('day')}
          >
            📋 Dia
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Filtrar:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '5px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            <option value="all">Todos</option>
            <option value="meeting">Reuniões</option>
            <option value="teams_meeting">Teams</option>
            <option value="call">Ligações</option>
            <option value="presentation">Apresentações</option>
          </select>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            style={{
              ...calendarStyles.addEventButton,
              backgroundColor: '#17a2b8',
              fontSize: '12px',
              padding: '8px 12px'
            }}
            onClick={shareCalendar}
          >
            📤 Compartilhar
          </button>
          <button
            style={{
              ...calendarStyles.addEventButton,
              backgroundColor: '#6c757d',
              fontSize: '12px',
              padding: '8px 12px'
            }}
            onClick={printCalendar}
          >
            🖨️ Imprimir
          </button>
        </div>
      </div>

      <button 
        style={calendarStyles.addEventButton}
        onClick={() => {
          setEditingEvent(null);
          setShowEventForm(true);
        }}
      >
        + Novo Evento
      </button>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Carregando eventos...
        </div>
      ) : (
        <>
          {currentView === 'month' && (
            <div style={calendarStyles.calendarGrid}>
              {dayNames.map(day => (
                <div key={day} style={calendarStyles.dayHeader}>
                  {day}
                </div>
              ))}
              {renderCalendar()}
            </div>
          )}
          
          {currentView === 'week' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '1px',
              backgroundColor: '#e0e0e0',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              {dayNames.map(day => (
                <div key={day} style={{
                  ...calendarStyles.dayHeader,
                  backgroundColor: '#f5f5f5'
                }}>
                  {day}
                </div>
              ))}
              {renderWeekView()}
            </div>
          )}
          
          {currentView === 'day' && renderDayView()}
        </>
      )}

      {/* Modal de Evento */}
      {showEventForm && (
        <EventFormModal
          event={editingEvent}
          selectedDate={selectedDate}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onSave={saveEvent}
          onDelete={deleteEvent}
          onClose={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
          styles={calendarStyles}
        />
      )}

      {/* Modal de Detalhes do Evento */}
      {showEventDetails && selectedEvent && (
        <div style={calendarStyles.modal}>
          <div style={{
            ...calendarStyles.modalContent,
            width: '500px'
          }}>
            <h2 style={{ marginTop: 0, color: '#333' }}>
              📅 {selectedEvent.title}
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>📅 Data:</strong> {selectedEvent.day}/{selectedEvent.month}/{selectedEvent.year}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>🕐 Horário:</strong> {selectedEvent.time} ({selectedEvent.duration} min)
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>📝 Tipo:</strong> {selectedEvent.type === 'teams_meeting' ? 'Reunião Teams' : selectedEvent.type}
              </div>
              {selectedEvent.description && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>📄 Descrição:</strong>
                  <div style={{ 
                    marginTop: '5px', 
                    padding: '10px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedEvent.description}
                  </div>
                </div>
              )}
              {selectedEvent.teams_link && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>🔗 Link Teams:</strong>
                  <div style={{ marginTop: '5px' }}>
                    <a 
                      href={selectedEvent.teams_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        color: '#0078d4',
                        textDecoration: 'none',
                        padding: '8px 12px',
                        backgroundColor: '#e3f2fd',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}
                    >
                      🚀 Entrar na Reunião Teams
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={closeEventDetails}
              >
                Fechar
              </button>
              <button
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => editEvent(selectedEvent)}
              >
                ✏️ Editar
              </button>
              <button
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir este evento?')) {
                    deleteEvent(selectedEvent.id);
                    closeEventDetails();
                  }
                }}
              >
                🗑️ Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal de Formulário de Evento
const EventFormModal = ({ event, selectedDate, currentMonth, currentYear, onSave, onDelete, onClose, styles }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    day: event?.day || selectedDate?.day || new Date().getDate(),
    month: event?.month || selectedDate?.month || (selectedDate ? selectedDate.month : new Date().getMonth()),
    year: event?.year || selectedDate?.year || (selectedDate ? selectedDate.year : new Date().getFullYear()),
    time: event?.time || '09:00',
    duration: event?.duration || 60,
    type: event?.type || 'meeting'
  });
  
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [isTeamsMeeting, setIsTeamsMeeting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Dados do evento a serem salvos:', formData);
    console.log('selectedDate:', selectedDate);
    console.log('currentMonth passado como prop:', currentMonth);
    console.log('Mês que será salvo:', formData.month);
    console.log('É reunião Teams:', isTeamsMeeting);
    console.log('Participantes:', participants);
    
    if (isTeamsMeeting) {
      // Criar reunião Teams
      await createTeamsMeeting();
    } else {
      // Criar evento normal
      onSave(formData);
    }
  };
  
  const createTeamsMeeting = async () => {
    try {
      const token = localStorage.getItem('triarc_email_token');
      
      const meetingData = {
        ...formData,
        participants: participants
      };
      
      console.log('Criando reunião Teams:', meetingData);
      
      const response = await fetch('http://localhost:5000/api/teams/create-meeting', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Reunião Teams criada:', result);
        alert(`🎉 Reunião Teams criada com sucesso!\n\n🔗 Link: ${result.teams_link}\n\n📧 Convites enviados para: ${participants.join(', ')}`);
        
        // Recarregar eventos para mostrar a reunião Teams
        await loadEvents();
        
        onClose();
      } else {
        const errorText = await response.text();
        console.error('Erro ao criar reunião Teams:', errorText);
        alert('Erro ao criar reunião Teams: ' + errorText);
      }
    } catch (error) {
      console.error('Erro ao criar reunião Teams:', error);
      alert('Erro ao criar reunião Teams: ' + error.message);
    }
  };
  
  const addParticipant = () => {
    if (newParticipant && newParticipant.includes('@')) {
      setParticipants([...participants, newParticipant]);
      setNewParticipant('');
    } else {
      alert('Por favor, insira um email válido');
    }
  };
  
  const removeParticipant = (index) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <h2>{event ? 'Editar Evento' : 'Novo Evento'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Título:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Descrição:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={styles.textarea}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Data:</label>
            <input
              type="date"
              value={`${formData.year}-${String(formData.month + 1).padStart(2, '0')}-${String(formData.day).padStart(2, '0')}`}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setFormData({
                  ...formData,
                  day: date.getDate(),
                  month: date.getMonth(),
                  year: date.getFullYear()
                });
              }}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Horário:</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Duração (minutos):</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
              style={styles.input}
              min="15"
              step="15"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Tipo:</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              style={styles.select}
            >
              <option value="meeting">Reunião</option>
              <option value="call">Ligação</option>
              <option value="presentation">Apresentação</option>
              <option value="other">Outro</option>
            </select>
          </div>

          {/* Campo para Reunião Teams */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <input
                type="checkbox"
                checked={isTeamsMeeting}
                onChange={(e) => setIsTeamsMeeting(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              🎯 Criar Reunião Microsoft Teams
            </label>
          </div>

          {/* Campos de Participantes (só aparecem se for Teams) */}
          {isTeamsMeeting && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>👥 Participantes:</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="email"
                    placeholder="Digite o email do participante"
                    value={newParticipant}
                    onChange={(e) => setNewParticipant(e.target.value)}
                    style={styles.input}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addParticipant())}
                  />
                  <button
                    type="button"
                    onClick={addParticipant}
                    style={{
                      ...styles.saveButton,
                      padding: '8px 16px',
                      fontSize: '12px'
                    }}
                  >
                    Adicionar
                  </button>
                </div>
                
                {/* Lista de participantes */}
                {participants.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Participantes adicionados:</h4>
                    {participants.map((participant, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        marginBottom: '4px'
                      }}>
                        <span style={{ fontSize: '14px' }}>{participant}</span>
                        <button
                          type="button"
                          onClick={() => removeParticipant(index)}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div style={styles.buttonGroup}>
            <button type="button" style={styles.cancelButton} onClick={onClose}>
              Cancelar
            </button>
            {event && (
              <button type="button" style={styles.deleteButton} onClick={() => onDelete(event.id)}>
                Excluir
              </button>
            )}
            <button type="submit" style={styles.saveButton}>
              {isTeamsMeeting ? '🎯 Criar Reunião Teams' : (event ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente de Contatos
const ContactsPanel = ({ onBack }) => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const contactsStyles = {
    container: {
      flexGrow: 1,
      backgroundColor: '#ffffff',
      padding: '20px',
      overflowY: 'auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: '15px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f1f1f',
      margin: 0,
    },
    backButton: {
      backgroundColor: '#0078d4',
      color: 'white',
      border: 'none',
      padding: '8px 15px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
    },
    searchBar: {
      width: '100%',
      padding: '10px 15px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      marginBottom: '20px',
      fontSize: '14px',
    },
    addButton: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      marginBottom: '20px',
    },
    contactsList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '15px',
    },
    contactCard: {
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '15px',
      backgroundColor: '#fafafa',
      transition: 'box-shadow 0.2s',
      cursor: 'pointer',
    },
    contactCardHover: {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    contactName: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#1f1f1f',
      marginBottom: '5px',
    },
    contactEmail: {
      fontSize: '14px',
      color: '#0078d4',
      marginBottom: '5px',
    },
    contactPhone: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '5px',
    },
    contactCompany: {
      fontSize: '12px',
      color: '#999',
      fontStyle: 'italic',
    },
    contactNotes: {
      fontSize: '12px',
      color: '#666',
      marginTop: '5px',
      fontStyle: 'italic',
    },
    contactActions: {
      marginTop: '10px',
      display: 'flex',
      gap: '10px',
    },
    actionButton: {
      backgroundColor: '#0078d4',
      color: 'white',
      border: 'none',
      padding: '5px 10px',
      borderRadius: '3px',
      cursor: 'pointer',
      fontSize: '12px',
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      padding: '5px 10px',
      borderRadius: '3px',
      cursor: 'pointer',
      fontSize: '12px',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      width: '400px',
      maxHeight: '80vh',
      overflowY: 'auto',
    },
    formGroup: {
      marginBottom: '15px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
    },
    input: {
      width: '100%',
      padding: '8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
    },
    textarea: {
      width: '100%',
      padding: '8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end',
      marginTop: '20px',
    },
    saveButton: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    cancelButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
    },
  };

  // Carregar contatos do backend
  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('triarc_email_token');
      
      const response = await fetch(`http://localhost:5000/api/contacts?search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else {
        console.error('Erro ao carregar contatos');
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar contato
  const saveContact = async (contactData) => {
    try {
      const token = localStorage.getItem('triarc_email_token');
      const url = editingContact 
        ? `http://localhost:5000/api/contacts/${editingContact.id}`
        : 'http://localhost:5000/api/contacts';
      
      const method = editingContact ? 'PUT' : 'POST';
      
      console.log('Enviando contato:', contactData);
      console.log('Token:', token);
      console.log('URL:', url);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      console.log('Resposta:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Resultado:', result);
        await loadContacts();
        setShowContactForm(false);
        setEditingContact(null);
        alert(editingContact ? 'Contato atualizado com sucesso!' : 'Contato criado com sucesso!');
      } else {
        const errorText = await response.text();
        console.error('Erro na resposta:', errorText);
        alert(`Erro ao salvar contato: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao salvar contato:', error);
      alert(`Erro ao salvar contato: ${error.message}`);
    }
  };

  // Excluir contato
  const deleteContact = async (contactId) => {
    if (!confirm('Tem certeza que deseja excluir este contato?')) return;
    
    try {
      const token = localStorage.getItem('triarc_email_token');
      
      const response = await fetch(`http://localhost:5000/api/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await loadContacts();
        alert('Contato excluído com sucesso!');
      } else {
        alert('Erro ao excluir contato');
      }
    } catch (error) {
      console.error('Erro ao excluir contato:', error);
      alert('Erro ao excluir contato');
    }
  };

  // Enviar email para contato
  const sendEmailToContact = async (contact, subject, body) => {
    try {
      const token = localStorage.getItem('triarc_email_token');
      
      const response = await fetch(`http://localhost:5000/api/contacts/${contact.id}/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, body }),
      });

      if (response.ok) {
        alert(`Email enviado para ${contact.email}!`);
        setShowEmailModal(false);
        setSelectedContact(null);
      } else {
        alert('Erro ao enviar email');
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      alert('Erro ao enviar email');
    }
  };

  // Ligar para contato
  const callContact = (phone) => {
    if (phone) {
      // Abrir aplicativo de telefone padrão do sistema
      window.open(`tel:${phone}`, '_self');
    } else {
      alert('Número de telefone não disponível');
    }
  };

  // Filtrar contatos
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Carregar contatos quando o componente monta ou termo de busca muda
  useEffect(() => {
    loadContacts();
  }, [searchTerm]);

  return (
    <div style={contactsStyles.container}>
      <div style={contactsStyles.header}>
        <h1 style={contactsStyles.title}>
          👥 Contatos
        </h1>
        <button style={contactsStyles.backButton} onClick={onBack}>
          ← Voltar
        </button>
      </div>
      
      <input 
        type="text" 
        placeholder="Buscar contatos..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={contactsStyles.searchBar}
      />
      
      <button 
        style={contactsStyles.addButton}
        onClick={() => {
          setEditingContact(null);
          setShowContactForm(true);
        }}
      >
        + Novo Contato
      </button>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Carregando contatos...
        </div>
      ) : (
        <div style={contactsStyles.contactsList}>
          {filteredContacts.map(contact => (
            <div key={contact.id} style={contactsStyles.contactCard}>
              <div style={contactsStyles.contactName}>{contact.name}</div>
              <div style={contactsStyles.contactEmail}>{contact.email}</div>
              <div style={contactsStyles.contactPhone}>{contact.phone}</div>
              <div style={contactsStyles.contactCompany}>
                {contact.company} - {contact.department}
              </div>
              {contact.notes && (
                <div style={contactsStyles.contactNotes}>
                  {contact.notes}
                </div>
              )}
              <div style={contactsStyles.contactActions}>
                <button 
                  style={contactsStyles.actionButton}
                  onClick={() => {
                    setSelectedContact(contact);
                    setShowEmailModal(true);
                  }}
                >
                  📧 Email
                </button>
                <button 
                  style={contactsStyles.actionButton}
                  onClick={() => callContact(contact.phone)}
                >
                  📞 Ligar
                </button>
                <button 
                  style={contactsStyles.actionButton}
                  onClick={() => {
                    setEditingContact(contact);
                    setShowContactForm(true);
                  }}
                >
                  ✏️ Editar
                </button>
                <button 
                  style={contactsStyles.deleteButton}
                  onClick={() => deleteContact(contact.id)}
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Formulário de Contato */}
      {showContactForm && (
        <ContactFormModal
          contact={editingContact}
          onSave={saveContact}
          onClose={() => {
            setShowContactForm(false);
            setEditingContact(null);
          }}
          styles={contactsStyles}
        />
      )}

      {/* Modal de Envio de Email */}
      {showEmailModal && (
        <EmailModal
          contact={selectedContact}
          onSend={sendEmailToContact}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedContact(null);
          }}
          styles={contactsStyles}
        />
      )}
    </div>
  );
};

// Modal de Formulário de Contato
const ContactFormModal = ({ contact, onSave, onClose, styles }) => {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    department: contact?.department || '',
    notes: contact?.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dados do evento a serem salvos:', formData);
    console.log('selectedDate:', selectedDate);
    console.log('currentMonth passado como prop:', currentMonth);
    console.log('Mês que será salvo:', formData.month);
    onSave(formData);
  };

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <h2>{contact ? 'Editar Contato' : 'Novo Contato'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nome:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Telefone:</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Empresa:</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Departamento:</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Observações:</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              style={styles.textarea}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" style={styles.cancelButton} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" style={styles.saveButton}>
              {contact ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal de Envio de Email
const EmailModal = ({ contact, onSend, onClose, styles }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(contact, subject, body);
  };

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <h2>Enviar Email para {contact?.name}</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Para:</label>
            <input
              type="email"
              value={contact?.email}
              style={styles.input}
              disabled
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Assunto:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mensagem:</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={styles.textarea}
              required
            />
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" style={styles.cancelButton} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" style={styles.saveButton}>
              Enviar Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
