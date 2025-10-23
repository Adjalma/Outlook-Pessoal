import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do logger
const logLevel = process.env.LOG_LEVEL || 'info';
const logFile = process.env.LOG_FILE || path.join(__dirname, '../logs/triarc_email.log');

// Criar diretório de logs se não existir
const logDir = path.dirname(logFile);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configuração do formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Configuração do logger
export const logger = winston.createLogger({
  level: logLevel,
  format: customFormat,
  defaultMeta: { 
    service: 'triarc-email-system',
    version: '1.0.0'
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          let log = `${timestamp} [${level}]: ${message}`;
          if (stack) {
            log += `\n${stack}`;
          }
          return log;
        })
      )
    }),
    
    // File transport para todos os logs
    new winston.transports.File({
      filename: logFile,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // File transport para erros
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ],
  
  // Tratamento de exceções não capturadas
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 3,
      tailable: true
    })
  ],
  
  // Tratamento de rejeições de Promise não capturadas
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 3,
      tailable: true
    })
  ]
});

// Função para log de requisições HTTP
export const logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// Função para log de erros
export const logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...context
  });
};

// Função para log de operações de email
export const logEmailOperation = (operation, data) => {
  logger.info(`Email Operation: ${operation}`, data);
};

// Função para log de autenticação
export const logAuth = (action, data) => {
  logger.info(`Auth: ${action}`, data);
};

// Função para log de performance
export const logPerformance = (operation, duration, data = {}) => {
  logger.info(`Performance: ${operation}`, {
    duration: `${duration}ms`,
    ...data
  });
};

// Função para log de segurança
export const logSecurity = (event, data) => {
  logger.warn(`Security: ${event}`, data);
};

// Configuração para desenvolvimento
if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Configuração para produção
if (process.env.NODE_ENV === 'production') {
  logger.remove(winston.transports.Console);
}

export default logger;
