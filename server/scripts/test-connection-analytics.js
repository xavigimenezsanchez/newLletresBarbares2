/**
 * Script de prueba para las analíticas de conexiones
 * Ejecutar con: node scripts/test-connection-analytics.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ConnectionAnalytics = require('../models/ConnectionAnalytics');

async function testConnectionAnalytics() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lletres-barbares', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado a MongoDB');
    
    // Crear datos de prueba
    console.log('\n📊 Creando datos de prueba...');
    
    const testConnections = [
      {
        sessionId: 'test-session-1',
        userInfo: {
          ipAddress: '185.233.85.123', // IP de España
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          device: {
            type: 'desktop',
            browser: 'Chrome',
            browserVersion: '120.0.0.0',
            os: 'Windows',
            osVersion: '10'
          }
        },
        location: {
          country: 'Spain',
          countryCode: 'ES',
          region: 'Catalonia',
          regionCode: 'CT',
          city: 'Barcelona',
          timezone: 'Europe/Madrid',
          latitude: 41.3851,
          longitude: 2.1734
        },
        connection: {
          timestamp: new Date(),
          entryPage: '/',
          referrer: 'https://google.com/search?q=lletres+barbares',
          connectionType: 'search_engine'
        },
        session: {
          duration: 180,
          pagesViewed: 3,
          lastActivity: new Date(),
          isActive: true
        },
        metrics: {
          language: 'ca-ES',
          userTimezone: 'Europe/Madrid'
        }
      },
      {
        sessionId: 'test-session-2',
        userInfo: {
          ipAddress: '87.98.175.85', // IP de Francia
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          device: {
            type: 'mobile',
            browser: 'Safari',
            browserVersion: '17.0',
            os: 'iOS',
            osVersion: '17.0'
          }
        },
        location: {
          country: 'France',
          countryCode: 'FR',
          region: 'Île-de-France',
          regionCode: 'IDF',
          city: 'Paris',
          timezone: 'Europe/Paris',
          latitude: 48.8566,
          longitude: 2.3522
        },
        connection: {
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
          entryPage: '/articles',
          referrer: 'https://twitter.com/status/123456789',
          connectionType: 'social'
        },
        session: {
          duration: 120,
          pagesViewed: 2,
          lastActivity: new Date(Date.now() - 5 * 60 * 1000),
          isActive: false
        },
        metrics: {
          language: 'fr-FR',
          userTimezone: 'Europe/Paris'
        }
      }
    ];
    
    // Insertar datos de prueba
    for (const connectionData of testConnections) {
      const connection = new ConnectionAnalytics(connectionData);
      await connection.save();
      console.log(`✅ Conexión de prueba creada: ${connectionData.location.city}, ${connectionData.location.country}`);
    }
    
    // Probar estadísticas
    console.log('\n📈 Probando estadísticas...');
    
    // Estadísticas generales
    console.log('\n1. Estadísticas generales:');
    const generalStats = await ConnectionAnalytics.getConnectionStats(30);
    console.log(JSON.stringify(generalStats[0], null, 2));
    
    // Estadísticas por país
    console.log('\n2. Estadísticas por país:');
    const countryStats = await ConnectionAnalytics.getCountryStats(30, 5);
    console.log(JSON.stringify(countryStats, null, 2));
    
    // Estadísticas por ciudad
    console.log('\n3. Estadísticas por ciudad:');
    const cityStats = await ConnectionAnalytics.getCityStats(30, 5);
    console.log(JSON.stringify(cityStats, null, 2));
    
    // Estadísticas por dispositivo
    console.log('\n4. Estadísticas por dispositivo:');
    const deviceStats = await ConnectionAnalytics.getDeviceStats(30);
    console.log(JSON.stringify(deviceStats, null, 2));
    
    // Estadísticas por navegador
    console.log('\n5. Estadísticas por navegador:');
    const browserStats = await ConnectionAnalytics.getBrowserStats(30, 5);
    console.log(JSON.stringify(browserStats, null, 2));
    
    // Timeline
    console.log('\n6. Timeline diario:');
    const timeline = await ConnectionAnalytics.getTimelineStats(7, 'day');
    console.log(JSON.stringify(timeline, null, 2));
    
    console.log('\n✅ Todas las pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testConnectionAnalytics();
}

module.exports = testConnectionAnalytics;