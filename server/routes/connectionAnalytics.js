const express = require('express');
const router = express.Router();
const ConnectionAnalytics = require('../models/ConnectionAnalytics');
const { requireAdminAuth, requireReadAuth, auditLog } = require('../middleware/authMiddleware');

// GET /api/connections/debug-ip - Debug para verificar IP y acceso
router.get('/debug-ip', (req, res) => {
  // Lógica idéntica al middleware de autenticación
  const forwardedFor = req.get('x-forwarded-for');
  const realIP = req.get('x-real-ip');
  const cfConnectingIP = req.get('cf-connecting-ip');
  const directIP = req.ip || req.connection.remoteAddress || '';
  
  // Determinar la IP real del cliente (misma lógica que el middleware)
  let clientIP = directIP;
  if (forwardedFor) {
    clientIP = forwardedFor.split(',')[0].trim();
  } else if (realIP) {
    clientIP = realIP;
  } else if (cfConnectingIP) {
    clientIP = cfConnectingIP;
  }
  
  const cleanClientIP = clientIP.replace('::ffff:', '').replace('::1', '127.0.0.1');
  const authorizedIPs = process.env.ANALYTICS_IPS ? process.env.ANALYTICS_IPS.split(',').map(ip => ip.trim()) : ['127.0.0.1', '::1'];
  
  const possibleIPs = [
    cleanClientIP,
    forwardedFor ? forwardedFor.split(',')[0].trim() : null,
    realIP,
    cfConnectingIP,
    directIP.replace('::ffff:', '')
  ].filter(Boolean);
  
  const isAuthorized = authorizedIPs.some(authorizedIP => {
    const cleanAuthorizedIP = authorizedIP.trim();
    return possibleIPs.some(possibleIP => {
      return possibleIP === cleanAuthorizedIP || 
             possibleIP.includes(cleanAuthorizedIP) || 
             cleanAuthorizedIP.includes(possibleIP);
    });
  });
  
  res.json({
    debug: true,
    step1_directIP: directIP,
    step2_selectedIP: clientIP,
    step3_cleanIP: cleanClientIP,
    step4_possibleIPs: possibleIPs,
    step5_authorizedIPs: authorizedIPs,
    step6_isAuthorized: isAuthorized,
    headers: {
      'x-forwarded-for': forwardedFor,
      'x-real-ip': realIP,
      'cf-connecting-ip': cfConnectingIP
    },
    environment: process.env.NODE_ENV,
    trustProxy: req.app.get('trust proxy')
  });
});

// GET /api/connections/test-analytics-apis - Test para verificar APIs de analytics
router.get('/test-analytics-apis', async (req, res) => {
  const results = {};
  
  try {
    // Test API de analytics de búsquedas
    const SearchAnalytics = require('../models/SearchAnalytics');
    const searchCount = await SearchAnalytics.countDocuments();
    results.searchAnalytics = { 
      model: 'OK', 
      count: searchCount,
      status: 'working'
    };
  } catch (error) {
    results.searchAnalytics = { 
      model: 'ERROR', 
      error: error.message,
      status: 'failed'
    };
  }
  
  try {
    // Test API de connections
    const ConnectionAnalytics = require('../models/ConnectionAnalytics');
    const connectionCount = await ConnectionAnalytics.countDocuments();
    results.connectionAnalytics = { 
      model: 'OK', 
      count: connectionCount,
      status: 'working'
    };
  } catch (error) {
    results.connectionAnalytics = { 
      model: 'ERROR', 
      error: error.message,
      status: 'failed'
    };
  }
  
  // Test rutas específicas
  results.routes = {
    searchStats: '/api/analytics/stats',
    connectionStats: '/api/connections/stats'
  };
  
  res.json({
    test: 'analytics-apis',
    timestamp: new Date().toISOString(),
    results
  });
});

// GET /api/connections/test-frontend - Test para verificar que el frontend se sirve
router.get('/test-frontend', (req, res) => {
  const path = require('path');
  const fs = require('fs');
  
  const indexPath = path.join(__dirname, '../../client/dist/index.html');
  
  try {
    const exists = fs.existsSync(indexPath);
    const stats = exists ? fs.statSync(indexPath) : null;
    
    res.json({
      test: 'frontend-serving',
      indexPath,
      exists,
      size: stats ? stats.size : null,
      modified: stats ? stats.mtime : null,
      nodeEnv: process.env.NODE_ENV,
      __dirname
    });
  } catch (error) {
    res.json({
      test: 'frontend-serving',
      error: error.message,
      indexPath,
      nodeEnv: process.env.NODE_ENV
    });
  }
});

