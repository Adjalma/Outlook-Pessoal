# 📧 GUIA COMPLETO - SISTEMA DE EMAIL TRIARC

## 🚀 CONFIGURAÇÃO AWS SES

### 1. **Obter Credenciais AWS SES**
1. **Acesse AWS Console** → IAM → Usuários
2. **Crie novo usuário:** `triarc-email-system`
3. **Anexe política:** `AmazonSESFullAccess`
4. **Gere Access Key e Secret Key**

### 2. **Configurar Arquivo .env**
```bash
# Configurações AWS SES
AWS_ACCESS_KEY_ID=SUA_ACCESS_KEY_AQUI
AWS_SECRET_ACCESS_KEY=SUA_SECRET_KEY_AQUI
AWS_REGION=us-east-1

# Domínio verificado
VERIFIED_DOMAIN=triarcsolutions.com.br
VERIFIED_EMAIL=adjalma.aguiar@yahoo.com
```

---

## 📥 CONFIGURAÇÃO IMAP (QUALQUER PROVEDOR)

### **✅ PROVEDORES SUPORTADOS:**

#### **Gmail (Google)**
```bash
Email: seu_email@gmail.com
IMAP: imap.gmail.com:993
Senha: Senha de app (não senha normal)
```

#### **Outlook/Hotmail (Microsoft)**
```bash
Email: seu_email@outlook.com
IMAP: outlook.office365.com:993
Senha: Sua senha normal
```

#### **Yahoo Mail**
```bash
Email: seu_email@yahoo.com
IMAP: imap.mail.yahoo.com:993
Senha: Senha de app
```

#### **Email Corporativo**
```bash
Email: admin@triarcsolutions.com.br
IMAP: mail.triarcsolutions.com.br:993
Senha: Sua senha corporativa
```

#### **Outros Provedores**
```bash
Email: seu_email@provedor.com
IMAP: imap.provedor.com:993
Senha: Sua senha
```

---

## 🔧 COMO CONFIGURAR

### **OPÇÃO 1: Detecção Automática**
O sistema detecta automaticamente o provedor pelo email:
- `@gmail.com` → `imap.gmail.com:993`
- `@outlook.com` → `outlook.office365.com:993`
- `@yahoo.com` → `imap.mail.yahoo.com:993`

### **OPÇÃO 2: Configuração Personalizada**
```bash
# No arquivo .env
IMAP_HOST=mail.suaempresa.com.br
IMAP_PORT=993
IMAP_USER=admin@triarcsolutions.com.br
IMAP_PASS=sua_senha_corporativa
```

### **OPÇÃO 3: Configuração via API**
```bash
curl -X POST http://localhost:5000/api/emails/sync \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@triarcsolutions.com.br",
    "password": "sua_senha",
    "imapHost": "mail.triarcsolutions.com.br",
    "imapPort": 993
  }'
```

---

## 🎯 PARA SEU CASO ESPECÍFICO

### **RECOMENDAÇÃO: Email Corporativo**
```
Email: admin@triarcsolutions.com.br
IMAP: mail.triarcsolutions.com.br:993
Senha: Senha do servidor de email da empresa
```

### **ALTERNATIVA: Gmail Corporativo**
```
Email: admin@triarcsolutions.com.br
IMAP: imap.gmail.com:993
Senha: Senha de app do Google
```

---

## 🔍 COMO DESCOBRIR SEU SERVIDOR IMAP

### **1. Verificar com Provedor**
- **Gmail:** `imap.gmail.com:993`
- **Outlook:** `outlook.office365.com:993`
- **Yahoo:** `imap.mail.yahoo.com:993`

### **2. Verificar Email Corporativo**
- **Contate seu administrador de TI**
- **Verifique configurações do Outlook**
- **Teste conexão IMAP**

### **3. Testar Conexão**
```bash
# Teste básico
telnet mail.suaempresa.com.br 993
```

---

## ⚠️ PROBLEMAS COMUNS

### **Gmail: "Authentication failed"**
- **Causa:** Usando senha normal
- **Solução:** Use senha de app do Google

### **Outlook: "Connection refused"**
- **Causa:** IMAP desabilitado
- **Solução:** Ative IMAP nas configurações

### **Email Corporativo: "Invalid credentials"**
- **Causa:** Credenciais incorretas
- **Solução:** Verifique com administrador

---

## 🚀 TESTANDO O SISTEMA

### **1. Configurar Credenciais**
```bash
cp env.production.example .env
nano .env
```

### **2. Reiniciar Servidor**
```bash
npm run dev
```

### **3. Testar Sincronização**
```bash
curl -X POST http://localhost:5000/api/emails/sync \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu_email@provedor.com",
    "password": "sua_senha"
  }'
```

---

## 📊 STATUS DO SISTEMA

- ✅ **AWS SES:** Configurado
- ✅ **IMAP:** Suporte a qualquer provedor
- ✅ **Detecção automática:** Funcionando
- ✅ **Configuração personalizada:** Disponível
- ✅ **APIs:** Implementadas

---

## 🎯 PRÓXIMOS PASSOS

1. **Escolha seu provedor de email**
2. **Configure credenciais IMAP**
3. **Teste sincronização**
4. **Verifique recebimento de emails**

**Sistema flexível para qualquer provedor!** 🚀
