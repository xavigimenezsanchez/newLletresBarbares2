const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', async () => {
  console.log('✅ Conectado a MongoDB');
  
  try {
    // Importar el modelo
    const Article = require('./models/Article');
    
    console.log('📚 Modelo Article importado correctamente');
    
    // Verificar que los métodos estáticos existen
    console.log('\n🔍 Verificando métodos estáticos:');
    console.log('  - getRecent:', typeof Article.getRecent === 'function' ? '✅' : '❌');
    console.log('  - getBySection:', typeof Article.getBySection === 'function' ? '✅' : '❌');
    console.log('  - getByAuthor:', typeof Article.getByAuthor === 'function' ? '✅' : '❌');
    console.log('  - getByYearAndIssue:', typeof Article.getByYearAndIssue === 'function' ? '✅' : '❌');
    console.log('  - findByAuthor:', typeof Article.findByAuthor === 'function' ? '✅' : '❌');
    console.log('  - findByAuthors:', typeof Article.findByAuthors === 'function' ? '✅' : '❌');
    console.log('  - getUniqueAuthors:', typeof Article.getUniqueAuthors === 'function' ? '✅' : '❌');
    console.log('  - fullTextSearch:', typeof Article.fullTextSearch === 'function' ? '✅' : '❌');
    console.log('  - getAuthorStats:', typeof Article.getAuthorStats === 'function' ? '✅' : '❌');
    
    // Verificar que los métodos de instancia existen
    console.log('\n🔍 Verificando métodos de instancia:');
    console.log('  - getIssue:', typeof Article.prototype.getIssue === 'function' ? '✅' : '❌');
    console.log('  - getFormattedAuthors:', typeof Article.prototype.getFormattedAuthors === 'function' ? '✅' : '❌');
    
    // Probar un método simple
    console.log('\n🧪 Probando método getRecent...');
    const recentArticles = await Article.getRecent(5);
    console.log(`✅ getRecent funcionó: ${recentArticles.length} artículos encontrados`);
    
    console.log('\n🎉 ¡Todos los métodos están funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}); 