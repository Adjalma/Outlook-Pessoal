import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração AWS SES
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

// Configuração do banco de dados
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/triarc_email.db');
const db = new sqlite3.Database(dbPath);

// Inicializar tabelas do sistema de email
export const initEmailTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabela de emails enviados
      db.run(`
        CREATE TABLE IF NOT EXISTS sent_emails (
          id TEXT PRIMARY KEY,
          to_email TEXT NOT NULL,
          from_email TEXT NOT NULL,
          subject TEXT NOT NULL,
          template_id TEXT,
          status TEXT DEFAULT 'pending',
          message_id TEXT,
          error_message TEXT,
          sent_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (template_id) REFERENCES email_templates (id)
        )
      `);

      // Tabela de templates
      db.run(`
        CREATE TABLE IF NOT EXISTS email_templates (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          subject TEXT NOT NULL,
          html_content TEXT NOT NULL,
          text_content TEXT,
          variables TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_by TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);

      // Tabela de listas de email
      db.run(`
        CREATE TABLE IF NOT EXISTS email_lists (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          subscriber_count INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_by TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);

      // Tabela de assinantes
      db.run(`
        CREATE TABLE IF NOT EXISTS subscribers (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          status TEXT DEFAULT 'active',
          subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          unsubscribed_at DATETIME,
          list_id TEXT,
          FOREIGN KEY (list_id) REFERENCES email_lists (id)
        )
      `);

      // Tabela de estatísticas
      db.run(`
        CREATE TABLE IF NOT EXISTS email_stats (
          id TEXT PRIMARY KEY,
          date DATE NOT NULL,
          emails_sent INTEGER DEFAULT 0,
          emails_delivered INTEGER DEFAULT 0,
          emails_bounced INTEGER DEFAULT 0,
          emails_complained INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      resolve();
    });
  });
};

// Função para enviar email simples
export const sendEmail = async (toEmail, subject, htmlContent, textContent = null, fromEmail = null) => {
  try {
    const emailId = uuidv4();
    const from = fromEmail || process.env.AWS_SES_FROM_EMAIL;
    const fromName = process.env.AWS_SES_FROM_NAME || 'Triarc Solutions';

    // Registrar email no banco
    db.run(`
      INSERT INTO sent_emails (id, to_email, from_email, subject, status)
      VALUES (?, ?, ?, ?, ?)
    `, [emailId, toEmail, from, subject, 'pending']);

    const params = {
      Source: `${fromName} <${from}>`,
      Destination: {
        ToAddresses: [toEmail]
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: 'UTF-8'
          }
        }
      }
    };

    // Adicionar conteúdo texto se fornecido
    if (textContent) {
      params.Message.Body.Text = {
        Data: textContent,
        Charset: 'UTF-8'
      };
    }

    const result = await ses.sendEmail(params).promise();
    
    // Atualizar status no banco
    db.run(`
      UPDATE sent_emails 
      SET status = 'sent', message_id = ?, sent_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [result.MessageId, emailId]);

    logger.info(`Email enviado com sucesso: ${emailId} para ${toEmail}`);
    
    return {
      success: true,
      messageId: result.MessageId,
      emailId: emailId
    };

  } catch (error) {
    logger.error('Erro ao enviar email:', error);
    
    // Atualizar status de erro no banco
    db.run(`
      UPDATE sent_emails 
      SET status = 'failed', error_message = ?
      WHERE id = ?
    `, [error.message, emailId]);

    return {
      success: false,
      error: error.message
    };
  }
};

// Função para enviar email com template
export const sendTemplateEmail = async (toEmail, templateId, variables = {}, fromEmail = null) => {
  try {
    // Buscar template
    const template = await getTemplate(templateId);
    if (!template) {
      throw new Error('Template não encontrado');
    }

    // Substituir variáveis no conteúdo
    let htmlContent = template.html_content;
    let textContent = template.text_content;
    let subject = template.subject;

    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, variables[key]);
      if (textContent) {
        textContent = textContent.replace(regex, variables[key]);
      }
      subject = subject.replace(regex, variables[key]);
    });

    // Enviar email
    const result = await sendEmail(toEmail, subject, htmlContent, textContent, fromEmail);
    
    if (result.success) {
      // Registrar template usado
      db.run(`
        UPDATE sent_emails 
        SET template_id = ?
        WHERE id = ?
      `, [templateId, result.emailId]);
    }

    return result;

  } catch (error) {
    logger.error('Erro ao enviar email com template:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Função para criar template
export const createTemplate = async (name, subject, htmlContent, textContent, variables, createdBy) => {
  try {
    const templateId = uuidv4();
    const variablesJson = JSON.stringify(variables || {});

    db.run(`
      INSERT INTO email_templates (id, name, subject, html_content, text_content, variables, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [templateId, name, subject, htmlContent, textContent, variablesJson, createdBy]);

    logger.info(`Template criado: ${templateId} - ${name}`);
    
    return {
      success: true,
      templateId: templateId
    };

  } catch (error) {
    logger.error('Erro ao criar template:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Função para buscar template
export const getTemplate = (templateId) => {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT * FROM email_templates WHERE id = ? AND is_active = 1
    `, [templateId], (err, template) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (template) {
        template.variables = JSON.parse(template.variables || '{}');
      }
      
      resolve(template);
    });
  });
};

