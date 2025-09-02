# 📊 Sistema de Analíticas de Lletres Barbares

Este documento describe el sistema completo de analíticas implementado en Lletres Barbares, que incluye tanto analíticas de búsquedas como de conexiones de usuarios.

## 🎯 Características Principales

### 1. Analíticas de Búsquedas (SearchAnalytics)
- Registro automático de todas las búsquedas realizadas
- Métricas de rendimiento y comportamiento del usuario
- Estadísticas por sección, dispositivo y tiempo
- Análisis de click-through rates

### 2. Analíticas de Conexiones (ConnectionAnalytics) **✨ NUEVO**
- Registro automático de todas las conexiones al sitio
- Información geográfica basada en IP (país, ciudad, región)
- Detección de dispositivos y navegadores
- Seguimiento de sesiones y páginas visitadas
- Análisis de fuentes de tráfico (referrers)

## 🚀 Configuración

### Dependencias Instaladas
```bash
npm install axios geoip-lite ua-parser-js
```

### Modelos de Base de Datos

#### ConnectionAnalytics
- **sessionId**: Identificador único de sesión
- **userInfo**: IP, User-Agent, información del dispositivo
- **location**: País, ciudad, coordenadas (basado en IP)
- **connection**: Timestamp, página de entrada, referrer
- **session**: Duración, páginas vistas, estado activo
- **metrics**: Idioma, zona horaria

## 📡 API Endpoints

### Analíticas de Conexiones

#### `GET /api/connections/stats`
Estadísticas generales de conexiones
```
Query params:
- days: número de días (default: 30)
```

#### `GET /api/connections/countries`
Estadísticas por país
```
Query params:
- days: número de días (default: 30)
- limit: número de resultados (default: 20)
```

#### `GET /api/connections/cities`
Estadísticas por ciudad
```
Query params:
- days: número de días (default: 30)
- limit: número de resultados (default: 25)
```

#### `GET /api/connections/devices`
Estadísticas por dispositivo y navegador
```
Query params:
- days: número de días (default: 30)
```

#### `GET /api/connections/timeline`
Estadísticas por tiempo
```
Query params:
- days: número de días (default: 30)
- groupBy: hour|day|week|month (default: day)
```

#### `GET /api/connections/live`
Estadísticas en tiempo real
- Sesiones activas
- Conexiones última hora
- Países más activos
- Dispositivos más utilizados

#### `GET /api/connections/detailed`
Listado detallado de conexiones
```
Query params:
- days: número de días (default: 7)
- page: página (default: 1)
- limit: resultados por página (default: 50)
- country: filtro por país
- deviceType: filtro por tipo de dispositivo
- browser: filtro por navegador
```

#### `POST /api/connections/export`
Exportar datos de conexiones
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "format": "json|csv",
  "filters": {}
}
```

### Analíticas Unificadas

#### `GET /api/analytics/stats` **✨ MEJORADO**
Ahora incluye tanto estadísticas de búsquedas como de conexiones:
```json
{
  "period": "30 días",
  "search": {
    "general": { "totalSearches": 1245, "uniqueQueries": 456 },
    "topQueries": [...],
    "sectionStats": [...],
    "deviceStats": [...],
    "hourlyStats": [...]
  },
  "connections": {
    "general": { "totalConnections": 5432, "uniqueIPs": 1234 },
    "topCountries": [...],
    "deviceStats": [...]
  }
}
```

## 🔧 Funcionamiento Automático

### Middleware de Conexiones
El sistema registra automáticamente:

1. **Primera conexión**: Cuando un usuario visita cualquier página
2. **Información capturada**:
   - IP address y geolocalización
   - Dispositivo, navegador, SO
   - Página de entrada
   - Referrer (de dónde viene)
   - Timestamp de conexión

3. **Seguimiento de sesión**:
   - Actualización automática de actividad
   - Conteo de páginas visitadas
   - Duración de sesión
   - Cierre automático de sesiones inactivas (30 min)

### Exclusiones
El middleware NO registra:
- Requests a APIs (`/api/*`)
- Archivos estáticos (imágenes, CSS, JS)
- Requests que no sean GET
- Health checks

## 📈 Datos Registrados

### Información Geográfica
- **País y ciudad** (basado en IP)
- **Coordenadas geográficas**
- **Zona horaria**
- **ISP y organización**

### Información Técnica
- **Tipo de dispositivo**: desktop, mobile, tablet
- **Navegador y versión**
- **Sistema operativo y versión**
- **Resolución de pantalla**
- **Idioma preferido**

### Información de Comportamiento
- **Duración de sesión**
- **Páginas visitadas**
- **Fuente de tráfico**: direct, search_engine, social, referral
- **Página de entrada**
- **Sesiones activas/inactivas**

## 🛠️ Mantenimiento

### Limpieza Automática
- **Sesiones inactivas**: Se cierran automáticamente cada 15 minutos
- **Datos antiguos**: Configurable via API (default: 180 días)

### Comandos de Mantenimiento

#### Cerrar sesiones inactivas
```
POST /api/connections/sessions/close-inactive
{
  "inactiveMinutes": 30
}
```

#### Limpiar datos antiguos
```
DELETE /api/connections/cleanup?daysToKeep=180
```

## 🧪 Testing

### Script de Prueba
```bash
node server/scripts/test-connection-analytics.js
```

Este script:
1. Crea datos de prueba
2. Ejecuta todas las consultas de estadísticas
3. Verifica que el sistema funcione correctamente

### Verificación en Desarrollo
1. Iniciar el servidor: `npm run dev`
2. Visitar páginas del frontend
3. Consultar `/api/connections/stats` para ver datos

## 🔒 Consideraciones de Privacidad

### Datos Sensibles
- **IPs**: Se almacenan para geolocalización pero pueden ser anonimizadas
- **User-Agents**: Contienen información del dispositivo pero no personal
- **Geolocalización**: Basada en IP, precisión a nivel de ciudad

### Cumplimiento GDPR
- Datos agregados y estadísticos
- Posibilidad de eliminar datos por IP/sesión
- Retención configurable de datos
- No se almacena información personal identificable

## 📊 Ejemplos de Uso

### Dashboard de Administración
```javascript
// Obtener resumen completo
const stats = await fetch('/api/analytics/stats?days=30').then(r => r.json());

// Conexiones en tiempo real
const live = await fetch('/api/connections/live').then(r => r.json());

// Top países
const countries = await fetch('/api/connections/countries?limit=10').then(r => r.json());
```

### Exportación de Datos
```javascript
// Exportar último mes como CSV
const response = await fetch('/api/connections/export', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    format: 'csv'
  })
});
```

## 🚀 Próximas Mejoras

### Posibles Extensiones
- **Analíticas de artículos**: Tiempo de lectura, scrolling
- **Heatmaps**: Zonas más clickeadas
- **A/B Testing**: Pruebas de diseño y contenido
- **Alertas**: Notificaciones de picos de tráfico
- **Dashboard visual**: Gráficos interactivos

### Optimizaciones
- **Caché**: Redis para consultas frecuentes
- **Agregación**: Pre-calcular estadísticas diarias
- **Streaming**: Eventos en tiempo real con WebSockets