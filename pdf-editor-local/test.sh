#!/bin/bash

# Script de prueba para el Editor PDF Local
echo "🧪 Probando Editor PDF Local - Lletres Bàrbares"
echo "================================================"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio pdf-editor-local"
    exit 1
fi

echo "✅ Directorio correcto encontrado"

# Verificar que las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

echo "✅ Dependencias instaladas"

# Verificar que la aplicación se construye
echo "🔨 Construyendo aplicación..."
if npm run build; then
    echo "✅ Aplicación construida correctamente"
else
    echo "❌ Error al construir la aplicación"
    exit 1
fi

# Verificar estructura de archivos
echo "📁 Verificando estructura de archivos..."
required_files=(
    "src/App.tsx"
    "src/main.tsx"
    "src/pages/EdicioPDFPage.tsx"
    "src/components/PDFArticlePaginated.tsx"
    "src/components/PDFArticlePaginatedManual.tsx"
    "src/services/localDataService.ts"
    "src/types/index.ts"
    "src/index.css"
    "src/assets/Jara logo petit.svg"
    "src/assets/logo5.svg"
    "src/assets/background.png"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Faltante: $file"
        exit 1
    fi
done

echo ""
echo "🎉 ¡Todas las verificaciones pasaron!"
echo ""
echo "📋 Para usar la aplicación:"
echo "1. Ejecuta: npm run electron-dev"
echo "2. Selecciona la carpeta de la edición (ej: ../client/documents/2025/51)"
echo "3. La aplicación se actualizará automáticamente cuando modifiques archivos"
echo ""
echo "📖 Para más información, consulta el README.md"