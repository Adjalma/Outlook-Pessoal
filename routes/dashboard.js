import express from 'express';
import { 
  getEmailStats,
  getSESStatus
} from '../services/emailService.js';
import { getLoginStats } from '../services/authService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Rota para obter estatísticas do dashboard
router.get('/stats', async (req, res) => {
  try {
    // Obter estatísticas de email dos últimos 30 dias
    const emailStats = await getEmailStats(30);
    
    // Calcular estatísticas resumidas
    const totalEmails = emailStats.reduce((sum, stat) => sum + stat.total_emails, 0);
    const sentEmails = emailStats.reduce((sum, stat) => sum + stat.sent_emails, 0);
    const failedEmails = emailStats.reduce((sum, stat) => sum + stat.failed_emails, 0);
    const successRate = totalEmails > 0 ? Math.round((sentEmails / totalEmails) * 100) : 0;
    
    // Emails enviados hoje
    const today = new Date().toISOString().split('T')[0];
    const todayStats = emailStats.find(stat => stat.date === today);
    const sentToday = todayStats ? todayStats.sent_emails : 0;
    
    // Obter estatísticas de login
    const loginStats = await getLoginStats();
    
    res.json({
      success: true,
      stats: {
        totalEmails,
        sentToday,
        successRate,
        subscribers: 0, // Implementar quando tiver listas
        loginStats: loginStats.slice(0, 7) // Últimos 7 dias
      }
    });

  } catch (error) {
    logger.error('Erro ao obter estatísticas do dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para obter estatísticas detalhadas de email
router.get('/email-stats', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const stats = await getEmailStats(days);
    
    res.json({
      success: true,
      stats
    });

  } catch (error) {
    logger.error('Erro ao obter estatísticas de email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para obter status do SES
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

// Rota para obter estatísticas de login
router.get('/login-stats', async (req, res) => {
  try {
    const stats = await getLoginStats();
    
    res.json({
      success: true,
      stats
    });

  } catch (error) {
    logger.error('Erro ao obter estatísticas de login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para obter informações do sistema
router.get('/system-info', async (req, res) => {
  try {
    const systemInfo = {
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      systemInfo
    });

  } catch (error) {
    logger.error('Erro ao obter informações do sistema:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router;
