#!/usr/bin/env node

const RevistaPDFGenerator = require('./generate-pdf.js');
const fs = require('fs-extra');
const path = require('path');

class MultiplePDFGenerator {
  constructor() {
    this.generator = new RevistaPDFGenerator();
    this.documentsPath = path.join(__dirname, '../client/documents');
  }

  async getAvailableIssues() {
    const issues = [];
    const years = await fs.readdir(this.documentsPath);
    
    for (const year of years.sort((a, b) => parseInt(b) - parseInt(a))) {
      if (!/^\d{4}$/.test(year)) continue;
      
      const yearPath = path.join(this.documentsPath, year);
      const issueNumbers = await fs.readdir(yearPath);
      
      for (const issueNumber of issueNumbers.sort((a, b) => parseInt(b) - parseInt(a))) {
        if (!/^\d+$/.test(issueNumber)) continue;
        
        const issuePath = path.join(yearPath, issueNumber);
        const issueJsonPath = path.join(issuePath, 'issue.json');
        
        if (await fs.pathExists(issueJsonPath)) {
          const issueData = await fs.readJson(issueJsonPath);
          issues.push({
            year: parseInt(year),
            number: parseInt(issueNumber),
            realNumber: issueData.number || parseInt(issueNumber),
            title: issueData.title,
            publicationDate: issueData.publicationDate,
            totalArticles: issueData.totalArticles
          });
        }
      }
    }
    
    return issues;
  }

  async generateLatestIssues(count = 5) {
    console.log(`📚 Buscando las últimas ${count} ediciones...`);
    
    const issues = await this.getAvailableIssues();
    const latestIssues = issues.slice(0, count);
    
    console.log(`📄 Encontradas ${latestIssues.length} ediciones recientes:`);
    latestIssues.forEach(issue => {
      console.log(`   - ${issue.year}/${issue.number} (${issue.title})`);
    });
    
    await this.generator.init();
    
    for (const issue of latestIssues) {
      try {
        console.log(`\\n🔄 Generando PDF para ${issue.year}/${issue.number}...`);
        await this.generator.generatePDF(issue.year, issue.number);
        console.log(`✅ Completado: ${issue.year}/${issue.number}`);
      } catch (error) {
        console.error(`❌ Error generando ${issue.year}/${issue.number}:`, error.message);
      }
    }
    
    console.log(`\\n🎉 Proceso completado. PDFs generados en: pdf-generator/output/`);
  }

  async generateYearRange(startYear, endYear) {
    console.log(`📚 Generando PDFs para el rango ${startYear}-${endYear}...`);
    
    const issues = await this.getAvailableIssues();
    const yearIssues = issues.filter(issue => 
      issue.year >= startYear && issue.year <= endYear
    );
    
    console.log(`📄 Encontradas ${yearIssues.length} ediciones en el rango:`);
    yearIssues.forEach(issue => {
      console.log(`   - ${issue.year}/${issue.number} (${issue.title})`);
    });
    
    await this.generator.init();
    
    for (const issue of yearIssues) {
      try {
        console.log(`\\n🔄 Generando PDF para ${issue.year}/${issue.number}...`);
        await this.generator.generatePDF(issue.year, issue.number);
        console.log(`✅ Completado: ${issue.year}/${issue.number}`);
      } catch (error) {
        console.error(`❌ Error generando ${issue.year}/${issue.number}:`, error.message);
      }
    }
    
    console.log(`\\n🎉 Proceso completado. PDFs generados en: pdf-generator/output/`);
  }

  async listAvailableIssues() {
    console.log('📚 Ediciones disponibles:\\n');
    
    const issues = await this.getAvailableIssues();
    let currentYear = null;
    
    for (const issue of issues) {
      if (currentYear !== issue.year) {
        currentYear = issue.year;
        console.log(`\\n📅 ${issue.year}:`);
      }
      
      const date = new Date(issue.publicationDate?.$date || issue.publicationDate || Date.now());
      console.log(`   - Número ${issue.number} (${date.toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' })}) - ${issue.totalArticles || 0} articles`);
    }
    
    console.log(`\\n📊 Total: ${issues.length} ediciones disponibles`);
  }
}

// Script principal
async function main() {
  const args = process.argv.slice(2);
  const generator = new MultiplePDFGenerator();

  try {
    if (args.includes('--list')) {
      await generator.listAvailableIssues();
    } else if (args.includes('--latest')) {
      const countArg = args.find(arg => arg.startsWith('--count='));
      const count = countArg ? parseInt(countArg.split('=')[1]) : 5;
      await generator.generateLatestIssues(count);
    } else if (args.includes('--year-range')) {
      const startArg = args.find(arg => arg.startsWith('--start='));
      const endArg = args.find(arg => arg.startsWith('--end='));
      
      if (!startArg || !endArg) {
        console.error('❌ Para usar --year-range necesitas --start=YYYY y --end=YYYY');
        process.exit(1);
      }
      
      const startYear = parseInt(startArg.split('=')[1]);
      const endYear = parseInt(endArg.split('=')[1]);
      
      await generator.generateYearRange(startYear, endYear);
    } else {
      console.log(`
🔧 Generador múltiple de PDFs para Lletres Bàrbares

Uso:
  node generate-multiple.js --list                          # Listar ediciones disponibles
  node generate-multiple.js --latest [--count=N]            # Generar últimas N ediciones (por defecto 5)
  node generate-multiple.js --year-range --start=YYYY --end=YYYY  # Generar rango de años

Ejemplos:
  node generate-multiple.js --list
  node generate-multiple.js --latest --count=3
  node generate-multiple.js --year-range --start=2023 --end=2024
      `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = MultiplePDFGenerator;