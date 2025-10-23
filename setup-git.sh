#!/bin/bash
# Script de inicialização do Git para o projeto Triarc Email System

echo "Inicializando repositório Git..."

# Inicializar repositório
git init

# Adicionar arquivos
git add .

# Commit inicial
git commit -m "Initial commit: Sistema de Email Corporativo Triarc Solutions"

# Conectar ao repositório remoto
git remote add origin https://github.com/Adjalma/Outlook-Pessoal.git

# Verificar conexão
git remote -v

echo "Repositório Git configurado com sucesso!"
echo "Para fazer push: git push -u origin main"
