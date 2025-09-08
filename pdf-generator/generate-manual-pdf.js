#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const mongoose = require('mongoose');

// Importar modelos
const Issue = require('../server/models/Issue');
const Article = require('../server/models/Article');

class ManualPDFGenerator {
  constructor() {
    this.templatesPath = path.join(__dirname, 'templates');
    this.outputPath = path.join(__dirname, 'output');
  }

  async init() {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lletres-barbares';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Crear directorios necesarios
    await fs.ensureDir(this.outputPath);
    await fs.ensureDir(this.templatesPath);
  }

  async generateManualPDF(issueNumber) {
    try {
      console.log(`🔍 Buscando edición número ${issueNumber}...`);
      
      // Buscar el issue
      const issue = await Issue.findOne({ number: issueNumber });
      if (!issue) {
        throw new Error(`No se encontró la edición número ${issueNumber}`);
      }

      console.log(`📚 Edición encontrada: ${issue.title}`);

      // Verificar si tiene pdfManual activado
      if (!issue.pdfManual) {
        console.log('⚠️  Esta edición no tiene generación manual activada');
        return;
      }

      // Obtener artículos en el orden especificado
      let articles;
      if (issue.articlesOrder && issue.articlesOrder.length > 0) {
        console.log('📋 Usando orden personalizado de artículos');
        articles = await Article.find({ 
          _id: { $in: issue.articlesOrder },
          issueId: issue._id 
        }).sort({ 
          _id: { $in: issue.articlesOrder } 
        });
      } else {
        console.log('📋 Usando orden por defecto de artículos');
        articles = await Article.find({ issueId: issue._id })
          .sort({ section: 1, publicationDate: 1 });
      }

      if (articles.length === 0) {
        throw new Error('No se encontraron artículos para esta edición');
      }

      console.log(`📰 Procesando ${articles.length} artículos...`);

      // Generar HTML con los datos del campo pdf
      const html = await this.generateHTML(issue, articles);
      
      // Generar PDF
      const pdfPath = await this.generatePDF(html, issueNumber);
      
      console.log(`✅ PDF generado exitosamente: ${pdfPath}`);
      return pdfPath;

    } catch (error) {
      console.error('❌ Error generando PDF:', error.message);
      throw error;
    }
  }

  async generateHTML(issue, articles) {
    const template = await this.getManualTemplate();
    
    // Procesar cada artículo y extraer datos del campo pdf
    const processedArticles = articles.map(article => {
      const pdfData = this.extractPDFData(article);
      return {
        ...article.toObject(),
        pdfData
      };
    });

    const html = template({
      issue: issue.toObject(),
      articles: processedArticles,
      generatedAt: new Date().toLocaleString('ca-ES')
    });

    return html;
  }

  extractPDFData(article) {
    const pdfData = {
      pages: new Map(),
      totalPages: 0
    };

    if (!article.text || !Array.isArray(article.text)) {
      return pdfData;
    }

    // Procesar cada elemento del array text
    article.text.forEach((element, index) => {
      if (element.pdf) {
        const pageNumber = element.pdf.page;
        
        if (!pdfData.pages.has(pageNumber)) {
          pdfData.pages.set(pageNumber, []);
        }

        const pageContent = {
          type: element.type,
          content: element.content,
          name: element.name,
          originalIndex: index,
          division: element.pdf.division
        };

        pdfData.pages.get(pageNumber).push(pageContent);
        
        // Actualizar total de páginas
        if (pageNumber > pdfData.totalPages) {
          pdfData.totalPages = pageNumber;
        }
      }
    });

    // Convertir Map a Array para el template
    pdfData.pagesArray = Array.from(pdfData.pages.entries())
      .sort(([a], [b]) => a - b)
      .map(([pageNumber, content]) => ({
        pageNumber,
        content
      }));

    return pdfData;
  }

  async getManualTemplate() {
    // Registrar helper para comparaciones
    Handlebars.registerHelper('eq', function(a, b) {
      return a === b;
    });

    const templatePath = path.join(this.templatesPath, 'manual-pdf.hbs');
    
    if (await fs.pathExists(templatePath)) {
      const templateContent = await fs.readFile(templatePath, 'utf8');
      return Handlebars.compile(templateContent);
    }

    // Crear template por defecto si no existe
    return await this.createManualTemplate();
  }