// GET /api/connections/debug - Endpoint de debug para verificar funcionamiento
router.get('/debug', async (req, res) => {
  try {
    // Contar documentos totales
    const totalConnections = await ConnectionAnalytics.countDocuments();
    
    // Obtener las últimas 5 conexiones
    const recentConnections = await ConnectionAnalytics.find()
      .sort({ 'connection.timestamp': -1 })
      .limit(5)
      .select({
        'userInfo.ipAddress': 1,
        'userInfo.device.type': 1,
        'location.city': 1,
        'location.country': 1,
        'connection.timestamp': 1,
        'connection.entryPage': 1,
        'sessionId': 1
      });

    // Verificar conexión a la base de datos
    const dbStatus = ConnectionAnalytics.db.readyState === 1 ? 'connected' : 'disconnected';

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        name: ConnectionAnalytics.db.name
      },
      analytics: {
        totalConnections,
        recentConnections
      },
      message: totalConnections === 0 
        ? 'No hay conexiones registradas aún. Visita páginas del frontend para generar datos.'
        : `Se han registrado ${totalConnections} conexiones.`
    });

  } catch (error) {
    console.error('Error en debug endpoint:', error);
    res.status(500).json({ 
      status: 'error',
      error: error.message,
      message: 'Error verificando el estado de las analíticas de conexiones'
    });
  }
});

