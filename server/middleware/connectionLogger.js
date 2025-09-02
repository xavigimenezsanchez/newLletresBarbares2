const ConnectionAnalytics = require('../models/ConnectionAnalytics');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const crypto = require('crypto');

// Cache para evitar múltiples registros de la misma sesión
const sessionCache = new Map();
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

// Función para generar un ID de sesión único
const generateSessionId = (req) => {
  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip || req.connection.remoteAddress || '';
  const timestamp = Date.now();
  
  // Crear un hash único basado en IP, User-Agent y timestamp del día
  const dayTimestamp = Math.floor(timestamp / (24 * 60 * 60 * 1000));
  const sessionString = `${ip}-${userAgent}-${dayTimestamp}`;
  
  return crypto.createHash('sha256').update(sessionString).digest('hex').substring(0, 16);
};

// Función para detectar el tipo de dispositivo y browser
const parseUserAgent = (userAgentString) => {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();
  
  let deviceType = 'desktop';
  if (result.device.type === 'mobile') deviceType = 'mobile';
  else if (result.device.type === 'tablet') deviceType = 'tablet';
  
  return {
    type: deviceType,
    browser: result.browser.name,
    browserVersion: result.browser.version,
    os: result.os.name,
    osVersion: result.os.version,
    vendor: result.device.vendor,
    model: result.device.model
  };
};

// Función para obtener información geográfica basada en IP
const getLocationFromIP = (ip) => {
  // Remover prefijos IPv6-to-IPv4 si existen
  const cleanIP = ip.replace(/^::ffff:/, '');
  
  // No procesar IPs locales
  if (cleanIP === '127.0.0.1' || cleanIP === 'localhost' || cleanIP.startsWith('192.168.') || cleanIP.startsWith('10.')) {
    return {
      country: 'Local',
      countryCode: 'LC',
      region: 'Local',
      regionCode: 'LC',
      city: 'Local',
      timezone: 'UTC',
      latitude: null,
      longitude: null,
      isp: 'Local Network',
      organization: 'Local Network'
    };
  }
  
  const geo = geoip.lookup(cleanIP);
  
  if (!geo) {
    return {
      country: 'Unknown',
      countryCode: 'UN',
      region: 'Unknown',
      regionCode: 'UN',
      city: 'Unknown',
      timezone: 'UTC',
      latitude: null,
      longitude: null,
      isp: 'Unknown',
      organization: 'Unknown'
    };
  }
  
  return {
    country: geo.country,
    countryCode: geo.country,
    region: geo.region,
    regionCode: geo.region,
    city: geo.city,
    timezone: geo.timezone,
    latitude: geo.ll ? geo.ll[0] : null,
    longitude: geo.ll ? geo.ll[1] : null,
    isp: 'Unknown',
    organization: 'Unknown'
  };
};

// Función para determinar el tipo de conexión basado en el referrer
const getConnectionType = (referrer) => {
  if (!referrer) return 'direct';
  
  const referrerLower = referrer.toLowerCase();
  
  // Motores de búsqueda
  if (referrerLower.includes('google.') || 
      referrerLower.includes('bing.') || 
      referrerLower.includes('yahoo.') ||
      referrerLower.includes('duckduckgo.') ||
      referrerLower.includes('startpage.')) {
    return 'search_engine';
  }
  
  // Redes sociales
  if (referrerLower.includes('facebook.') ||
      referrerLower.includes('twitter.') ||
      referrerLower.includes('instagram.') ||
      referrerLower.includes('linkedin.') ||
      referrerLower.includes('reddit.') ||
      referrerLower.includes('pinterest.')) {
    return 'social';
  }
  
  // Si viene de otro dominio, es referral
  return 'referral';
};

