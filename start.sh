#!/bin/bash

# Script de inicialización para Vercel
echo "🚀 Iniciando WhatsApp Bot en Vercel..."

# Verificar que Node.js esté disponible
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está disponible"
    exit 1
fi

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Iniciar la aplicación
echo "✅ Iniciando la aplicación..."
npm start
