import express from 'express';
import { body, validationResult } from 'express-validator';
import { 
  login, 
  register, 
  logout, 
  verifyToken, 
  getUserById,
  getUsers,
  updateUser,
  changePassword,
  getLoginStats
} from '../services/authService.js';
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

// Rota de login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await login(email, password, ipAddress);
    
    res.json({
      success: true,
      token: result.token,
      user: result.user
    });

  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// Rota de registro
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').isLength({ min: 2 }),
  body('role').optional().isIn(['user', 'admin'])
], validateRequest, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    const result = await register(email, password, name, role);
    
    res.json({
      success: true,
      user: result
    });

  } catch (error) {
    logger.error('Erro no registro:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Rota de logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      await logout(token);
    }

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    logger.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token não fornecido'
      });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    const user = await getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    logger.error('Erro na verificação do token:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para obter usuários (apenas admin)
router.get('/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    const users = await getUsers();
    
    res.json({
      success: true,
      users
    });

  } catch (error) {
    logger.error('Erro ao obter usuários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para atualizar usuário
router.put('/users/:id', [
  body('name').optional().isLength({ min: 2 }),
  body('role').optional().isIn(['user', 'admin']),
  body('is_active').optional().isBoolean()
], validateRequest, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    const { id } = req.params;
    const updates = req.body;

    const result = await updateUser(id, updates);
    
    res.json({
      success: true,
      changes: result.changes
    });

  } catch (error) {
    logger.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para alterar senha
router.put('/change-password', [
  body('currentPassword').isLength({ min: 6 }),
  body('newPassword').isLength({ min: 6 })
], validateRequest, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    const { currentPassword, newPassword } = req.body;

    const result = await changePassword(decoded.userId, currentPassword, newPassword);
    
    res.json({
      success: true,
      changes: result.changes
    });

  } catch (error) {
    logger.error('Erro ao alterar senha:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Rota para estatísticas de login
router.get('/login-stats', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

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

export default router;
