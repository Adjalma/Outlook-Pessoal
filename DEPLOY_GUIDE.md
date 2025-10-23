# Sistema de Email Corporativo Triarc Solutions
# Guia de Deploy e Configuração de Domínio

## 🌐 CONFIGURAÇÃO DE DOMÍNIO

### Estrutura Recomendada:
- **Frontend**: `email.triarcsolutions.com.br`
- **API Backend**: `api.triarcsolutions.com.br` 
- **Sistema Principal**: `triarcsolutions.com.br`

## 📋 PASSO A PASSO PARA DEPLOY

### 1. PREPARAR PROJETO PARA GIT
```bash
# Inicializar repositório
git init
git add .
git commit -m "Initial commit: Sistema de Email Triarc"

# Conectar ao GitHub
git remote add origin https://github.com/triarc-solutions/email-system.git
git push -u origin main
```

### 2. CONFIGURAR VERCEL
1. Acesse: https://vercel.com
2. Conecte sua conta GitHub
3. Importe o repositório `triarc-solutions/email-system`
4. Configure as variáveis de ambiente (veja seção abaixo)

### 3. VARIÁVEIS DE AMBIENTE NO VERCEL
Configure estas variáveis no painel do Vercel:

```env
# Servidor
NODE_ENV=production
FRONTEND_URL=https://email.triarcsolutions.com.br

# AWS SES
AWS_ACCESS_KEY_ID=AKIA... (sua access key)
AWS_SECRET_ACCESS_KEY=... (sua secret key)
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@triarcsolutions.com.br
AWS_SES_FROM_NAME=Triarc Solutions

# JWT
JWT_SECRET=sua_chave_secreta_jwt_muito_forte_aqui_producao
JWT_EXPIRES_IN=24h

# CORS
ALLOWED_ORIGINS=https://email.triarcsolutions.com.br,https://triarcsolutions.com.br

# Logging
LOG_LEVEL=warn
```

### 4. CONFIGURAR DOMÍNIO NO VERCEL
1. No painel Vercel, vá em "Domains"
2. Adicione: `email.triarcsolutions.com.br`
3. Configure os registros DNS conforme instruções

### 5. REGISTROS DNS NECESSÁRIOS

#### Para o Subdomínio de Email:
```
Tipo: CNAME
Nome: email
Valor: cname.vercel-dns.com
TTL: 3600
```

#### Para AWS SES (já configurado):
```
Tipo: TXT
Nome: triarcsolutions.com.br
Valor: v=spf1 include:amazonses.com ~all

Tipo: CNAME
Nome: [token1]._domainkey.triarcsolutions.com.br
Valor: [token1].dkim.amazonses.com

Tipo: TXT
Nome: _dmarc.triarcsolutions.com.br
Valor: v=DMARC1; p=quarantine; rua=mailto:dmarc@triarcsolutions.com.br
```

## 🚀 COMANDOS DE DEPLOY

### Deploy Manual:
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login

# Deploy
vercel --prod
```

### Deploy Automático:
- Push para branch `main` = deploy automático
- Push para branch `develop` = preview deploy

## 📊 MONITORAMENTO

### Health Check:
- URL: `https://email.triarcsolutions.com.br/api/health`
- Status: 200 OK

### Logs:
- Acesse painel Vercel → Functions → Logs
- Ou configure integração com serviços de monitoramento

## 🔒 SEGURANÇA

### HTTPS:
- Automático no Vercel
- Certificado SSL gerenciado

### CORS:
- Configurado para domínios específicos
- Bloqueia requisições não autorizadas

### Rate Limiting:
- 100 requests por 15 minutos por IP
- Configurável via variáveis de ambiente

## 💰 CUSTOS ESTIMADOS

### Vercel:
- **Hobby Plan**: Gratuito (até 100GB bandwidth)
- **Pro Plan**: $20/mês (para uso empresarial)

### AWS SES:
- **Gratuito**: Até 62.000 emails/mês
- **Pago**: $0.10 por 1.000 emails após limite

## 🆘 SUPORTE

### Problemas Comuns:
1. **CORS Error**: Verificar ALLOWED_ORIGINS
2. **AWS SES Error**: Verificar credenciais e região
3. **Build Error**: Verificar dependências Node.js

### Contatos:
- **Suporte Técnico**: suporte@triarcsolutions.com.br
- **Email**: contato@triarcsolutions.com.br

## 📝 CHECKLIST DE DEPLOY

- [ ] Repositório Git configurado
- [ ] Vercel conectado ao GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio adicionado no Vercel
- [ ] DNS configurado
- [ ] AWS SES verificado
- [ ] Teste de envio de email
- [ ] Health check funcionando
- [ ] HTTPS ativo
- [ ] Monitoramento configurado
