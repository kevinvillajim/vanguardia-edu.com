#!/bin/bash

# Script para convertir archivos JSX a TSX y JS a TS
# Uso: ./scripts/convert-to-tsx.sh

echo "🔄 Iniciando conversión de JSX/JS a TSX/TS..."

# Contador de archivos convertidos
jsx_count=0
js_count=0

# Función para convertir JSX a TSX
convert_jsx_files() {
    local dir=$1
    echo "📁 Procesando directorio: $dir"
    
    while IFS= read -r -d '' file; do
        if [[ $file == *".jsx" ]]; then
            new_file="${file%.jsx}.tsx"
            echo "  ✅ $file → $new_file"
            mv "$file" "$new_file"
            ((jsx_count++))
        fi
    done < <(find "$dir" -name "*.jsx" -print0)
}

# Función para convertir JS a TS (excluyendo archivos de configuración)
convert_js_files() {
    local dir=$1
    echo "📁 Procesando archivos JS en: $dir"
    
    while IFS= read -r -d '' file; do
        # Excluir archivos de configuración y node_modules
        if [[ $file != *"node_modules"* ]] && 
           [[ $file != *"vite.config"* ]] && 
           [[ $file != *"tailwind.config"* ]] && 
           [[ $file != *"postcss.config"* ]] && 
           [[ $file != *".eslintrc"* ]] && 
           [[ $file == *".js" ]]; then
            new_file="${file%.js}.ts"
            echo "  ✅ $file → $new_file"
            mv "$file" "$new_file"
            ((js_count++))
        fi
    done < <(find "$dir" -name "*.js" -print0)
}

# Convertir archivos en src/
if [ -d "src" ]; then
    echo "🎯 Convirtiendo archivos JSX a TSX..."
    convert_jsx_files "src"
    
    echo "🎯 Convirtiendo archivos JS a TS..."
    convert_js_files "src"
else
    echo "❌ Directorio 'src' no encontrado. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Actualizar imports en archivos TypeScript
echo "🔧 Actualizando imports..."

# Buscar y reemplazar imports de .jsx a .tsx
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i.bak "s/from '\([^']*\)\.jsx'/from '\1'/g"
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i.bak "s/from \"\([^\"]*\)\.jsx\"/from \"\1\"/g"

# Buscar y reemplazar imports de .js a .ts (solo para archivos internos)
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i.bak "s/from '\(\.\/[^']*\)\.js'/from '\1'/g"
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i.bak "s/from \"\(\.\/[^\"]*\)\.js\"/from \"\1\"/g"

# Limpiar archivos de respaldo
find src -name "*.bak" -delete

echo "✨ Conversión completada!"
echo "📊 Resumen:"
echo "  - Archivos JSX convertidos: $jsx_count"
echo "  - Archivos JS convertidos: $js_count"
echo "  - Total: $((jsx_count + js_count)) archivos"

echo ""
echo "🔍 Próximos pasos:"
echo "1. Ejecutar: npx tsc --noEmit --skipLibCheck"
echo "2. Corregir errores de TypeScript"
echo "3. Agregar tipos faltantes a props y funciones"
echo ""
echo "⚠️  IMPORTANTE: Revisa que la aplicación funcione correctamente después de la conversión."