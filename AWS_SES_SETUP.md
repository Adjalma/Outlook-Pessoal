# Sistema de Email Corporativo Triarc Solutions
# Configuração AWS SES Completa

## 🚀 PASSO A PASSO PARA CONFIGURAÇÃO AWS SES

### 1. CRIAR CONTA AWS
- Acesse: https://aws.amazon.com
- Crie uma conta ou faça login
- Complete a verificação de identidade

### 2. CONFIGURAR SES NO CONSOLE AWS
1. Acesse o console AWS SES
2. Vá para "Verified identities"
3. Clique em "Create identity"
4. Selecione "Domain"
5. Digite: `triarcsolutions.com.br`
6. Marque "Use a default configuration set" (opcional)
7. Clique em "Create identity"

### 3. CONFIGURAR DNS (CRÍTICO)
Adicione estes registros DNS no seu provedor de domínio (dominio.br):

#### SPF Record
```
Tipo: TXT
Nome: triarcsolutions.com.br
Valor: v=spf1 include:amazonses.com ~all
TTL: 3600
```

#### DKIM Records (3 registros obrigatórios)
```
CNAME 1:
Nome: [token1]._domainkey.triarcsolutions.com.br
Valor: [token1].dkim.amazonses.com
TTL: 3600

CNAME 2:
Nome: [token2]._domainkey.triarcsolutions.com.br
Valor: [token2].dkim.amazonses.com
TTL: 3600

CNAME 3:
Nome: [token3]._domainkey.triarcsolutions.com.br
Valor: [token3].dkim.amazonses.com
TTL: 3600
```

#### DMARC Record
```
Tipo: TXT
Nome: _dmarc.triarcsolutions.com.br
Valor: v=DMARC1; p=quarantine; rua=mailto:dmarc@triarcsolutions.com.br
TTL: 3600
```

### 4. CRIAR USUÁRIO IAM
1. Acesse IAM no console AWS
2. Clique em "Users" → "Create user"
3. Nome: `triarc-ses-user`
4. Anexe política: `AmazonSESFullAccess`
5. Clique em "Create user"
6. Vá para "Security credentials"
7. Clique em "Create access key"
8. Tipo: "Application running outside AWS"
9. Copie Access Key ID e Secret Access Key

### 5. CONFIGURAR ARQUIVO .ENV
Crie o arquivo `.env` na raiz do projeto:

```env
# Servidor
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# AWS SES Configuration
AWS_ACCESS_KEY_ID=AKIA... (sua access key)
AWS_SECRET_ACCESS_KEY=... (sua secret key)
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@triarcsolutions.com.br
AWS_SES_FROM_NAME=Triarc Solutions

# JWT Configuration
JWT_SECRET=sua_chave_secreta_jwt_muito_forte_aqui
JWT_EXPIRES_IN=24h

# Database
DATABASE_PATH=./data/triarc_email.db

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/triarc_email.log
```

### 6. VERIFICAR DOMÍNIO
- Aguarde a verificação DNS (pode levar até 72h)
- Status deve ficar "Verified" no console SES
- Teste o envio de email

## 📧 EMAILS CORPORATIVOS CONFIGURADOS

### Emails Principais
1. **contato@triarcsolutions.com.br** - Contato geral
2. **suporte@triarcsolutions.com.br** - Suporte técnico  
3. **comercial@triarcsolutions.com.br** - Vendas e comercial

### Emails Departamentais
4. **rh@triarcsolutions.com.br** - Recursos humanos
5. **financeiro@triarcsolutions.com.br** - Financeiro
6. **ti@triarcsolutions.com.br** - Tecnologia da informação

### Emails Funcionais
7. **noreply@triarcsolutions.com.br** - Emails automáticos
8. **newsletter@triarcsolutions.com.br** - Newsletter
9. **marketing@triarcsolutions.com.br** - Marketing

## 💰 CUSTOS ESTIMADOS

### Cenário Atual (3 emails)
- **Volume estimado**: 1.000 emails/mês
- **Custo AWS SES**: R$ 0,00 (dentro do limite gratuito)
- **Total mensal**: R$ 0,00

### Cenário Futuro (9 emails)
- **Volume estimado**: 5.000 emails/mês  
- **Custo AWS SES**: R$ 0,00 (ainda gratuito)
- **Total mensal**: R$ 0,00

### Cenário Empresarial
- **Volume estimado**: 50.000 emails/mês
- **Custo AWS SES**: R$ 0,00 (ainda gratuito)
- **Total mensal**: R$ 0,00

## 🔒 LIMITES AWS SES

### Sandbox Mode (inicial)
- 200 emails/dia
- 1 email/segundo
- Apenas emails verificados

### Production Mode (após solicitação)
- 50.000 emails/dia
- 14 emails/segundo
- Qualquer endereço de email

## 🚨 SOLICITAR SAÍDA DO SANDBOX
1. Acesse SES Console
2. Vá para "Account dashboard"
3. Clique em "Request production access"
4. Preencha o formulário:
   - Use case: "Transactional emails for corporate website"
   - Website URL: https://triarcsolutions.com.br
   - Describe your use case: "Sending transactional emails for corporate communications, newsletters, and customer support"
5. Aguarde aprovação (24-48h)

## 🧪 TESTAR CONFIGURAÇÃO
Após configurar tudo, teste com:

```bash
# Instalar dependências
npm install

# Iniciar sistema
npm run dev

# Acessar dashboard
http://localhost:5173

# Login padrão
Email: admin@triarcsolutions.com.br
Senha: admin123
```

## 📞 SUPORTE
Se houver problemas:
1. Verifique os logs em `./logs/triarc_email.log`
2. Confirme se os registros DNS estão corretos
3. Teste a conectividade AWS SES
4. Entre em contato: suporte@triarcsolutions.com.br