// Middleware principal para registrar conexiones
const connectionLogger = async (req, res, next) => {
  try {
    // Debug: Log todas las requests
    console.log(`🔍 ConnectionLogger: ${req.method} ${req.path} from ${req.ip}`);
    
    // Solo registrar conexiones GET a páginas principales (no APIs, imágenes, etc.)
    // Temporalmente, vamos a permitir algunas APIs para testing
    const shouldSkip = req.method !== 'GET' || 
        (req.path.includes('.') && !req.path.endsWith('.html')) ||
        req.path.startsWith('/api/images/') ||
        req.path.startsWith('/api/videos/');
    
    if (shouldSkip) {
      console.log(`⏭️  Skipping: ${req.method} ${req.path} (filtered out)`);
      return next();
    }
    
    console.log(`✅ Processing connection for: ${req.path}`);
    
    const ip = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('User-Agent') || '';
    const sessionId = generateSessionId(req);
    
    // Verificar si ya hemos registrado esta sesión recientemente
    const cacheKey = `${sessionId}-${ip}`;
    const cachedTime = sessionCache.get(cacheKey);
    const now = Date.now();
    
    if (cachedTime && (now - cachedTime) < SESSION_TIMEOUT) {
      // Actualizar actividad de la sesión existente
      console.log(`🔄 Session exists in cache, updating activity for: ${sessionId}`);
      await ConnectionAnalytics.updateSessionActivity(sessionId);
      return next();
    }
    
    console.log(`🆕 New session detected: ${sessionId} from ${ip}`);
    
    // Obtener información del dispositivo
    const deviceInfo = parseUserAgent(userAgent);
    
    // Obtener información geográfica
    const locationInfo = getLocationFromIP(ip);
    
    // Obtener información de la conexión
    const referrer = req.get('Referer') || req.get('Referrer') || '';
    const connectionType = getConnectionType(referrer);
    const entryPage = req.path || '/';
    
    // Obtener información adicional de los headers
    const acceptLanguage = req.get('Accept-Language') || '';
    const language = acceptLanguage.split(',')[0] || 'unknown';
    
    // Crear el registro de conexión
    const connectionData = {
      sessionId,
      userInfo: {
        ipAddress: ip,
        userAgent,
        device: deviceInfo
      },
      location: locationInfo,
      connection: {
        timestamp: new Date(),
        entryPage,
        referrer,
        connectionType
      },
      session: {
        duration: 0,
        pagesViewed: 1,
        lastActivity: new Date(),
        isActive: true
      },
      metrics: {
        userTimezone: req.get('X-Timezone') || 'unknown',
        language: language.substring(0, 10) // Limitar longitud
      }
    };
    
    // Guardar en la base de datos
    console.log(`💾 Attempting to save connection data:`, {
      sessionId,
      ip,
      userAgent: userAgent.substring(0, 50) + '...',
      location: locationInfo,
      device: deviceInfo
    });
    
    const connectionAnalytics = new ConnectionAnalytics(connectionData);
    await connectionAnalytics.save();
    
    console.log(`✅ Connection saved successfully with ID: ${connectionAnalytics._id}`);
    
    // Actualizar cache
    sessionCache.set(cacheKey, now);
    
    // Limpiar cache antiguo periódicamente
    if (Math.random() < 0.01) { // 1% de probabilidad
      for (const [key, timestamp] of sessionCache.entries()) {
        if (now - timestamp > SESSION_TIMEOUT) {
          sessionCache.delete(key);
        }
      }
    }
    
    console.log(`📊 Nueva conexión registrada: ${ip} (${locationInfo.city}, ${locationInfo.country}) - ${deviceInfo.type}`);
    
  } catch (error) {
    console.error('❌ Error registrando conexión:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    // No bloquear la request si falla el logging
  }
  
  next();
};

// Middleware para actualizar actividad de sesión en requests adicionales
const sessionTracker = async (req, res, next) => {
  try {
    // Solo para requests GET de páginas
    if (req.method !== 'GET' || 
        req.path.startsWith('/api/') || 
        req.path.includes('.') && !req.path.endsWith('.html')) {
      return next();
    }
    
    const sessionId = generateSessionId(req);
    await ConnectionAnalytics.updateSessionActivity(sessionId);
    
  } catch (error) {
    console.error('Error actualizando sesión:', error);
  }
  
  next();
};

// Función para cerrar sesiones inactivas (ejecutar periódicamente)
const closeInactiveSessions = async () => {
  try {
    const closedCount = await ConnectionAnalytics.closeInactiveSessions(30); // 30 minutos
    if (closedCount > 0) {
      console.log(`🔒 Cerradas ${closedCount} sesiones inactivas`);
    }
  } catch (error) {
    console.error('Error cerrando sesiones inactivas:', error);
  }
};

// Ejecutar limpieza de sesiones cada 15 minutos
setInterval(closeInactiveSessions, 15 * 60 * 1000);

module.exports = {
  connectionLogger,
  sessionTracker,
  closeInactiveSessions
};