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
    const clientIP = req.ip || req.connection.remoteAddress || '';
    
    // Log del intento de acceso
    console.log(`🔍 Intento de acceso a analytics desde: ${clientIP}`);
    
    // Verificar si la IP está autorizada
    const isAuthorizedIP = AUTHORIZED_IPS.some(authorizedIP => {
      // Permitir coincidencia exacta o que contenga la IP (para rangos como 192.168.1.*)
      return clientIP === authorizedIP || 
             clientIP.includes(authorizedIP) || 
             authorizedIP.includes(clientIP.replace('::ffff:', ''));
    });
    
    if (!isAuthorizedIP) {
      console.warn(`⚠️  Acceso DENEGADO a analytics desde IP no autorizada: ${clientIP}`);
      
      // Devolver 404 en lugar de 403 para no revelar que existe la página
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>404 - Página no encontrada</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
            .error { color: #666; }
          </style>
        </head>
        <body>
          <h1>404</h1>
          <p class="error">La página que buscas no existe.</p>
          <a href="/">Volver al inicio</a>
        </body>
        </html>
      `);
    }
    
    console.log(`✅ Acceso AUTORIZADO a analytics desde: ${clientIP}`);
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
  
  // En producción, podrías enviar esto a un sistema de monitoreo
  if (process.env.NODE_ENV === 'production') {
    // TODO: Enviar a sistema de logging externo
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