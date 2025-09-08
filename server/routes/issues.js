const express = require('express');
const router = express.Router();
const path = require('path');
const Issue = require('../models/Issue');
const Article = require('../models/Article');
const ManualPDFGenerator = require('../../pdf-generator/generate-manual-pdf');

// GET /api/issues - Obtener todos los números con paginación
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      year,
      sort = 'publicationDate',
      order = 'desc'
    } = req.query;

    const query = { isPublished: true };
    
    if (year) query.year = parseInt(year);

    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const issues = await Issue.find(query)
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Issue.countDocuments(query);

    res.json({
      issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo números:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/issues/latest - Obtener el último número
router.get('/latest', async (req, res) => {
  try {
    const issue = await Issue.getLatest();
    
    if (!issue) {
      return res.status(404).json({ error: 'No se encontraron números' });
    }

    // Obtener artículos del número
    const articles = await Article.find({ 
      issueId: issue._id, 
      isPublished: true 
    }).populate('issueId', 'year number');

    res.json({
      issue,
      articles
    });
  } catch (error) {
    console.error('Error obteniendo último número:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/issues/years - Obtener lista de años disponibles
router.get('/years', async (req, res) => {
  try {
    const years = await Issue.distinct('year');
    res.json(years.sort((a, b) => b - a)); // Orden descendente
  } catch (error) {
    console.error('Error obteniendo años:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/issues/number/:number - Obtener número específico por número
router.get('/number/:number', async (req, res) => {
  try {
    const { number } = req.params;
    console.log('Buscando número:', number, 'tipo:', typeof number);
    
    const parsedNumber = parseInt(number);
    console.log('Número parseado:', parsedNumber);
    
    const issue = await Issue.findOne({ 
      number: parsedNumber
    });

    console.log('Issue encontrado:', issue ? 'sí' : 'no');

    if (!issue) {
      return res.status(404).json({ error: 'Número no encontrado' });
    }

    res.json(issue);
  } catch (error) {
    console.error('Error obteniendo número por número:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/issues/year/:year - Obtener números por año
router.get('/year/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const issues = await Issue.getByYear(parseInt(year));
    res.json(issues);
  } catch (error) {
    console.error('Error obteniendo números por año:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/issues/:year/:number - Obtener número específico con artículos
router.get('/:year/:number', async (req, res) => {
  try {
    const { year, number } = req.params;
    
    const issue = await Issue.findOne({ 
      year: parseInt(year), 
      number: parseInt(number),
      isPublished: true
    });

    if (!issue) {
      return res.status(404).json({ error: 'Número no encontrado' });
    }

    // Obtener artículos organizados por sección
    const articles = await Article.find({ 
      issueId: issue._id, 
      isPublished: true 
    }).populate('issueId', 'year number');

    // Organizar artículos por sección
    const articlesBySection = {
      articles: articles.filter(a => a.section === 'articles'),
      creacio: articles.filter(a => a.section === 'creacio'),
      entrevistes: articles.filter(a => a.section === 'entrevistes'),
      llibres: articles.filter(a => a.section === 'llibres'),
      llocs: articles.filter(a => a.section === 'llocs'),
      recomanacions: articles.filter(a => a.section === 'recomanacions')
    };

    res.json({
      issue,
      articles: articlesBySection
    });
  } catch (error) {
    console.error('Error obteniendo número específico:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/issues/:number/generate-manual-pdf - Generar PDF manual
router.post('/:number/generate-manual-pdf', async (req, res) => {
  try {
    const { number } = req.params;
    const issueNumber = parseInt(number);
    
    if (isNaN(issueNumber)) {
      return res.status(400).json({ error: 'Número de edición no válido' });
    }

    // Verificar que el issue existe y tiene pdfManual activado
    const issue = await Issue.findOne({ number: issueNumber });
    if (!issue) {
      return res.status(404).json({ error: `Edición número ${issueNumber} no encontrada` });
    }

    if (!issue.pdfManual) {
      return res.status(400).json({ 
        error: `La edición número ${issueNumber} no tiene generación manual activada` 
      });
    }

    // Generar PDF manual
    const generator = new ManualPDFGenerator();
    await generator.init();
    
    const pdfPath = await generator.generateManualPDF(issueNumber);
    await generator.close();

    // Enviar el archivo PDF
    res.download(pdfPath, `revista-manual-${issueNumber}.pdf`, (err) => {
      if (err) {
        console.error('Error enviando PDF:', err);
        res.status(500).json({ error: 'Error enviando el archivo PDF' });
      }
    });

  } catch (error) {
    console.error('Error generando PDF manual:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/issues/:id - Obtener número por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const issue = await Issue.findById(id);
    
    if (!issue) {
      return res.status(404).json({ error: 'Número no encontrado' });
    }

    res.json(issue);
  } catch (error) {
    console.error('Error obteniendo número por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 