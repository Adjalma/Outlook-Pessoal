# 📧 CONFIGURAÇÃO EMAIL CORPORATIVO - TRIARC SOLUTIONS

## 🎯 CONFIGURAÇÃO ESPECÍFICA

### **DOMÍNIO CORPORATIVO**
```
Domínio: triarcsolutions.com.br
Email Principal: admin@triarcsolutions.com.br
```

### **ENVIO DE EMAILS (AWS SES)**
```bash
# Configurações AWS SES
AWS_ACCESS_KEY_ID=SUA_ACCESS_KEY_AQUI
AWS_SECRET_ACCESS_KEY=SUA_SECRET_KEY_AQUI
AWS_REGION=us-east-1

# Domínio verificado no AWS SES
VERIFIED_DOMAIN=triarcsolutions.com.br
VERIFIED_EMAIL=admin@triarcsolutions.com.br
```

### **RECEBIMENTO DE EMAILS (Servidor Corporativo)**
```bash
# Configurações IMAP Corporativo
IMAP_HOST=mail.triarcsolutions.com.br
IMAP_PORT=993
IMAP_USER=admin@triarcsolutions.com.br
IMAP_PASS=senha_do_servidor_corporativo
```

---

## 🔧 COMO CONFIGURAR

### **1. OBTER CREDENCIAIS AWS SES**
1. **Acesse AWS Console** → IAM → Usuários
2. **Crie usuário:** `triarc-email-system`
3. **Anexe política:** `AmazonSESFullAccess`
4. **Gere Access Key e Secret Key**

### **2. CONFIGURAR SERVIDOR IMAP CORPORATIVO**
**Opção A: Servidor Próprio**
```bash
IMAP_HOST=mail.triarcsolutions.com.br
IMAP_PORT=993
IMAP_USER=admin@triarcsolutions.com.br
IMAP_PASS=sua_senha_corporativa
```

**Opção B: Gmail Corporativo**
```bash
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=admin@triarcsolutions.com.br
IMAP_PASS=senha_app_google
```

**Opção C: Outlook Corporativo**
```bash
IMAP_HOST=outlook.office365.com
IMAP_PORT=993
IMAP_USER=admin@triarcsolutions.com.br
IMAP_PASS=sua_senha_outlook
```

### **3. CRIAR ARQUIVO .env**
```bash
# Copie o arquivo de exemplo
cp env.production.example .env

# Edite com suas credenciais
nano .env
```

---

## 📋 CONFIGURAÇÃO COMPLETA DO .env

```bash
# Configurações do Sistema de Email Triarc - CORPORATIVO

# Porta do servidor
PORT=5000

# JWT Secret
JWT_SECRET=triarc_email_secret_key_2025_very_secure

# Configurações AWS SES - ENVIO
AWS_ACCESS_KEY_ID=SUA_ACCESS_KEY_AQUI
AWS_SECRET_ACCESS_KEY=SUA_SECRET_KEY_AQUI
AWS_REGION=us-east-1

# Domínio corporativo verificado
VERIFIED_DOMAIN=triarcsolutions.com.br
VERIFIED_EMAIL=admin@triarcsolutions.com.br

# Configurações IMAP - RECEBIMENTO CORPORATIVO
IMAP_HOST=mail.triarcsolutions.com.br
IMAP_PORT=993
IMAP_USER=admin@triarcsolutions.com.br
IMAP_PASS=sua_senha_corporativa

# Configurações de banco de dados
DB_PATH=./database.sqlite

# Configurações de upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,jpeg,png,gif

# Configurações de segurança
BCRYPT_ROUNDS=10
TOKEN_EXPIRES_IN=24h

# Configurações de produção
NODE_ENV=production
DEBUG=false
```

---

## 🚀 TESTANDO O SISTEMA CORPORATIVO

### **1. Teste de Envio**
```bash
curl -X POST http://localhost:5000/api/emails/send \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "cliente@exemplo.com",
    "subject": "Email Corporativo Triarc",
    "body": "Este é um email enviado pelo sistema corporativo da Triarc Solutions."
  }'
```

### **2. Teste de Recebimento**
```bash
curl -X POST http://localhost:5000/api/emails/sync \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@triarcsolutions.com.br",
    "password": "sua_senha_corporativa"
  }'
```

---

## 📊 FUNCIONALIDADES CORPORATIVAS

### **✅ ENVIO CORPORATIVO**
- ✅ **Domínio:** `triarcsolutions.com.br`
- ✅ **Remetente:** `admin@triarcsolutions.com.br`
- ✅ **AWS SES:** Envio profissional
- ✅ **Anexos:** Suportados
- ✅ **Templates:** Corporativos

### **✅ RECEBIMENTO CORPORATIVO**
- ✅ **Domínio:** `triarcsolutions.com.br`
- ✅ **Destinatário:** `admin@triarcsolutions.com.br`
- ✅ **IMAP:** Servidor corporativo
- ✅ **Sincronização:** Automática
- ✅ **Organização:** Pastas corporativas

### **✅ INTEGRAÇÃO COMPLETA**
- ✅ **Calendário:** Reuniões Teams
- ✅ **Contatos:** Clientes corporativos
- ✅ **Pastas:** Organização empresarial
- ✅ **Busca:** Emails corporativos

---

## ⚠️ PROBLEMAS COMUNS CORPORATIVOS

### **Erro: "Connection refused"**
- **Causa:** Servidor IMAP não configurado
- **Solução:** Verifique com administrador de TI

### **Erro: "Invalid credentials"**
- **Causa:** Credenciais incorretas
- **Solução:** Verifique usuário e senha

### **Erro: "Domain not verified"**
- **Causa:** Domínio não verificado no AWS SES
- **Solução:** Verifique domínio no console AWS

---

## 🎯 PRÓXIMOS PASSOS

1. **Configure servidor IMAP corporativo**
2. **Obtenha credenciais AWS SES**
3. **Crie arquivo .env**
4. **Teste envio e recebimento**
5. **Configure usuários corporativos**

---

## 📞 SUPORTE TÉCNICO

### **Para Configuração IMAP:**
- **Contate administrador de TI**
- **Verifique configurações do servidor**
- **Teste conexão IMAP**

### **Para AWS SES:**
- **Console AWS SES**
- **Verificação de domínio**
- **Configuração de credenciais**

---

## 🚀 SISTEMA CORPORATIVO COMPLETO!

**Agora você tem:**
- ✅ **Email corporativo** `admin@triarcsolutions.com.br`
- ✅ **Envio profissional** via AWS SES
- ✅ **Recebimento corporativo** via IMAP
- ✅ **Sistema integrado** completo

**Pronto para uso corporativo!** 🎯
