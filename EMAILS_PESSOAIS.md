# Emails Corporativos Adicionais - Triarc Solutions
# Configuração para Rafael Andres, Rodolfo Fernandes e Adjalma Aguiar

## 📧 NOVOS EMAILS CORPORATIVOS

### Rafael Andres
- **rafael.andres@triarcsolutions.com.br** - Rafael Andres
- **rafael@triarcsolutions.com.br** - Rafael (abreviado)

### Rodolfo Fernandes  
- **rodolfo.fernandes@triarcsolutions.com.br** - Rodolfo Fernandes
- **rodolfo@triarcsolutions.com.br** - Rodolfo (abreviado)

### Adjalma Aguiar
- **adjalma.aguiar@triarcsolutions.com.br** - Adjalma Aguiar
- **adjalma@triarcsolutions.com.br** - Adjalma (abreviado)

## 🔧 CONFIGURAÇÃO NO AWS SES

### 1. Verificar Identidades no Console AWS SES
1. Acesse o console AWS SES
2. Vá para "Verified identities"
3. Clique em "Create identity"
4. Selecione "Email address"
5. Adicione cada email individualmente:

```
rafael.andres@triarcsolutions.com.br
rafael@triarcsolutions.com.br
rodolfo.fernandes@triarcsolutions.com.br
rodolfo@triarcsolutions.com.br
adjalma.aguiar@triarcsolutions.com.br
adjalma@triarcsolutions.com.br
```

### 2. Verificar Emails
- AWS enviará emails de verificação para cada endereço
- Clique no link de verificação em cada email
- Status deve ficar "Verified" no console

## 📊 LISTA COMPLETA DE EMAILS CORPORATIVOS

### Emails Departamentais
1. **contato@triarcsolutions.com.br** - Contato geral
2. **suporte@triarcsolutions.com.br** - Suporte técnico
3. **comercial@triarcsolutions.com.br** - Vendas e comercial
4. **rh@triarcsolutions.com.br** - Recursos humanos
5. **financeiro@triarcsolutions.com.br** - Financeiro
6. **ti@triarcsolutions.com.br** - Tecnologia da informação
7. **marketing@triarcsolutions.com.br** - Marketing
8. **newsletter@triarcsolutions.com.br** - Newsletter
9. **noreply@triarcsolutions.com.br** - Emails automáticos

### Emails Pessoais
10. **rafael.andres@triarcsolutions.com.br** - Rafael Andres
11. **rafael@triarcsolutions.com.br** - Rafael (abreviado)
12. **rodolfo.fernandes@triarcsolutions.com.br** - Rodolfo Fernandes
13. **rodolfo@triarcsolutions.com.br** - Rodolfo (abreviado)
14. **adjalma.aguiar@triarcsolutions.com.br** - Adjalma Aguiar
15. **adjalma@triarcsolutions.com.br** - Adjalma (abreviado)

## 💰 CUSTOS ATUALIZADOS

### Cenário Atual (15 emails)
- **Volume estimado**: 2.000 emails/mês
- **Custo AWS SES**: R$ 0,00 (dentro do limite gratuito)
- **Total mensal**: R$ 0,00

### Cenário Futuro (15 emails)
- **Volume estimado**: 10.000 emails/mês
- **Custo AWS SES**: R$ 0,00 (ainda gratuito)
- **Total mensal**: R$ 0,00

### Cenário Empresarial
- **Volume estimado**: 100.000 emails/mês
- **Custo AWS SES**: R$ 0,00 (ainda gratuito)
- **Total mensal**: R$ 0,00

## 🧪 TESTAR NOVOS EMAILS

Após verificar os emails no AWS SES, teste com:

```bash
# Testar configuração completa
node test-ses-config.js

# Enviar email de teste para cada pessoa
# Use o dashboard em http://localhost:5173
```

## 📋 PRÓXIMOS PASSOS

1. ✅ Verificar cada email no console AWS SES
2. ✅ Configurar caixas de email nos provedores
3. ✅ Testar envio para cada endereço
4. ✅ Configurar assinaturas de email
5. ✅ Treinar equipe no uso do sistema

## 🔐 CONFIGURAÇÃO DE USUÁRIOS NO SISTEMA

Para adicionar os usuários ao sistema de email:

1. Acesse o dashboard: http://localhost:5173
2. Login: admin@triarcsolutions.com.br / admin123
3. Vá para "Configurações" → "Usuários"
4. Adicione cada usuário:

```
Rafael Andres
Email: rafael.andres@triarcsolutions.com.br
Role: admin (ou user)

Rodolfo Fernandes
Email: rodolfo.fernandes@triarcsolutions.com.br
Role: admin (ou user)

Adjalma Aguiar
Email: adjalma.aguiar@triarcsolutions.com.br
Role: admin (ou user)
```

## 📞 SUPORTE

Para configuração dos emails pessoais:
- Email: suporte@triarcsolutions.com.br
- Site: https://triarcsolutions.com.br

---

**Triarc Solutions** - Soluções Empresariais Integradas
