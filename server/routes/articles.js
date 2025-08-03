const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Issue = require('../models/Issue');

// GET /api/articles - Obtener todos los artículos con paginación
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      section, 
      author, 
      year,
      sort = 'publicationDate',
      order = 'desc'
    } = req.query;

    const query = { isPublished: true };
    
    if (section) query.section = section;
    if (author) query.author = { $regex: author, $options: 'i' };
    if (year) query.year = parseInt(year);

    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const articles = await Article.find(query)
      .populate('issueId', 'year number')
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Article.countDocuments(query);

    res.json({
      articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo artículos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/articles/recent - Obtener artículos recientes
router.get('/recent', async (req, res) => {
  try {
    // const { limit = 6 } = req.query;
    const articles = await Article.getRecent();
    // const articles = await Article.getRecent(parseInt(limit));
    res.json(articles);
  } catch (error) {
    console.error('Error obteniendo artículos recientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/articles/featured - Obtener artículo destacado
router.get('/featured', async (req, res) => {
  try {
    const article = await Article.findOne({ isPublished: true })
      .populate('issueId', 'year number')
      .sort({ publicationDate: -1 })
      .limit(1);
    
    res.json(article);
  } catch (error) {
    console.error('Error obteniendo artículo destacado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/articles/section/:section - Obtener artículos por sección
router.get('/section/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const { limit = 10 } = req.query;
    
    const articles = await Article.getBySection(section, parseInt(limit));
    res.json(articles);
  } catch (error) {
    console.error('Error obteniendo artículos por sección:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/articles/author/:author - Obtener artículos por autor
router.get('/author/:author', async (req, res) => {
  try {
    const { author } = req.params;
    const { limit = 10 } = req.query;
    
    const articles = await Article.getByAuthor(decodeURIComponent(author), parseInt(limit));
    res.json(articles);
  } catch (error) {
    console.error('Error obteniendo artículos por autor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/articles/:url - Obtener artículo por URL
router.get('/:url', async (req, res) => {
  try {
    const { url } = req.params;
    
    const article = await Article.findOne({ 
      url: url, 
      isPublished: true 
    }).populate('issueId', 'year number title');

    if (!article) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    res.json(article);
  } catch (error) {
    console.error('Error obteniendo artículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/articles/issue/:year/:number - Obtener artículos por número de revista
router.get('/issue/:year/:number', async (req, res) => {
  try {
    const { year, number } = req.params;
    
    const issue = await Issue.findOne({ year: parseInt(year), number: parseInt(number) });
    
    if (!issue) {
      return res.status(404).json({ error: 'Número de revista no encontrado' });
    }

    const articles = await Article.find({ 
      issueId: issue._id, 
      isPublished: true 
    }).populate('issueId', 'year number title');

    res.json({
      issue,
      articles
    });
  } catch (error) {
    console.error('Error obteniendo artículos por número:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 