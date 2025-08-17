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
    // Importar los modelos
    const Article = require('../models/Article');
    const Author = require('../models/Author');
    
    console.log('📚 Modelos importados correctamente');
    
    // Función para generar slug a partir del nombre
    const generateSlug = (name) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    };
    
    // Función para determinar especialidades basadas en secciones
    const getSpecialtiesFromSections = (sections) => {
      const sectionToSpecialty = {
        'articles': 'Assaig',
        'creacio': 'Creació literària',
        'entrevistes': 'Entrevistes',
        'llibres': 'Crítica literària',
        'llocs': 'Crítica cultural',
        'recomanacions': 'Recomanacions'
      };
      
      return [...new Set(sections.map(section => sectionToSpecialty[section] || 'Altres'))];
    };
    
    // Función para crear o actualizar un autor
    const createOrUpdateAuthor = async (authorName, articles) => {
      try {
        // Generar slug manualmente
        const slug = generateSlug(authorName);
        
        // Calcular estadísticas
        const totalArticles = articles.length;
        const sections = [...new Set(articles.map(article => article.section))];
        const years = [...new Set(articles.map(article => article.year))].sort();
        const firstPublication = years.length > 0 ? years[0].toString() : undefined;
        const lastPublication = years.length > 0 ? years[years.length - 1].toString() : undefined;
        
        // Determinar especialidades
        const specialties = getSpecialtiesFromSections(sections);
        
        // Crear datos del autor
        const authorData = {
          name: authorName,
          slug: slug,
          bio: {
            short: `Autor de ${totalArticles} articles a Lletres Bàrbares`,
            full: `${authorName} ha contribuït amb ${totalArticles} articles a la revista Lletres Bàrbares, cobrint les seccions de ${sections.join(', ')}. La seva primera publicació va ser l'any ${firstPublication} i l'última l'any ${lastPublication}.`
          },
          specialties: specialties,
          stats: {
            totalArticles: totalArticles,
            firstPublication: firstPublication,
            lastPublication: lastPublication,
            totalViews: 0
          },
          isActive: true
        };
        
        // Buscar si ya existe el autor
        const existingAuthor = await Author.findOne({ slug: slug });
        
        if (existingAuthor) {
          // Actualizar autor existente
          await Author.findByIdAndUpdate(existingAuthor._id, authorData);
          console.log(`🔄 Autor actualitzat: ${authorName}`);
        } else {
          // Crear nuevo autor
          const newAuthor = new Author(authorData);
          await newAuthor.save();
          console.log(`✅ Autor creat: ${authorName}`);
        }
        
        return { success: true, authorName, slug };
      } catch (error) {
        console.error(`❌ Error creant/actualitzant autor ${authorName}:`, error.message);
        return { success: false, authorName, error: error.message };
      }
    };
    
    // Obtener todos los artículos
    console.log('🔍 Buscando artículos...');
    const articles = await Article.find({});
    
    console.log(`📊 Total d'articles trobats: ${articles.length}`);
    
    if (articles.length === 0) {
      console.log('❌ No hi ha articles per processar');
      return;
    }
    
    // Extraer autores únicos del campo authors (nuevo) y author (compatibilidad)
    const authorMap = new Map();
    
    articles.forEach(article => {
      // Usar el nuevo campo authors si existe, sino el campo author
      const articleAuthors = article.authors && article.authors.length > 0 
        ? article.authors 
        : (article.author ? [article.author] : []);
      
      articleAuthors.forEach(authorName => {
        if (authorName && authorName.trim()) {
          const cleanName = authorName.trim();
          if (!authorMap.has(cleanName)) {
            authorMap.set(cleanName, []);
          }
          authorMap.get(cleanName).push(article);
        }
      });
    });
    
    const uniqueAuthors = Array.from(authorMap.keys());
    console.log(`👥 Encontrados ${uniqueAuthors.length} autores únicos`);
    
    if (uniqueAuthors.length === 0) {
      console.log('❌ No se encontraron autores para procesar');
      return;
    }
    
    // Mostrar algunos ejemplos de autores encontrados
    console.log('\n📋 Ejemplos de autores encontrados:');
    uniqueAuthors.slice(0, 10).forEach(authorName => {
      const articles = authorMap.get(authorName);
      console.log(`   - ${authorName}: ${articles.length} artículos`);
    });
    
    if (uniqueAuthors.length > 10) {
      console.log(`   ... y ${uniqueAuthors.length - 10} más`);
    }
    
    console.log('');
    
    // Procesar cada autor
    console.log('🚀 Iniciando migración de autores...');
    console.log('');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const authorName of uniqueAuthors) {
      const articles = authorMap.get(authorName);
      console.log(`📝 Procesando autor: ${authorName}`);
      console.log(`   🔗 Slug generado: ${generateSlug(authorName)}`);
      console.log(`   📊 Artículos: ${articles.length}`);
      
      const result = await createOrUpdateAuthor(authorName, articles);
      
      if (result.success) {
        successCount++;
        console.log(`   ✅ Autor procesado exitosamente`);
      } else {
        errorCount++;
        console.log(`   ❌ Error: ${result.error}`);
      }
      
      console.log('');
      
      // Pequeña pausa para no sobrecargar la base de datos
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Resumen final
    console.log('🎉 Migración completada exitosamente!');
    console.log('');
    console.log('📊 Resumen de la migración:');
    console.log(`   ✅ Autores procesados exitosamente: ${successCount}`);
    console.log(`   ❌ Errores durante la migración: ${errorCount}`);
    console.log(`   📈 Total de autores únicos: ${uniqueAuthors.length}`);
    
    // Verificar resultados
    console.log('');
    console.log('🔍 Verificando resultados...');
    
    const totalAuthorsInDB = await Author.countDocuments();
    console.log(`📚 Total de autores en la base de datos: ${totalAuthorsInDB}`);
    
    // Mostrar algunos ejemplos de autores creados
    const sampleAuthors = await Author.find().limit(5).select('name slug stats.totalArticles specialties');
    console.log('\n📋 Ejemplos de autores creados:');
    sampleAuthors.forEach(author => {
      console.log(`   - ${author.name}`);
      console.log(`     Slug: ${author.slug}`);
      console.log(`     Artículos: ${author.stats.totalArticles}`);
      console.log(`     Especialidades: ${author.specialties?.join(', ') || 'N/A'}`);
      console.log('');
    });
    
    console.log('✅ Migración de autores completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}); 