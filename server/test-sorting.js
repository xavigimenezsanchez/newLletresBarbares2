const mongoose = require('mongoose');
require('dotenv').config();

// Función para normalizar caracteres acentuados para ordenamiento
function normalizeForSorting(text) {
  return text
    .toLowerCase()
    .normalize('NFD') // Descomponer caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
    .replace(/[àáâäãå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôöõ]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[·]/g, ''); // Eliminar punto medio catalán
}

// Función para ordenar alfabéticamente con soporte para acentos
function sortAlphabetically(items, getText) {
  return [...items].sort((a, b) => {
    const textA = normalizeForSorting(getText(a));
    const textB = normalizeForSorting(getText(b));
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });
}

// Función para ordenar autores alfabéticamente
function sortAuthorsAlphabetically(authors) {
  return sortAlphabetically(authors, author => author.name);
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', async () => {
  console.log('✅ Conectado a MongoDB');
  
  try {
    const Author = require('./models/Author');
    console.log('📚 Modelo Author importado correctamente');
    
    // Obtener algunos autores para probar
    const authors = await Author.find({ isActive: true })
      .limit(20)
      .select('name slug stats.totalArticles')
      .sort({ name: 1 }); // Ordenamiento estándar de MongoDB
    
    console.log(`\n📊 Total de autores encontrados: ${authors.length}`);
    
    if (authors.length === 0) {
      console.log('❌ No hay autores para probar');
      console.log('💡 Ejecuta primero: node scripts/migrate-authors.js');
      return;
    }
    
    console.log('\n🔍 Ordenamiento estándar de MongoDB (problemático con acentos):');
    authors.forEach((author, index) => {
      console.log(`  ${index + 1}. ${author.name}`);
    });
    
    // Aplicar nuestro ordenamiento personalizado
    const sortedAuthors = sortAuthorsAlphabetically(authors);
    
    console.log('\n✅ Ordenamiento personalizado (correcto con acentos):');
    sortedAuthors.forEach((author, index) => {
      console.log(`  ${index + 1}. ${author.name}`);
    });
    
    // Mostrar algunos ejemplos específicos de acentos
    console.log('\n🎯 Ejemplos de caracteres acentuados encontrados:');
    const accentExamples = authors
      .filter(author => /[àáâäãåèéêëìíîïòóôöõùúûüñç·]/.test(author.name))
      .slice(0, 10);
    
    if (accentExamples.length > 0) {
      accentExamples.forEach(author => {
        const normalized = normalizeForSorting(author.name);
        console.log(`  "${author.name}" → "${normalized}"`);
      });
    } else {
      console.log('  No se encontraron caracteres acentuados en los nombres');
    }
    
    // Verificar que el ordenamiento sea diferente
    const standardOrder = authors.map(a => a.name).join(', ');
    const customOrder = sortedAuthors.map(a => a.name).join(', ');
    
    if (standardOrder !== customOrder) {
      console.log('\n🎉 ¡El ordenamiento personalizado funciona correctamente!');
      console.log('   Los autores con acentos ahora se ordenan correctamente.');
    } else {
      console.log('\n⚠️  El ordenamiento personalizado no cambió el resultado.');
      console.log('   Esto puede significar que no hay caracteres acentuados o que ya están ordenados correctamente.');
    }
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Conexión a MongoDB cerrada');
  }
}); 