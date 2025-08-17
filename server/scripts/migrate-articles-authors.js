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
    // Importar el modelo Article
    const Article = require('../models/Article');
    
    console.log('📚 Modelo Article importado correctamente');
    
    // Función para separar autores múltiples
    const parseAuthors = (authorString) => {
      if (!authorString || typeof authorString !== 'string') {
        return [];
      }
      
      // Patrones comunes de separación de autores
      const separators = [
        ' i ',           // "Carles Duarte i Montserrat i Àngel Carbonell Amenós"
        ' & ',           // "Author1 & Author2"
        ', ',            // "Author1, Author2"
        ' y ',           // "Author1 y Author2"
        ' and ',         // "Author1 and Author2"
        ' + ',           // "Author1 + Author2"
        ' / ',           // "Author1 / Author2"
        ' | '            // "Author1 | Author2"
      ];
      
      let authors = [authorString.trim()];
      
      // Intentar separar por diferentes separadores
      for (const separator of separators) {
        if (authorString.includes(separator)) {
          authors = authorString.split(separator).map(a => a.trim()).filter(a => a);
          break;
        }
      }
      
      // Limpiar y validar autores
      authors = authors
        .map(author => author.trim())
        .filter(author => author.length > 0)
        .filter(author => author !== 'i' && author !== '&' && author !== 'y' && author !== 'and' && author !== '+' && author !== '/' && author !== '|');
      
      return authors.length > 0 ? authors : [authorString.trim()];
    };
    
    // Función para migrar un artículo
    const migrateArticle = async (article) => {
      try {
        const oldAuthor = article.author;
        const newAuthors = parseAuthors(oldAuthor);
        
        // Actualizar el artículo
        const updateData = {
          authors: newAuthors,
          // Mantener el campo author por compatibilidad durante la transición
          author: oldAuthor
        };
        
        await Article.findByIdAndUpdate(article._id, updateData);
        
        console.log(`✅ Artículo migrado: "${article.title}"`);
        console.log(`   Autor original: "${oldAuthor}"`);
        console.log(`   Autores separados: [${newAuthors.map(a => `"${a}"`).join(', ')}]`);
        console.log('');
        
        return { success: true, oldAuthor, newAuthors };
      } catch (error) {
        console.error(`❌ Error migrando artículo "${article.title}":`, error.message);
        return { success: false, error: error.message };
      }
    };
    
    // Obtener todos los artículos
    console.log('🔍 Buscando artículos para migrar...');
    const articles = await Article.find({});
    
    console.log(`📊 Total de artículos encontrados: ${articles.length}`);
    
    if (articles.length === 0) {
      console.log('❌ No hay artículos para migrar');
      return;
    }
    
    // Estadísticas antes de la migración
    const statsBefore = {
      totalArticles: articles.length,
      articlesWithMultipleAuthors: 0,
      articlesWithSingleAuthor: 0,
      totalUniqueAuthors: new Set()
    };
    
    articles.forEach(article => {
      if (article.author) {
        const authors = parseAuthors(article.author);
        if (authors.length > 1) {
          statsBefore.articlesWithMultipleAuthors++;
        } else {
          statsBefore.articlesWithSingleAuthor++;
        }
        authors.forEach(author => statsBefore.totalUniqueAuthors.add(author));
      }
    });
    
    console.log('📈 Estadísticas antes de la migración:');
    console.log(`   - Total artículos: ${statsBefore.totalArticles}`);
    console.log(`   - Artículos con autor único: ${statsBefore.articlesWithSingleAuthor}`);
    console.log(`   - Artículos con múltiples autores: ${statsBefore.articlesWithMultipleAuthors}`);
    console.log(`   - Total autores únicos: ${statsBefore.totalUniqueAuthors.size}`);
    console.log('');
    
    // Confirmar antes de proceder
    console.log('⚠️  ¿Proceder con la migración? (Ctrl+C para cancelar)');
    console.log('   Se actualizarán todos los artículos para separar autores múltiples.');
    console.log('   El campo "author" original se mantendrá por compatibilidad.');
    console.log('');
    
    // Esperar 5 segundos para dar tiempo a cancelar
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Iniciar migración
    console.log('🚀 Iniciando migración...');
    console.log('');
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (const article of articles) {
      const result = await migrateArticle(article);
      results.push(result);
      
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
      
      // Pequeña pausa para no sobrecargar la base de datos
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Estadísticas después de la migración
    console.log('');
    console.log('🎉 Migración completada!');
    console.log('');
    console.log('📊 Resumen de la migración:');
    console.log(`   ✅ Artículos migrados exitosamente: ${successCount}`);
    console.log(`   ❌ Errores durante la migración: ${errorCount}`);
    console.log(`   📈 Total procesados: ${results.length}`);
    
    // Verificar resultados
    console.log('');
    console.log('🔍 Verificando resultados...');
    
    const migratedArticles = await Article.find({});
    const statsAfter = {
      totalArticles: migratedArticles.length,
      articlesWithAuthorsArray: 0,
      articlesWithAuthorField: 0,
      totalUniqueAuthorsInArray: new Set()
    };
    
    migratedArticles.forEach(article => {
      if (article.authors && article.authors.length > 0) {
        statsAfter.articlesWithAuthorsArray++;
        article.authors.forEach(author => statsAfter.totalUniqueAuthorsInArray.add(author));
      }
      if (article.author) {
        statsAfter.articlesWithAuthorField++;
      }
    });
    
    console.log('📈 Estadísticas después de la migración:');
    console.log(`   - Total artículos: ${statsAfter.totalArticles}`);
    console.log(`   - Artículos con campo "authors": ${statsAfter.articlesWithAuthorsArray}`);
    console.log(`   - Artículos con campo "author" (compatibilidad): ${statsAfter.articlesWithAuthorField}`);
    console.log(`   - Total autores únicos en arrays: ${statsAfter.totalUniqueAuthorsInArray.size}`);
    
    // Ejemplos de artículos migrados
    console.log('');
    console.log('📋 Ejemplos de artículos migrados:');
    const sampleArticles = await Article.find({ authors: { $exists: true, $ne: [] } }).limit(5);
    
    sampleArticles.forEach(article => {
      console.log(`   - "${article.title}"`);
      console.log(`     Autores: [${article.authors.map(a => `"${a}"`).join(', ')}]`);
      console.log(`     Autor original: "${article.author}"`);
      console.log('');
    });
    
    console.log('✅ Migración completada exitosamente!');
    console.log('');
    console.log('💡 Próximos pasos:');
    console.log('   1. Verificar que la migración funcionó correctamente');
    console.log('   2. Actualizar el frontend para usar el campo "authors"');
    console.log('   3. Actualizar las APIs para manejar arrays de autores');
    console.log('   4. Una vez confirmado, eliminar el campo "author" del modelo');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}); 