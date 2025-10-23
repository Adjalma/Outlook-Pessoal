import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Importar rotas
import authRoutes from './routes/auth.js';
import emailRoutes from './routes/email.js';
import templateRoutes from './routes/templates.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';

// Importar middleware
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

// Importar configuração do banco
import { initDatabase } from './config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.',
  },
});

app.use(limiter);

// CORS configurado para o frontend
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [process.env.FRONTEND_URL || 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas (requerem autenticação)
app.use('/api/email', authenticateToken, emailRoutes);
app.use('/api/templates', authenticateToken, templateRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/users', authenticateToken, userRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Triarc Email System',
    version: '1.0.0'
  });
});

// Servir arquivos estáticos (para templates de email)
app.use('/static', express.static(join(__dirname, 'public')));

// Middleware de erro global
app.use(errorHandler);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Inicializar servidor
async function startServer() {
  try {
    // Inicializar banco de dados
    await initDatabase();
    logger.info('Banco de dados inicializado com sucesso');

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor Triarc Email rodando na porta ${PORT}`);
      logger.info(`📧 Sistema de email corporativo ativo`);
      logger.info(`🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      logger.info(`📊 Dashboard: http://localhost:${PORT}/api/dashboard`);
    });
  } catch (error) {
    logger.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido. Encerrando servidor...');
  process.exit(0);
});

// Para Vercel, exportar o app diretamente
export default app;

// Para desenvolvimento local, iniciar servidor
if (process.env.NODE_ENV !== 'production') {
  startServer();
}
