# Sistema de Email Corporativo Triarc Solutions

Sistema completo de gerenciamento de emails corporativos com dashboard web, integração AWS SES e autenticação JWT.

## Arquitetura

- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **Banco de Dados**: SQLite
- **Email Service**: AWS SES
- **Deploy**: Vercel
- **Domínio**: email.triarcsolutions.com.br

## Funcionalidades

- Dashboard administrativo
- Envio de emails em massa
- Templates personalizáveis
- Autenticação JWT
- Logs de sistema
- Rate limiting
- CORS configurado

## Instalação

```bash
# Instalar dependências
npm install

# Instalar dependências do frontend
cd frontend && npm install

# Configurar variáveis de ambiente
cp ENV_CONFIG.md .env

# Iniciar desenvolvimento
npm run dev
```

## Configuração AWS SES

1. Configure as credenciais AWS no arquivo .env
2. Verifique o domínio triarcsolutions.com.br no AWS SES
3. Configure os registros DNS conforme AWS_SES_SETUP.md

## Deploy

O projeto está configurado para deploy automático no Vercel:
- Push para main = deploy produção
- Push para develop = preview deploy

## Estrutura do Projeto

```
├── server.js              # Servidor principal
├── routes/               # Rotas da API
├── middleware/           # Middlewares
├── services/             # Serviços
├── config/              # Configurações
├── frontend/            # Aplicação React
├── data/               # Banco SQLite
└── logs/               # Logs do sistema
```

## Variáveis de Ambiente

Consulte ENV_CONFIG.md para configuração completa das variáveis de ambiente.

## Licença

MIT License - Triarc Solutions