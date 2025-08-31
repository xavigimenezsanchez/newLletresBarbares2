# Guía Rápida - Comparación de Bases de Datos

## 🚀 Inicio Rápido

### 1. Configurar las URIs de bases de datos
```bash
cd server/scripts
cp comparison-env.example .env
# Edita .env con las URIs correctas
```

### 2. Verificar configuración
```bash
npm run setup-compare
```

### 3. Ejecutar prueba pequeña
```bash
npm run test-compare
```

### 4. Si la prueba es exitosa, ejecutar comparación completa
```bash
npm run compare-dbs
```

## 📋 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run setup-compare` | Verifica configuración y conexiones |
| `npm run test-compare` | Prueba con 10 documentos |
| `npm run test-compare:large` | Prueba con 100 documentos |
| `npm run compare-dbs` | Comparación completa |
| `npm run logs:list` | Lista todos los archivos de log |
| `npm run logs:summary` | Resumen de logs |
| `npm run logs:clean` | Limpia logs antiguos |

## 🔍 Qué valida el script

Para cada documento en `DBOld.documents`, busca el correspondiente en `DBNew.articles` por `url` y verifica:

- ✅ `old.issue === new.issueNumber`
- ✅ `old.data === new.data`
- ✅ `old.text.length === new.text.length`
- ✅ `old.author === new.author`
- ✅ `old.author === new.authors[0]`
- ✅ `old.section === new.section`

## 📊 Resultados

El script genera:
- **Salida en consola**: Progreso y resumen en tiempo real
- **Archivo de log**: `comparison-YYYY-MM-DD.log` con todo el detalle
- **Archivo JSON**: `comparison-report.json` con datos estructurados

### 📁 Archivos generados:
- `comparison-YYYY-MM-DD.log` - Log completo con TODAS las discrepancias
- `test-comparison-10-YYYY-MM-DD.log` - Log de pruebas pequeñas
- `comparison-report.json` - Reporte en formato JSON

### 📄 Ver logs completos:
```bash
# Listar todos los logs
npm run logs:list

# Ver contenido de un log específico
cd server/scripts
node manage-logs.js view comparison-2024-01-15.log

# Resumen de todos los logs
npm run logs:summary
```

**Nota importante**: El log ahora incluye TODAS las discrepancias con detalles completos, mientras que la consola muestra solo un resumen para mejor legibilidad.

## ⚠️ Variables de Entorno Requeridas

```env
# En server/scripts/.env
DB_OLD_URI=mongodb+srv://user:pass@cluster.mongodb.net/old-db-name
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/newLletresBarbares
```

## 🆘 Problemas Comunes

1. **Error de conexión**: Verifica URIs y credenciales
2. **Colección no encontrada**: Confirma nombres de colecciones
3. **Memoria insuficiente**: Usa las pruebas pequeñas primero

¡Listo para comparar! 🎯