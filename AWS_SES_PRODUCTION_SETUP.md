# 🚀 CONFIGURAÇÃO AWS SES PARA PRODUÇÃO - TRIARC SOLUTIONS

## 📋 PASSO A PASSO PARA CONFIGURAR AWS SES

### **1. Acesse o Console AWS**
- Vá para: https://console.aws.amazon.com/ses/
- Faça login com sua conta AWS

### **2. Verificar Domínio**
1. **Clique em "Verified identities"**
2. **Clique em "Create identity"**
3. **Selecione "Domain"**
4. **Digite:** `triarcsolutions.com.br`
5. **Clique em "Create identity"**

### **3. Configurar DNS Records**
Após criar a identidade, você receberá os registros DNS para adicionar:

#### **Registro DKIM (3 registros):**
```
Nome: [hash1]._domainkey.triarcsolutions.com.br
Tipo: CNAME
Valor: [hash1].dkim.amazonses.com

Nome: [hash2]._domainkey.triarcsolutions.com.br
Tipo: CNAME
Valor: [hash2].dkim.amazonses.com

Nome: [hash3]._domainkey.triarcsolutions.com.br
Tipo: CNAME
Valor: [hash3].dkim.amazonses.com
```

#### **Registro SPF:**
```
Nome: triarcsolutions.com.br
Tipo: TXT
Valor: v=spf1 include:amazonses.com ~all
```

#### **Registro DMARC:**
```
Nome: _dmarc.triarcsolutions.com.br
Tipo: TXT
Valor: v=DMARC1; p=quarantine; rua=mailto:admin@triarcsolutions.com.br
```

### **4. Adicionar Registros no Provedor DNS**
- Acesse o painel do seu provedor de domínio
- Adicione todos os registros acima
- Aguarde propagação (pode levar até 24h)

### **5. Verificar Status**
- Volte ao AWS SES
- Aguarde o status mudar para "Verified" ✅

### **6. Solicitar Remoção do Sandbox**
1. **Clique em "Account dashboard"**
2. **Clique em "Request production access"**
3. **Preencha o formulário:**
   - **Use case:** Corporate email system
   - **Website URL:** https://triarcsolutions.com.br
   - **Description:** Internal corporate email system for Triarc Solutions
4. **Envie a solicitação**

### **7. Criar Usuário IAM**
1. **Vá para IAM Console**
2. **Clique em "Users"**
3. **Clique em "Create user"**
4. **Nome:** `triarc-email-ses-user`
5. **Anexar política:** `AmazonSESFullAccess`
6. **Criar Access Key**
7. **Salve as credenciais:**

```
AWS_ACCESS_KEY_ID=[sua_access_key]
AWS_SECRET_ACCESS_KEY=[sua_secret_key]
```

## 🔧 CONFIGURAÇÃO NO SISTEMA

### **Arquivo .env (Criar em backend/.env):**
```env
# Configurações de Produção
PORT=5000
JWT_SECRET=triarc_email_secret_key_2025_very_secure_production

# AWS SES - SUAS CREDENCIAIS REAIS
AWS_ACCESS_KEY_ID=sua_access_key_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_key_aqui
AWS_REGION=us-east-1

# Domínio verificado
VERIFIED_DOMAIN=triarcsolutions.com.br

# Configurações de banco
DB_PATH=./database.sqlite

# Configurações de segurança
BCRYPT_ROUNDS=12
TOKEN_EXPIRES_IN=24h
NODE_ENV=production
```

## 📧 EMAILS CRIADOS AUTOMATICAMENTE

O sistema criará automaticamente estes emails:

1. **admin@triarcsolutions.com.br** (Administrador)
2. **rafael.andres@triarcsolutions.com.br** (Rafael Andres)
3. **rodolfo.fernandes@triarcsolutions.com.br** (Rodolfo Fernandes)
4. **adjalma.aguiar@triarcsolutions.com.br** (Adjalma Aguiar)

## 🚀 DEPLOY EM PRODUÇÃO

### **Opção 1: Vercel (Recomendado)**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy do frontend
cd frontend
vercel --prod

# Deploy do backend (usando Railway ou Heroku)
```

### **Opção 2: Servidor Próprio**
```bash
# Instalar PM2 para produção
npm install -g pm2

# Iniciar aplicação
pm2 start server.js --name "triarc-email"
pm2 startup
pm2 save
```

## 🔒 SEGURANÇA EM PRODUÇÃO

1. **Altere o JWT_SECRET** para algo único e seguro
2. **Configure HTTPS** (certificado SSL)
3. **Configure firewall** (porta 5000)
4. **Backup automático** do banco de dados
5. **Monitoramento** de logs

## 📞 SUPORTE

Se precisar de ajuda com a configuração DNS ou AWS SES, me avise!
