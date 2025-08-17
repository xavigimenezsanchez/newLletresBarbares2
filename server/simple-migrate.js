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
    // Importar modelos
    const Author = require('./models/Author');
    const Article = require('./models/Article');
    
    console.log('📚 Modelos importados correctamente');
    
    // Obtener todos los artículos únicos por autor
    console.log('🔍 Buscando artículos...');
    const articles = await Article.find({}).select('author section year issueNumber publicationDate');
    
    console.log(`📖 Encontrados ${articles.length} artículos`);
    
    // Agrupar por autor
    const authorsMap = new Map();
    
    articles.forEach(article => {
      if (!article.author) return;
      
      if (!authorsMap.has(article.author)) {
        authorsMap.set(article.author, {
          name: article.author,
          articles: [],
          sections: new Set(),
          years: new Set(),
          firstPublication: null,
          lastPublication: null
        });
      }
      
      const authorData = authorsMap.get(article.author);
      authorData.articles.push(article);
      authorData.sections.add(article.section);
      
      if (article.year) {
        authorData.years.add(article.year);
      }
      
      if (article.publicationDate) {
        const pubDate = new Date(article.publicationDate);
        if (!authorData.firstPublication || pubDate < authorData.firstPublication) {
          authorData.firstPublication = pubDate;
        }
        if (!authorData.lastPublication || pubDate > authorData.lastPublication) {
          authorData.lastPublication = pubDate;
        }
      }
    });
    
    console.log(`👥 Encontrados ${authorsMap.size} autores únicos`);
    
    // Crear o actualizar autores
    for (const [authorName, authorData] of authorsMap) {
      try {
        console.log(`\n📝 Procesando autor: ${authorName}`);
        
        // Verificar si el autor ya existe
        let author = await Author.findOne({ name: authorName });
        
        if (author) {
          console.log(`  ✅ Actualizando autor existente`);
          
          // Actualizar estadísticas
          author.stats.totalArticles = authorData.articles.length;
          author.stats.firstPublication = authorData.firstPublication;
          author.stats.lastPublication = authorData.lastPublication;
          
          // Actualizar especialidades basadas en secciones
          if (authorData.sections.size > 0) {
            author.specialties = Array.from(authorData.sections);
          }
          
          await author.save();
          console.log(`  ✅ Autor actualizado: ${author.slug}`);
        } else {
          console.log(`  🆕 Creando nuevo autor`);
          
          // Crear nuevo autor
          const newAuthor = new Author({
            name: authorName,
            bio: {
              short: `${authorName} ha contribuït amb ${authorData.articles.length} articles a Lletres Bàrbares.`,
              full: `${authorName} és un autor que ha contribuït amb ${authorData.articles.length} articles a Lletres Bàrbares, publicant en les seccions: ${Array.from(authorData.sections).join(', ')}.`
            },
            specialties: Array.from(authorData.sections),
            stats: {
              totalArticles: authorData.articles.length,
              firstPublication: authorData.firstPublication,
              lastPublication: authorData.lastPublication,
              totalViews: 0
            },
            isActive: true,
            metaDescription: `${authorName} - Autor de Lletres Bàrbares amb ${authorData.articles.length} articles publicats.`,
            metaKeywords: ['autor', 'lletres bàrbares', ...Array.from(authorData.sections)]
          });
          
          await newAuthor.save();
          console.log(`  ✅ Autor creado: ${newAuthor.slug}`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error procesando autor ${authorName}:`, error.message);
      }
    }
    
    console.log('\n🎉 Migración completada exitosamente!');
    
    // Mostrar resumen final
    const totalAuthors = await Author.countDocuments();
    console.log(`📊 Total de autores en la base de datos: ${totalAuthors}`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}); 