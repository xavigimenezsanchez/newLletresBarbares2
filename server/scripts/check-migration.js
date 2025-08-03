const mongoose = require('mongoose');

const Issue = require('../models/Issue');
const Article = require('../models/Article');

async function checkMigration() {
  try {
    console.log('🔍 Verificant estat de la migració...');
    
    const uri = "mongodb+srv://test:U1SHxjVdRiDCxkpH@cluster0.kx7ne.mongodb.net/newLletresBarbares?retryWrites=true&w=majority&appName=Cluster0";
    const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
    
    await mongoose.connect(uri, clientOptions);
    console.log('✅ Conectat a MongoDB Atlas');

    // Contar documentos
    const issuesCount = await Issue.countDocuments();
    const articlesCount = await Article.countDocuments();
    
    console.log(`\n📊 Estadístiques:`);
    console.log(`   - Issues: ${issuesCount}`);
    console.log(`   - Articles: ${articlesCount}`);

    // Mostrar el último issue
    const latestIssue = await Issue.findOne().sort({ year: -1, number: -1 });
    if (latestIssue) {
      console.log(`\n📖 Últim issue: ${latestIssue.year}/${latestIssue.number}`);
      console.log(`   - Títol: ${latestIssue.title}`);
      console.log(`   - Articles: ${latestIssue.totalArticles}`);
      console.log(`   - Seccions: ${latestIssue.sections.join(', ')}`);
    }

    // Mostrar algunos artículos recientes
    const recentArticles = await Article.find()
      .sort({ publicationDate: -1 })
      .limit(5)
      .select('title author section publicationDate');
    
    console.log(`\n📄 Últims 5 articles:`);
    recentArticles.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title} (${article.author}) - ${article.section}`);
    });

    console.log('\n✅ Verificació completada!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconnectat');
  }
}

checkMigration(); 