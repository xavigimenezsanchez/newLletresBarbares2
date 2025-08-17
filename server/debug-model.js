const mongoose = require('mongoose');
require('dotenv').config();

// Habilitar debug de Mongoose
mongoose.set('debug', true);

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', async () => {
  console.log('✅ Conectado a MongoDB');
  console.log('🔍 Debug de Mongoose habilitado');
  
  try {
    // Importar el modelo
    console.log('📚 Importando modelo Author...');
    const Author = require('./models/Author');
    
    console.log('✅ Modelo Author importado correctamente');
    console.log('📋 Esquema del modelo:');
    console.log('  - Campos:', Object.keys(Author.schema.paths));
    console.log('  - Middlewares:', Author.schema._middleware);
    
    // Crear un autor de prueba
    console.log('\n🧪 Creando autor de prueba...');
    
    const testAuthor = new Author({
      name: 'Test Author Debug',
      bio: {
        short: 'Autor de prova per debug.',
        full: 'Aquest és un autor de prova creat per debug del sistema.'
      },
      profession: 'Escriptor de prova',
      location: 'Barcelona',
      specialties: ['prova', 'debug'],
      stats: {
        totalArticles: 0,
        totalViews: 0
      },
      isActive: true
    });
    
    console.log('\n📝 Autor antes de guardar:');
    console.log('  - Nombre:', testAuthor.name);
    console.log('  - Slug:', testAuthor.slug);
    console.log('  - Bio:', testAuthor.bio.short);
    console.log('  - IsNew:', testAuthor.isNew);
    
    // Intentar guardar el autor
    console.log('\n💾 Intentando guardar el autor...');
    
    try {
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
      
    } catch (saveError) {
      console.error('\n❌ Error al guardar:', saveError.message);
      console.error('Stack trace:', saveError.stack);
      
      // Intentar crear el autor con slug manual
      console.log('\n🔄 Intentando crear autor con slug manual...');
      
      const manualAuthor = new Author({
        name: 'Manual Test Author',
        slug: 'manual-test-author', // Slug manual
        bio: {
          short: 'Autor amb slug manual.',
          full: 'Aquest és un autor amb slug manual per evitar el problema.'
        },
        profession: 'Escriptor manual',
        location: 'Barcelona',
        specialties: ['manual', 'test'],
        stats: {
          totalArticles: 0,
          totalViews: 0
        },
        isActive: true
      });
      
      try {
        await manualAuthor.save();
        console.log('✅ Autor con slug manual guardado:', manualAuthor.slug);
        
        // Limpiar
        await Author.findByIdAndDelete(manualAuthor._id);
        console.log('🧹 Autor manual eliminado');
        
      } catch (manualError) {
        console.error('❌ Error con slug manual:', manualError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}); 