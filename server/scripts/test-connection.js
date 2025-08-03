const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Provant connexió a MongoDB Atlas...');
  
  // Mostrar la URI (sin la contraseña)
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lletres-barbares';
  const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
  console.log(`📡 URI: ${maskedUri}`);
  
  try {
    const clientOptions = { 
      serverApi: { 
        version: '1', 
        strict: true, 
        deprecationErrors: true 
      },
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    console.log('🔄 Intentant connexió...');
    await mongoose.connect(uri, clientOptions);
    
    console.log('✅ Connexió exitosa!');
    
    // Probar ping
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log('🏓 Ping exitós!');
    
    // Listar bases de datos
    const dbs = await mongoose.connection.db.admin().listDatabases();
    console.log('📚 Bases de dades disponibles:');
    dbs.databases.forEach(db => {
      console.log(`   - ${db.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error de connexió:', error.message);
    
    if (error.message.includes('whitelist')) {
      console.log('\n💡 Possibles solucions:');
      console.log('   1. Verifica que la IP està a la whitelist de MongoDB Atlas');
      console.log('   2. Afegeix 0.0.0.0/0 per permetre totes les IPs');
      console.log('   3. Verifica que el usuari i contrasenya són correctes');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n🔐 Error d\'autenticació:');
      console.log('   - Verifica el usuari i contrasenya');
      console.log('   - Assegura\'t que el usuari té permisos per a la base de dades');
    }
    
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconnectat');
  }
}

testConnection(); 