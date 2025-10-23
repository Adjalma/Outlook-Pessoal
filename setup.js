#!/usr/bin/env node

/**
 * Script de Inicialização do Sistema de Email Corporativo Triarc Solutions
 * 
 * Este script configura e inicializa o sistema completo de email corporativo
 * com integração AWS SES e interface com rede neural responsiva.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Iniciando configuração do Sistema de Email Corporativo Triarc Solutions...\n');

// Função para criar diretórios necessários
function createDirectories() {
  console.log('📁 Criando diretórios necessários...');
  
  const directories = [
    './data',
    './logs',
    './templates',
    './uploads',
    './backups',
    './frontend/src/components',
    './frontend/src/pages'
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   ✅ ${dir} criado`);
    } else {
      console.log(`   ⚠️  ${dir} já existe`);
    }
  });
}

// Função para criar arquivo .env se não existir
function createEnvFile() {
  console.log('\n🔧 Configurando arquivo de ambiente...');
  
  const envPath = './.env';
  const envExamplePath = './ENV_CONFIG.md';
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      // Ler o conteúdo do exemplo
      const envContent = fs.readFileSync(envExamplePath, 'utf8');
      
      // Extrair apenas as variáveis de ambiente (linhas que começam com VARIABLE_NAME=)
      const envLines = envContent
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('#') && line.includes('='))
        .map(line => line.replace(/^#.*$/, '').trim())
        .filter(line => line);
      
      // Criar arquivo .env
      const envFileContent = [
        '# Sistema de Email Corporativo Triarc Solutions',
        '# Configuração de Ambiente',
        '',
        ...envLines,
        ''
      ].join('\n');
      
      fs.writeFileSync(envPath, envFileContent);
      console.log('   ✅ Arquivo .env criado a partir do exemplo');
    } else {
      // Criar arquivo .env básico
      const basicEnvContent = `# Sistema de Email Corporativo Triarc Solutions
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# AWS SES Configuration
AWS_ACCESS_KEY_ID=sua_access_key_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_key_aqui
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@triarcsolutions.com.br
AWS_SES_FROM_NAME=Triarc Solutions

# JWT Configuration
JWT_SECRET=sua_chave_secreta_jwt_aqui
JWT_EXPIRES_IN=24h

# Database
DATABASE_PATH=./data/triarc_email.db

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/triarc_email.log
`;
      
      fs.writeFileSync(envPath, basicEnvContent);
      console.log('   ✅ Arquivo .env básico criado');
    }
  } else {
    console.log('   ⚠️  Arquivo .env já existe');
  }
}

// Função para instalar dependências
function installDependencies() {
  console.log('\n📦 Instalando dependências...');
  
  try {
    console.log('   Instalando dependências do backend...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('   ✅ Dependências do backend instaladas');
    
    console.log('   Instalando dependências do frontend...');
    execSync('npm install', { stdio: 'inherit', cwd: './frontend' });
    console.log('   ✅ Dependências do frontend instaladas');
    
  } catch (error) {
    console.error('   ❌ Erro ao instalar dependências:', error.message);
    process.exit(1);
  }
}

// Função para criar templates padrão
function createDefaultTemplates() {
  console.log('\n📧 Criando templates padrão...');
  
  const templatesDir = './templates';
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  // Template de boas-vindas
  const welcomeTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo à Triarc Solutions</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bem-vindo à Triarc Solutions!</h1>
        </div>
        <div class="content">
            <h2>Olá {{subscriber_name}}!</h2>
            <p>É um prazer tê-lo(a) conosco. Agradecemos por escolher a Triarc Solutions como sua parceira em soluções tecnológicas.</p>
            
            <p>Com nossa experiência em:</p>
            <ul>
                <li>Gestão Empresarial</li>
                <li>Treinamento e Desenvolvimento</li>
                <li>Tecnologia e Inovação</li>
            </ul>
            
            <p>Estamos prontos para ajudar sua empresa a alcançar novos patamares de sucesso.</p>
            
            <a href="https://triarcsolutions.com.br" class="button">Conheça Nossos Serviços</a>
            
            <p>Se você tiver alguma dúvida, não hesite em entrar em contato conosco.</p>
            
            <p>Atenciosamente,<br>Equipe Triarc Solutions</p>
        </div>
        <div class="footer">
            <p>Triarc Solutions - Soluções Empresariais Integradas</p>
            <p>Email: contato@triarcsolutions.com.br | Site: triarcsolutions.com.br</p>
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync(path.join(templatesDir, 'welcome.html'), welcomeTemplate);
  console.log('   ✅ Template de boas-vindas criado');

  // Template de newsletter
  const newsletterTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Newsletter Triarc Solutions</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .article { margin: 20px 0; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Newsletter Triarc Solutions</h1>
            <p>{{newsletter_date}}</p>
        </div>
        <div class="content">
            <h2>Olá {{subscriber_name}}!</h2>
            <p>Confira as últimas novidades e insights da Triarc Solutions:</p>
            
            <div class="article">
                <h3>{{article_title}}</h3>
                <p>{{article_summary}}</p>
                <a href="{{article_link}}" class="button">Ler Mais</a>
            </div>
            
            <div class="article">
                <h3>Dicas de Gestão</h3>
                <p>{{management_tip}}</p>
            </div>
            
            <div class="article">
                <h3>Tecnologia em Foco</h3>
                <p>{{tech_insight}}</p>
            </div>
            
            <p>Obrigado por ser nosso assinante!</p>
            
            <p>Atenciosamente,<br>Equipe Triarc Solutions</p>
        </div>
        <div class="footer">
            <p>Triarc Solutions - Soluções Empresariais Integradas</p>
            <p>Email: newsletter@triarcsolutions.com.br | Site: triarcsolutions.com.br</p>
            <p><a href="{{unsubscribe_link}}">Cancelar assinatura</a></p>
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync(path.join(templatesDir, 'newsletter.html'), newsletterTemplate);
  console.log('   ✅ Template de newsletter criado');
}

// Função para criar script de inicialização
function createStartScripts() {
  console.log('\n🔧 Criando scripts de inicialização...');
  
  // Script para Windows
  const startScriptWindows = `@echo off
echo Iniciando Sistema de Email Corporativo Triarc Solutions...
echo.

echo Iniciando backend...
start "Backend" cmd /k "npm run dev"

echo Aguardando 3 segundos...
timeout /t 3 /nobreak > nul

echo Iniciando frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Sistema iniciado com sucesso!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo Dashboard: http://localhost:5173
echo.
echo Credenciais padrão:
echo Email: admin@triarcsolutions.com.br
echo Senha: admin123
echo.
pause`;

  fs.writeFileSync('./start-email-system.bat', startScriptWindows);
  console.log('   ✅ Script de inicialização Windows criado');

  // Script para Linux/Mac
  const startScriptUnix = `#!/bin/bash
echo "Iniciando Sistema de Email Corporativo Triarc Solutions..."
echo

echo "Iniciando backend..."
npm run dev &
BACKEND_PID=$!

echo "Aguardando 3 segundos..."
sleep 3

echo "Iniciando frontend..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo
echo "Sistema iniciado com sucesso!"
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo "Dashboard: http://localhost:5173"
echo
echo "Credenciais padrão:"
echo "Email: admin@triarcsolutions.com.br"
echo "Senha: admin123"
echo
echo "Pressione Ctrl+C para parar o sistema"

# Função para cleanup
cleanup() {
    echo "Parando sistema..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Aguardar
wait`;

  fs.writeFileSync('./start-email-system.sh', startScriptUnix);
  fs.chmodSync('./start-email-system.sh', '755');
  console.log('   ✅ Script de inicialização Unix criado');
}

// Função para criar documentação
function createDocumentation() {
  console.log('\n📚 Criando documentação...');
  
  const readmeContent = `# Sistema de Email Corporativo Triarc Solutions

## 🚀 Visão Geral

Sistema completo de email corporativo com integração AWS SES e interface administrativa com sistema de rede neural responsiva.

## ✨ Funcionalidades

- ✅ **Envio de Emails**: Individual e em massa
- ✅ **Templates Personalizados**: Sistema completo de templates HTML
- ✅ **Listas de Email**: Gerenciamento de assinantes
- ✅ **Dashboard Administrativo**: Interface moderna com rede neural
- ✅ **Autenticação Segura**: Sistema de login com JWT
- ✅ **Estatísticas**: Monitoramento e analytics
- ✅ **Integração AWS SES**: Envio confiável e escalável

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- Conta AWS com SES configurado
- Domínio triarcsolutions.com.br verificado

### Configuração Rápida
1. Execute o script de configuração:
   \`\`\`bash
   node setup.js
   \`\`\`

2. Configure suas credenciais AWS no arquivo \`.env\`

3. Inicie o sistema:
   \`\`\`bash
   # Windows
   start-email-system.bat
   
   # Linux/Mac
   ./start-email-system.sh
   \`\`\`

## 📧 Emails Corporativos Configurados

- **contato@triarcsolutions.com.br** - Contato geral
- **suporte@triarcsolutions.com.br** - Suporte técnico
- **comercial@triarcsolutions.com.br** - Vendas e comercial
- **rh@triarcsolutions.com.br** - Recursos humanos
- **financeiro@triarcsolutions.com.br** - Financeiro
- **ti@triarcsolutions.com.br** - Tecnologia da informação
- **marketing@triarcsolutions.com.br** - Marketing
- **newsletter@triarcsolutions.com.br** - Newsletter
- **noreply@triarcsolutions.com.br** - Emails automáticos

## 🔐 Acesso ao Sistema

- **URL**: http://localhost:5173
- **Usuário**: admin@triarcsolutions.com.br
- **Senha**: admin123

## 📊 Custos AWS SES

### Cenário Atual (3 emails)
- Volume: 1.000 emails/mês
- Custo: **R$ 0,00** (dentro do limite gratuito)

### Cenário Futuro (9 emails)
- Volume: 5.000 emails/mês
- Custo: **R$ 0,00** (ainda gratuito)

### Cenário Empresarial
- Volume: 50.000 emails/mês
- Custo: **R$ 0,00** (ainda gratuito)

## 🧪 Testar Configuração AWS SES

\`\`\`bash
node test-ses-config.js
\`\`\`

## 🚀 Próximos Passos

1. ✅ Configurar credenciais AWS SES
2. ✅ Verificar domínio no AWS SES
3. ✅ Configurar registros DNS (SPF, DKIM, DMARC)
4. ✅ Testar envio de emails
5. ✅ Configurar produção

## 📞 Suporte

Para suporte técnico, entre em contato:
- Email: suporte@triarcsolutions.com.br
- Site: https://triarcsolutions.com.br

---

**Triarc Solutions** - Soluções Empresariais Integradas
`;

  fs.writeFileSync('./README.md', readmeContent);
  console.log('   ✅ Documentação criada');
}

// Função principal
async function main() {
  try {
    createDirectories();
    createEnvFile();
    installDependencies();
    createDefaultTemplates();
    createStartScripts();
    createDocumentation();
    
    console.log('\n🎉 Configuração concluída com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Configure suas credenciais AWS SES no arquivo .env');
    console.log('2. Execute: start-email-system.bat (Windows) ou ./start-email-system.sh (Linux/Mac)');
    console.log('3. Acesse: http://localhost:5173');
    console.log('4. Login: admin@triarcsolutions.com.br / admin123');
    console.log('5. Teste a configuração: node test-ses-config.js');
    console.log('6. Configure emails pessoais: node configure-personal-emails.js');
    console.log('\n📚 Documentação:');
    console.log('- README.md - Documentação geral');
    console.log('- AWS_SES_SETUP.md - Configuração AWS SES');
    console.log('- EMAILS_PESSOAIS.md - Configuração emails pessoais');
    console.log('- ENV_CONFIG.md - Configuração de ambiente');
    console.log('\n🚀 Sistema pronto para uso!');
    
  } catch (error) {
    console.error('\n❌ Erro durante a configuração:', error.message);
    process.exit(1);
  }
}

// Executar configuração
main();
