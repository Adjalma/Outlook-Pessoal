# 📧 GUIA COMPLETO - SISTEMA DE EMAIL TRIARC

## 🚀 CONFIGURAÇÃO AWS SES

### 1. **Obter Credenciais AWS SES**

1. **Acesse AWS Console** → IAM → Usuários
2. **Crie novo usuário:** `triarc-email-system`
3. **Anexe política:** `AmazonSESFullAccess`
4. **Gere Access Key e Secret Key**
5. **Copie as credenciais**

### 2. **Configurar Arquivo .env**

Copie o arquivo `env.production.example` para `.env` e configure:

```bash
# Configurações AWS SES
AWS_ACCESS_KEY_ID=SUA_ACCESS_KEY_AQUI
AWS_SECRET_ACCESS_KEY=SUA_SECRET_KEY_AQUI
AWS_REGION=us-east-1

# Domínio verificado
VERIFIED_DOMAIN=triarcsolutions.com.br
VERIFIED_EMAIL=adjalma.aguiar@yahoo.com
```

### 3. **Configurar IMAP para Recebimento**

Para Gmail:
1. **Ative 2FA** na sua conta Google
2. **Gere senha de app:** Google Account → Segurança → Senhas de app
3. **Configure no .env:**

```bash
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=seu_email@gmail.com
IMAP_PASS=sua_senha_app_gmail
```

---

## 🔧 FUNCIONALIDADES IMPLEMENTADAS

### **✅ ENVIO DE EMAILS**
- ✅ AWS SES integrado
- ✅ Anexos suportados
- ✅ Templates HTML
- ✅ Convites Teams automáticos

### **✅ RECEBIMENTO DE EMAILS**
- ✅ IMAP integrado
- ✅ Sincronização automática
- ✅ Marcar como lido/não lido
- ✅ Marcar como importante
- ✅ Organização em pastas

### **✅ FUNCIONALIDADES AVANÇADAS**
- ✅ Reuniões Microsoft Teams
- ✅ Calendário integrado
- ✅ Contatos
- ✅ Pastas personalizadas
- ✅ Busca de emails

---

## 🚀 COMO USAR

### **1. Configurar Credenciais**
```bash
# Copie o arquivo de exemplo
cp env.production.example .env

# Edite com suas credenciais reais
nano .env
```

### **2. Reiniciar Servidor**
```bash
npm run dev
```

### **3. Sincronizar Emails**
1. **Acesse o sistema**
2. **Vá para Configurações**
3. **Clique em "Sincronizar Emails"**
4. **Digite email e senha IMAP**
5. **Aguarde sincronização**

### **4. Enviar Emails**
1. **Clique em "Novo Email"**
2. **Digite destinatário, assunto, corpo**
3. **Anexe arquivos se necessário**
4. **Clique em "Enviar"**

### **5. Criar Reuniões Teams**
1. **Acesse Calendário**
2. **Clique em "Novo Evento"**
3. **Marque "Criar Reunião Teams"**
4. **Adicione participantes**
5. **Clique em "Criar Reunião Teams"**

---

## 🔍 TESTANDO O SISTEMA

### **Teste 1: Envio de Email**
```bash
curl -X POST http://localhost:5000/api/emails/send \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "teste@example.com",
    "subject": "Teste",
    "body": "Email de teste"
  }'
```

### **Teste 2: Sincronização IMAP**
```bash
curl -X POST http://localhost:5000/api/emails/sync \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu_email@gmail.com",
    "password": "sua_senha_app"
  }'
```

### **Teste 3: Reunião Teams**
1. **Acesse o calendário**
2. **Crie evento com Teams**
3. **Verifique se aparece no calendário**
4. **Clique no evento para ver link**

---

## ⚠️ PROBLEMAS COMUNS

### **Erro: "InvalidClientTokenId"**
- **Causa:** Credenciais AWS inválidas
- **Solução:** Verifique Access Key e Secret Key

### **Erro: "Authentication failed"**
- **Causa:** Senha IMAP incorreta
- **Solução:** Use senha de app do Gmail

### **Erro: "Domain not verified"**
- **Causa:** Domínio não verificado no AWS SES
- **Solução:** Verifique domínio no console AWS

### **Emails não aparecem**
- **Causa:** Não sincronizou IMAP
- **Solução:** Execute sincronização manual

---

## 📊 STATUS DO SISTEMA

- ✅ **Backend:** Funcionando
- ✅ **Frontend:** Funcionando  
- ✅ **Banco de dados:** Atualizado
- ✅ **APIs:** Implementadas
- ⚠️ **AWS SES:** Precisa configurar credenciais
- ⚠️ **IMAP:** Precisa configurar credenciais

---

## 🎯 PRÓXIMOS PASSOS

1. **Configure suas credenciais AWS SES**
2. **Configure suas credenciais IMAP**
3. **Teste envio de emails**
4. **Teste recebimento de emails**
5. **Teste reuniões Teams**

**Sistema pronto para produção!** 🚀
