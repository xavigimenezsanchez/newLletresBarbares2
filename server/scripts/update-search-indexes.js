const mongoose = require('mongoose');
require('dotenv').config();

// Importar el modelo para aplicar los nuevos índices
const Article = require('../models/Article');

async function updateSearchIndexes() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    console.log('🗂️ Verificando índices existentes...');
    const existingIndexes = await Article.collection.listIndexes().toArray();
    console.log('📋 Índices existentes:');
    existingIndexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Eliminar índices existentes que podrían causar conflicto
    const indexesToDrop = [
      'title_text_summary_text_author_text',
      'text.content_1',
      'full_text_search_index',
      'text_content_index'
    ];

    for (const indexName of indexesToDrop) {
      try {
        await Article.collection.dropIndex(indexName);
        console.log(`✅ Eliminado índice: ${indexName}`);
      } catch (error) {
        console.log(`ℹ️ Índice ${indexName} no existe o ya fue eliminado`);
      }
    }

    console.log('🔧 Creando nuevos índices de búsqueda...');
    
    // Crear el nuevo índice de texto completo
    try {
      await Article.collection.createIndex({
        title: 'text',
        summary: 'text', 
        author: 'text',
        'text.content': 'text'
      }, {
        name: 'full_text_search_index',
        default_language: 'spanish',
        weights: {
          title: 10,
          summary: 5,
          author: 3,
          'text.content': 1
        }
      });
      console.log('✅ Índice de texto completo creado');
    } catch (error) {
      console.log('⚠️ Error creando índice de texto completo:', error.message);
    }

    // Crear índice adicional para búsquedas específicas en contenido
    try {
      await Article.collection.createIndex(
        { 'text.content': 1 },
        { name: 'text_content_index' }
      );
      console.log('✅ Índice de contenido creado');
    } catch (error) {
      console.log('⚠️ Error creando índice de contenido:', error.message);
    }

    console.log('✅ Nuevos índices creados exitosamente');

    // Probar la búsqueda
    console.log('🔍 Probando búsqueda mejorada...');
    const testResults = await Article.find({
      $or: [
        { title: { $regex: 'cinema', $options: 'i' } },
        { summary: { $regex: 'cinema', $options: 'i' } },
        { author: { $regex: 'cinema', $options: 'i' } },
        { 'text.content': { $regex: 'cinema', $options: 'i' } }
      ],
      isPublished: true
    }).limit(3);

    console.log(`📋 Encontrados ${testResults.length} artículos de prueba`);
    testResults.forEach(article => {
      console.log(`   - "${article.title}" por ${article.author}`);
    });

    console.log('🎉 Actualización de índices completada');

  } catch (error) {
    console.error('❌ Error actualizando índices:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar si el script es llamado directamente
if (require.main === module) {
  updateSearchIndexes();
}

module.exports = { updateSearchIndexes };