const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true,
    index: true
  },
  // Campos originales del JSON
  issue: {
    type: Number,
    required: true,
    index: true
  },
  data: {
    type: String,
    required: true
  },
  imageCard: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  section: {
    type: String,
    required: true,
    enum: ['articles', 'creacio', 'entrevistes', 'llibres', 'llocs', 'recomanacions'],
    index: true
  },
  // CAMBIO: author → authors (array de strings)
  authors: [{
    type: String,
    required: true,
    index: true
  }],
  // Mantener author por compatibilidad durante la migración
  author: {
    type: String,
    required: false, // Ya no es requerido
    index: true
  },
  summary: {
    type: String,
    default: ''
  },
  text: {
    type: mongoose.Schema.Types.Mixed, // Array del contenido original
    required: true
  },
  // Campos adicionales para mejorar el schema
  publicationDate: {
    type: Date,
    required: true,
    index: true
  },
  isPublished: {
    type: Boolean,
    default: true,
    index: true
  },
  tags: [{
    type: String,
    index: true
  }],
  readTime: {
    type: Number, // en minutos
    default: 5
  },
  // Campos calculados
  year: {
    type: Number,
    index: true
  },
  issueNumber: {
    type: Number,
    index: true
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
articleSchema.index({ title: 'text', summary: 'text', 'authors': 'text', 'text.content': 'text' });
articleSchema.index({ section: 1, publicationDate: -1 });
articleSchema.index({ authors: 1, publicationDate: -1 }); // Cambiado de author a authors
articleSchema.index({ year: 1, issueNumber: 1 });
// Índice adicional para búsqueda en contenido de texto
articleSchema.index({ 'text.content': 1 });

// Middleware para calcular campos automáticamente
articleSchema.pre('save', function(next) {
  // Calcular publicationDate desde el campo data
  if (this.data && !this.publicationDate) {
    const [day, month, year] = this.data.split('/');
    this.publicationDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  // Calcular year desde publicationDate
  if (this.publicationDate && !this.year) {
    this.year = this.publicationDate.getFullYear();
  }
  
  // Calcular issueNumber desde issue
  if (this.issue && !this.issueNumber) {
    this.issueNumber = this.issue;
  }
  
  next();
});

// MÉTODOS ESTÁTICOS RESTAURADOS PARA COMPATIBILIDAD

// Método estático para obtener artículos recientes
// Obtiene todos los artículos cuya issueNumber es la más alta (última revista publicada)
articleSchema.statics.getRecent = async function() {
  // Encontrar el issueNumber más alto entre los artículos publicados
  const resultado = await this.find({ isPublished: true })
    .sort({ issueNumber: -1 })
    .limit(1)
    .select('issueNumber')
    .lean();

  if (!resultado || resultado.length === 0 || !resultado[0].issueNumber) {
    return [];
  }

  const maxIssueNumber = resultado[0].issueNumber;

  // Devolver todos los artículos de ese issueNumber
  return this.find({ isPublished: true, issueNumber: maxIssueNumber })
    .populate('issueId', 'year number')
    .sort({ publicationDate: -1 });
};

// Método estático para obtener artículos por sección
articleSchema.statics.getBySection = function(section, limit = 10) {
  return this.find({ section, isPublished: true })
    .populate('issueId', 'year number')
    .sort({ publicationDate: -1 })
    .limit(limit);
};

// Método estático para obtener artículos por autor
articleSchema.statics.getByAuthor = function(author, limit = 10) {
  return this.find({
    $or: [
      { authors: { $in: [author] } },
      { author: author } // Compatibilidad con datos antiguos
    ],
    isPublished: true
  })
    .populate('issueId', 'year number')
    .sort({ publicationDate: -1 })
    .limit(limit);
};

// Método estático para obtener artículos por año y número
articleSchema.statics.getByYearAndIssue = function(year, issueNumber, limit = 10) {
  return this.find({ year, issueNumber, isPublished: true })
    .populate('issueId', 'year number')
    .sort({ publicationDate: -1 })
    .limit(limit);
};

// Método estático para buscar por autor
articleSchema.statics.findByAuthor = function(authorName) {
  return this.find({
    $or: [
      { authors: { $in: [authorName] } },
      { author: authorName } // Compatibilidad con datos antiguos
    ]
  });
};

// Método estático para buscar por múltiples autores
articleSchema.statics.findByAuthors = function(authorNames) {
  return this.find({
    $or: [
      { authors: { $in: authorNames } },
      { author: { $in: authorNames } } // Compatibilidad con datos antiguos
    ]
  });
};

// Método para obtener todos los autores únicos
articleSchema.statics.getUniqueAuthors = function() {
  return this.aggregate([
    {
      $project: {
        allAuthors: {
          $setUnion: [
            { $ifNull: ['$authors', []] },
            { $ifNull: [{ $cond: [{ $ne: ['$author', null] }, ['$author'], []] }, []] }
          ]
        }
      }
    },
    { $unwind: '$allAuthors' },
    { $group: { _id: '$allAuthors' } },
    { $sort: { _id: 1 } }
  ]);
};

// Método para buscar artículos con texto completo
articleSchema.statics.fullTextSearch = function(query, options = {}) {
  const searchQuery = {
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { summary: { $regex: query, $options: 'i' } },
      { authors: { $in: [new RegExp(query, 'i')] } },
      { author: { $regex: query, $options: 'i' } }, // Compatibilidad
      { 'text.content': { $regex: query, $options: 'i' } }
    ]
  };

  // Aplicar filtros adicionales
  if (options.section) {
    searchQuery.section = options.section;
  }
  
  if (options.year) {
    searchQuery.year = options.year;
  }

  return this.find(searchQuery)
    .sort(options.sort || { publicationDate: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Método para obtener estadísticas por autor
articleSchema.statics.getAuthorStats = function() {
  return this.aggregate([
    {
      $project: {
        allAuthors: {
          $setUnion: [
            { $ifNull: ['$authors', []] },
            { $ifNull: [{ $cond: [{ $ne: ['$author', null] }, ['$author'], []] }, []] }
          ]
        },
        section: 1,
        year: 1,
        publicationDate: 1
      }
    },
    { $unwind: '$allAuthors' },
    {
      $group: {
        _id: '$allAuthors',
        totalArticles: { $sum: 1 },
        sections: { $addToSet: '$section' },
        years: { $addToSet: '$year' },
        firstPublication: { $min: '$publicationDate' },
        lastPublication: { $max: '$publicationDate' }
      }
    },
    {
      $project: {
        author: '$_id',
        totalArticles: 1,
        sections: 1,
        years: 1,
        firstPublication: 1,
        lastPublication: 1,
        _id: 0
      }
    },
    { $sort: { totalArticles: -1, author: 1 } }
  ]);
};

// MÉTODOS DE INSTANCIA

// Método para obtener el issue relacionado
articleSchema.methods.getIssue = function() {
  return mongoose.model('Issue').findById(this.issueId);
};

// Método para obtener autores formateados
articleSchema.methods.getFormattedAuthors = function() {
  if (this.authors && this.authors.length > 0) {
    return this.authors;
  }
  if (this.author) {
    return [this.author];
  }
  return [];
};

const Article = mongoose.model('Article', articleSchema);

module.exports = Article; 