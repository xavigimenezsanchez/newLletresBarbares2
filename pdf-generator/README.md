# Generador de PDF para Lletres Bàrbares

Aquest script de Node.js genera automàticament un PDF de qualsevol número de la revista Lletres Bàrbares.

## Característiques

- **Portada:** Pàgina 1 amb el disseny de la revista, número, data i recompte d'articles
- **Índex:** Pàgina 2 amb la llista d'articles organitzats per secció i número de pàgina
- **Articles:** A partir de la pàgina 3, cada article comença en una nova pàgina

## Instal·lació

```bash
cd pdf-generator
npm install
```

## Ús

### Generar PDF de l'última edició (número 51, 2025)
```bash
npm run generate
```
o
```bash
node generate-pdf.js
```

### Generar PDF d'un número específic
```bash
node generate-pdf.js --issue=50 --year=2024
```

### Scripts disponibles
```bash
# Generar l'última edició (número 51, 2025)
npm run generate

# Provar amb l'edició 51
npm test

# Llistar totes les edicions disponibles
npm run list

# Generar les últimes 5 edicions
npm run latest

# Generar les últimes 3 edicions
npm run latest:3

# Generar un rang d'anys (exemple amb script directe)
node generate-multiple.js --year-range --start=2023 --end=2024
```

## Estructura del projecte

```
pdf-generator/
├── package.json              # Dependències del projecte
├── generate-pdf.js           # Script principal per una edició
├── generate-multiple.js      # Script per múltiples edicions
├── templates/                # Plantilles HTML per al PDF
│   ├── cover.hbs            # Plantilla de portada
│   ├── index.hbs            # Plantilla d'índex
│   └── article.hbs          # Plantilla d'articles
└── output/                   # PDFs generats
    └── revista-YYYY-NN.pdf
```

## Dependències

- **puppeteer**: Per generar el PDF a partir d'HTML
- **handlebars**: Motor de plantilles per generar l'HTML
- **fs-extra**: Operacions avançades del sistema de fitxers
- **marked**: Per processar markdown (si cal)

## Personalització

Les plantilles HTML es troben a la carpeta `templates/` i es poden modificar per canviar:

- Estils CSS
- Estructura del layout
- Tipografia
- Colors

## Funcionament intern

1. **Càrrega de dades**: Llegeix els fitxers JSON de l'edició especificada
2. **Processament**: Organitza els articles per seccions
3. **Generació de plantilles**: Crea HTML per portada, índex i articles
4. **Conversió a PDF**: Utilitza Puppeteer per generar el PDF final

## Format de sortida

El PDF generat inclou:
- Format A4
- Portada amb gradient i informació de l'edició
- Índex amb articles organitzats per seccions
- Articles amb format professional (títol, autor, secció, contingut)
- Cada article comença en una pàgina nova

## Exemple de sortida

```
📚 Generando PDF para el número 51/2025...
📄 Cargados 12 artículos
🎨 Generando portada...
📋 Generando índice...
📝 Generando artículos...
✅ PDF generado: /path/to/revista-2025-51.pdf
```

## Requisitos del sistema

- Node.js >= 18.0.0
- npm >= 8.0.0
- Sistema amb suport per Puppeteer (Chrome/Chromium)

## Errors comuns

- **Issue not found**: Verificar que existeixi la carpeta de l'edició
- **Puppeteer errors**: Assegurar-se que el sistema té les dependències necessàries per Chrome

## Scripts addicionals

### generate-multiple.js
Script per generar múltiples PDFs de cop:

```bash
# Llistar edicions disponibles
node generate-multiple.js --list

# Generar les últimes 5 edicions
node generate-multiple.js --latest

# Generar les últimes 3 edicions
node generate-multiple.js --latest --count=3

# Generar un rang d'anys específic
node generate-multiple.js --year-range --start=2023 --end=2024
```

## Futura millora

- Suport per imatges locals en els articles
- Optimització de la grandària del PDF
- Plantilles personalitzables per diferents estils
- ✅ Generació en lots de múltiples edicions (implementat)
- Compressió automàtica dels PDFs
- Generació de portades personalitzades per edició