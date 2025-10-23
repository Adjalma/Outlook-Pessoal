const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware básico
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' }
});
app.use(limiter);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Triarc Email System',
    version: '1.0.0'
  });
});

// Rota principal
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Sistema de Email Triarc Solutions</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; 
                   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                   min-height: 100vh; display: flex; align-items: center; justify-content: center; }
            .container { background: white; padding: 40px; border-radius: 10px; 
                        box-shadow: 0 10px 30px rgba(0,0,0,0.2); text-align: center; max-width: 500px; }
            .logo { width: 100px; height: 100px; margin: 0 auto 20px; background: #667eea; 
                   border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                   color: white; font-size: 24px; font-weight: bold; }
            h1 { color: #333; margin-bottom: 10px; }
            .btn { display: inline-block; padding: 12px 24px; margin: 5px; background: #667eea; 
                  color: white; text-decoration: none; border-radius: 5px; transition: background 0.3s; }
            .btn:hover { background: #5a6fd8; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">T</div>
            <h1>Sistema de Email Triarc Solutions</h1>
            <p>Sistema Corporativo de Gerenciamento de Emails</p>
            <a href="/api/health" class="btn" target="_blank">Health Check</a>
            <a href="https://github.com/Adjalma/Outlook-Pessoal" class="btn" target="_blank">GitHub</a>
        </div>
    </body>
    </html>
  `);
});

// Exportar para Vercel
module.exports = app;