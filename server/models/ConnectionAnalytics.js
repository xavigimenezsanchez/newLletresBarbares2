const mongoose = require('mongoose');

const connectionAnalyticsSchema = new mongoose.Schema({
  // Información de la conexión
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  
  // Información del usuario
  userInfo: {
    ipAddress: {
      type: String,
      required: true,
      index: true
    },
    userAgent: {
      type: String,
      required: true
    },
    // Información del dispositivo
    device: {
      type: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet'],
        default: 'desktop'
      },
      browser: String,
      browserVersion: String,
      os: String,
      osVersion: String,
      vendor: String,
      model: String
    }
  },
  
  // Información geográfica (basada en IP)
  location: {
    country: String,
    countryCode: String,
    region: String,
    regionCode: String,
    city: String,
    timezone: String,
    latitude: Number,
    longitude: Number,
    isp: String,
    organization: String
  },
  
  // Información de la conexión
  connection: {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    // Página de entrada
    entryPage: {
      type: String,
      default: '/'
    },
    // Referrer (desde dónde llegó)
    referrer: String,
    // Tipo de conexión
    connectionType: {
      type: String,
      enum: ['direct', 'search_engine', 'social', 'referral', 'unknown'],
      default: 'unknown'
    }
  },
  
  // Información de la sesión
  session: {
    // Duración estimada de la sesión (se actualiza)
    duration: {
      type: Number,
      default: 0 // en segundos
    },
    // Páginas visitadas durante la sesión
    pagesViewed: {
      type: Number,
      default: 1
    },
    // Última actividad
    lastActivity: {
      type: Date,
      default: Date.now
    },
    // Indicador de sesión activa
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  // Métricas adicionales
  metrics: {
    // Resolución de pantalla
    screenResolution: String,
    // Zona horaria del usuario
    userTimezone: String,
    // Idioma preferido
    language: String
  }
}, {
  timestamps: true
});

// Índices para consultas eficientes
connectionAnalyticsSchema.index({ 'connection.timestamp': -1 });
connectionAnalyticsSchema.index({ 'userInfo.ipAddress': 1, 'connection.timestamp': -1 });
connectionAnalyticsSchema.index({ 'location.country': 1, 'connection.timestamp': -1 });
connectionAnalyticsSchema.index({ 'location.city': 1, 'connection.timestamp': -1 });
connectionAnalyticsSchema.index({ 'userInfo.device.type': 1, 'connection.timestamp': -1 });
connectionAnalyticsSchema.index({ 'userInfo.device.browser': 1, 'connection.timestamp': -1 });
connectionAnalyticsSchema.index({ 'userInfo.device.os': 1, 'connection.timestamp': -1 });
connectionAnalyticsSchema.index({ sessionId: 1, 'session.isActive': 1 });

// Métodos estáticos para estadísticas
connectionAnalyticsSchema.statics.getConnectionStats = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        'connection.timestamp': { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalConnections: { $sum: 1 },
        uniqueIPs: { $addToSet: '$userInfo.ipAddress' },
        uniqueSessions: { $addToSet: '$sessionId' },
        avgSessionDuration: { $avg: '$session.duration' },
        avgPagesPerSession: { $avg: '$session.pagesViewed' }
      }
    },
    {
      $project: {
        totalConnections: 1,
        uniqueIPs: { $size: '$uniqueIPs' },
        uniqueSessions: { $size: '$uniqueSessions' },
        avgSessionDuration: { $round: ['$avgSessionDuration', 2] },
        avgPagesPerSession: { $round: ['$avgPagesPerSession', 2] }
      }
    }
  ]);
};

// Estadísticas por país
connectionAnalyticsSchema.statics.getCountryStats = async function(days = 30, limit = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        'connection.timestamp': { $gte: startDate },
        'location.country': { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: {
          country: '$location.country',
          countryCode: '$location.countryCode'
        },
        connections: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userInfo.ipAddress' },
        avgSessionDuration: { $avg: '$session.duration' }
      }
    },
    {
      $project: {
        country: '$_id.country',
        countryCode: '$_id.countryCode',
        connections: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        avgSessionDuration: { $round: ['$avgSessionDuration', 2] }
      }
    },
    {
      $sort: { connections: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Estadísticas por ciudad
connectionAnalyticsSchema.statics.getCityStats = async function(days = 30, limit = 15) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        'connection.timestamp': { $gte: startDate },
        'location.city': { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: {
          city: '$location.city',
          country: '$location.country'
        },
        connections: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userInfo.ipAddress' }
      }
    },
    {
      $project: {
        city: '$_id.city',
        country: '$_id.country',
        connections: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    },
    {
      $sort: { connections: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Estadísticas por dispositivo
connectionAnalyticsSchema.statics.getDeviceStats = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        'connection.timestamp': { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$userInfo.device.type',
        connections: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userInfo.ipAddress' },
        avgSessionDuration: { $avg: '$session.duration' }
      }
    },
    {
      $project: {
        deviceType: '$_id',
        connections: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        avgSessionDuration: { $round: ['$avgSessionDuration', 2] }
      }
    },
    {
      $sort: { connections: -1 }
    }
  ]);
};