// GET /api/connections/stats - Estadísticas generales de conexiones
router.get('/stats', requireReadAuth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const stats = await ConnectionAnalytics.getConnectionStats(parseInt(days));
    const countryStats = await ConnectionAnalytics.getCountryStats(parseInt(days), 10);
    const cityStats = await ConnectionAnalytics.getCityStats(parseInt(days), 15);
    const deviceStats = await ConnectionAnalytics.getDeviceStats(parseInt(days));
    const browserStats = await ConnectionAnalytics.getBrowserStats(parseInt(days), 10);
    const osStats = await ConnectionAnalytics.getOSStats(parseInt(days), 10);
    const referrerStats = await ConnectionAnalytics.getReferrerStats(parseInt(days), 10);

    res.json({
      period: `${days} días`,
      general: stats[0] || {},
      geography: {
        countries: countryStats,
        cities: cityStats
      },
      technology: {
        devices: deviceStats,
        browsers: browserStats,
        operatingSystems: osStats
      },
      traffic: {
        referrers: referrerStats
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de conexiones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/connections/countries - Estadísticas por país
router.get('/countries', async (req, res) => {
  try {
    const { days = 30, limit = 20 } = req.query;
    
    const countries = await ConnectionAnalytics.getCountryStats(parseInt(days), parseInt(limit));
    
    res.json({
      period: `${days} días`,
      countries
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de países:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/connections/cities - Estadísticas por ciudad
router.get('/cities', async (req, res) => {
  try {
    const { days = 30, limit = 25 } = req.query;
    
    const cities = await ConnectionAnalytics.getCityStats(parseInt(days), parseInt(limit));
    
    res.json({
      period: `${days} días`,
      cities
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de ciudades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/connections/devices - Estadísticas por dispositivo
router.get('/devices', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const devices = await ConnectionAnalytics.getDeviceStats(parseInt(days));
    const browsers = await ConnectionAnalytics.getBrowserStats(parseInt(days), 10);
    const operatingSystems = await ConnectionAnalytics.getOSStats(parseInt(days), 10);
    
    res.json({
      period: `${days} días`,
      deviceTypes: devices,
      browsers,
      operatingSystems
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de dispositivos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/connections/timeline - Estadísticas por tiempo
router.get('/timeline', async (req, res) => {
  try {
    const { days = 30, groupBy = 'day' } = req.query;
    
    if (!['hour', 'day', 'week', 'month'].includes(groupBy)) {
      return res.status(400).json({ error: 'groupBy debe ser: hour, day, week o month' });
    }
    
    const timeline = await ConnectionAnalytics.getTimelineStats(parseInt(days), groupBy);
    
    res.json({
      period: `${days} días`,
      groupBy,
      timeline
    });

  } catch (error) {
    console.error('Error obteniendo timeline de conexiones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/connections/referrers - Estadísticas de referrers
router.get('/referrers', async (req, res) => {
  try {
    const { days = 30, limit = 15 } = req.query;
    
    const referrers = await ConnectionAnalytics.getReferrerStats(parseInt(days), parseInt(limit));
    
    res.json({
      period: `${days} días`,
      referrers
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de referrers:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/connections/live - Estadísticas en tiempo real (sesiones activas)
router.get('/live', async (req, res) => {
  try {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000);
    
    // Sesiones activas
    const activeSessions = await ConnectionAnalytics.countDocuments({
      'session.isActive': true,
      'session.lastActivity': { $gte: last5Minutes }
    });
    
    // Conexiones en la última hora
    const connectionsLastHour = await ConnectionAnalytics.countDocuments({
      'connection.timestamp': { $gte: lastHour }
    });
    
    // Países más activos en la última hora
    const activeCountries = await ConnectionAnalytics.aggregate([
      {
        $match: {
          'connection.timestamp': { $gte: lastHour }
        }
      },
      {
        $group: {
          _id: '$location.country',
          connections: { $sum: 1 }
        }
      },
      {
        $project: {
          country: '$_id',
          connections: 1
        }
      },
      {
        $sort: { connections: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    // Dispositivos más activos
    const activeDevices = await ConnectionAnalytics.aggregate([
      {
        $match: {
          'connection.timestamp': { $gte: lastHour }
        }
      },
      {
        $group: {
          _id: '$userInfo.device.type',
          connections: { $sum: 1 }
        }
      },
      {
        $project: {
          deviceType: '$_id',
          connections: 1
        }
      },
      {
        $sort: { connections: -1 }
      }
    ]);
    
    res.json({
      timestamp: now,
      activeSessions,
      connectionsLastHour,
      activeCountries,
      activeDevices
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas en tiempo real:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/connections/detailed - Listado detallado de conexiones
router.get('/detailed', async (req, res) => {
  try {
    const { 
      days = 7, 
      page = 1, 
      limit = 50,
      country,
      deviceType,
      browser 
    } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Construir filtros
    const filters = {
      'connection.timestamp': { $gte: startDate }
    };
    
    if (country) filters['location.country'] = country;
    if (deviceType) filters['userInfo.device.type'] = deviceType;
    if (browser) filters['userInfo.device.browser'] = browser;
    
    const connections = await ConnectionAnalytics.find(filters)
      .sort({ 'connection.timestamp': -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select({
        'userInfo.ipAddress': 1,
        'userInfo.device': 1,
        'location.city': 1,
        'location.country': 1,
        'connection.timestamp': 1,
        'connection.entryPage': 1,
        'connection.referrer': 1,
        'connection.connectionType': 1,
        'session.duration': 1,
        'session.pagesViewed': 1,
        'session.isActive': 1
      });
    
    const total = await ConnectionAnalytics.countDocuments(filters);
    
    res.json({
      period: `${days} días`,
      connections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      filters: { country, deviceType, browser }
    });

  } catch (error) {
    console.error('Error obteniendo conexiones detalladas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/connections/export - Exportar datos de conexiones (REQUIERE AUTENTICACIÓN ADMIN)
router.post('/export', requireAdminAuth, auditLog('EXPORT_CONNECTION_ANALYTICS'), async (req, res) => {
  try {
    const { startDate, endDate, format = 'json', filters = {} } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Fechas de inicio y fin requeridas' });
    }
    
    const query = {
      'connection.timestamp': {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      ...filters
    };
    
    const data = await ConnectionAnalytics.find(query)
      .sort({ 'connection.timestamp': -1 })
      .select({
        'userInfo.ipAddress': 1,
        'userInfo.device': 1,
        'location': 1,
        'connection': 1,
        'session.duration': 1,
        'session.pagesViewed': 1,
        'metrics.language': 1
      });
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=connections-analytics-${startDate}-${endDate}.csv`);
      
      const csvHeader = 'timestamp,ip,country,city,deviceType,browser,os,entryPage,referrer,connectionType,duration,pagesViewed,language\n';
      const csvData = data.map(item => {
        return [
          item.connection.timestamp.toISOString(),
          item.userInfo.ipAddress,
          item.location.country || '',
          item.location.city || '',
          item.userInfo.device.type || '',
          item.userInfo.device.browser || '',
          item.userInfo.device.os || '',
          item.connection.entryPage || '',
          item.connection.referrer || '',
          item.connection.connectionType || '',
          item.session.duration || 0,
          item.session.pagesViewed || 0,
          item.metrics.language || ''
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
      }).join('\n');
      
      res.send(csvHeader + csvData);
    } else {
      res.json({
        period: { startDate, endDate },
        totalRecords: data.length,
        filters,
        data
      });
    }

  } catch (error) {
    console.error('Error exportando datos de conexiones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/connections/cleanup - Limpiar datos antiguos (REQUIERE AUTENTICACIÓN ADMIN)
router.delete('/cleanup', requireAdminAuth, auditLog('DELETE_OLD_CONNECTION_DATA'), async (req, res) => {
  try {
    const { daysToKeep = 180 } = req.query;
    
    const deletedCount = await ConnectionAnalytics.cleanOldData(parseInt(daysToKeep));
    
    res.json({
      success: true,
      deletedCount,
      message: `Eliminados ${deletedCount} registros de conexiones antiguos`
    });

  } catch (error) {
    console.error('Error limpiando datos de conexiones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/connections/sessions/close-inactive - Cerrar sesiones inactivas (REQUIERE AUTENTICACIÓN ADMIN)
router.post('/sessions/close-inactive', requireAdminAuth, auditLog('CLOSE_INACTIVE_SESSIONS'), async (req, res) => {
  try {
    const { inactiveMinutes = 30 } = req.body;
    
    const closedCount = await ConnectionAnalytics.closeInactiveSessions(parseInt(inactiveMinutes));
    
    res.json({
      success: true,
      closedCount,
      message: `Cerradas ${closedCount} sesiones inactivas`
    });

  } catch (error) {
    console.error('Error cerrando sesiones inactivas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;