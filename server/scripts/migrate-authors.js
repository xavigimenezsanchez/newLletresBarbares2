const mongoose = require('mongoose');
const Author = require('../models/Author');
const Article = require('../models/Article');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', async () => {
  console.log('Conectado a MongoDB');
  
  try {
    await migrateAuthors();
    console.log('Migración completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    mongoose.connection.close();
  }
});

async function migrateAuthors() {
  console.log('Iniciando migración de autores...');
  
  try {
    // Obtener todos los artículos únicos por autor
    const articles = await Article.find({}).select('author section year issueNumber publicationDate');
    
    // Agrupar por autor
    const authorsMap = new Map();
    
    articles.forEach(article => {
      if (!article.author) return;
      
      if (!authorsMap.has(article.author)) {
        authorsMap.set(article.author, {
          name: article.author,
          articles: [],
          sections: new Set(),
          years: new Set(),
          firstPublication: null,
          lastPublication: null
        });
      }
      
      const authorData = authorsMap.get(article.author);
      authorData.articles.push(article);
      authorData.sections.add(article.section);
      
      if (article.year) {
        authorData.years.add(article.year);
      }
      
      if (article.publicationDate) {
        const pubDate = new Date(article.publicationDate);
        if (!authorData.firstPublication || pubDate < authorData.firstPublication) {
          authorData.firstPublication = pubDate;
        }
        if (!authorData.lastPublication || pubDate > authorData.lastPublication) {
          authorData.lastPublication = pubDate;
        }
      }
    });
    
    console.log(`Encontrados ${authorsMap.size} autores únicos`);
    
    // Crear o actualizar autores
    for (const [authorName, authorData] of authorsMap) {
      try {
        // Verificar si el autor ya existe
        let author = await Author.findOne({ name: authorName });
        
        if (author) {
          console.log(`Actualizando autor existente: ${authorName}`);
          
          // Actualizar estadísticas
          author.stats.totalArticles = authorData.articles.length;
          author.stats.firstPublication = authorData.firstPublication;
          author.stats.lastPublication = authorData.lastPublication;
          
          // Actualizar especialidades basadas en secciones
          if (authorData.sections.size > 0) {
            author.specialties = Array.from(authorData.sections);
          }
          
          await author.save();
        } else {
          console.log(`Creando nuevo autor: ${authorName}`);
          
          // Crear nuevo autor
          const newAuthor = new Author({
            name: authorName,
            bio: {
              short: `${authorName} ha contribuït amb ${authorData.articles.length} articles a Lletres Bàrbares.`,
              full: `${authorName} és un autor que ha contribuït amb ${authorData.articles.length} articles a Lletres Bàrbares, publicant en les seccions: ${Array.from(authorData.sections).join(', ')}.`
            },
            specialties: Array.from(authorData.sections),
            stats: {
              totalArticles: authorData.articles.length,
              firstPublication: authorData.firstPublication,
              lastPublication: authorData.lastPublication,
              totalViews: 0
            },
            isActive: true,
            metaDescription: `${authorName} - Autor de Lletres Bàrbares amb ${authorData.articles.length} articles publicats.`,
            metaKeywords: ['autor', 'lletres bàrbares', ...Array.from(authorData.sections)]
          });
          
          await newAuthor.save();
        }
        
      } catch (error) {
        console.error(`Error procesando autor ${authorName}:`, error);
      }
    }
    
    console.log('Migración de autores completada');
    
  } catch (error) {
    console.error('Error durante la migración:', error);
    throw error;
  }
}

// Función para limpiar autores (solo usar en desarrollo)
async function cleanAuthors() {
  console.log('Limpiando todos los autores...');
  await Author.deleteMany({});
  console.log('Autores eliminados');
}

// Función para crear algunos autores de ejemplo
async function createSampleAuthors() {
  console.log('Creando autores de ejemplo...');
  
  const sampleAuthors = [
    {
      name: 'Joan Brossa',
      bio: {
        short: 'Poeta, dramaturg i artista visual català, considerat un dels màxims exponents de la poesia experimental.',
        full: 'Joan Brossa (Barcelona, 1919-1998) fou un poeta, dramaturg i artista visual català. És considerat un dels màxims exponents de la poesia experimental i visual del segle XX. La seva obra abraça la poesia, el teatre, l\'art visual i la performance, sempre amb un component lúdic i innovador.'
      },
      profession: 'Poeta i artista visual',
      location: 'Barcelona, Catalunya',
      birthDate: '1919-01-19',
      education: [
        {
          degree: 'Estudis de comerç',
          institution: 'Escola de Comerç de Barcelona',
          year: 1936
        }
      ],
      awards: [
        {
          name: 'Premi Ciutat de Barcelona',
          year: 1987,
          description: 'Reconocimiento a su trayectoria artística'
        }
      ],
      specialties: ['poesia', 'teatre', 'art visual'],
      stats: {
        totalArticles: 0,
        totalViews: 0
      },
      isActive: true,
      metaDescription: 'Joan Brossa - Poeta, dramaturg i artista visual català',
      metaKeywords: ['joan brossa', 'poesia', 'teatre', 'art visual', 'catalunya']
    },
    {
      name: 'Mercè Rodoreda',
      bio: {
        short: 'Escriptora catalana, autora de "La plaça del Diamant" i una de les veus més importants de la literatura catalana.',
        full: 'Mercè Rodoreda (Barcelona, 1908-Girona, 1983) fou una escriptora catalana considerada una de les veus més importants de la literatura catalana del segle XX. La seva obra més coneguda és "La plaça del Diamant", considerada una de les millors novel·les catalanes de tots els temps.'
      },
      profession: 'Escriptora',
      location: 'Barcelona, Catalunya',
      birthDate: '1908-10-10',
      education: [
        {
          degree: 'Estudis de magisteri',
          institution: 'Escola Normal de Barcelona',
          year: 1928
        }
      ],
      awards: [
        {
          name: 'Premi Sant Jordi',
          year: 1966,
          description: 'Por "La plaça del Diamant"'
        }
      ],
      specialties: ['novel·la', 'poesia', 'teatre'],
      stats: {
        totalArticles: 0,
        totalViews: 0
      },
      isActive: true,
      metaDescription: 'Mercè Rodoreda - Escriptora catalana, autora de "La plaça del Diamant"',
      metaKeywords: ['mercè rodoreda', 'escriptora', 'novel·la', 'la plaça del diamant', 'catalunya']
    }
  ];
  
  for (const authorData of sampleAuthors) {
    try {
      const author = new Author(authorData);
      await author.save();
      console.log(`Autor creado: ${authorData.name}`);
    } catch (error) {
      console.error(`Error creando autor ${authorData.name}:`, error);
    }
  }
  
  console.log('Autores de ejemplo creados');
}

// Ejecutar según el argumento de línea de comandos
const command = process.argv[2];

switch (command) {
  case 'clean':
    cleanAuthors().then(() => process.exit(0));
    break;
  case 'sample':
    createSampleAuthors().then(() => process.exit(0));
    break;
  default:
    // Migración normal
    break;
} 