// Estadísticas por navegador
connectionAnalyticsSchema.statics.getBrowserStats = async function(days = 30, limit = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        'connection.timestamp': { $gte: startDate },
        'userInfo.device.browser': { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$userInfo.device.browser',
        connections: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userInfo.ipAddress' }
      }
    },
    {
      $project: {
        browser: '$_id',
        connections: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    },
    {
      $sort: { connections: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Estadísticas por sistema operativo
connectionAnalyticsSchema.statics.getOSStats = async function(days = 30, limit = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        'connection.timestamp': { $gte: startDate },
        'userInfo.device.os': { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$userInfo.device.os',
        connections: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userInfo.ipAddress' }
      }
    },
    {
      $project: {
        os: '$_id',
        connections: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    },
    {
      $sort: { connections: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Estadísticas de conexiones por tiempo
connectionAnalyticsSchema.statics.getTimelineStats = async function(days = 30, groupBy = 'day') {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  let groupStage;
  switch (groupBy) {
    case 'hour':
      groupStage = { $hour: '$connection.timestamp' };
      break;
    case 'day':
      groupStage = { $dateToString: { format: '%Y-%m-%d', date: '$connection.timestamp' } };
      break;
    case 'week':
      groupStage = { $week: '$connection.timestamp' };
      break;
    case 'month':
      groupStage = { $dateToString: { format: '%Y-%m', date: '$connection.timestamp' } };
      break;
    default:
      groupStage = { $dateToString: { format: '%Y-%m-%d', date: '$connection.timestamp' } };
  }
  
  return await this.aggregate([
    {
      $match: {
        'connection.timestamp': { $gte: startDate }
      }
    },
    {
      $group: {
        _id: groupStage,
        connections: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userInfo.ipAddress' },
        uniqueSessions: { $addToSet: '$sessionId' },
        avgSessionDuration: { $avg: '$session.duration' }
      }
    },
    {
      $project: {
        period: '$_id',
        connections: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        uniqueSessions: { $size: '$uniqueSessions' },
        avgSessionDuration: { $round: ['$avgSessionDuration', 2] }
      }
    },
    {
      $sort: { period: 1 }
    }
  ]);
};

// Método para obtener estadísticas de referrers
connectionAnalyticsSchema.statics.getReferrerStats = async function(days = 30, limit = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        'connection.timestamp': { $gte: startDate },
        'connection.referrer': { $exists: true, $ne: null, $ne: '' }
      }
    },
    {
      $group: {
        _id: '$connection.referrer',
        connections: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userInfo.ipAddress' }
      }
    },
    {
      $project: {
        referrer: '$_id',
        connections: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    },
    {
      $sort: { connections: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Método para actualizar la actividad de la sesión
connectionAnalyticsSchema.statics.updateSessionActivity = async function(sessionId, pagesViewed = null) {
  const now = new Date();
  
  const updateData = {
    'session.lastActivity': now,
    'session.isActive': true
  };
  
  if (pagesViewed !== null) {
    updateData['session.pagesViewed'] = pagesViewed;
  }
  
  const result = await this.findOneAndUpdate(
    { sessionId, 'session.isActive': true },
    updateData,
    { new: true }
  );
  
  if (result) {
    // Calcular duración de la sesión
    const startTime = result.connection.timestamp;
    const duration = Math.floor((now - startTime) / 1000); // en segundos
    
    await this.updateOne(
      { _id: result._id },
      { 'session.duration': duration }
    );
  }
  
  return result;
};

// Método para cerrar sesiones inactivas
connectionAnalyticsSchema.statics.closeInactiveSessions = async function(inactiveMinutes = 30) {
  const cutoffTime = new Date();
  cutoffTime.setMinutes(cutoffTime.getMinutes() - inactiveMinutes);
  
  const result = await this.updateMany(
    {
      'session.isActive': true,
      'session.lastActivity': { $lt: cutoffTime }
    },
    {
      'session.isActive': false
    }
  );
  
  return result.modifiedCount;
};

// Método para limpiar datos antiguos
connectionAnalyticsSchema.statics.cleanOldData = async function(daysToKeep = 180) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const result = await this.deleteMany({
    'connection.timestamp': { $lt: cutoffDate }
  });
  
  return result.deletedCount;
};

module.exports = mongoose.model('ConnectionAnalytics', connectionAnalyticsSchema);