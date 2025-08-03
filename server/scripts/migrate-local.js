const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Issue = require('../models/Issue');
const Article = require('../models/Article');

// Función para parsear fecha en formato DD/MM/YYYY
function parseDate(dateString) {
  const [day, month, year] = dateString.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

// Función para mapear carpeta a número de issue
function mapFolderToIssueNumber(folderNumber) {
  return parseInt(folderNumber) - 1; // Carpeta 1 = Issue 0, Carpeta 50 = Issue 49
}

// Función para migrar un artículo
async function migrateArticle(articleData, issueId, year, issueNumber) {
  try {
    // Verificar si el artículo ya existe
    const existingArticle = await Article.findOne({ url: articleData.url });
    if (existingArticle) {
      console.log(`⚠️  Article ja existeix: ${articleData.title}`);
      return existingArticle;
    }

    const article = new Article({
      issueId: issueId,
      issue: year, // El campo issue contiene el año
      data: articleData.data,
      imageCard: articleData.imageCard || '',
      title: articleData.title,
      url: articleData.url,
      section: articleData.section,
      author: articleData.author,
      summary: articleData.summary || '',
      text: articleData.text || [],
      publicationDate: parseDate(articleData.data),
      isPublished: true,
      year: year,
      issueNumber: issueNumber,
      tags: []
    });

    await article.save();
    console.log(`✅ Article migrat: ${articleData.title}`);
    return article;
  } catch (error) {
    console.error(`❌ Error migrant article ${articleData.title}:`, error.message);
    throw error;
  }
}

// Función para migrar un número de revista
async function migrateIssue(year, folderNumber) {
  try {
    // Mapear carpeta a número de issue
    const issueNumber = mapFolderToIssueNumber(folderNumber);
    
    // Corregir la ruta para buscar en client/documents
    const issuePath = path.join(__dirname, '../client/documents', year.toString(), folderNumber.toString());
    
    if (!fs.existsSync(issuePath)) {
      console.log(`⚠️  No existeix el directori: ${issuePath}`);
      return null;
    }

    console.log(`📚 Migrant carpeta ${folderNumber} → Issue ${issueNumber} (any ${year})`);

    // Crear o actualizar el issue
    let issue = await Issue.findOne({ year: parseInt(year), number: issueNumber });
    
    if (!issue) {
      issue = new Issue({
        year: parseInt(year),
        number: issueNumber,
        publicationDate: new Date(parseInt(year), 11, 1), // 1 de desembre
        title: `Lletres Barbares - Número ${issueNumber}`,
        isPublished: true,
        sections: []
      });
      await issue.save();
      console.log(`✅ Issue creat: ${year}/${issueNumber} (carpeta ${folderNumber})`);
    }

    // Migrar artículos por sección
    const sections = ['articles', 'creacio', 'entrevistes', 'llibres', 'llocs', 'recomanacions'];
    const sectionStats = {};
    
    for (const section of sections) {
      const sectionPath = path.join(issuePath, section);
      
      if (fs.existsSync(sectionPath)) {
        const files = fs.readdirSync(sectionPath).filter(file => file.endsWith('.json'));
        sectionStats[section] = files.length;
        
        console.log(`   📁 Secció ${section}: ${files.length} articles`);
        
        for (const file of files) {
          const filePath = path.join(sectionPath, file);
          const articleData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          // Asegurar que el artículo tenga la sección correcta
          articleData.section = section;
          
          await migrateArticle(articleData, issue._id, year, issueNumber);
        }
      }
    }

    // Actualizar estadísticas del issue
    issue.sections = Object.keys(sectionStats);
    issue.totalArticles = Object.values(sectionStats).reduce((sum, count) => sum + count, 0);
    await issue.save();

    console.log(`📊 Issue ${year}/${issueNumber}: ${issue.totalArticles} articles en ${issue.sections.length} seccions`);
    return issue;
  } catch (error) {
    console.error(`❌ Error migrant issue ${year}/${folderNumber}:`, error.message);
    throw error;
  }
}

// Función principal de migración
async function migrateAllData() {
  try {
    console.log('🚀 Iniciant migració de dades des de JSON (MongoDB Local)...');
    
    // Conectar a MongoDB Local
    await mongoose.connect('mongodb://localhost:27017/lletres-barbares', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectat a MongoDB Local');

    // Limpiar datos existentes
    console.log('🗑️  Netejant dades existents...');
    await Issue.deleteMany({});
    await Article.deleteMany({});
    console.log('✅ Dades netejades');

    // Obtener años disponibles
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

    let totalIssues = 0;
    let totalArticles = 0;

    // Migrar cada año
    for (const year of years) {
      const yearPath = path.join(documentsPath, year.toString());
      const folderNumbers = fs.readdirSync(yearPath)
        .filter(dir => fs.statSync(path.join(yearPath, dir)).isDirectory())
        .map(num => parseInt(num))
        .sort();

      console.log(`\n📚 Migrant any ${year} (${folderNumbers.length} números)`);

      for (const folderNumber of folderNumbers) {
        const issue = await migrateIssue(year, folderNumber);
        if (issue) {
          totalIssues++;
          totalArticles += issue.totalArticles;
        }
      }
    }

    // Mostrar estadísticas finales
    console.log('\n📊 Estadístiques de migració:');
    console.log(`   - Números de revista: ${totalIssues}`);
    console.log(`   - Articles: ${totalArticles}`);

    // Verificar datos migrados
    const dbIssues = await Issue.countDocuments();
    const dbArticles = await Article.countDocuments();
    
    console.log('\n🔍 Verificació de dades:');
    console.log(`   - Issues a la BD: ${dbIssues}`);
    console.log(`   - Articles a la BD: ${dbArticles}`);

    // Mostrar el último issue migrado
    const latestIssue = await Issue.findOne().sort({ year: -1, number: -1 });
    if (latestIssue) {
      console.log(`\n📖 Últim issue migrat: ${latestIssue.year}/${latestIssue.number}`);
    }

    console.log('\n✅ Migració completada amb èxit!');
    console.log('💡 Per exportar les dades a MongoDB Atlas, usa:');
    console.log('   mongodump --db lletres-barbares --out ./backup');
    
  } catch (error) {
    console.error('❌ Error durant la migració:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconnectat de MongoDB');
  }
}

// Ejecutar migración
if (require.main === module) {
  migrateAllData();
}

module.exports = { migrateAllData, migrateIssue, migrateArticle }; 