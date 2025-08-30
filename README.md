# Lletres Bàrbares - Revista Digital

Revista mensual de cultura, literatura i pensament amb una arquitectura moderna de full-stack JavaScript.

## 🏗️ Arquitectura

Aquest projecte utilitza una arquitectura **monorepo** amb:

- **Frontend**: React + TypeScript + Vite + Bulma CSS
- **Backend**: Node.js + Express + MongoDB Atlas
- **Desplegament**: Heroku (frontend + backend en una sola aplicació)

## 📁 Estructura del Projecte

```
newlletresbarbaras/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Components React
│   │   ├── services/       # Servei d'API
│   │   ├── types/          # Definicions TypeScript
│   │   └── index.css       # Estils amb Bulma
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Backend Node.js
│   ├── models/             # Models MongoDB
│   ├── routes/             # Endpoints API
│   ├── index.js            # Servidor principal
│   └── package.json
├── package.json            # Scripts del monorepo
├── Procfile               # Configuració Heroku
└── README.md
```

## 🚀 Instal·lació i Desenvolupament

### Prerequisits

- Node.js >= 18.0.0
- MongoDB Atlas (base de dades)
- Git

### 1. Clonar el repositori

```bash
git clone https://github.com/xavigimenezsanchez/newlletresbarbares.git
cd newlletresbarbares
```

### 2. Instal·lar dependències

```bash
npm run install:all
```

### 3. Configurar variables d'entorn

```bash
# Copiar l'arxiu d'exemple
cp server/env.example server/.env

# Editar les variables d'entorn
nano server/.env
```

Variables necessàries:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lletres-barbares
```

### 4. Executar en desenvolupament

```bash
# Executar frontend i backend simultàniament
npm run dev

# O per separat:
npm run dev:client    # Frontend (http://localhost:5173)
npm run dev:server    # Backend (http://localhost:5000)
```

## 📚 API Endpoints

### Articles
- `GET /api/articles` - Llistar articles amb paginació
- `GET /api/articles/recent` - Articles recents
- `GET /api/articles/featured` - Article destacat
- `GET /api/articles/:slug` - Article per slug
- `GET /api/articles/section/:section` - Articles per secció
- `GET /api/articles/author/:author` - Articles per autor

### Números de Revista
- `GET /api/issues` - Llistar números
- `GET /api/issues/latest` - Últim número
- `GET /api/issues/years` - Anys disponibles
- `GET /api/issues/:year/:number` - Número específic

### Cerca
- `GET /api/search` - Cerca general
- `GET /api/search/text` - Cerca de text complet
- `GET /api/search/authors` - Llista d'autors
- `GET /api/search/stats` - Estadístiques

## 🗄️ Base de Dades

### Models

#### Issue (Número de Revista)
```javascript
{
  year: Number,
  number: Number,
  publicationDate: Date,
  title: String,
  description: String,
  isPublished: Boolean
}
```

#### Article
```javascript
{
  issueId: ObjectId,
  title: String,
  urlSlug: String,
  section: String,
  author: String,
  summary: String,
  content: Mixed, // JSON del contingut
  imageCard: String,
  publicationDate: Date,
  isPublished: Boolean,
  tags: [String]
}
```

## 🎨 Frontend

### Tecnologies
- **React 18** amb TypeScript
- **Vite** per a build i dev server
- **Bulma CSS** per a estils
- **Fetch API** per a crides HTTP

### Components Principals
- `Header` - Navegació principal
- `Hero` - Secció destacada
- `ArticleGrid` - Graella d'articles
- `ArticleCard` - Targeta d'article individual
- `Footer` - Peu de pàgina

### Estils
Els estils estan inspirats en **The New Yorker** amb:
- Tipografia elegante (Didot, Georgia)
- Colors corporatius (roig #D32F2F)
- Layout responsive amb Bulma
- Hover effects i transicions

## 🔧 Scripts Disponibles

```bash
# Desenvolupament
npm run dev              # Frontend + Backend
npm run dev:client       # Només frontend
npm run dev:server       # Només backend

# Build
npm run build            # Build del frontend
npm run build:client     # Build del frontend

# Producció
npm start                # Iniciar servidor de producció

# Instal·lació
npm run install:all      # Instal·lar totes les dependències
```

## 🚀 Desplegament a Heroku

### 1. Preparar l'aplicació

```bash
# Crear aplicació a Heroku
heroku create lletres-barbares

# Afegir add-on de MongoDB Atlas
heroku addons:create mongolab:sandbox
```

### 2. Configurar variables d'entorn

```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
```

### 3. Desplegar

```bash
git add .
git commit -m "Preparar per a desplegament"
git push heroku main
```

### 4. Verificar

```bash
heroku open
heroku logs --tail
```

## 📊 Característiques

### Frontend
- ✅ Disseny responsive
- ✅ Cerca d'articles
- ✅ Navegació per seccions
- ✅ Paginació
- ✅ Loading states
- ✅ Error handling

### Backend
- ✅ API REST completa
- ✅ Connexió MongoDB Atlas
- ✅ Búsqueda de text complet
- ✅ Paginació i filtres
- ✅ Rate limiting
- ✅ CORS configurat
- ✅ Middleware de seguretat

### Base de Dades
- ✅ Models optimitzats
- ✅ Índexs per a rendiment
- ✅ Relacions entre models
- ✅ Validació de dades

## 🤝 Contribució

1. Fork el projecte
2. Crea una branca per a la teva feature (`git checkout -b feature/AmazingFeature`)
3. Commit els teus canvis (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branca (`git push origin feature/AmazingFeature`)
5. Obre un Pull Request

## 📄 Llicència

Aquest projecte està sota la Llicència MIT. Vegeu el fitxer `LICENSE` per a més detalls.

## 📞 Contacte

- **Email**: info@lletresbarbares.cat
- **Web**: https://lletresbarbares.cat
- **GitHub**: https://github.com/xavigimenezsanchez/newlletresbarbares

---

Desenvolupat amb ❤️ per a la comunitat catalana de cultura i literatura. 