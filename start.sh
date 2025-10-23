#!/bin/bash

echo "🚀 Iniciando Sistema de Email Triarc"
echo "===================================="

# Verificar se estamos no diretório correto
if [ ! -f "backend/package.json" ]; then
    echo "❌ Execute este script na raiz do projeto Email_Triarc"
    exit 1
fi

# Verificar se o backend está instalado
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    cd backend
    npm install
    cd ..
fi

# Verificar se o frontend está instalado
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    cd frontend
    npm install
    cd ..
fi

# Verificar se o arquivo .env existe
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "📝 Copiando arquivo de exemplo..."
    cp backend/env.example backend/.env
    echo ""
    echo "🔧 CONFIGURAÇÃO NECESSÁRIA:"
    echo "   1. Edite o arquivo backend/.env"
    echo "   2. Configure suas credenciais AWS SES:"
    echo "      - AWS_ACCESS_KEY_ID"
    echo "      - AWS_SECRET_ACCESS_KEY"
    echo "      - AWS_REGION"
    echo "   3. Verifique o domínio no AWS SES"
    echo ""
    echo "⚠️  Configure o .env antes de continuar!"
    exit 1
fi

echo "✅ Configuração verificada"
echo ""

# Iniciar backend
echo "🔧 Iniciando servidor backend..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Aguardar backend iniciar
echo "⏳ Aguardando backend iniciar..."
sleep 5

# Verificar se o backend está rodando
if ! curl -s http://localhost:5000 > /dev/null; then
    echo "❌ Erro ao iniciar backend"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend iniciado com sucesso"

# Iniciar frontend
echo "🎨 Iniciando frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Sistema iniciado com sucesso!"
echo ""
echo "📧 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "👤 Credenciais padrão:"
echo "   Email: admin@triarcsolutions.com.br"
echo "   Senha: admin123"
echo ""
echo "⚠️  Para parar o sistema, pressione Ctrl+C"

# Função para parar os processos
cleanup() {
    echo ""
    echo "🛑 Parando sistema..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Sistema parado"
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Manter script rodando
wait
