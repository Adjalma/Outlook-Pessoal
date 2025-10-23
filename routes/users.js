import express from 'express';
import { body, validationResult } from 'express-validator';
import { 
  getUsers,
  updateUser,
  getUserById
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

// Rota para listar usuários (apenas admin)
router.get('/', async (req, res) => {
  try {
    const users = await getUsers();
    
    res.json({
      success: true,
      users
    });

  } catch (error) {
    logger.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para obter usuário específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    
    if (user) {
      res.json({
        success: true,
        user
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

  } catch (error) {
    logger.error('Erro ao obter usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para atualizar usuário
router.put('/:id', [
  body('name').optional().isLength({ min: 2 }),
  body('role').optional().isIn(['user', 'admin']),
  body('is_active').optional().isBoolean()
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verificar se o usuário está tentando atualizar outro usuário
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    // Usuários não-admin não podem alterar role ou status
    if (req.user.role !== 'admin') {
      delete updates.role;
      delete updates.is_active;
    }

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

// Rota para obter perfil do usuário atual
router.get('/profile/me', async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    
    if (user) {
      res.json({
        success: true,
        user
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

  } catch (error) {
    logger.error('Erro ao obter perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para atualizar perfil do usuário atual
router.put('/profile/me', [
  body('name').optional().isLength({ min: 2 })
], validateRequest, async (req, res) => {
  try {
    const updates = req.body;
    
    // Remover campos que não podem ser alterados pelo próprio usuário
    delete updates.role;
    delete updates.is_active;
    delete updates.email;

    const result = await updateUser(req.user.id, updates);
    
    res.json({
      success: true,
      changes: result.changes
    });

  } catch (error) {
    logger.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router;