// Função para listar templates
export const getTemplates = () => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT et.*, u.name as created_by_name
      FROM email_templates et
      LEFT JOIN users u ON et.created_by = u.id
      WHERE et.is_active = 1
      ORDER BY et.created_at DESC
    `, (err, templates) => {
      if (err) {
        reject(err);
        return;
      }
      
      templates.forEach(template => {
        template.variables = JSON.parse(template.variables || '{}');
      });
      
      resolve(templates);
    });
  });
};

// Função para atualizar template
export const updateTemplate = (templateId, updates) => {
  return new Promise((resolve, reject) => {
    const fields = [];
    const values = [];

    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.subject) {
      fields.push('subject = ?');
      values.push(updates.subject);
    }
    if (updates.html_content) {
      fields.push('html_content = ?');
      values.push(updates.html_content);
    }
    if (updates.text_content) {
      fields.push('text_content = ?');
      values.push(updates.text_content);
    }
    if (updates.variables) {
      fields.push('variables = ?');
      values.push(JSON.stringify(updates.variables));
    }
    if (updates.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(updates.is_active);
    }

    if (fields.length === 0) {
      reject(new Error('Nenhum campo para atualizar'));
      return;
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(templateId);

    db.run(`
      UPDATE email_templates 
      SET ${fields.join(', ')}
      WHERE id = ?
    `, values, function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ changes: this.changes });
    });
  });
};

// Função para enviar newsletter
export const sendNewsletter = async (templateId, listId, variables = {}) => {
  try {
    // Buscar assinantes da lista
    const subscribers = await getSubscribersByList(listId);
    if (subscribers.length === 0) {
      throw new Error('Nenhum assinante encontrado na lista');
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Enviar para cada assinante
    for (const subscriber of subscribers) {
      const emailVariables = {
        ...variables,
        subscriber_name: subscriber.name || 'Cliente',
        subscriber_email: subscriber.email
      };

      const result = await sendTemplateEmail(
        subscriber.email, 
        templateId, 
        emailVariables
      );

      results.push({
        email: subscriber.email,
        success: result.success,
        error: result.error
      });

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }

      // Pequena pausa para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger.info(`Newsletter enviada: ${successCount} sucessos, ${errorCount} erros`);

    return {
      success: true,
      totalSent: subscribers.length,
      successCount,
      errorCount,
      results
    };

  } catch (error) {
    logger.error('Erro ao enviar newsletter:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Função para adicionar assinante
export const addSubscriber = async (email, name, listId) => {
  try {
    const subscriberId = uuidv4();

    db.run(`
      INSERT INTO subscribers (id, email, name, list_id)
      VALUES (?, ?, ?, ?)
    `, [subscriberId, email, name, listId]);

    // Atualizar contador da lista
    db.run(`
      UPDATE email_lists 
      SET subscriber_count = subscriber_count + 1
      WHERE id = ?
    `, [listId]);

    logger.info(`Assinante adicionado: ${email} à lista ${listId}`);
    
    return {
      success: true,
      subscriberId: subscriberId
    };

  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return {
        success: false,
        error: 'Email já está cadastrado nesta lista'
      };
    }
    
    logger.error('Erro ao adicionar assinante:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Função para buscar assinantes por lista
export const getSubscribersByList = (listId) => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT * FROM subscribers 
      WHERE list_id = ? AND status = 'active'
      ORDER BY subscribed_at DESC
    `, [listId], (err, subscribers) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(subscribers);
    });
  });
};

// Função para criar lista de email
export const createEmailList = async (name, description, createdBy) => {
  try {
    const listId = uuidv4();

    db.run(`
      INSERT INTO email_lists (id, name, description, created_by)
      VALUES (?, ?, ?, ?)
    `, [listId, name, description, createdBy]);

    logger.info(`Lista de email criada: ${listId} - ${name}`);
    
    return {
      success: true,
      listId: listId
    };

  } catch (error) {
    logger.error('Erro ao criar lista de email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Função para obter estatísticas
export const getEmailStats = (days = 30) => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_emails,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent_emails,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_emails,
        COUNT(DISTINCT to_email) as unique_recipients
      FROM sent_emails 
      WHERE created_at >= date('now', '-${days} days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(stats);
    });
  });
};

// Função para verificar status do SES
export const getSESStatus = async () => {
  try {
    const result = await ses.getSendQuota().promise();
    return {
      success: true,
      quota: result
    };
  } catch (error) {
    logger.error('Erro ao verificar status SES:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
