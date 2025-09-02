/**
 * Middleware de autenticación simple para páginas de analytics
 * Protección por IP y URL secreta para acceso limitado
 */

// IPs autorizadas para acceder a analytics (configurable en .env)
const AUTHORIZED_IPS = process.env.ANALYTICS_IPS 
  ? process.env.ANALYTICS_IPS.split(',').map(ip => ip.trim())
  : ['127.0.0.1', '::1']; // Por defecto solo localhost

// URL secreta para analytics (configurable en .env)
const SECRET_PATH = process.env.ANALYTICS_SECRET_PATH || 'admin-dashboard-2024';

// Middleware para proteger acceso a analytics
const protectAnalytics = (req, res, next) => {
  try {
    // Obtener IP del cliente, priorizando headers de proxy
    const forwardedFor = req.get('x-forwarded-for');
    const realIP = req.get('x-real-ip');
    const cfConnectingIP = req.get('cf-connecting-ip');
    const directIP = req.ip || req.connection.remoteAddress || '';
    
    // Determinar la IP real del cliente
    let clientIP = directIP;
    if (forwardedFor) {
      clientIP = forwardedFor.split(',')[0].trim();
    } else if (realIP) {
      clientIP = realIP;
    } else if (cfConnectingIP) {
      clientIP = cfConnectingIP;
    }
    
    // Log del intento de acceso
    console.log(`🔍 Intento de acceso a analytics desde: ${clientIP}`);
    console.log(`🔍 Headers de IP: direct=${directIP}, x-forwarded-for=${forwardedFor}, x-real-ip=${realIP}, cf-connecting-ip=${cfConnectingIP}`);
    
    // Limpiar la IP del cliente (quitar prefijos IPv6)
    const cleanClientIP = clientIP.replace('::ffff:', '').replace('::1', '127.0.0.1');
    
    // Array de posibles IPs del cliente (para casos edge)
    const possibleIPs = [
      cleanClientIP,
      forwardedFor ? forwardedFor.split(',')[0].trim() : null,
      realIP,
      cfConnectingIP,
      directIP.replace('::ffff:', '')
    ].filter(Boolean);
    
    console.log(`🔍 IP del cliente (limpia): ${cleanClientIP}`);
    console.log(`🔍 Posibles IPs: ${possibleIPs.join(', ')}`);
    console.log(`🔍 IPs autorizadas: ${AUTHORIZED_IPS.join(', ')}`);
    
    // TEMPORAL: En desarrollo, permitir todas las IPs
    if (process.env.NODE_ENV === 'development') {
      console.log(`🟡 DESARROLLO: Permitiendo acceso sin verificación de IP`);
      return next();
    }
    
    // Verificar si alguna de las posibles IPs está autorizada
    const isAuthorizedIP = AUTHORIZED_IPS.some(authorizedIP => {
      const cleanAuthorizedIP = authorizedIP.trim();
      
      return possibleIPs.some(possibleIP => {
        const match = possibleIP === cleanAuthorizedIP || 
                     possibleIP.includes(cleanAuthorizedIP) || 
                     cleanAuthorizedIP.includes(possibleIP);
        
        if (match) {
          console.log(`✅ Coincidencia encontrada: ${possibleIP} <-> ${cleanAuthorizedIP}`);
        }
        
        return match;
      });
    });
    
    if (!isAuthorizedIP) {
      console.warn(`⚠️  Acceso DENEGADO a analytics desde IP no autorizada: ${cleanClientIP}`);
      console.warn(`⚠️  Headers: x-forwarded-for=${forwardedFor}, x-real-ip=${realIP}, cf-connecting-ip=${cfConnectingIP}`);
      
      // Devolver 404 en lugar de 403 para no revelar que existe la página
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>404 - Página no encontrada</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
            .error { color: #666; }
            .debug { color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>404</h1>
          <p class="error">La página que buscas no existe.</p>
          <div class="debug">Debug: IP=${cleanClientIP}, Authorized=${AUTHORIZED_IPS.join(',')}</div>
          <a href="/">Volver al inicio</a>
        </body>
        </html>
      `);
    }
    
    console.log(`✅ Acceso AUTORIZADO a analytics desde: ${cleanClientIP}`);
    next();
    
  } catch (error) {
    console.error('Error en middleware de analytics:', error);
    res.status(500).send('Error interno del servidor');
  }
};

// Middleware para logging de accesos exitosos
const logAnalyticsAccess = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || '';
  const userAgent = req.get('User-Agent') || 'unknown';
  
  console.log(`📊 ACCESO A ANALYTICS: ${clientIP} - ${userAgent} - ${new Date().toISOString()}`);
  
  // En producción, podrías enviar esto a un sistema de logging externo
  if (process.env.NODE_ENV === 'production') {
    // TODO: Enviar a servicio de logging/monitoreo
  }
  
  next();
};

// Función para generar nueva URL secreta
const generateSecretPath = () => {
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  return `admin-analytics-${randomSuffix}`;
};

module.exports = {
  protectAnalytics,
  logAnalyticsAccess,
  generateSecretPath,
  getSecretPath: () => SECRET_PATH,
  getAuthorizedIPs: () => AUTHORIZED_IPS
};