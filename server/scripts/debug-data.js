const mongoose = require('mongoose');
require('dotenv').config();

const Issue = require('../models/Issue');
const Article = require('../models/Article');

async function debugData() {
  try {
    console.log('🔍 Verificant dades a MongoDB Atlas...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lletres-barbares', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectat a MongoDB Atlas');

    // Verificar colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📚 Col·leccions disponibles:');
    collections.forEach(col => console.log(`   - ${col.name}`));

    // Verificar Issues
    const totalIssues = await Issue.countDocuments();
    console.log(`\n📖 Total d'issues: ${totalIssues}`);

    if (totalIssues > 0) {
      const issues = await Issue.find().limit(3);
      console.log('\n📋 Primeres 3 issues:');
      issues.forEach(issue => {
        console.log(`   - Any: ${issue.year}, Número: ${issue.number}, Publicat: ${issue.isPublished}`);
      });
    }

    // Verificar Issues publicados
    const publishedIssues = await Issue.countDocuments({ isPublished: true });
    console.log(`\n✅ Issues publicades: ${publishedIssues}`);

    // Verificar Articles
    const totalArticles = await Article.countDocuments();
    console.log(`\n📄 Total d'articles: ${totalArticles}`);

    if (totalArticles > 0) {
      const articles = await Article.find().limit(3);
      console.log('\n📋 Primeres 3 articles:');
      articles.forEach(article => {
        console.log(`   - Títol: ${article.title}, Secció: ${article.section}, Publicat: ${article.isPublished}`);
      });
    }

    // Verificar Articles publicados
    const publishedArticles = await Article.countDocuments({ isPublished: true });
    console.log(`\n✅ Articles publicats: ${publishedArticles}`);

    // Probar la consulta del endpoint latest
    console.log('\n🔍 Provant consulta /api/issues/latest:');
    const latestIssue = await Issue.findOne().sort({ year: -1, number: -1 });
    
    if (latestIssue) {
      console.log(`   - Últim issue trobat: ${latestIssue.year}/${latestIssue.number}`);
      console.log(`   - isPublished: ${latestIssue.isPublished}`);
      
      if (latestIssue.isPublished) {
        const articles = await Article.find({ issueId: latestIssue._id, isPublished: true });
        console.log(`   - Articles publicats en aquest issue: ${articles.length}`);
      }
    } else {
      console.log('   - No s\'ha trobat cap issue');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconnectat de MongoDB');
  }
}

debugData(); 