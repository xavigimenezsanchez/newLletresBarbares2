# Lletres Barbares - Web App

Una web app moderna per a la revista mensual "Lletres Barbares", dissenyada amb inspiració en The New Yorker.

## 🎨 Característiques del Disseny

- **Inspiració en The New Yorker**: Disseny elegant i minimalista amb tipografia serif
- **Responsive**: Optimitzada per a dispositius mòbils i desktop
- **Tipografia**: Utilitza fonts serif (Didot, Georgia) per a un aspecte clàssic
- **Paleta de colors**: Vermell característic (#D32F2F) amb grisos elegants
- **Layout**: Estructura clara amb header fix, hero section i grid d'articles

## 🛠️ Tecnologies Utilitzades

- **React 18** amb TypeScript
- **Vite** per a build i desenvolupament ràpid
- **Tailwind CSS** per a estils utilitaris i disseny responsive
- **PostCSS** i **Autoprefixer** per a compatibilitat

## 📁 Estructura del Projecte

```
src/
├── components/          # Components React
│   ├── Header.tsx      # Navegació principal
│   ├── Hero.tsx        # Secció hero amb article destacat
│   ├── ArticleGrid.tsx # Grid d'articles
│   ├── ArticleCard.tsx # Targeta individual d'article
│   └── Footer.tsx      # Peu de pàgina
├── types/              # Definicions TypeScript
│   └── index.ts        # Interfícies per a dades
├── App.tsx             # Component principal
├── main.tsx           # Punt d'entrada
└── index.css          # Estils globals i Tailwind
```

## 🚀 Com Executar el Projecte

### Prerequisits
- Node.js 18+ 
- npm o yarn

### Instal·lació
```bash
# Clonar el repositori
git clone [url-del-repositori]

# Entrar al directori
cd lletres-barbares-web

# Instal·lar dependències
npm install

# Executar en mode desenvolupament
npm run dev
```

### Scripts Disponibles
```bash
npm run dev          # Executar servidor de desenvolupament
npm run build        # Construir per a producció
npm run preview      # Previsualitzar build de producció
npm run lint         # Executar ESLint
```

## 📊 Estructura de Dades

La web està dissenyada per a treballar amb dades JSON estructurades:

```typescript
interface Article {
  issue: number;
  data: string;        // Format: DD/MM/YYYY
  imageCard: string;   // Nom de la imatge
  title: string;
  url: string;         // URL amigable
  section: 'articles' | 'creacio' | 'entrevistes' | 'llibres' | 'llocs' | 'recomanacions';
  author: string;
  summary: string;
  text: ArticleTextElement[];
}
```

## 🎯 Funcionalitats Implementades

### ✅ Completades
- Header amb navegació responsive
- Hero section amb article destacat
- Grid d'articles amb targetes
- Footer amb informació de contacte
- Disseny responsive per a mòbils
- Tipografia i colors inspirades en The New Yorker

### 🔄 Pròximes Funcionalitats
- Pàgina individual d'article
- Sistema de navegació per seccions
- Arxiu per anys i números
- Cerca d'articles
- Integració amb backend per a dades reals
- Sistema d'imatges
- SEO optimitzat

## 🎨 Personalització

### Colors
Els colors principals es poden modificar a `tailwind.config.js`:

```javascript
colors: {
  'newyorker-red': '#D32F2F',
  'newyorker-dark': '#1A1A1A',
  'newyorker-gray': '#F5F5F5',
  'newyorker-text': '#333333',
  'newyorker-light-gray': '#E0E0E0',
}
```

### Tipografia
Les fonts es configuren a `src/index.css`:

```css
font-family: 'Georgia', 'Times New Roman', serif;  /* Text principal */
font-family: 'Didot', 'Bodoni MT', serif;          /* Títols */
```

## 📱 Responsive Design

La web està optimitzada per a:
- **Mòbils**: < 768px
- **Tablets**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔧 Configuració de Tailwind

El projecte utilitza Tailwind CSS amb configuració personalitzada:
- Colors personalitzats
- Tipografia específica
- Components predefinits
- Plugin de tipografia

## 📄 Llicència

Aquest projecte està sota llicència MIT.

## 🤝 Contribucions

Les contribucions són benvingudes! Si us plau:
1. Fes un fork del projecte
2. Crea una branca per a la teva feature
3. Fes commit dels teus canvis
4. Obre un Pull Request

## 📞 Contacte

Per a preguntes o suport:
- Email: info@lletresbarbares.cat
- GitHub: [url-del-repositori]

---

**Lletres Barbares** - Revista mensual de cultura, literatura i pensament
