const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Issue = require('../models/Issue');

// GET /api/search - Búsqueda general
router.get('/', async (req, res) => {
  try {
    const { 
      q, 
      section, 
      author, 
      year,
      page = 1, 
      limit = 10 
    } = req.query;

    if (!q && !section && !author && !year) {
      return res.status(400).json({ error: 'Se requiere al menos un parámetro de búsqueda' });
    }

    const query = { isPublished: true };
    
    // Búsqueda de texto
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } }
      ];
    }

    // Filtros adicionales
    if (section) query.section = section;
    if (author) query.author = { $regex: author, $options: 'i' };
    if (year) {
      const issues = await Issue.find({ year: parseInt(year) });
      query.issueId = { $in: issues.map(issue => issue._id) };
    }

    const articles = await Article.find(query)
      .populate('issueId', 'year number')
      .sort({ publicationDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Article.countDocuments(query);

    res.json({
      query: { q, section, author, year },
      articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/search/text - Búsqueda de texto completo
router.get('/text', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Se requiere el parámetro de búsqueda "q"' });
    }

    const articles = await Article.searchText(q)
      .populate('issueId', 'year number')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Article.countDocuments({ $text: { $search: q } });

    res.json({
      query: q,
      articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error en búsqueda de texto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/search/authors - Obtener lista de autores
router.get('/authors', async (req, res) => {
  try {
    const authors = await Article.distinct('author', { isPublished: true });
    res.json(authors.sort());
  } catch (error) {
    console.error('Error obteniendo autores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/search/sections - Obtener estadísticas por sección
router.get('/sections', async (req, res) => {
  try {
    const sections = await Article.aggregate([
      { $match: { isPublished: true } },
      { $group: { 
        _id: '$section', 
        count: { $sum: 1 },
        latestArticle: { $max: '$publicationDate' }
      }},
      { $sort: { count: -1 } }
    ]);

    res.json(sections);
  } catch (error) {
    console.error('Error obteniendo estadísticas por sección:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/search/stats - Obtener estadísticas generales
router.get('/stats', async (req, res) => {
  try {
    const stats = await Article.aggregate([
      { $match: { isPublished: true } },
      { $group: {
        _id: null,
        totalArticles: { $sum: 1 },
        totalAuthors: { $addToSet: '$author' },
        totalSections: { $addToSet: '$section' },
        latestArticle: { $max: '$publicationDate' },
        oldestArticle: { $min: '$publicationDate' }
      }},
      { $project: {
        _id: 0,
        totalArticles: 1,
        totalAuthors: { $size: '$totalAuthors' },
        totalSections: { $size: '$totalSections' },
        latestArticle: 1,
        oldestArticle: 1
      }}
    ]);

    res.json(stats[0] || {});
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 