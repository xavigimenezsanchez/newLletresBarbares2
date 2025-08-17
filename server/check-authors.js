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
    
    // Contar autores totales
    const totalAuthors = await Author.countDocuments();
    console.log(`\n📊 Total de autores en la base de datos: ${totalAuthors}`);
    
    if (totalAuthors === 0) {
      console.log('❌ No hay autores en la base de datos');
      console.log('💡 Ejecuta primero: node migrate-with-slug.js');
    } else {
      // Mostrar algunos ejemplos
      const sampleAuthors = await Author.find()
        .limit(10)
        .select('name slug stats.totalArticles specialties')
        .sort({ name: 1 });
      
      console.log('\n📋 Ejemplos de autores:');
      sampleAuthors.forEach(author => {
        console.log(`  - ${author.name}`);
        console.log(`    Slug: ${author.slug}`);
        console.log(`    Artículos: ${author.stats.totalArticles}`);
        console.log(`    Especialidades: ${author.specialties?.join(', ') || 'N/A'}`);
        console.log('');
      });
      
      // Mostrar estadísticas por especialidad
      const specialties = await Author.aggregate([
        { $unwind: '$specialties' },
        { $group: { _id: '$specialties', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      if (specialties.length > 0) {
        console.log('🏷️  Especialidades más comunes:');
        specialties.forEach(spec => {
          console.log(`  - ${spec._id}: ${spec.count} autores`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}); 