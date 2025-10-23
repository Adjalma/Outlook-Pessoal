import express from 'express';
import { body, validationResult } from 'express-validator';
import { 
  sendEmail,
  sendTemplateEmail,
  sendNewsletter,
  getEmailStats,
  getSESStatus
} from '../services/emailService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Middleware de validação
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: errors.array()
    });
  }
  next();
};

// Rota para enviar email simples
router.post('/send', [
  body('to').isEmail().normalizeEmail(),
  body('subject').isLength({ min: 1, max: 200 }),
  body('content').isLength({ min: 1 }),
  body('from').optional().isEmail().normalizeEmail()
], validateRequest, async (req, res) => {
  try {
    const { to, subject, content, from } = req.body;

    const result = await sendEmail(to, subject, content, null, from);
    
    if (result.success) {
      res.json({
        success: true,
        messageId: result.messageId,
        emailId: result.emailId
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    logger.error('Erro ao enviar email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para enviar email com template
router.post('/send-template', [
  body('to').isEmail().normalizeEmail(),
  body('templateId').isUUID(),
  body('variables').optional().isObject(),
  body('from').optional().isEmail().normalizeEmail()
], validateRequest, async (req, res) => {
  try {
    const { to, templateId, variables, from } = req.body;

    const result = await sendTemplateEmail(to, templateId, variables, from);
    
    if (result.success) {
      res.json({
        success: true,
        messageId: result.messageId,
        emailId: result.emailId
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    logger.error('Erro ao enviar email com template:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para enviar newsletter
router.post('/send-newsletter', [
  body('templateId').isUUID(),
  body('listId').isUUID(),
  body('variables').optional().isObject()
], validateRequest, async (req, res) => {
  try {
    const { templateId, listId, variables } = req.body;

    const result = await sendNewsletter(templateId, listId, variables);
    
    if (result.success) {
      res.json({
        success: true,
        totalSent: result.totalSent,
        successCount: result.successCount,
        errorCount: result.errorCount,
        results: result.results
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    logger.error('Erro ao enviar newsletter:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para obter emails recentes
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const emails = await getRecentEmails(limit, offset);
    
    res.json({
      success: true,
      emails
    });

  } catch (error) {
    logger.error('Erro ao obter emails recentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para obter estatísticas de email
router.get('/stats', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const stats = await getEmailStats(days);
    
    res.json({
      success: true,
      stats
    });

  } catch (error) {
    logger.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para verificar status do SES
router.get('/ses-status', async (req, res) => {
  try {
    const result = await getSESStatus();
    
    if (result.success) {
      res.json({
        success: true,
        quota: result.quota
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    logger.error('Erro ao verificar status SES:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Função auxiliar para obter emails recentes
const getRecentEmails = (limit, offset) => {
  return new Promise((resolve, reject) => {
    const sqlite3 = require('sqlite3');
    const path = require('path');
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/triarc_email.db');
    const db = new sqlite3.Database(dbPath);
    
    db.all(`
      SELECT se.*, et.name as template_name
      FROM sent_emails se
      LEFT JOIN email_templates et ON se.template_id = et.id
      ORDER BY se.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset], (err, emails) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(emails);
    });
  });
};

export default router;
