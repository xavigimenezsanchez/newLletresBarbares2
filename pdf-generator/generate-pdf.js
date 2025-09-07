#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const { marked } = require('marked');

class RevistaPDFGenerator {
  constructor() {
    this.documentsPath = path.join(__dirname, '../client/documents');
    this.templatesPath = path.join(__dirname, 'templates');
    this.outputPath = path.join(__dirname, 'output');
  }

  async init() {
    // Crear directorios necesarios
    await fs.ensureDir(this.outputPath);
    await fs.ensureDir(this.templatesPath);
    
    // Crear templates si no existen
    await this.createTemplates();
  }

  async createTemplates() {
    const coverTemplate = `
<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: 'Georgia', serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            color: white;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        .logo {
            font-size: 3.5rem;
            font-weight: bold;
            margin-bottom: 2rem;
            letter-spacing: 3px;
            text-transform: uppercase;
        }
        .subtitle {
            font-size: 1.5rem;
            margin-bottom: 3rem;
            font-style: italic;
            opacity: 0.9;
        }
        .issue-info {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: bold;
        }
        .date {
            font-size: 1.2rem;
            opacity: 0.8;
        }
        .articles-count {
            position: absolute;
            bottom: 3rem;
            right: 3rem;
            font-size: 1rem;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="logo">Lletres Bàrbares</div>
    <div class="subtitle">Revista de cultura, literatura i pensament</div>
    <div class="issue-info">Número {{number}}</div>
    <div class="date">{{date}}</div>
    <div class="articles-count">{{totalArticles}} articles</div>
</body>
</html>`;

    const indexTemplate = `
<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Índex - {{title}}</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 3rem;
            border-bottom: 2px solid #1a1a2e;
            padding-bottom: 1rem;
        }
        .header h1 {
            color: #1a1a2e;
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        .header h2 {
            color: #666;
            font-size: 1.2rem;
            font-weight: normal;
        }
        .section {
            margin-bottom: 2rem;
        }
        .section-title {
            color: #1a1a2e;
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            text-transform: uppercase;
            border-left: 4px solid #1a1a2e;
            padding-left: 1rem;
        }
        .article-item {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px dotted #ccc;
        }
        .article-title {
            flex-grow: 1;
            font-weight: bold;
            color: #333;
            padding-right: 1rem;
        }
        .article-author {
            font-style: italic;
            color: #666;
            margin-right: 1rem;
            min-width: 150px;
            text-align: right;
        }
        .article-page {
            font-weight: bold;
            color: #1a1a2e;
            min-width: 30px;
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Índex</h1>
        <h2>{{title}} - {{date}}</h2>
    </div>
    
    {{#each sections}}
    <div class="section">
        <div class="section-title">{{name}}</div>
        {{#each articles}}
        <div class="article-item">
            <div class="article-title">{{title}}</div>
            <div class="article-author">{{author}}</div>
            <div class="article-page">{{page}}</div>
        </div>
        {{/each}}
    </div>
    {{/each}}
</body>
</html>`;

    const articleTemplate = `
<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #333;
        }
        .article-header {
            margin-bottom: 2rem;
            border-bottom: 2px solid #1a1a2e;
            padding-bottom: 1rem;
        }
        .section-label {
            color: #1a1a2e;
            font-size: 0.9rem;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 1px;
        }
        .article-title {
            color: #1a1a2e;
            font-size: 2rem;
            font-weight: bold;
            margin: 1rem 0;
            line-height: 1.3;
        }
        .article-author {
            color: #666;
            font-style: italic;
            font-size: 1.1rem;
        }
        .article-summary {
            background: #f8f9fa;
            padding: 1.5rem;
            margin: 2rem 0;
            border-left: 4px solid #1a1a2e;
            font-style: italic;
        }
        .article-content {
            font-size: 1rem;
            line-height: 1.8;
        }
        .article-content h2 {
            color: #1a1a2e;
            font-size: 1.3rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
        }
        .article-content p {
            margin-bottom: 1rem;
            text-align: justify;
        }
        .article-content img {
            max-width: 100%;
            height: auto;
            margin: 1rem 0;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="article-header">
        <div class="section-label">{{section}}</div>
        <h1 class="article-title">{{{title}}}</h1>
        <div class="article-author">{{author}}</div>
    </div>
    
    {{#if summary}}
    <div class="article-summary">
        {{{summary}}}
    </div>
    {{/if}}
    
    <div class="article-content">
        {{{content}}}
    </div>
</body>
</html>`;

    await fs.writeFile(path.join(this.templatesPath, 'cover.hbs'), coverTemplate);
    await fs.writeFile(path.join(this.templatesPath, 'index.hbs'), indexTemplate);
    await fs.writeFile(path.join(this.templatesPath, 'article.hbs'), articleTemplate);
  }

  async loadIssueData(year, issueNumber) {
    const issuePath = path.join(this.documentsPath, year.toString(), issueNumber.toString());
    
    if (!await fs.pathExists(issuePath)) {
      throw new Error(`Issue ${year}/${issueNumber} not found at ${issuePath}`);
    }

    // Cargar información del issue
    const issueJsonPath = path.join(issuePath, 'issue.json');
    let issueData = {};
    
    if (await fs.pathExists(issueJsonPath)) {
      issueData = await fs.readJson(issueJsonPath);
    }

    // Cargar artículos de todas las secciones
    const articles = [];
    const sections = ['articles', 'creacio', 'entrevistes', 'llibres', 'llocs', 'recomanacions'];
    
    for (const section of sections) {
      const sectionPath = path.join(issuePath, section);
      
      if (await fs.pathExists(sectionPath)) {
        const files = await fs.readdir(sectionPath);
        const jsonFiles = files.filter(f => f.endsWith('.json')).sort((a, b) => {
          const numA = parseInt(a.split('.')[0]);
          const numB = parseInt(b.split('.')[0]);
          return numA - numB;
        });

        for (const file of jsonFiles) {
          const articlePath = path.join(sectionPath, file);
          const articleData = await fs.readJson(articlePath);
          articles.push({
            ...articleData,
            section: section
          });
        }
      }
    }

    return {
      ...issueData,
      articles: articles
    };
  }

