const express = require('express');
const router = express.Router();
const SearchAnalytics = require('../models/SearchAnalytics');
const ConnectionAnalytics = require('../models/ConnectionAnalytics');
const UAParser = require('ua-parser-js');

// Middleware para detectar dispositivo
const detectDevice = (req, res, next) => {
  const userAgent = req.get('User-Agent');
  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  
  let deviceType = 'desktop';
  if (device.type === 'mobile') deviceType = 'mobile';
  else if (device.type === 'tablet') deviceType = 'tablet';
  
  req.deviceType = deviceType;
  next();
};

// POST /api/analytics/search - Registrar búsqueda
router.post('/search', detectDevice, async (req, res) => {
  try {
    const {
      query,
      searchType = 'live_search',
      filters = {},
      results = {},
      userBehavior = {},
      context = {}
    } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query requerida' });
    }

    const startTime = Date.now();
    
    // Crear registro de analytics
    const analytics = new SearchAnalytics({
      query: query.trim(),
      searchType,
      filters,
      results,
      userInfo: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip || req.connection.remoteAddress,
        sessionId: req.session?.id || 'anonymous'
      },
      performance: {
        responseTime: 0, // Se actualizará después
        timestamp: new Date()
      },
      userBehavior,
      context: {
        ...context,
        deviceType: req.deviceType,
        page: req.get('Referer') || 'unknown'
      }
    });

    await analytics.save();

    // Calcular tiempo de respuesta
    const responseTime = Date.now() - startTime;
    analytics.performance.responseTime = responseTime;
    await analytics.save();

    res.status(201).json({
      success: true,
      analyticsId: analytics._id,
      responseTime
    });

  } catch (error) {
    console.error('Error registrando analytics:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/analytics/search/:id/click - Registrar click en resultado
router.put('/search/:id/click', async (req, res) => {
  try {
    const { id } = req.params;
    const { clickedResultIndex, timeToClick, scrolledResults } = req.body;

    const analytics = await SearchAnalytics.findById(id);
    if (!analytics) {
      return res.status(404).json({ error: 'Analytics no encontrado' });
    }

    analytics.userBehavior.clickedResult = true;
    if (clickedResultIndex !== undefined) analytics.userBehavior.clickedResultIndex = clickedResultIndex;
    if (timeToClick !== undefined) analytics.userBehavior.timeToClick = timeToClick;
    if (scrolledResults !== undefined) analytics.userBehavior.scrolledResults = scrolledResults;

    await analytics.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando click:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/analytics/stats - Estadísticas generales (búsquedas + conexiones)
router.get('/stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    // Estadísticas de búsquedas
    const searchStats = await SearchAnalytics.getSearchStats(parseInt(days));
    const topQueries = await SearchAnalytics.getTopQueries(parseInt(days), 10);
    const sectionStats = await SearchAnalytics.getSectionStats(parseInt(days));
    const searchDeviceStats = await SearchAnalytics.getDeviceStats(parseInt(days));
    const hourlyStats = await SearchAnalytics.getHourlyStats(parseInt(days));
    
    // Estadísticas de conexiones
    const connectionStats = await ConnectionAnalytics.getConnectionStats(parseInt(days));
    const countryStats = await ConnectionAnalytics.getCountryStats(parseInt(days), 5);
    const connectionDeviceStats = await ConnectionAnalytics.getDeviceStats(parseInt(days));

    res.json({
      period: `${days} días`,
      search: {
        general: searchStats[0] || {},
        topQueries,
        sectionStats,
        deviceStats: searchDeviceStats,
        hourlyStats
      },
      connections: {
        general: connectionStats[0] || {},
        topCountries: countryStats,
        deviceStats: connectionDeviceStats
      }
    });

  } catch (error) {
    console.error('Error obteniendo stats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/analytics/queries - Top queries
router.get('/queries', async (req, res) => {
  try {
    const { days = 30, limit = 20 } = req.query;
    
    const queries = await SearchAnalytics.getTopQueries(parseInt(days), parseInt(limit));
    
    res.json({
      period: `${days} días`,
      queries
    });

  } catch (error) {
    console.error('Error obteniendo queries:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/analytics/sections - Estadísticas por sección
router.get('/sections', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const sections = await SearchAnalytics.getSectionStats(parseInt(days));
    
    res.json({
      period: `${days} días`,
      sections
    });

  } catch (error) {
    console.error('Error obteniendo stats de secciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/analytics/devices - Estadísticas por dispositivo
router.get('/devices', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const devices = await SearchAnalytics.getDeviceStats(parseInt(days));
    
    res.json({
      period: `${days} días`,
      devices
    });

  } catch (error) {
    console.error('Error obteniendo stats de dispositivos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/analytics/timeline - Estadísticas por tiempo
router.get('/timeline', async (req, res) => {
  try {
    const { days = 30, groupBy = 'day' } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    let groupStage;
    switch (groupBy) {
      case 'hour':
        groupStage = { $hour: '$performance.timestamp' };
        break;
      case 'day':
        groupStage = { $dateToString: { format: '%Y-%m-%d', date: '$performance.timestamp' } };
        break;
      case 'week':
        groupStage = { $week: '$performance.timestamp' };
        break;
      case 'month':
        groupStage = { $dateToString: { format: '%Y-%m', date: '$performance.timestamp' } };
        break;
      default:
        groupStage = { $dateToString: { format: '%Y-%m-%d', date: '$performance.timestamp' } };
    }

    const timeline = await SearchAnalytics.aggregate([
      {
        $match: {
          'performance.timestamp': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupStage,
          searches: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userInfo.sessionId' },
          avgResults: { $avg: '$results.total' },
          clicks: { $sum: { $cond: ['$userBehavior.clickedResult', 1, 0] } }
        }
      },
      {
        $project: {
          period: '$_id',
          searches: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          avgResults: { $round: ['$avgResults', 1] },
          clickThroughRate: {
            $round: [
              { $multiply: [{ $divide: ['$clicks', '$searches'] }, 100] },
              2
            ]
          }
        }
      },
      {
        $sort: { period: 1 }
      }
    ]);

    res.json({
      period: `${days} días`,
      groupBy,
      timeline
    });

  } catch (error) {
    console.error('Error obteniendo timeline:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/analytics/export - Exportar datos
router.post('/export', async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Fechas requeridas' });
    }

    const query = {
      'performance.timestamp': {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const data = await SearchAnalytics.find(query).sort({ 'performance.timestamp': -1 });

    if (format === 'csv') {
      // Implementar exportación CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=search-analytics-${startDate}-${endDate}.csv`);
      
      const csv = data.map(item => {
        return `${item.query},${item.searchType},${item.results.total},${item.performance.timestamp},${item.userBehavior.clickedResult}`;
      }).join('\n');
      
      res.send(`query,searchType,results,timestamp,clicked\n${csv}`);
    } else {
      res.json({
        period: { startDate, endDate },
        totalRecords: data.length,
        data
      });
    }

  } catch (error) {
    console.error('Error exportando datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/analytics/cleanup - Limpiar datos antiguos
router.delete('/cleanup', async (req, res) => {
  try {
    const { daysToKeep = 90 } = req.query;
    
    const deletedCount = await SearchAnalytics.cleanOldData(parseInt(daysToKeep));
    
    res.json({
      success: true,
      deletedCount,
      message: `Eliminados ${deletedCount} registros antiguos`
    });

  } catch (error) {
    console.error('Error limpiando datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 