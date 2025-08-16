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
  author: {
    type: String,
    required: true,
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
articleSchema.index({ title: 'text', summary: 'text', author: 'text', 'text.content': 'text' });
articleSchema.index({ section: 1, publicationDate: -1 });
articleSchema.index({ author: 1, publicationDate: -1 });
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
  
  // Calcular year y issueNumber desde el campo issue
  if (this.issue && !this.year) {
    // Asumiendo que el campo issue contiene el año
    this.year = this.issue;
  }
  
  next();
});

// Método para extraer texto plano del campo text
articleSchema.methods.getPlainText = function() {
  if (!this.text || !Array.isArray(this.text)) {
    return '';
  }
  
  return this.text
    .filter(item => item.type === 'paragraph' || item.type === 'title')
    .map(item => {
      if (!item.content) return '';
      // Eliminar HTML tags básicos
      return item.content
        .replace(/<[^>]*>/g, '') // Remover tags HTML
        .replace(/&nbsp;/g, ' ') // Reemplazar &nbsp; por espacios
        .replace(/&amp;/g, '&') // Reemplazar &amp; por &
        .replace(/&lt;/g, '<') // Reemplazar &lt; por <
        .replace(/&gt;/g, '>') // Reemplazar &gt; por >
        .replace(/&quot;/g, '"') // Reemplazar &quot; por "
        .trim();
    })
    .filter(text => text.length > 0)
    .join(' ');
};

// Método estático para búsqueda en contenido
articleSchema.statics.searchInContent = function(query, options = {}) {
  const {
    section,
    author,
    year,
    page = 1,
    limit = 10
  } = options;

  const searchQuery = { isPublished: true };
  
  // Búsqueda en múltiples campos
  if (query) {
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { summary: { $regex: query, $options: 'i' } },
      { author: { $regex: query, $options: 'i' } },
      // Búsqueda en el contenido del texto
      { 'text.content': { $regex: query, $options: 'i' } }
    ];
  }

  // Filtros adicionales
  if (section) searchQuery.section = section;
  if (author) searchQuery.author = { $regex: author, $options: 'i' };
  if (year) searchQuery.year = parseInt(year);

  return this.find(searchQuery)
    .populate('issueId', 'year number')
    .sort({ publicationDate: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
};

// Método para obtener el issue relacionado
articleSchema.methods.getIssue = function() {
  return mongoose.model('Issue').findById(this.issueId);
};

// Método estático para búsqueda de texto completo
articleSchema.statics.searchText = function(query) {
  return this.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });
};

// Método estático para obtener artículos por sección
articleSchema.statics.getBySection = function(section, limit = 10) {
  return this.find({ section, isPublished: true })
    .sort({ publicationDate: -1 })
    .limit(limit)
    .populate('issueId', 'year number');
};

// Método estático para obtener artículos por autor
articleSchema.statics.getByAuthor = function(author, limit = 10) {
  return this.find({ author, isPublished: true })
    .sort({ publicationDate: -1 })
    .limit(limit)
    .populate('issueId', 'year number');
};

// Método estático para obtener artículos recientes
articleSchema.statics.getRecent = function(limit = 10) {
  return this.find({ isPublished: true })
    .sort({ publicationDate: -1 })
    .limit(limit)
    .populate('issueId', 'year number');
};

// Método estático para obtener artículos por año y número
articleSchema.statics.getByYearAndIssue = function(year, issueNumber, limit = 10) {
  return this.find({ year, issueNumber, isPublished: true })
    .sort({ publicationDate: -1 })
    .limit(limit)
    .populate('issueId', 'year number');
};

module.exports = mongoose.model('Article', articleSchema); 