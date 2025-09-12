#!/bin/bash

# Script de inicio para Editor PDF Local
echo "🚀 Iniciando Editor PDF Local - Lletres Bàrbares"
echo "================================================"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio pdf-editor-local"
    exit 1
fi

# Verificar que las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

echo "✅ Dependencias verificadas"

# Mostrar opciones
echo ""
echo "Selecciona cómo quieres ejecutar la aplicación:"
echo "1) Desarrollo con Electron (recomendado)"
echo "2) Solo servidor web (limitado)"
echo "3) Construir para producción"
echo ""

read -p "Elige una opción (1-3): " choice

case $choice in
    1)
        echo "🔧 Iniciando en modo desarrollo con Electron..."
        npm run electron-dev
        ;;
    2)
        echo "⚠️  Iniciando solo servidor web (funcionalidad limitada)..."
        echo "   Nota: Para funcionalidad completa, usa la opción 1"
        npm run dev
        ;;
    3)
        echo "🏗️  Construyendo para producción..."
        npm run build-electron
        echo "✅ Aplicación construida en dist-electron/"
        ;;
    *)
        echo "❌ Opción no válida"
        exit 1
        ;;
esac