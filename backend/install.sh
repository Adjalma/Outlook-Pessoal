#!/bin/bash

echo "🚀 Instalando Sistema de Email Triarc com AWS SES"
echo "=================================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js primeiro."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale npm primeiro."
    exit 1
fi

echo "✅ Node.js e npm encontrados"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp env.example .env
    echo "⚠️  IMPORTANTE: Configure suas credenciais AWS SES no arquivo .env"
fi

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p uploads
mkdir -p logs

# Verificar configuração AWS
echo "🔧 Verificando configuração AWS SES..."
echo "⚠️  Certifique-se de que:"
echo "   1. Suas credenciais AWS estão configuradas no .env"
echo "   2. O domínio triarcsolutions.com.br está verificado no AWS SES"
echo "   3. Você tem permissões para enviar emails"

echo ""
echo "🎉 Instalação concluída!"
echo ""
echo "Para iniciar o servidor:"
echo "  npm start          # Modo produção"
echo "  npm run dev        # Modo desenvolvimento"
echo ""
echo "Para configurar AWS SES:"
echo "  1. Acesse AWS Console > SES"
echo "  2. Verifique o domínio triarcsolutions.com.br"
echo "  3. Configure DNS (SPF, DKIM, DMARC)"
echo "  4. Atualize as credenciais no arquivo .env"
echo ""
echo "📧 Sistema pronto para uso!"