  async createManualTemplate() {
    const templateContent = `
<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{issue.title}}</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        
        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }

        .page-break {
            page-break-before: always;
        }

        .cover-page {
            text-align: center;
            padding: 4cm 2cm;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            color: white;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .cover-title {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .cover-subtitle {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }

        .cover-info {
            font-size: 1.2rem;
            margin-top: 2rem;
        }

        .article-page {
            padding: 2cm;
        }

        .article-header {
            text-align: center;
            margin-bottom: 2rem;
            border-bottom: 2px solid #1a1a2e;
            padding-bottom: 1rem;
        }

        .article-title {
            font-size: 2rem;
            color: #1a1a2e;
            margin-bottom: 0.5rem;
        }

        .article-authors {
            font-size: 1.2rem;
            color: #666;
            margin-bottom: 0.5rem;
        }

        .article-section {
            font-size: 1rem;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .content-element {
            margin-bottom: 1rem;
        }

        .content-element.title {
            font-size: 1.5rem;
            font-weight: bold;
            color: #1a1a2e;
            margin-top: 2rem;
            margin-bottom: 1rem;
        }

        .content-element.paragraph {
            text-align: justify;
            margin-bottom: 1rem;
        }

        .content-element.image {
            text-align: center;
            margin: 2rem 0;
        }

        .content-element.image img {
            max-width: 100%;
            height: auto;
        }

        .division-content {
            border-left: 3px solid #1a1a2e;
            padding-left: 1rem;
            margin: 1rem 0;
        }

        .division-content.current-page {
            background-color: #f8f9fa;
            padding: 1rem;
            border-radius: 4px;
        }

        .division-content.next-page {
            background-color: #e9ecef;
            padding: 1rem;
            border-radius: 4px;
            margin-top: 0.5rem;
        }

        .page-number {
            position: fixed;
            bottom: 1cm;
            right: 2cm;
            font-size: 0.9rem;
            color: #666;
        }

        .generated-info {
            position: fixed;
            bottom: 1cm;
            left: 2cm;
            font-size: 0.8rem;
            color: #999;
        }
    </style>
</head>
<body>
    <!-- Portada -->
    <div class="cover-page">
        <h1 class="cover-title">{{issue.title}}</h1>
        <p class="cover-subtitle">Generació Manual de PDF</p>
        <div class="cover-info">
            <p>Número {{issue.number}} - {{issue.year}}</p>
            <p>Generat el {{generatedAt}}</p>
        </div>
    </div>

    {{#each articles}}
    {{#each pdfData.pagesArray}}
    <div class="page-break">
        <div class="article-page">
            {{#if @first}}
            <div class="article-header">
                <h1 class="article-title">{{../title}}</h1>
                <p class="article-authors">{{#each ../authors}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}</p>
                <p class="article-section">{{../section}}</p>
            </div>
            {{/if}}

            <div class="page-number">Pàgina {{pageNumber}}</div>

            {{#each content}}
            <div class="content-element {{type}}">
                {{#if division}}
                    <div class="division-content current-page">
                        <strong>Contingut pàgina actual:</strong>
                        <div>{{division.contentPage}}</div>
                    </div>
                    {{#if division.contentNextPage}}
                    <div class="division-content next-page">
                        <strong>Contingut pàgina següent:</strong>
                        <div>{{division.contentNextPage}}</div>
                    </div>
                    {{/if}}
                {{else}}
                    {{#if (eq type 'title')}}
                        <h2>{{content}}</h2>
                    {{else if (eq type 'paragraph')}}
                        <p>{{content}}</p>
                    {{else if (eq type 'image')}}
                        <div class="image">
                            {{#if name}}<p><strong>{{name}}</strong></p>{{/if}}
                            <p><em>Imatge: {{content}}</em></p>
                        </div>
                    {{else}}
                        <p>{{content}}</p>
                    {{/if}}
                {{/if}}
            </div>
            {{/each}}
        </div>
    </div>
    {{/each}}
    {{/each}}

    <div class="generated-info">PDF generat manualment - {{generatedAt}}</div>
</body>
</html>`;

    const templatePath = path.join(this.templatesPath, 'manual-pdf.hbs');
    await fs.writeFile(templatePath, templateContent);
    console.log('📝 Template manual creado');

    return Handlebars.compile(templateContent);
  }

  async generatePDF(html, issueNumber) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfPath = path.join(this.outputPath, `revista-manual-${issueNumber}.pdf`);
      
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '2cm',
          right: '2cm',
          bottom: '2cm',
          left: '2cm'
        }
      });

      return pdfPath;
    } finally {
      await browser.close();
    }
  }

  async close() {
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const issueNumber = args.find(arg => arg.startsWith('--issue='))?.split('=')[1];
  
  if (!issueNumber) {
    console.log('❌ Uso: node generate-manual-pdf.js --issue=NUMERO');
    console.log('   Ejemplo: node generate-manual-pdf.js --issue=50');
    process.exit(1);
  }

  const generator = new ManualPDFGenerator();
  
  try {
    await generator.init();
    await generator.generateManualPDF(parseInt(issueNumber));
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  } finally {
    await generator.close();
  }
}

// Ejecutar si este archivo es ejecutado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ManualPDFGenerator;