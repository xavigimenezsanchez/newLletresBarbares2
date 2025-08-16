const mongoose = require('mongoose');

const searchAnalyticsSchema = new mongoose.Schema({
  // Término de búsqueda
  query: {
    type: String,
    required: true,
    index: true
  },
  
  // Tipo de búsqueda
  searchType: {
    type: String,
    enum: ['live_search', 'full_search', 'section_filter', 'author_filter'],
    default: 'live_search'
  },
  
  // Filtros aplicados
  filters: {
    section: String,
    author: String,
    year: Number
  },
  
  // Resultados de la búsqueda
  results: {
    total: Number,
    returned: Number
  },
  
  // Información del usuario
  userInfo: {
    userAgent: String,
    ipAddress: String,
    sessionId: String
  },
  
  // Tiempo de respuesta
  performance: {
    responseTime: Number, // en milisegundos
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  
  // Comportamiento del usuario
  userBehavior: {
    clickedResult: {
      type: Boolean,
      default: false
    },
    clickedResultIndex: Number, // qué resultado se clickeó
    timeToClick: Number, // tiempo hasta hacer click (en ms)
    scrolledResults: Boolean, // si scrolleó los resultados
    searchRefined: Boolean, // si refinó la búsqueda
    originalQuery: String // query original si se refinó
  },
  
  // Contexto de la búsqueda
  context: {
    page: String, // desde qué página se hizo la búsqueda
    referrer: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet'],
      default: 'desktop'
    }
  }
}, {
  timestamps: true
});

// Índices para consultas eficientes
searchAnalyticsSchema.index({ 'performance.timestamp': -1 });
searchAnalyticsSchema.index({ query: 1, 'performance.timestamp': -1 });
searchAnalyticsSchema.index({ 'filters.section': 1, 'performance.timestamp': -1 });
searchAnalyticsSchema.index({ 'userBehavior.clickedResult': 1 });
searchAnalyticsSchema.index({ 'performance.responseTime': 1 });

// Métodos estáticos para analytics
searchAnalyticsSchema.statics.getSearchStats = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        'performance.timestamp': { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSearches: { $sum: 1 },
        uniqueQueries: { $addToSet: '$query' },
        avgResponseTime: { $avg: '$performance.responseTime' },
        totalClicks: { $sum: { $cond: ['$userBehavior.clickedResult', 1, 0] } },
        avgResults: { $avg: '$results.total' }
      }
    },
    {
      $project: {
        totalSearches: 1,
        uniqueQueries: { $size: '$uniqueQueries' },
        avgResponseTime: { $round: ['$avgResponseTime', 2] },
        clickThroughRate: {
          $round: [
            { $multiply: [{ $divide: ['$totalClicks', '$totalSearches'] }, 100] },
            2
          ]
        },
        avgResults: { $round: ['$avgResults', 1] }
      }
    }
  ]);
};

// Top queries por período
searchAnalyticsSchema.statics.getTopQueries = async function(days = 30, limit = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        'performance.timestamp': { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$query',
        count: { $sum: 1 },
        avgResults: { $avg: '$results.total' },
        clickThroughRate: {
          $avg: { $cond: ['$userBehavior.clickedResult', 1, 0] }
        },
        lastSearched: { $max: '$performance.timestamp' }
      }
    },
    {
      $project: {
        query: '$_id',
        count: 1,
        avgResults: { $round: ['$avgResults', 1] },
        clickThroughRate: { $round: [{ $multiply: ['$clickThroughRate', 100] }, 2] },
        lastSearched: 1
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Analytics por sección
searchAnalyticsSchema.statics.getSectionStats = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        'performance.timestamp': { $gte: startDate },
        'filters.section': { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$filters.section',
        searches: { $sum: 1 },
        avgResults: { $avg: '$results.total' },
        clicks: { $sum: { $cond: ['$userBehavior.clickedResult', 1, 0] } }
      }
    },
    {
      $project: {
        section: '$_id',
        searches: 1,
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
      $sort: { searches: -1 }
    }
  ]);
};

// Analytics por dispositivo
searchAnalyticsSchema.statics.getDeviceStats = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        'performance.timestamp': { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$context.deviceType',
        searches: { $sum: 1 },
        avgResponseTime: { $avg: '$performance.responseTime' },
        clicks: { $sum: { $cond: ['$userBehavior.clickedResult', 1, 0] } }
      }
    },
    {
      $project: {
        deviceType: '$_id',
        searches: 1,
        avgResponseTime: { $round: ['$avgResponseTime', 2] },
        clickThroughRate: {
          $round: [
            { $multiply: [{ $divide: ['$clicks', '$searches'] }, 100] },
            2
          ]
        }
      }
    },
    {
      $sort: { searches: -1 }
    }
  ]);
};

// Analytics por hora del día
searchAnalyticsSchema.statics.getHourlyStats = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        'performance.timestamp': { $gte: startDate }
      }
    },
    {
      $group: {
        _id: { $hour: '$performance.timestamp' },
        searches: { $sum: 1 },
        avgResults: { $avg: '$results.total' }
      }
    },
    {
      $project: {
        hour: '$_id',
        searches: 1,
        avgResults: { $round: ['$avgResults', 1] }
      }
    },
    {
      $sort: { hour: 1 }
    }
  ]);
};

// Método para limpiar datos antiguos
searchAnalyticsSchema.statics.cleanOldData = async function(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const result = await this.deleteMany({
    'performance.timestamp': { $lt: cutoffDate }
  });
  
  return result.deletedCount;
};

module.exports = mongoose.model('SearchAnalytics', searchAnalyticsSchema); 