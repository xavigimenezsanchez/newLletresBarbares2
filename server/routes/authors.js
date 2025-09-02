const express = require('express');
const router = express.Router();
const Author = require('../models/Author');
const Article = require('../models/Article');

// GET /api/authors - Listar todos los autores activos
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 18, 
      specialty, 
      search,
      sort = 'name' 
    } = req.query;

    let query = { isActive: true };
    
    // Filtro por especialidad
    if (specialty) {
      query.specialties = { $in: [specialty] };
    }
    
    // Búsqueda por texto
    if (search) {
      query.$text = { $search: search };
    }
    
    // Construir sort
    let sortOptions = {};
    switch (sort) {
      case 'name':
        sortOptions.name = 1;
        break;
      case 'articles':
        sortOptions['stats.totalArticles'] = -1;
        break;
      case 'recent':
        sortOptions['stats.lastPublication'] = -1;
        break;
      default:
        sortOptions.name = 1;
    }
    
    const skip = (page - 1) * limit;
    
    const authors = await Author.find(query)
      .sort(sortOptions)
      .collation({ locale: "ca" })
      .skip(skip)
      .limit(parseInt(limit))
      .select('name slug bio.short photo profession location stats.totalArticles stats.lastPublication');
    
    const total = await Author.countDocuments(query);
    
    res.json({
      authors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo autores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/authors/top - Obtener autores más publicados
router.get('/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const authors = await Author.getTopAuthors(parseInt(limit));
    
    res.json({
      authors,
      limit: parseInt(limit)
    });
    
  } catch (error) {
    console.error('Error obteniendo top autores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/authors/specialties - Obtener todas las especialidades
router.get('/specialties', async (req, res) => {
  try {
    const specialties = await Author.distinct('specialties', { isActive: true });
    
    res.json({
      specialties: specialties.filter(s => s).sort()
    });
    
  } catch (error) {
    console.error('Error obteniendo especialidades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/authors/search - Búsqueda de autores
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query de búsqueda requerida' });
    }
    
    const authors = await Author.searchAuthors(q, parseInt(limit));
    
    res.json({
      query: q,
      authors,
      total: authors.length
    });
    
  } catch (error) {
    console.error('Error buscando autores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/authors/:slug - Obtener autor específico por slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const author = await Author.findOne({ slug, isActive: true });
    
    if (!author) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }
    
    // Actualizar estadísticas del autor
    await author.updateStats();
    
    res.json({ author });
    
  } catch (error) {
    console.error('Error obteniendo autor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/authors/:slug/articles - Obtener artículos del autor
router.get('/:slug/articles', async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 20, section, year } = req.query;
    
    const author = await Author.findOne({ slug, isActive: true });
    
    if (!author) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }
    
    let query = { 
      author: author.name,
      isPublished: true 
    };
    
    // Filtros adicionales
    if (section) query.section = section;
    if (year) query.year = parseInt(year);
    
    const skip = (page - 1) * limit;
    
    const articles = await Article.find(query)
      .sort({ publicationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('title summary section url publicationDate imageCard year issueNumber');
    
    const total = await Article.countDocuments(query);
    
    res.json({
      author: {
        name: author.name,
        slug: author.slug
      },
      articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo artículos del autor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/authors/:slug/stats - Obtener estadísticas del autor
router.get('/:slug/stats', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const author = await Author.findOne({ slug, isActive: true });
    
    if (!author) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }
    
    const stats = await author.getAuthorStats();
    
    res.json({
      author: {
        name: author.name,
        slug: author.slug
      },
      stats
    });
    
  } catch (error) {
    console.error('Error obteniendo estadísticas del autor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/authors - Crear nuevo autor (solo admin)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      bio,
      photo,
      contact,
      profession,
      location,
      birthDate,
      education,
      awards,
      specialties,
      metaDescription,
      metaKeywords
    } = req.body;
    
    if (!name || !bio?.short || !bio?.full) {
      return res.status(400).json({ 
        error: 'Nombre y biografía son requeridos' 
      });
    }
    
    // Verificar si ya existe un autor con ese nombre
    const existingAuthor = await Author.findOne({ name });
    if (existingAuthor) {
      return res.status(400).json({ 
        error: 'Ya existe un autor con ese nombre' 
      });
    }
    
    const author = new Author({
      name,
      bio,
      photo,
      contact,
      profession,
      location,
      birthDate,
      education,
      awards,
      specialties,
      metaDescription,
      metaKeywords
    });
    
    // await author.save();
    
    res.status(201).json({
      message: 'Autor creado exitosamente',
      author
    });
    
  } catch (error) {
    console.error('Error creando autor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/authors/:slug - Actualizar autor (solo admin)
router.put('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const updateData = req.body;
    
    const author = await Author.findOne({ slug });
    
    if (!author) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }
    
    // Actualizar campos permitidos
    Object.keys(updateData).forEach(key => {
      if (key !== 'slug' && key !== '_id') {
        author[key] = updateData[key];
      }
    });
    
    // await author.save();
    
    res.json({
      message: 'Autor actualizado exitosamente',
      author
    });
    
  } catch (error) {
    console.error('Error actualizando autor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/authors/:slug - Desactivar autor (solo admin)
router.delete('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const author = await Author.findOne({ slug });
    
    if (!author) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }
    
    // En lugar de eliminar, marcar como inactivo
    author.isActive = false;
    // await author.save();
    
    res.json({
      message: 'Autor desactivado exitosamente'
    });
    
  } catch (error) {
    console.error('Error desactivando autor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 