# 🔒 Seguridad de Analytics - Lletres Barbares

## 🎯 Problema Identificado

Las rutas de analytics tenían las siguientes vulnerabilidades:
- ❌ **POST/PUT/DELETE sin autenticación** - Cualquiera podía modificar o eliminar datos
- ❌ **Sin rate limiting** - Posibles ataques de spam o DDoS
- ❌ **Sin audit logging** - No hay rastro de quién hace qué
- ❌ **Sin protección contra bots** - Crawlers podrían acceder a datos sensibles

## ✅ Medidas de Seguridad Implementadas

### 1. **Sistema de Autenticación por Token**

#### **Operaciones Protegidas (Requieren ADMIN_TOKEN):**
- `POST /api/analytics/export` - Exportar datos de búsquedas
- `DELETE /api/analytics/cleanup` - Eliminar datos antiguos
- `POST /api/connections/export` - Exportar datos de conexiones  
- `DELETE /api/connections/cleanup` - Eliminar datos antiguos
- `POST /api/connections/sessions/close-inactive` - Cerrar sesiones

#### **Cómo Autenticarse:**
```bash
# Opción 1: Header Authorization
curl -H "Authorization: Bearer tu-token-secreto" \
     -X POST http://localhost:5000/api/analytics/export

# Opción 2: Query parameter
curl -X POST "http://localhost:5000/api/analytics/export?token=tu-token-secreto"
```

### 2. **Rate Limiting**

#### **Límites Implementados:**
- **Máximo 10 requests por IP cada 15 minutos** para operaciones POST/PUT
- **Bloqueo automático** de IPs que exceden el límite
- **Respuesta 429** con tiempo de espera cuando se excede

#### **Operaciones con Rate Limiting:**
- `POST /api/analytics/search` - Registrar búsquedas
- `PUT /api/analytics/search/:id/click` - Registrar clicks

### 3. **Protección contra Bots**

#### **User-Agents Bloqueados:**
- `crawler`, `bot`, `spider`, `scraper`
- **Respuesta 403** para bots detectados
- **Logging** de intentos de bots

### 4. **Restricción por IP (Opcional)**

#### **Variables de Entorno:**
```env
ADMIN_IPS=127.0.0.1,::1,192.168.1.100
```

Solo las IPs listadas pueden realizar operaciones administrativas.

### 5. **Audit Logging**

#### **Registro Completo de Operaciones:**
```
📝 AUDIT: EXPORT_SEARCH_ANALYTICS {
  timestamp: "2024-01-15T10:30:00.000Z",
  operation: "EXPORT_SEARCH_ANALYTICS",
  ip: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  path: "/api/analytics/export",
  method: "POST",
  body: { startDate: "2024-01-01", endDate: "2024-01-31" }
}
```

#### **Operaciones Auditadas:**
- `EXPORT_SEARCH_ANALYTICS` - Exportación de datos de búsquedas
- `DELETE_OLD_SEARCH_DATA` - Eliminación de datos antiguos de búsquedas
- `EXPORT_CONNECTION_ANALYTICS` - Exportación de datos de conexiones
- `DELETE_OLD_CONNECTION_DATA` - Eliminación de datos antiguos de conexiones
- `CLOSE_INACTIVE_SESSIONS` - Cierre de sesiones inactivas

## 🔧 Configuración Requerida

### **1. Variables de Entorno (.env)**

```env
# Token secreto para operaciones administrativas
ADMIN_TOKEN=your-super-secret-admin-token-change-in-production-123456789

# IPs autorizadas (opcional)
ADMIN_IPS=127.0.0.1,::1,192.168.1.100

# Entorno (development/production)
NODE_ENV=production
```

### **2. Token Seguro en Producción**

⚠️ **IMPORTANTE:** Cambiar el token por defecto en producción:

