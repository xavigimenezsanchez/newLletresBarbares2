const mongoose = require('mongoose');
const Author = require('./models/Author');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', async () => {
  console.log('Conectado a MongoDB');
  
  try {
    // Crear un autor de prueba
    const testAuthor = new Author({
      name: 'Test Author',
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
    
    console.log('Autor antes de guardar:', testAuthor);
    
    await testAuthor.save();
    
    console.log('Autor guardado exitosamente:', testAuthor);
    
  } catch (error) {
    console.error('Error creando autor de prueba:', error);
  } finally {
    mongoose.connection.close();
  }
}); 