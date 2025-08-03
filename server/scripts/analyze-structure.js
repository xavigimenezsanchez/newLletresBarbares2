const fs = require('fs');
const path = require('path');

// Función para mapear carpeta a número de issue
function mapFolderToIssueNumber(folderNumber) {
  return parseInt(folderNumber) - 1; // Carpeta 1 = Issue 0, Carpeta 50 = Issue 49
}

// Función para analizar la estructura de un archivo JSON
function analyzeJsonStructure(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    return {
      file: filePath,
      structure: Object.keys(data),
      sample: data
    };
  } catch (error) {
    return {
      file: filePath,
      error: error.message
    };
  }
}

// Función para analizar toda la estructura de documentos
function analyzeDocumentsStructure() {
  console.log('🔍 Analitzant estructura de documents...');
  
  // Corregir la ruta para buscar en client/documents
  const documentsPath = path.join(__dirname, '../client/documents');
  console.log(`🔍 Buscant documents a: ${documentsPath}`);
  
  if (!fs.existsSync(documentsPath)) {
    console.log('❌ No s\'ha trobat el directori documents');
    return;
  }

  const years = fs.readdirSync(documentsPath)
    .filter(dir => fs.statSync(path.join(documentsPath, dir)).isDirectory())
    .map(year => parseInt(year))
    .sort();

  console.log(`📅 Anys trobats: ${years.join(', ')}`);

  const structures = {};
  let totalArticles = 0;

  for (const year of years) {
    const yearPath = path.join(documentsPath, year.toString());
    const folderNumbers = fs.readdirSync(yearPath)
      .filter(dir => fs.statSync(path.join(yearPath, dir)).isDirectory())
      .map(num => parseInt(num))
      .sort();

    console.log(`\n📚 Any ${year} (${folderNumbers.length} números)`);

    for (const folderNumber of folderNumbers) {
      const issueNumber = mapFolderToIssueNumber(folderNumber);
      const issuePath = path.join(yearPath, folderNumber.toString());
      const sections = ['articles', 'creacio', 'entrevistes', 'llibres', 'llocs', 'recomanacions'];

      console.log(`   📁 Carpeta ${folderNumber} → Issue ${issueNumber}`);

      for (const section of sections) {
        const sectionPath = path.join(issuePath, section);
        
        if (fs.existsSync(sectionPath)) {
          const files = fs.readdirSync(sectionPath).filter(file => file.endsWith('.json'));
          totalArticles += files.length;
          
          if (files.length > 0) {
            console.log(`      📄 ${section}: ${files.length} articles`);
          }
          
          for (const file of files) {
            const filePath = path.join(sectionPath, file);
            const analysis = analyzeJsonStructure(filePath);
            
            if (!analysis.error) {
              const key = `${year}/${issueNumber}/${section}`;
              if (!structures[key]) {
                structures[key] = [];
              }
              structures[key].push(analysis);
            }
          }
        }
      }
    }
  }

  console.log(`\n📊 Total d'articles trobats: ${totalArticles}`);

  // Analizar patrones comunes
  console.log('\n📊 Anàlisi de patrons:');
  
  const allFields = new Set();
  const fieldCounts = {};
  
  Object.values(structures).flat().forEach(item => {
    if (item.structure) {
      item.structure.forEach(field => {
        allFields.add(field);
        fieldCounts[field] = (fieldCounts[field] || 0) + 1;
      });
    }
  });

  console.log('\n📋 Camps trobats:');
  Object.entries(fieldCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([field, count]) => {
      console.log(`   - ${field}: ${count} documents`);
    });

  // Mostrar ejemplo de estructura
  const firstItem = Object.values(structures).flat()[0];
  if (firstItem && firstItem.sample) {
    console.log('\n📄 Exemple d\'estructura:');
    console.log(JSON.stringify(firstItem.sample, null, 2));
  }

  return {
    structures,
    allFields: Array.from(allFields),
    fieldCounts,
    totalArticles
  };
}

// Ejecutar análisis
const analysis = analyzeDocumentsStructure();

// Generar recomendaciones de schema
console.log('\n💡 Recomanacions de schema:');

const recommendedSchema = {
  article: {
    issue: 'Number (any del número)',
    data: 'String (data en format DD/MM/YYYY)',
    imageCard: 'String (nom de la imatge)',
    title: 'String (títol de l\'article)',
    url: 'String (slug de l\'URL)',
    section: 'String (secció: articles, creacio, etc.)',
    author: 'String (autor)',
    summary: 'String (resum)',
    text: 'Array (contingut de l\'article)'
  },
  issue: {
    year: 'Number (any)',
    number: 'Number (número de revista)',
    publicationDate: 'Date (data de publicació)',
    title: 'String (títol del número)',
    isPublished: 'Boolean (publicat o no)'
  }
};

console.log('\n📋 Schema recomanat per Article:');
Object.entries(recommendedSchema.article).forEach(([field, type]) => {
  console.log(`   - ${field}: ${type}`);
});

console.log('\n📋 Schema recomanat per Issue:');
Object.entries(recommendedSchema.issue).forEach(([field, type]) => {
  console.log(`   - ${field}: ${type}`);
});

console.log('\n🗂️  Mapeig de carpetes a issues:');
console.log('   - Carpeta 1 → Issue 0');
console.log('   - Carpeta 2 → Issue 1');
console.log('   - ...');
console.log('   - Carpeta 50 → Issue 49'); 