```bash
# Generar token seguro
openssl rand -hex 32

# O usar Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚦 Niveles de Protección

### **🟢 Operaciones de Solo Lectura (Bajo Riesgo)**
- `GET /api/analytics/stats` - Estadísticas generales
- `GET /api/connections/stats` - Estadísticas de conexiones
- `GET /api/connections/countries` - Estadísticas por país
- `GET /api/connections/cities` - Estadísticas por ciudad
- `GET /api/connections/devices` - Estadísticas por dispositivo
- `GET /api/connections/live` - Estadísticas en tiempo real

**Protección:** Solo verificación anti-bots en producción

### **🟡 Operaciones de Escritura Normal (Riesgo Medio)**
- `POST /api/analytics/search` - Registrar búsquedas
- `PUT /api/analytics/search/:id/click` - Registrar clicks

**Protección:** Rate limiting (10 requests/15min)

### **🔴 Operaciones Administrativas (Alto Riesgo)**
- `POST /api/analytics/export` - Exportar datos
- `DELETE /api/analytics/cleanup` - Eliminar datos
- `POST /api/connections/export` - Exportar conexiones
- `DELETE /api/connections/cleanup` - Eliminar conexiones
- `POST /api/connections/sessions/close-inactive` - Gestión de sesiones

**Protección:** 
- ✅ Token de administrador requerido
- ✅ Verificación de IP (opcional)
- ✅ Audit logging completo
- ✅ Rate limiting

## 🧪 Testing de Seguridad

### **1. Probar Operaciones sin Token**
```bash
# Debería retornar 401 Unauthorized
curl -X POST http://localhost:5000/api/analytics/export
```

### **2. Probar con Token Inválido**
```bash
# Debería retornar 403 Forbidden
curl -H "Authorization: Bearer token-invalido" \
     -X POST http://localhost:5000/api/analytics/export
```

### **3. Probar Rate Limiting**
```bash
# Hacer más de 10 requests rápidamente
for i in {1..12}; do
  curl -X POST http://localhost:5000/api/analytics/search \
       -H "Content-Type: application/json" \
       -d '{"query":"test"}'
done
# Los últimos deberían retornar 429 Too Many Requests
```

### **4. Probar Bot Blocking**
```bash
# Debería retornar 403 Forbidden
curl -H "User-Agent: GoogleBot/2.1" \
     http://localhost:5000/api/analytics/stats
```

## 🛡️ Mejoras Adicionales Recomendadas

### **Para Producción:**

1. **HTTPS Obligatorio**
   ```javascript
   app.use((req, res, next) => {
     if (req.header('x-forwarded-proto') !== 'https') {
       res.redirect(`https://${req.header('host')}${req.url}`);
     } else {
       next();
     }
   });
   ```

2. **Logging Externo**
   - Enviar logs de auditoría a servicios como LogRocket, Sentry, o CloudWatch
   - Alertas automáticas en operaciones sensibles

3. **Firewall de Aplicación Web (WAF)**
   - Cloudflare, AWS WAF, o similar
   - Protección contra ataques SQL injection, XSS, etc.

4. **Autenticación Multi-Factor**
   - Para operaciones super-críticas
   - Integración con Google Authenticator o similar

5. **Rotación de Tokens**
   - Cambiar tokens periódicamente
   - Tokens con fecha de expiración

## 📊 Monitoreo de Seguridad

### **Alertas Recomendadas:**

1. **Intentos de Acceso No Autorizado**
   ```
   ⚠️ Intento de acceso no autorizado desde 192.168.1.xxx 
   con token inválido a /api/analytics/export
   ```

2. **Rate Limiting Activado**
   ```
   🚫 Rate limit excedido para 192.168.1.xxx: 15 requests
   ```

3. **Operaciones Administrativas**
   ```
   📝 ADMIN OPERATION: Usuario desde 192.168.1.xxx 
   ejecutó DELETE_OLD_SEARCH_DATA
   ```

4. **Bots Detectados**
   ```
   🤖 Bot detectado y bloqueado: GoogleBot/2.1 desde 192.168.1.xxx
   ```

## ✅ Estado de Seguridad

| Aspecto | Estado | Descripción |
|---------|--------|-------------|
| Autenticación | ✅ | Token requerido para operaciones críticas |
| Rate Limiting | ✅ | Implementado en operaciones de escritura |
| Audit Logging | ✅ | Registro completo de operaciones administrativas |
| Bot Protection | ✅ | User-agents sospechosos bloqueados |
| IP Filtering | ✅ | Opcional, configurable por entorno |
| HTTPS | ⚠️ | Recomendado para producción |
| WAF | ⚠️ | Recomendado para producción |

Las rutas de analytics están ahora **significativamente más seguras** y protegidas contra los ataques más comunes.