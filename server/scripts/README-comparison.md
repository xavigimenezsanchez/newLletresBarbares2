# Script de Comparación de Bases de Datos

Este script compara los datos entre la antigua base de datos de producción (DBOld) y la nueva base de datos (DBNew).

## ¿Qué hace el script?

El script realiza las siguientes validaciones para cada documento en `DBOld.documents`:

1. Busca el documento correspondiente en `DBNew.articles` usando el campo `url`
2. Si lo encuentra, verifica que:
   - `old.issue === new.issueNumber`
   - `old.data === new.data` 
   - `old.text.length === new.text.length`
   - `old.author === new.author`
   - `old.author === new.authors[0]`
   - `old.section === new.section`

## Configuración

### 1. Variables de entorno

Crea un archivo `.env` en el directorio `server/scripts/` basado en `comparison-env.example`:

```bash
cp comparison-env.example .env
```

Edita el archivo `.env` con las URIs correctas de tus bases de datos:

```env
# Base de datos antigua (DBOld)
DB_OLD_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/nombre-db-antigua

# Base de datos nueva (DBNew) 
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/newLletresBarbares
```

### 2. Instalación de dependencias

Asegúrate de que las dependencias de Node.js estén instaladas:

```bash
cd server
npm install
```

## Ejecución

### Ejecutar el script

```bash
cd server/scripts
node compare-databases.js
```

### Salida del script

El script mostrará:

1. **Progreso en tiempo real**: Número de documentos procesados
2. **Estadísticas finales**:
   - Total de documentos en DBOld
   - Documentos encontrados/no encontrados en DBNew
   - Documentos que pasaron/fallaron la validación
3. **Discrepancias detalladas**: Agrupadas por tipo de error
4. **Archivos generados**:
   - `comparison-YYYY-MM-DD.log` - Log completo con timestamps
   - `comparison-report.json` - Datos estructurados en JSON

### 📁 Archivos de Log

Los scripts generan archivos de log automáticamente:

- **Comparación completa**: `comparison-YYYY-MM-DD.log`
- **Pruebas pequeñas**: `test-comparison-10-YYYY-MM-DD.log`
- **Pruebas grandes**: `test-comparison-100-YYYY-MM-DD.log`

Cada archivo incluye:
- Timestamps detallados de cada operación
- Información de conexión a las bases de datos
- Progreso paso a paso
- Estadísticas completas
- Todas las discrepancias encontradas

### Ejemplo de salida

```
🚀 Iniciando comparación de bases de datos...
🔌 Conectando a las bases de datos...
✅ Conectado exitosamente a ambas bases de datos
🔍 Iniciando comparación de documentos...
📊 Total de documentos en DBOld: 1250
⏳ Procesando documento 100/1250...
⏳ Procesando documento 200/1250...
...
✅ Comparación completada

📊 RESULTADOS DE LA COMPARACIÓN:
==================================================
Total de documentos en DBOld: 1250
Encontrados en DBNew: 1240
No encontrados en DBNew: 10
Pasaron validación: 1200
Fallaron validación: 40
Total de discrepancias: 50

🚨 DISCREPANCIAS ENCONTRADAS:
==================================================

AUTHOR_MISMATCH: 15 casos
  1. URL: /article/ejemplo-1
     Título: Título del artículo
     Error: Author no coincide: old.author='Juan Pérez' vs new.author='J. Pérez'

ISSUE_MISMATCH: 10 casos
  ...

📈 ESTADÍSTICAS:
==================================================
Tasa de documentos encontrados: 99.20%
Tasa de éxito en validación: 96.77%

📄 Reporte guardado en: /ruta/al/comparison-report.json
🔌 Conexiones cerradas
✅ Proceso completado exitosamente
```

## Tipos de discrepancias

El script identifica los siguientes tipos de errores:

- **DOCUMENT_NOT_FOUND**: Documento no existe en DBNew
- **ISSUE_MISMATCH**: `old.issue ≠ new.issueNumber`
- **DATA_MISMATCH**: `old.data ≠ new.data`
- **TEXT_LENGTH_MISMATCH**: `old.text.length ≠ new.text.length`
- **AUTHOR_MISMATCH**: `old.author ≠ new.author`
- **AUTHOR_FIRST_MISMATCH**: `old.author ≠ new.authors[0]`
- **SECTION_MISMATCH**: `old.section ≠ new.section`
- **COMPARISON_ERROR**: Error técnico durante la comparación

## Archivo de reporte

El script genera un archivo `comparison-report.json` que contiene:

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "stats": {
    "totalOldDocuments": 1250,
    "foundInNew": 1240,
    "notFoundInNew": 10,
    "passedValidation": 1200,
    "failedValidation": 40
  },
  "discrepancies": [
    {
      "url": "/article/ejemplo",
      "title": "Título del artículo",
      "type": "AUTHOR_MISMATCH",
      "message": "Author no coincide...",
      "oldData": { ... },
      "newData": { ... }
    }
  ]
}
```

## Solución de problemas

### Error de conexión
- Verifica que las URIs de MongoDB sean correctas
- Asegúrate de que las credenciales tengan permisos de lectura
- Comprueba la conectividad de red

### Memoria insuficiente
- Para bases de datos muy grandes, el script procesa documentos de uno en uno
- Si aún hay problemas de memoria, considera dividir la comparación por lotes

### Errores de esquema
- El script usa un esquema flexible para DBOld
- Si hay campos inesperados, el script debería manejarlos correctamente

## Personalización

Para modificar las validaciones, edita la función `validateDocument()` en `compare-databases.js`.

Para cambiar el formato del reporte, modifica las funciones `printResults()` y `saveDiscrepanciesToFile()`.