/**
 * Middleware de autenticación para proteger rutas sensibles de analytics
 */

// Lista de IPs permitidas (opcional)
const ALLOWED_IPS = process.env.ADMIN_IPS ? process.env.ADMIN_IPS.split(',') : [];

// Token de autenticación simple para operaciones administrativas
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your-secret-admin-token-here';

// Middleware para verificar token de administrador
const requireAdminAuth = (req, res, next) => {
  try {
    // Verificar token en header Authorization
    const authHeader = req.get('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.query.token; // También permitir token en query params

    if (!token) {
      return res.status(401).json({ 
        error: 'Token de autenticación requerido',
        message: 'Esta operación requiere autenticación de administrador'
      });
    }

    if (token !== ADMIN_TOKEN) {
      console.warn(`⚠️  Intento de acceso no autorizado desde ${req.ip} con token inválido`);
      return res.status(403).json({ 
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }

    // Verificar IP si está configurado
    if (ALLOWED_IPS.length > 0) {
      const clientIP = req.ip || req.connection.remoteAddress || '';
      const isAllowedIP = ALLOWED_IPS.some(allowedIP => clientIP.includes(allowedIP));
      
      if (!isAllowedIP) {
        console.warn(`⚠️  Acceso denegado desde IP no autorizada: ${clientIP}`);
        return res.status(403).json({ 
          error: 'IP no autorizada',
          message: 'Tu dirección IP no está autorizada para esta operación'
        });
      }
    }

    console.log(`✅ Acceso autorizado desde ${req.ip} para ${req.method} ${req.path}`);
    next();

  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'Error verificando autenticación'
    });
  }
};

// Middleware para operaciones de solo lectura (menos restrictivo)
const requireReadAuth = (req, res, next) => {
  // Para operaciones de lectura, podemos ser menos restrictivos
  // o saltarnos la autenticación si es para uso interno
  
  if (process.env.NODE_ENV === 'development') {
    // En desarrollo, permitir sin autenticación
    return next();
  }

  // En producción, aplicar alguna forma de rate limiting o validación básica
  const userAgent = req.get('User-Agent') || '';
  
  // Bloquear bots conocidos o user-agents sospechosos
  const suspiciousBots = ['crawler', 'bot', 'spider', 'scraper'];
  const isSuspicious = suspiciousBots.some(bot => userAgent.toLowerCase().includes(bot));
  
  if (isSuspicious) {
    console.warn(`🤖 Bot detectado y bloqueado: ${userAgent} desde ${req.ip}`);
    return res.status(403).json({ 
      error: 'Acceso denegado',
      message: 'Bots no permitidos'
    });
  }

  next();
};

// Middleware para rate limiting en operaciones sensibles
const rateLimitMiddleware = () => {
  const requests = new Map();
  const WINDOW_SIZE = 15 * 60 * 1000; // 15 minutos
  const MAX_REQUESTS = 10; // Máximo 10 requests por ventana

  return (req, res, next) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    // Limpiar requests antiguos
    const userRequests = requests.get(key) || [];
    const recentRequests = userRequests.filter(time => now - time < WINDOW_SIZE);
    
    if (recentRequests.length >= MAX_REQUESTS) {
      console.warn(`🚫 Rate limit excedido para ${key}: ${recentRequests.length} requests`);
      return res.status(429).json({ 
        error: 'Demasiadas peticiones',
        message: 'Has excedido el límite de peticiones. Intenta más tarde.',
        retryAfter: Math.ceil(WINDOW_SIZE / 1000)
      });
    }

    // Agregar request actual
    recentRequests.push(now);
    requests.set(key, recentRequests);
    
    next();
  };
};

// Middleware para logging de operaciones sensibles
const auditLog = (operation) => {
  return (req, res, next) => {
    const logData = {
      timestamp: new Date().toISOString(),
      operation,
      ip: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      path: req.path,
      method: req.method,
      body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined
    };

    console.log(`📝 AUDIT: ${operation}`, logData);
    
    // En producción, podrías enviar esto a un servicio de logging externo
    if (process.env.NODE_ENV === 'production') {
      // TODO: Enviar a servicio de logging/monitoreo
    }

    next();
  };
};

module.exports = {
  requireAdminAuth,
  requireReadAuth,
  rateLimitMiddleware,
  auditLog
};