  formatContent(textArray) {
    if (!Array.isArray(textArray)) return '';
    
    return textArray.map(item => {
      switch (item.type) {
        case 'title':
        case 'title2':
          return `<h2>${item.content}</h2>`;
        case 'paragraph':
        case 'paragraph2':
          return `<p>${item.content}</p>`;
        case 'image':
          return `<img src="${item.content}" alt="${item.name || ''}" />`;
        default:
          return `<p>${item.content}</p>`;
      }
    }).join('\\n');
  }

  getSectionDisplayName(section) {
    const sectionNames = {
      articles: 'Articles',
      creacio: 'Creació',
      entrevistes: 'Entrevistes',
      llibres: 'Llibres',
      llocs: 'Llocs',
      recomanacions: 'Recomanacions'
    };
    return sectionNames[section] || section;
  }

  async generatePDF(year, issueNumber) {
    console.log(`📚 Generando PDF para el número ${issueNumber}/${year}...`);
    
    // Cargar datos
    const issueData = await this.loadIssueData(year, issueNumber);
    console.log(`📄 Cargados ${issueData.articles.length} artículos`);

    // Inicializar browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Configurar el PDF
      const pdfPath = path.join(this.outputPath, `revista-${year}-${issueNumber}.pdf`);
      const htmlPages = [];

      // 1. Generar portada
      console.log('🎨 Generando portada...');
      const coverTemplate = Handlebars.compile(await fs.readFile(path.join(this.templatesPath, 'cover.hbs'), 'utf8'));
      const coverHtml = coverTemplate({
        title: issueData.title || `Lletres Bàrbares - Número ${issueNumber}`,
        number: issueNumber,
        date: new Date(issueData.publicationDate?.$date || issueData.publicationDate || Date.now()).toLocaleDateString('ca-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        totalArticles: issueData.articles.length
      });
      htmlPages.push(coverHtml);

      // 2. Generar índice
      console.log('📋 Generando índice...');
      const indexTemplate = Handlebars.compile(await fs.readFile(path.join(this.templatesPath, 'index.hbs'), 'utf8'));
      
      // Agrupar artículos por sección
      const articlesBySection = {};
      let currentPage = 3; // Empezar en página 3 (después de portada e índice)
      
      issueData.articles.forEach(article => {
        if (!articlesBySection[article.section]) {
          articlesBySection[article.section] = [];
        }
        articlesBySection[article.section].push({
          title: article.title,
          author: Array.isArray(article.authors) ? article.authors.join(', ') : (article.author || ''),
          page: currentPage
        });
        currentPage++; // Cada artículo en una nueva página
      });

      const sections = Object.keys(articlesBySection).map(sectionKey => ({
        name: this.getSectionDisplayName(sectionKey),
        articles: articlesBySection[sectionKey]
      }));

      const indexHtml = indexTemplate({
        title: issueData.title || `Lletres Bàrbares - Número ${issueNumber}`,
        date: new Date(issueData.publicationDate?.$date || issueData.publicationDate || Date.now()).toLocaleDateString('ca-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        sections: sections
      });
      htmlPages.push(indexHtml);

      // 3. Generar artículos
      console.log('📝 Generando artículos...');
      const articleTemplate = Handlebars.compile(await fs.readFile(path.join(this.templatesPath, 'article.hbs'), 'utf8'));
      
      for (let i = 0; i < issueData.articles.length; i++) {
        const article = issueData.articles[i];
        console.log(`   - Artículo ${i + 1}/${issueData.articles.length}: ${article.title}`);
        
        const articleHtml = articleTemplate({
          title: article.title,
          author: Array.isArray(article.authors) ? article.authors.join(', ') : (article.author || ''),
          section: this.getSectionDisplayName(article.section),
          summary: article.summary,
          content: this.formatContent(article.text)
        });
        
        htmlPages.push(articleHtml);
      }

      // Combinar todas las páginas HTML
      const fullHtml = htmlPages.join('<div class="page-break"></div>');
      
      // Generar PDF
      console.log('🔄 Generando PDF...');
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
      
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      });

      console.log(`✅ PDF generado: ${pdfPath}`);
      return pdfPath;

    } finally {
      await browser.close();
    }
  }
}

// Script principal
async function main() {
  const args = process.argv.slice(2);
  let issueNumber = 51; // Por defecto la última
  let year = 2025;

  // Parsear argumentos
  for (const arg of args) {
    if (arg.startsWith('--issue=')) {
      issueNumber = parseInt(arg.split('=')[1]);
    }
    if (arg.startsWith('--year=')) {
      year = parseInt(arg.split('=')[1]);
    }
  }

  try {
    const generator = new RevistaPDFGenerator();
    await generator.init();
    const pdfPath = await generator.generatePDF(year, issueNumber);
    console.log(`\\n🎉 PDF de la revista generado correctamente:`);
    console.log(`📄 ${pdfPath}`);
  } catch (error) {
    console.error('❌ Error generando PDF:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = RevistaPDFGenerator;