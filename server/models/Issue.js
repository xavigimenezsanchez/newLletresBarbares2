const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    index: true
  },
  number: {
    type: Number,
    required: true,
    index: true
  },
  publicationDate: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    default: function() {
      return `Lletres Barbares - Número ${this.number}`;
    }
  },
  coverImage: {
    type: String,
    required: false
  },
  description: String,
  coverImage: String,
  isPublished: {
    type: Boolean,
    default: true,
    index: true
  },
  // Campos adicionales para mejorar el schema
  totalArticles: {
    type: Number,
    default: 0
  },
  sections: [{
    type: String,
    enum: ['articles', 'creacio', 'entrevistes', 'llibres', 'llocs', 'recomanacions']
  }],
  // Campos para generación manual de PDF
  pdfManual: {
    type: Boolean,
    required: false
  },
  articlesOrder: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }]
}, {
  timestamps: true
});

// Índice compuesto para búsquedas eficientes
issueSchema.index({ year: 1, number: 1 }, { unique: true });

// Método para obtener el número total de artículos
issueSchema.methods.getArticleCount = function() {
  return mongoose.model('Article').countDocuments({ issueId: this._id });
};

// Método estático para obtener el último número
issueSchema.statics.getLatest = function() {
  return this.findOne({ isPublished: true }).sort({ year: -1, number: -1 });
};

// Método estático para obtener números por año
issueSchema.statics.getByYear = function(year) {
  return this.find({ year, isPublished: true }).sort({ number: 1 });
};

// Método para actualizar estadísticas del issue
issueSchema.methods.updateStats = async function() {
  const Article = mongoose.model('Article');
  const stats = await Article.aggregate([
    { $match: { issueId: this._id } },
    { $group: {
      _id: '$section',
      count: { $sum: 1 }
    }}
  ]);
  
  this.totalArticles = stats.reduce((sum, stat) => sum + stat.count, 0);
  this.sections = stats.map(stat => stat._id);
  
  return this.save();
};

module.exports = mongoose.model('Issue', issueSchema); 