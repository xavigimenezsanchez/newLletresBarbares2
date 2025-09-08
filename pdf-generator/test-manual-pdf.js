#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');

class TestManualPDFGenerator {
  constructor() {
    this.templatesPath = path.join(__dirname, 'templates');
    this.outputPath = path.join(__dirname, 'output');
  }

  async init() {
    // Crear directorios necesarios
    await fs.ensureDir(this.outputPath);
    await fs.ensureDir(this.templatesPath);
  }

  async generateTestPDF() {
    try {
      console.log('🧪 Generando PDF de prueba con datos simulados...');
      
      // Datos simulados de la edición 50
      const mockIssue = {
        _id: 'mock-issue-50',
        number: 50,
        year: 2025,
        title: 'Lletres Bàrbares - Número 50',
        description: 'Edición especial con generación manual',
        pdfManual: true,
        articlesOrder: ['article1', 'article2', 'article3']
      };

      const mockArticles = [
        {
          _id: 'article1',
          title: 'Artículo de Prueba 1',
          authors: ['Autor Prueba 1'],
          section: 'articles',
          text: [
            {
              type: 'title',
              content: 'Introducción al Artículo',
              pdf: { page: 1 }
            },
            {
              type: 'paragraph',
              content: 'Este es el primer párrafo del artículo que aparece en la página 1.',
              pdf: { page: 1 }
            },
            {
              type: 'paragraph',
              content: 'Este párrafo está dividido entre páginas.',
              pdf: { 
                page: 1,
                division: {
                  contentPage: 'Esta parte del párrafo aparece en la página actual.',
                  contentNextPage: 'Y esta parte continúa en la página siguiente.',
                  alignLast: true
                }
              }
            },
            {
              type: 'title',
              content: 'Segunda Sección',
              pdf: { page: 2 }
            },
            {
              type: 'paragraph',
              content: 'Contenido de la segunda página del artículo.',
              pdf: { page: 2 }
            }
          ]
        },
        {
          _id: 'article2',
          title: 'Artículo de Prueba 2',
          authors: ['Autor Prueba 2'],
          section: 'creacio',
          text: [
            {
              type: 'title',
              content: 'Poesía Experimental',
              pdf: { page: 3 }
            },
            {
              type: 'paragraph',
              content: 'Contenido poético que aparece en la página 3.',
              pdf: { page: 3 }
            }
          ]
        }
      ];

      // Generar HTML con los datos simulados
      const html = await this.generateHTML(mockIssue, mockArticles);
      
      // Generar PDF
      const pdfPath = await this.generatePDF(html, 50);
      
      console.log(`✅ PDF de prueba generado exitosamente: ${pdfPath}`);
      return pdfPath;

    } catch (error) {
      console.error('❌ Error generando PDF de prueba:', error.message);
      throw error;
    }
  }

  async generateHTML(issue, articles) {
    const template = await this.getManualTemplate();
    
    // Procesar cada artículo y extraer datos del campo pdf
    const processedArticles = articles.map(article => {
      const pdfData = this.extractPDFData(article);
      return {
        ...article,
        pdfData
      };
    });

    const html = template({
      issue: issue,
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
      
      const pdfPath = path.join(this.outputPath, `revista-manual-test-${issueNumber}.pdf`);
      
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
}

// Función principal
async function main() {
  const generator = new TestManualPDFGenerator();
  
  try {
    await generator.init();
    await generator.generateTestPDF();
    console.log('🎉 ¡PDF de prueba generado exitosamente!');
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar si este archivo es ejecutado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestManualPDFGenerator;