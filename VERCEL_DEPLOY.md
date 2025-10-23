# Configuração de Deploy Vercel
# Sistema de Email Corporativo Triarc Solutions

## Configuração do Projeto

### 1. Importar Repositório
- URL: https://github.com/Adjalma/Outlook-Pessoal
- Framework: Other
- Root Directory: . (raiz)

### 2. Build Settings
- Build Command: cd frontend && npm run build
- Output Directory: frontend/dist
- Install Command: npm install && cd frontend && npm install

### 3. Environment Variables
Configure estas variáveis no painel Vercel:

```env
NODE_ENV=production
FRONTEND_URL=https://email.triarcsolutions.com.br
ALLOWED_ORIGINS=https://email.triarcsolutions.com.br,https://api.triarcsolutions.com.br,https://triarcsolutions.com.br
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@triarcsolutions.com.br
AWS_SES_FROM_NAME=Triarc Solutions
JWT_SECRET=chave_secreta_jwt_forte_producao
JWT_EXPIRES_IN=24h
LOG_LEVEL=warn
```

### 4. Domínios
Adicionar no painel Vercel:
- email.triarcsolutions.com.br
- api.triarcsolutions.com.br

### 5. Deploy Automático
- Branch main = produção
- Branch develop = preview

## Comandos de Deploy

### Deploy Manual
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Deploy via Git
```bash
# Push para produção
git push origin main

# Push para preview
git push origin develop
```

## Verificação

### Health Check
- URL: https://email.triarcsolutions.com.br/api/health
- Status esperado: 200 OK

### Logs
- Acessar: Vercel Dashboard > Functions > Logs
- Verificar erros de build e runtime

## Troubleshooting

### Build Error
- Verificar dependências Node.js
- Verificar scripts no package.json
- Verificar arquivos de configuração

### Runtime Error
- Verificar variáveis de ambiente
- Verificar logs do Vercel
- Verificar conectividade AWS SES

### DNS Error
- Verificar registros DNS
- Aguardar propagação (até 24h)
- Verificar configuração no Vercel
