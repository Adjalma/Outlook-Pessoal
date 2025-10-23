# Sistema de Email Corporativo Triarc Solutions
# Configuração de Ambiente

# ===========================================
# CONFIGURAÇÃO DO SERVIDOR
# ===========================================
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# ===========================================
# CONFIGURAÇÃO AWS SES
# ===========================================
# Substitua pelos seus valores reais do AWS
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@triarcsolutions.com.br
AWS_SES_FROM_NAME=Triarc Solutions

# ===========================================
# CONFIGURAÇÃO JWT
# ===========================================
# Gere uma chave secreta forte para produção
JWT_SECRET=sua_chave_secreta_jwt_muito_forte_aqui
JWT_EXPIRES_IN=24h

# ===========================================
# CONFIGURAÇÃO DO BANCO DE DADOS
# ===========================================
DATABASE_PATH=./data/triarc_email.db

# ===========================================
# CONFIGURAÇÃO DE ARQUIVOS
# ===========================================
TEMPLATES_PATH=./templates
UPLOADS_PATH=./uploads
LOGS_PATH=./logs

# ===========================================
# CONFIGURAÇÃO DE RATE LIMITING
# ===========================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===========================================
# CONFIGURAÇÃO DE LOGGING
# ===========================================
LOG_LEVEL=info
LOG_FILE=./logs/triarc_email.log

# ===========================================
# CONFIGURAÇÃO DE EMAIL
# ===========================================
# Emails corporativos departamentais
EMAIL_CONTATO=contato@triarcsolutions.com.br
EMAIL_SUPORTE=suporte@triarcsolutions.com.br
EMAIL_COMERCIAL=comercial@triarcsolutions.com.br
EMAIL_RH=rh@triarcsolutions.com.br
EMAIL_FINANCEIRO=financeiro@triarcsolutions.com.br
EMAIL_TI=ti@triarcsolutions.com.br
EMAIL_MARKETING=marketing@triarcsolutions.com.br
EMAIL_NEWSLETTER=newsletter@triarcsolutions.com.br

# Emails pessoais da equipe
EMAIL_RAFAEL_ANDRES=rafael.andres@triarcsolutions.com.br
EMAIL_RAFAEL=rafael@triarcsolutions.com.br
EMAIL_RODOLFO_FERNANDES=rodolfo.fernandes@triarcsolutions.com.br
EMAIL_RODOLFO=rodolfo@triarcsolutions.com.br
EMAIL_ADJALMA_AGUIAR=adjalma.aguiar@triarcsolutions.com.br
EMAIL_ADJALMA=adjalma@triarcsolutions.com.br

# ===========================================
# CONFIGURAÇÃO DE SEGURANÇA
# ===========================================
# Configurações de CORS
ALLOWED_ORIGINS=http://localhost:5173,https://triarcsolutions.com.br,https://www.triarcsolutions.com.br

# Configurações de sessão
SESSION_SECRET=sua_chave_secreta_de_sessao_aqui
SESSION_MAX_AGE=86400000

# ===========================================
# CONFIGURAÇÃO DE BACKUP
# ===========================================
BACKUP_ENABLED=true
BACKUP_INTERVAL=24
BACKUP_RETENTION_DAYS=30

# ===========================================
# CONFIGURAÇÃO DE MONITORAMENTO
# ===========================================
HEALTH_CHECK_INTERVAL=300000
CLEANUP_INTERVAL=3600000
STATS_RETENTION_DAYS=90

# ===========================================
# CONFIGURAÇÃO DE DESENVOLVIMENTO
# ===========================================
# Apenas para desenvolvimento - remover em produção
DEBUG_MODE=true
VERBOSE_LOGGING=true
MOCK_SES=false

# ===========================================
# CONFIGURAÇÃO DE PRODUÇÃO
# ===========================================
# Descomente para produção
# NODE_ENV=production
# DEBUG_MODE=false
# VERBOSE_LOGGING=false
# LOG_LEVEL=warn
