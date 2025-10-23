# Configuração DNS para Sistema de Email Triarc
# Guia Completo de Subdomínios

## 🌐 ESTRUTURA DE DOMÍNIO

```
triarcsolutions.com.br (domínio principal)
├── email.triarcsolutions.com.br → Frontend do sistema de email
├── api.triarcsolutions.com.br → Backend/API do sistema
└── www.triarcsolutions.com.br → Site principal da empresa
```

## 📋 REGISTROS DNS NECESSÁRIOS

### 1. SUBDOMÍNIO DE EMAIL (Frontend)
```
Tipo: CNAME
Nome: email
Valor: cname.vercel-dns.com
TTL: 3600
```

### 2. SUBDOMÍNIO DE API (Backend)
```
Tipo: CNAME
Nome: api
Valor: cname.vercel-dns.com
TTL: 3600
```

### 3. WWW (Site Principal)
```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
TTL: 3600
```

### 4. DOMÍNIO PRINCIPAL (Apex)
```
Tipo: A
Nome: @
Valor: 76.76.19.61 (IP do Vercel)
TTL: 3600
```

## 🔧 CONFIGURAÇÃO NO PROVEDOR DE DOMÍNIO

### Para Registro.br (dominio.br):
1. Acesse: https://registro.br
2. Faça login na sua conta
3. Vá em "Meus Domínios"
4. Clique em "Gerenciar DNS"
5. Adicione os registros acima

### Para outros provedores:
- **GoDaddy**: DNS Management → Add Record
- **Namecheap**: Advanced DNS → Add New Record
- **Cloudflare**: DNS → Add Record

## ⚙️ CONFIGURAÇÃO NO VERCEL

### 1. Adicionar Domínios:
```bash
# Via CLI
vercel domains add email.triarcsolutions.com.br
vercel domains add api.triarcsolutions.com.br
```

### 2. Ou via Painel Web:
1. Acesse: https://vercel.com/dashboard
2. Vá em "Settings" → "Domains"
3. Clique em "Add Domain"
4. Digite: `email.triarcsolutions.com.br`
5. Repita para: `api.triarcsolutions.com.br`

## 🚀 CONFIGURAÇÃO DE PROJETO

### 1. Atualizar vercel.json:
```json
{
  "version": 2,
  "name": "triarc-email-system",
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. Atualizar variáveis de ambiente:
```env
FRONTEND_URL=https://email.triarcsolutions.com.br
ALLOWED_ORIGINS=https://email.triarcsolutions.com.br,https://api.triarcsolutions.com.br,https://triarcsolutions.com.br
```

## 🔍 VERIFICAÇÃO DE CONFIGURAÇÃO

### 1. Testar DNS:
```bash
# Verificar resolução DNS
nslookup email.triarcsolutions.com.br
nslookup api.triarcsolutions.com.br
```

### 2. Testar HTTPS:
- https://email.triarcsolutions.com.br
- https://api.triarcsolutions.com.br/api/health

### 3. Testar CORS:
```javascript
// No console do navegador
fetch('https://api.triarcsolutions.com.br/api/health')
  .then(response => response.json())
  .then(data => console.log(data));
```

## ⏱️ TEMPO DE PROPAGAÇÃO

- **DNS**: 5-60 minutos
- **SSL**: 5-10 minutos
- **Propagação Global**: Até 24 horas

## 🆘 SOLUÇÃO DE PROBLEMAS

### DNS não resolve:
1. Verificar se os registros estão corretos
2. Aguardar propagação (até 24h)
3. Usar `dig` ou `nslookup` para testar

### SSL não funciona:
1. Verificar se o domínio está adicionado no Vercel
2. Aguardar certificado SSL (5-10 min)
3. Verificar se não há conflitos de DNS

### CORS Error:
1. Verificar ALLOWED_ORIGINS
2. Confirmar se o domínio está na lista
3. Verificar se está usando HTTPS

## 📞 SUPORTE

### Contatos:
- **Registro.br**: https://registro.br/suporte
- **Vercel**: https://vercel.com/support
- **Triarc**: suporte@triarcsolutions.com.br

### Logs úteis:
- DNS: `dig email.triarcsolutions.com.br`
- SSL: https://www.ssllabs.com/ssltest/
- CORS: Console do navegador (F12)
