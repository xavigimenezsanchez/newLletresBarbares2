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
    const Author = require('./models/Author');
    
    console.log('📚 Modelo Author importado correctamente');
    
    // Crear un autor de prueba
    console.log('🧪 Creando autor de prueba...');
    
    const testAuthor = new Author({
      name: 'Test Author Name',
      bio: {
        short: 'Autor de prova per testejat el sistema.',
        full: 'Aquest és un autor de prova creat per testejat el sistema de migració i la generació automàtica de slugs.'
      },
      profession: 'Escriptor de prova',
      location: 'Barcelona',
      specialties: ['prova', 'test'],
      stats: {
        totalArticles: 0,
        totalViews: 0
      },
      isActive: true
    });
    
    console.log('📝 Autor antes de guardar:');
    console.log('  - Nombre:', testAuthor.name);
    console.log('  - Slug:', testAuthor.slug);
    console.log('  - Bio:', testAuthor.bio.short);
    
    // Guardar el autor
    await testAuthor.save();
    
    console.log('\n✅ Autor guardado exitosamente:');
    console.log('  - ID:', testAuthor._id);
    console.log('  - Nombre:', testAuthor.name);
    console.log('  - Slug:', testAuthor.slug);
    console.log('  - Bio:', testAuthor.bio.short);
    
    // Verificar que se creó en la base de datos
    const savedAuthor = await Author.findById(testAuthor._id);
    console.log('\n🔍 Autor recuperado de la base de datos:');
    console.log('  - Nombre:', savedAuthor.name);
    console.log('  - Slug:', savedAuthor.slug);
    
    // Limpiar el autor de prueba
    await Author.findByIdAndDelete(testAuthor._id);
    console.log('\n🧹 Autor de prueba eliminado');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}); 