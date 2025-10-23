import { logger } from '../utils/logger.js';

// Middleware de tratamento de erros global
export const errorHandler = (err, req, res, next) => {
  // Log do erro
  logger.error('Erro não tratado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: err.details || err.message
    });
  }

  // Erro de autenticação
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado'
    });
  }

  // Erro de permissão
  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado'
    });
  }

  // Erro de recurso não encontrado
  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      error: 'Recurso não encontrado'
    });
  }

  // Erro de conflito
  if (err.name === 'ConflictError') {
    return res.status(409).json({
      success: false,
      error: 'Conflito de dados'
    });
  }

  // Erro de limite de taxa
  if (err.name === 'RateLimitError') {
    return res.status(429).json({
      success: false,
      error: 'Muitas requisições. Tente novamente mais tarde.'
    });
  }

  // Erro de AWS SES
  if (err.name === 'SESError') {
    return res.status(502).json({
      success: false,
      error: 'Erro no serviço de email',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Erro de banco de dados
  if (err.code && err.code.startsWith('SQLITE_')) {
    logger.error('Erro de banco de dados:', err);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Erro genérico
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Middleware para capturar erros assíncronos
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware para capturar erros de rotas não encontradas
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Rota não encontrada: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.name = 'NotFoundError';
  next(error);
};

// Middleware para capturar erros de sintaxe JSON
export const jsonErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.warn('Erro de sintaxe JSON:', {
      error: err.message,
      url: req.url,
      method: req.method,
      ip: req.ip
    });
    
    return res.status(400).json({
      success: false,
      error: 'JSON inválido'
    });
  }
  next(err);
};

// Middleware para capturar erros de timeout
export const timeoutHandler = (timeout = 30000) => {
  return (req, res, next) => {
    req.setTimeout(timeout, () => {
      const error = new Error('Timeout da requisição');
      error.statusCode = 408;
      error.name = 'TimeoutError';
      next(error);
    });
    next();
  };
};

// Middleware para capturar erros de tamanho de payload
export const payloadSizeHandler = (maxSize = '10mb') => {
  return (err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_PAYLOAD_SIZE') {
      logger.warn('Payload muito grande:', {
        error: err.message,
        url: req.url,
        method: req.method,
        ip: req.ip
      });
      
      return res.status(413).json({
        success: false,
        error: 'Payload muito grande',
        maxSize: maxSize
      });
    }
    next(err);
  };
};

// Função para criar erros personalizados
export const createError = (message, statusCode = 500, name = 'CustomError') => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.name = name;
  return error;
};

// Função para criar erros de validação
export const createValidationError = (message, details = []) => {
  const error = new Error(message);
  error.statusCode = 400;
  error.name = 'ValidationError';
  error.details = details;
  return error;
};

// Função para criar erros de autenticação
export const createAuthError = (message = 'Token inválido') => {
  const error = new Error(message);
  error.statusCode = 401;
  error.name = 'UnauthorizedError';
  return error;
};

// Função para criar erros de permissão
export const createForbiddenError = (message = 'Acesso negado') => {
  const error = new Error(message);
  error.statusCode = 403;
  error.name = 'ForbiddenError';
  return error;
};

// Função para criar erros de recurso não encontrado
export const createNotFoundError = (message = 'Recurso não encontrado') => {
  const error = new Error(message);
  error.statusCode = 404;
  error.name = 'NotFoundError';
  return error;
};

// Função para criar erros de conflito
export const createConflictError = (message = 'Conflito de dados') => {
  const error = new Error(message);
  error.statusCode = 409;
  error.name = 'ConflictError';
  return error;
};

// Função para criar erros de SES
export const createSESError = (message, originalError = null) => {
  const error = new Error(message);
  error.statusCode = 502;
  error.name = 'SESError';
  error.originalError = originalError;
  return error;
};

// Middleware para monitoramento de erros
export const errorMonitoring = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Monitorar erros 4xx e 5xx
    if (res.statusCode >= 400) {
      logger.warn('Erro HTTP detectado:', {
        statusCode: res.statusCode,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id,
        response: typeof data === 'string' ? data.substring(0, 500) : data
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

export default {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  jsonErrorHandler,
  timeoutHandler,
  payloadSizeHandler,
  createError,
  createValidationError,
  createAuthError,
  createForbiddenError,
  createNotFoundError,
  createConflictError,
  createSESError,
  errorMonitoring
};
