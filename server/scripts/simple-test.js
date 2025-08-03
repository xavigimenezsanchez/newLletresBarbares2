console.log('🚀 Iniciant test de connexió...');

const mongoose = require('mongoose');

const uri = "mongodb+srv://test:U1SHxjVdRiDCxkpH@cluster0.kx7ne.mongodb.net/newLletresBarbares?retryWrites=true&w=majority&appName=Cluster0";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
console.log('📡 Intentant connexió...');

mongoose.connect(uri, clientOptions)
  .then(() => {
    console.log('✅ Connexió exitosa!');
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('🔌 Desconnectat');
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
  }); 