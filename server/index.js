const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de seguridad y optimización
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: [
        "'self'",
        "data:",
        "http://localhost:5000",
        "http://localhost:5173",
        "https://lletresbarbares.s3.amazonaws.com",
        "https://lletresbarbares.s3.*.amazonaws.com"
      ],
      mediaSrc: [
        "'self'",
        "http://localhost:5000",
        "http://localhost:5173",
        "https://lletresbarbares.s3.amazonaws.com",
        "https://lletresbarbares.s3.*.amazonaws.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      scriptSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "http://localhost:5000",
        "http://localhost:5173"
      ]
    },
  },
}));
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-app-name.herokuapp.com'] 
    : ['http://localhost:3000', 'http://localhost:5173']
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // máximo 500 requests por ventana (aumentado para infinite scroll)
  message: 'Demasiadas peticiones desde esta IP, prova més tard.'
});

// Rate limiting más permisivo para imágenes y media
const mediaLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 200, // máximo 200 peticiones de media por minuto
  message: 'Demasiadas peticiones de media, prova més tard.'
});

// Aplicar limiters
app.use('/api/images/', mediaLimiter);
app.use('/api/videos/', mediaLimiter);
app.use('/api/', generalLimiter);

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Conectar a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lletres-barbares', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Importar rutas de la API
const articlesRoutes = require('./routes/articles');
const issuesRoutes = require('./routes/issues');
const searchRoutes = require('./routes/search');
const debugRoutes = require('./routes/debug');
const mediaRoutes = require('./routes/media');

// Rutas de la API
app.use('/api/articles', articlesRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api', mediaRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// En producción, servir archivos estáticos del frontend
if (process.env.NODE_ENV === 'production') {
  // Servir archivos estáticos del build de React
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Para cualquier ruta que no sea /api, servir el index.html de React
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📚 API disponible en http://localhost:${PORT}/api`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Frontend servido desde /client/dist`);
  }
}); 