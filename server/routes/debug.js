const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const Article = require('../models/Article');

// GET /api/debug/status - Estado general de la base de datos
router.get('/status', async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const publishedIssues = await Issue.countDocuments({ isPublished: true });
    const totalArticles = await Article.countDocuments();
    const publishedArticles = await Article.countDocuments({ isPublished: true });

    res.json({
      database: 'MongoDB Atlas',
      collections: {
        issues: {
          total: totalIssues,
          published: publishedIssues,
          unpublished: totalIssues - publishedIssues
        },
        articles: {
          total: totalArticles,
          published: publishedArticles,
          unpublished: totalArticles - publishedArticles
        }
      }
    });
  } catch (error) {
    console.error('Error en debug status:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/debug/issues - Listar todos los issues
router.get('/issues', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ year: -1, number: -1 }).limit(10);
    res.json(issues);
  } catch (error) {
    console.error('Error obteniendo issues:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/debug/articles - Listar algunos artículos
router.get('/articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ publicationDate: -1 }).limit(5);
    res.json(articles);
  } catch (error) {
    console.error('Error obteniendo articles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/debug/latest-query - Probar la consulta del endpoint latest
router.get('/latest-query', async (req, res) => {
  try {
    const latestIssue = await Issue.findOne().sort({ year: -1, number: -1 });
    
    if (!latestIssue) {
      return res.json({
        found: false,
        message: 'No se encontraron números'
      });
    }

    const articles = await Article.find({ 
      issueId: latestIssue._id, 
      isPublished: true 
    });

    res.json({
      found: true,
      issue: {
        id: latestIssue._id,
        year: latestIssue.year,
        number: latestIssue.number,
        isPublished: latestIssue.isPublished,
        publicationDate: latestIssue.publicationDate
      },
      articlesCount: articles.length,
      articles: articles.slice(0, 3) // Solo los primeros 3
    });
  } catch (error) {
    console.error('Error en latest query:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 