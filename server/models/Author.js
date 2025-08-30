const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  // Información básica
  name: {
    type: String,
    required: true,
    index: true
  },
  
  // URL amigable para SEO
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Información personal
  bio: {
    short: {
      type: String,
      maxlength: 200,
      required: true
    },
    full: {
      type: String,
      required: true
    }
  },
  
  // Foto del autor
  photo: {
    type: String,
    default: null // URL de la imagen en S3
  },
  
  // Información de contacto (opcional)
  contact: {
    email: String,
    website: String,
    twitter: String,
    linkedin: String,
    instagram: String
  },
  
  // Información profesional
  profession: String,
  location: String,
  birthDate: Date,
  
  // Formación y experiencia
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  
  // Premios y reconocimientos
  awards: [{
    name: String,
    year: Number,
    description: String
  }],
  
  // Especialidades o temas principales
  specialties: [String],
  
  // Estadísticas del autor
  stats: {
    totalArticles: {
      type: Number,
      default: 0
    },
    firstPublication: Date,
    lastPublication: Date,
    totalViews: {
      type: Number,
      default: 0
    }
  },
  
  // Metadatos
  isActive: {
    type: Boolean,
    default: true
  },
  
  // SEO
  metaDescription: String,
  metaKeywords: [String]
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
authorSchema.index({ name: 'text', 'bio.full': 'text', specialties: 'text' });
authorSchema.index({ 'stats.totalArticles': -1 });
authorSchema.index({ 'stats.lastPublication': -1 });
authorSchema.index({ isActive: 1 });

// Middleware para generar slug automáticamente - MÚLTIPLES ENFOQUES
// 1. Pre-validate (se ejecuta antes de la validación)
// authorSchema.pre('validate', function(next) {
//   console.log('🔄 Pre-validate middleware ejecutándose para:', this.name);
  
//   if (!this.slug || this.slug === '') {
//     this.slug = this.name
//       .toLowerCase()
//       .replace(/[^a-z0-9\s]/g, '')
//       .replace(/\s+/g, '-')
//       .replace(/-+/g, '-')
//       .replace(/^-+|-+$/g, '');
    
//     console.log('✅ Slug generado en pre-validate:', this.slug);
//   }
  
//   next();
// });

// 2. Pre-save (se ejecuta antes de guardar)
// authorSchema.pre('save', function(next) {
//   console.log('💾 Pre-save middleware ejecutándose para:', this.name);
//   console.log('📝 Slug antes de pre-save:', this.slug);
  
//   // Siempre regenerar el slug para asegurar consistencia
//   this.slug = this.name
//     .toLowerCase()
//     .replace(/[^a-z0-9\s]/g, '')
//     .replace(/\s+/g, '-')
//     .replace(/-+/g, '-')
//     .replace(/^-+|-+$/g, '');
  
//   console.log('✅ Slug final generado en pre-save:', this.slug);
//   next();
// });

// 3. Pre-insertMany (para operaciones bulk)
// authorSchema.pre('insertMany', function(next, docs) {
//   console.log('📦 Pre-insertMany middleware ejecutándose');
  
//   if (Array.isArray(docs)) {
//     docs.forEach(doc => {
//       if (doc.name && (!doc.slug || doc.slug === '')) {
//         doc.slug = doc.name
//           .toLowerCase()
//           .replace(/[^a-z0-9\s]/g, '')
//           .replace(/\s+/g, '-')
//           .replace(/-+/g, '-')
//           .replace(/^-+|-+$/g, '');
//       }
//     });
//   }
  
//   next();
// });

// Método para obtener autores activos
authorSchema.statics.getActiveAuthors = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Método para buscar autores por texto
authorSchema.statics.searchAuthors = function(query, limit = 10) {
  return this.find(
    { 
      $text: { $search: query },
      isActive: true 
    },
    { score: { $meta: "textScore" } }
  )
  .sort({ score: { $meta: "textScore" } })
  .limit(limit);
};

// Método para obtener autores por especialidad
authorSchema.statics.getAuthorsBySpecialty = function(specialty) {
  return this.find({ 
    specialties: { $in: [specialty] },
    isActive: true 
  }).sort({ name: 1 });
};

// Método para obtener autores más publicados
authorSchema.statics.getTopAuthors = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'stats.totalArticles': -1 })
    .limit(limit);
};

// Método para actualizar estadísticas del autor
authorSchema.methods.updateStats = async function() {
  const Article = mongoose.model('Article');
  
  // Contar artículos del autor
  const articleCount = await Article.countDocuments({ 
    author: this.name,
    isPublished: true 
  });
  
  // Obtener fechas de primera y última publicación
  const firstArticle = await Article.findOne({ 
    author: this.name,
    isPublished: true 
  }).sort({ publicationDate: 1 });
  
  const lastArticle = await Article.findOne({ 
    author: this.name,
    isPublished: true 
  }).sort({ publicationDate: -1 });
  
  // Actualizar estadísticas
  this.stats.totalArticles = articleCount;
  if (firstArticle) this.stats.firstPublication = firstArticle.publicationDate;
  if (lastArticle) this.stats.lastPublication = lastArticle.publicationDate;
  
  await this.save();
  return this;
};

// Método para obtener artículos del autor
authorSchema.methods.getArticles = async function(limit = 20, page = 1) {
  const Article = mongoose.model('Article');
  
  const skip = (page - 1) * limit;
  
  const articles = await Article.find({ 
    author: this.name,
    isPublished: true 
  })
  .sort({ publicationDate: -1 })
  .skip(skip)
  .limit(limit)
  .select('title summary section url publicationDate imageCard');
  
  const total = await Article.countDocuments({ 
    author: this.name,
    isPublished: true 
  });
  
  return {
    articles,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Método para obtener estadísticas del autor
authorSchema.methods.getAuthorStats = async function() {
  const Article = mongoose.model('Article');
  
  // Estadísticas por sección
  const sectionStats = await Article.aggregate([
    { $match: { author: this.name, isPublished: true } },
    { $group: { _id: '$section', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  // Estadísticas por año
  const yearStats = await Article.aggregate([
    { $match: { author: this.name, isPublished: true } },
    { $group: { _id: '$year', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);
  
  return {
    sectionStats,
    yearStats,
    totalArticles: this.stats.totalArticles,
    firstPublication: this.stats.firstPublication,
    lastPublication: this.stats.lastPublication
  };
};

module.exports = mongoose.model('Author', authorSchema); 