import jwt from 'jsonwebtoken';
import { verifyToken } from '../services/authService.js';
import { logger } from '../utils/logger.js';

// Middleware de autenticação
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      logger.warn('Tentativa de acesso sem token', {
        ip: req.ip,
        url: req.url,
        method: req.method
      });
      
      return res.status(401).json({
        success: false,
        error: 'Token de acesso necessário'
      });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      logger.warn('Token inválido', {
        ip: req.ip,
        url: req.url,
        method: req.method
      });
      
      return res.status(403).json({
        success: false,
        error: 'Token inválido ou expirado'
      });
    }

    // Adicionar informações do usuário à requisição
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();

  } catch (error) {
    logger.error('Erro no middleware de autenticação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar se é admin
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticação necessária'
    });
  }

  if (req.user.role !== 'admin') {
    logger.warn('Tentativa de acesso administrativo sem permissão', {
      userId: req.user.id,
      email: req.user.email,
      ip: req.ip,
      url: req.url
    });
    
    return res.status(403).json({
      success: false,
      error: 'Acesso administrativo necessário'
    });
  }

  next();
};

// Middleware para verificar rate limiting personalizado
export const customRateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpar requisições antigas
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    } else {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);

    if (userRequests.length >= maxRequests) {
      logger.warn('Rate limit excedido', {
        ip: key,
        requests: userRequests.length,
        windowMs,
        maxRequests
      });
      
      return res.status(429).json({
        success: false,
        error: 'Muitas requisições. Tente novamente mais tarde.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Adicionar requisição atual
    userRequests.push(now);
    requests.set(key, userRequests);

    next();
  };
};

// Middleware para validação de entrada
export const validateInput = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body);
      
      if (error) {
        logger.warn('Validação de entrada falhou', {
          error: error.details,
          body: req.body,
          ip: req.ip
        });
        
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      next();
    } catch (error) {
      logger.error('Erro na validação de entrada:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };
};

// Middleware para sanitização de dados
export const sanitizeInput = (req, res, next) => {
  try {
    // Função para sanitizar strings
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      
      return str
        .trim()
        .replace(/[<>]/g, '') // Remover tags HTML básicas
        .replace(/javascript:/gi, '') // Remover javascript:
        .replace(/on\w+=/gi, ''); // Remover event handlers
    };

    // Função para sanitizar objeto recursivamente
    const sanitizeObject = (obj) => {
      if (obj === null || obj === undefined) return obj;
      
      if (typeof obj === 'string') {
        return sanitizeString(obj);
      }
      
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      if (typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
      }
      
      return obj;
    };

    // Sanitizar body, query e params
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('Erro na sanitização de entrada:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Middleware para logging de operações sensíveis
export const logSensitiveOperation = (operation) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log da operação sensível
      logger.info(`Sensitive Operation: ${operation}`, {
        userId: req.user?.id,
        email: req.user?.email,
        ip: req.ip,
        url: req.url,
        method: req.method,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString()
      });
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware para CORS personalizado
export const customCORS = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://triarcsolutions.com.br',
    'https://www.triarcsolutions.com.br'
  ];

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

export default {
  authenticateToken,
  requireAdmin,
  customRateLimit,
  validateInput,
  sanitizeInput,
  logSensitiveOperation,
  customCORS
};
