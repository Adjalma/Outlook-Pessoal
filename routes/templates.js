import express from 'express';
import { body, validationResult } from 'express-validator';
import { 
  createTemplate,
  getTemplate,
  getTemplates,
  updateTemplate
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

// Rota para criar template
router.post('/', [
  body('name').isLength({ min: 1, max: 100 }),
  body('subject').isLength({ min: 1, max: 200 }),
  body('htmlContent').isLength({ min: 1 }),
  body('textContent').optional(),
  body('variables').optional().isArray()
], validateRequest, async (req, res) => {
  try {
    const { name, subject, htmlContent, textContent, variables } = req.body;
    const createdBy = req.user.id; // Vem do middleware de autenticação

    const result = await createTemplate(name, subject, htmlContent, textContent, variables, createdBy);
    
    if (result.success) {
      res.json({
        success: true,
        templateId: result.templateId
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    logger.error('Erro ao criar template:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para obter template específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = await getTemplate(id);
    
    if (template) {
      res.json({
        success: true,
        template
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Template não encontrado'
      });
    }

  } catch (error) {
    logger.error('Erro ao obter template:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para listar templates
router.get('/', async (req, res) => {
  try {
    const templates = await getTemplates();
    
    res.json({
      success: true,
      templates
    });

  } catch (error) {
    logger.error('Erro ao listar templates:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para atualizar template
router.put('/:id', [
  body('name').optional().isLength({ min: 1, max: 100 }),
  body('subject').optional().isLength({ min: 1, max: 200 }),
  body('htmlContent').optional().isLength({ min: 1 }),
  body('textContent').optional(),
  body('variables').optional().isArray(),
  body('is_active').optional().isBoolean()
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await updateTemplate(id, updates);
    
    res.json({
      success: true,
      changes: result.changes
    });

  } catch (error) {
    logger.error('Erro ao atualizar template:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para deletar template (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await updateTemplate(id, { is_active: false });
    
    res.json({
      success: true,
      changes: result.changes
    });

  } catch (error) {
    logger.error('Erro ao deletar template:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router;
