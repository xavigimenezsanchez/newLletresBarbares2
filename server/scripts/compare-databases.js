const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Esquema simple para la base de datos antigua (DBOld)
const oldDocumentSchema = new mongoose.Schema({
  issue: Number,
  data: String,
  text: mongoose.Schema.Types.Mixed,
  author: String,
  section: String,
  url: String,
  title: String
}, { strict: false });

// Modelo para la base de datos nueva (ya existe)
const Article = require('../models/Article');

// Configuración de conexiones
const DB_OLD_URI = process.env.DB_OLD_URI || 'mongodb://localhost:27017/old-database';
const DB_NEW_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lletres-barbares';

// Clase Logger para manejar salida a archivo y consola
class Logger {
  constructor(logFileName) {
    this.logPath = path.join(__dirname, logFileName);
    this.logStream = fs.createWriteStream(this.logPath, { flags: 'w' });
    this.startTime = new Date();
    
    // Escribir cabecera del log
    this.writeHeader();
  }

  writeHeader() {
    const header = [
      '='.repeat(80),
      `COMPARACIÓN DE BASES DE DATOS - ${this.startTime.toISOString()}`,
      `DBOld URI: ${DB_OLD_URI}`,
      `DBNew URI: ${DB_NEW_URI}`,
      '='.repeat(80),
      ''
    ].join('\n');
    
    this.logStream.write(header);
  }

  log(message, includeTimestamp = true, showInConsole = true) {
    const timestamp = includeTimestamp ? `[${new Date().toISOString()}] ` : '';
    const logMessage = `${timestamp}${message}\n`;
    
    // Escribir a consola solo si showInConsole es true
    if (showInConsole) {
      console.log(message);
    }
    
    // Siempre escribir a archivo (con timestamp)
    this.logStream.write(logMessage);
  }

  error(message) {
    const timestamp = `[${new Date().toISOString()}] `;
    const logMessage = `${timestamp}ERROR: ${message}\n`;
    
    console.error(`ERROR: ${message}`);
    this.logStream.write(logMessage);
  }

  section(title) {
    const separator = '='.repeat(60);
    const section = `\n${separator}\n${title}\n${separator}\n`;
    
    console.log(section);
    this.logStream.write(section);
  }

  subsection(title) {
    const separator = '-'.repeat(40);
    const subsection = `\n${separator}\n${title}\n${separator}\n`;
    
    console.log(subsection);
    this.logStream.write(subsection);
  }

  close() {
    const footer = [
      '',
      '='.repeat(80),
      `COMPARACIÓN COMPLETADA - ${new Date().toISOString()}`,
      `Duración: ${((new Date() - this.startTime) / 1000).toFixed(2)} segundos`,
      `Log guardado en: ${this.logPath}`,
      '='.repeat(80)
    ].join('\n');
    
    this.logStream.write(footer);
    this.logStream.end();
    
    console.log(`\n📄 Log completo guardado en: ${this.logPath}`);
  }
}

class DatabaseComparator {
  constructor(logFileName = 'comparison.log') {
    this.connectionOld = null;
    this.connectionNew = null;
    this.OldDocument = null;
    this.discrepancies = [];
    this.stats = {
      totalOldDocuments: 0,
      foundInNew: 0,
      notFoundInNew: 0,
      passedValidation: 0,
      failedValidation: 0
    };
    this.logger = new Logger(logFileName);
  }

  async connectToDatabases() {
    try {
      this.logger.log('🔌 Conectando a las bases de datos...');
      
      // Conexión a DBOld
      this.connectionOld = mongoose.createConnection(DB_OLD_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      // Conexión a DBNew
      this.connectionNew = mongoose.createConnection(DB_NEW_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      // Esperar a que las conexiones estén listas
      await Promise.all([
        new Promise((resolve, reject) => {
          this.connectionOld.once('open', resolve);
          this.connectionOld.once('error', reject);
        }),
        new Promise((resolve, reject) => {
          this.connectionNew.once('open', resolve);
          this.connectionNew.once('error', reject);
        })
      ]);

      // Crear modelo para DBOld
      this.OldDocument = this.connectionOld.model('Document', oldDocumentSchema, 'documents');
      
      // Crear modelo para DBNew
      this.NewArticle = this.connectionNew.model('Article', Article.schema, 'articles');

      this.logger.log('✅ Conectado exitosamente a ambas bases de datos');
    } catch (error) {
      this.logger.error(`❌ Error conectando a las bases de datos: ${error.message}`);
      throw error;
    }
  }

  async compareDocuments() {
    try {
      this.logger.section('🔍 INICIANDO COMPARACIÓN DE DOCUMENTOS');
      
      // Obtener todos los documentos de DBOld
      const oldDocuments = await this.OldDocument.find({});
      this.stats.totalOldDocuments = oldDocuments.length;
      
      this.logger.log(`📊 Total de documentos en DBOld: ${this.stats.totalOldDocuments}`);

      let processedCount = 0;
      
      for (const oldDoc of oldDocuments) {
        processedCount++;
        
        if (processedCount % 100 === 0) {
          this.logger.log(`⏳ Procesando documento ${processedCount}/${this.stats.totalOldDocuments}...`);
        }

        await this.compareDocument(oldDoc);
      }

      this.logger.log('✅ Comparación completada');
      this.printResults();
    } catch (error) {
      this.logger.error(`❌ Error durante la comparación: ${error.message}`);
      throw error;
    }
  }

  async compareDocument(oldDoc) {
    try {
      // Buscar el documento correspondiente en DBNew por URL
      const newDoc = await this.NewArticle.findOne({ url: oldDoc.url });

      if (!newDoc) {
        this.stats.notFoundInNew++;
        this.recordDiscrepancy(oldDoc, null, 'DOCUMENT_NOT_FOUND', 
          `Documento con URL '${oldDoc.url}' no encontrado en DBNew`);
        return;
      }

      this.stats.foundInNew++;

      // Realizar las validaciones específicas
      const validationResults = this.validateDocument(oldDoc, newDoc);
      
      if (validationResults.length === 0) {
        this.stats.passedValidation++;
      } else {
        this.stats.failedValidation++;
        validationResults.forEach(result => {
          this.recordDiscrepancy(oldDoc, newDoc, result.type, result.message);
        });
      }

    } catch (error) {
      this.recordDiscrepancy(oldDoc, null, 'COMPARISON_ERROR', 
        `Error al comparar documento: ${error.message}`);
    }
  }

  validateDocument(oldDoc, newDoc) {
    const errors = [];

    // Validación 1: old.issue === new.issueNumber
    if (oldDoc.issue !== newDoc.issueNumber) {
      errors.push({
        type: 'ISSUE_MISMATCH',
        message: `Issue no coincide: old.issue=${oldDoc.issue} vs new.issueNumber=${newDoc.issueNumber}`
      });
    }

    // Validación 2: old.data === new.data
    if (oldDoc.data !== newDoc.data) {
      errors.push({
        type: 'DATA_MISMATCH',
        message: `Data no coincide: old.data='${oldDoc.data}' vs new.data='${newDoc.data}'`
      });
    }

    // Validación 3: old.text.length === new.text.length
    const oldTextLength = Array.isArray(oldDoc.text) ? oldDoc.text.length : 0;
    const newTextLength = Array.isArray(newDoc.text) ? newDoc.text.length : 0;
    
    if (oldTextLength !== newTextLength) {
      errors.push({
        type: 'TEXT_LENGTH_MISMATCH',
        message: `Longitud del texto no coincide: old.text.length=${oldTextLength} vs new.text.length=${newTextLength}`
      });
    }

    // Validación 4: old.author === new.author
    if (oldDoc.author !== newDoc.author) {
      errors.push({
        type: 'AUTHOR_MISMATCH',
        message: `Author no coincide: old.author='${oldDoc.author}' vs new.author='${newDoc.author}'`
      });
    }

    // Validación 5: old.author === new.authors[0]
    const firstNewAuthor = Array.isArray(newDoc.authors) && newDoc.authors.length > 0 
      ? newDoc.authors[0] 
      : null;
    
    if (oldDoc.author !== firstNewAuthor) {
      errors.push({
        type: 'AUTHOR_FIRST_MISMATCH',
        message: `Author no coincide con primer elemento de authors: old.author='${oldDoc.author}' vs new.authors[0]='${firstNewAuthor}'`
      });
    }

    // Validación 6: old.section === new.section
    if (oldDoc.section !== newDoc.section) {
      errors.push({
        type: 'SECTION_MISMATCH',
        message: `Section no coincide: old.section='${oldDoc.section}' vs new.section='${newDoc.section}'`
      });
    }

    return errors;
  }

  recordDiscrepancy(oldDoc, newDoc, type, message) {
    this.discrepancies.push({
      url: oldDoc.url,
      title: oldDoc.title,
      type,
      message,
      oldData: {
        issue: oldDoc.issue,
        data: oldDoc.data,
        author: oldDoc.author,
        section: oldDoc.section,
        textLength: Array.isArray(oldDoc.text) ? oldDoc.text.length : 0
      },
      newData: newDoc ? {
        issueNumber: newDoc.issueNumber,
        data: newDoc.data,
        author: newDoc.author,
        authors: newDoc.authors,
        section: newDoc.section,
        textLength: Array.isArray(newDoc.text) ? newDoc.text.length : 0
      } : null
    });
  }

  printResults() {
    this.logger.section('📊 RESULTADOS DE LA COMPARACIÓN');
    this.logger.log(`Total de documentos en DBOld: ${this.stats.totalOldDocuments}`, false);
    this.logger.log(`Encontrados en DBNew: ${this.stats.foundInNew}`, false);
    this.logger.log(`No encontrados en DBNew: ${this.stats.notFoundInNew}`, false);
    this.logger.log(`Pasaron validación: ${this.stats.passedValidation}`, false);
    this.logger.log(`Fallaron validación: ${this.stats.failedValidation}`, false);
    this.logger.log(`Total de discrepancias: ${this.discrepancies.length}`, false);

    if (this.discrepancies.length > 0) {
      this.logger.section('🚨 DISCREPANCIAS ENCONTRADAS');
      
      // Agrupar discrepancias por tipo
      const discrepanciesByType = {};
      this.discrepancies.forEach(disc => {
        if (!discrepanciesByType[disc.type]) {
          discrepanciesByType[disc.type] = [];
        }
        discrepanciesByType[disc.type].push(disc);
      });

      Object.keys(discrepanciesByType).forEach(type => {
        this.logger.subsection(`${type}: ${discrepanciesByType[type].length} casos`);
        
        // En consola: mostrar solo primeros 3 ejemplos
        const consoleCases = discrepanciesByType[type].slice(0, 3);
        consoleCases.forEach((disc, index) => {
          console.log(`  ${index + 1}. URL: ${disc.url}`);
          console.log(`     Título: ${disc.title}`);
          console.log(`     Error: ${disc.message}`);
          if (index < consoleCases.length - 1) console.log('');
        });
        
        if (discrepanciesByType[type].length > 3) {
          console.log(`     ... y ${discrepanciesByType[type].length - 3} más casos (ver log completo).`);
        }
        
        // En archivo de log: mostrar TODOS los casos con detalles completos
        discrepanciesByType[type].forEach((disc, index) => {
          this.logger.log(`  ${index + 1}. URL: ${disc.url}`, false, false);
          this.logger.log(`     Título: ${disc.title}`, false, false);
          this.logger.log(`     Error: ${disc.message}`, false, false);
          
          // Añadir detalles completos en el log
          if (disc.oldData && disc.newData) {
            this.logger.log(`     Datos antiguos:`, false, false);
            Object.entries(disc.oldData).forEach(([key, value]) => {
              this.logger.log(`       ${key}: ${JSON.stringify(value)}`, false, false);
            });
            this.logger.log(`     Datos nuevos:`, false, false);
            Object.entries(disc.newData).forEach(([key, value]) => {
              this.logger.log(`       ${key}: ${JSON.stringify(value)}`, false, false);
            });
          } else if (disc.oldData) {
            this.logger.log(`     Datos antiguos:`, false, false);
            Object.entries(disc.oldData).forEach(([key, value]) => {
              this.logger.log(`       ${key}: ${JSON.stringify(value)}`, false, false);
            });
          }
          
          // Separador entre casos en el log
          if (index < discrepanciesByType[type].length - 1) {
            this.logger.log('     ' + '-'.repeat(60), false, false);
            this.logger.log('', false, false);
          }
        });
      });
    }

    // Calcular porcentajes
    const successRate = this.stats.totalOldDocuments > 0 
      ? ((this.stats.passedValidation / this.stats.foundInNew) * 100).toFixed(2)
      : '0.00';
    
    const foundRate = this.stats.totalOldDocuments > 0 
      ? ((this.stats.foundInNew / this.stats.totalOldDocuments) * 100).toFixed(2)
      : '0.00';

    this.logger.section('📈 ESTADÍSTICAS');
    this.logger.log(`Tasa de documentos encontrados: ${foundRate}%`, false);
    this.logger.log(`Tasa de éxito en validación: ${successRate}%`, false);
    
    // Añadir información sobre dónde encontrar los detalles completos
    if (this.discrepancies.length > 0) {
      this.logger.log('');
      this.logger.log('💡 INFORMACIÓN ADICIONAL:');
      this.logger.log(`📄 Detalles completos de TODAS las discrepancias en: ${this.logger.logPath}`);
      this.logger.log(`📊 Datos estructurados en: ${path.join(__dirname, 'comparison-report.json')}`);
    }
  }

  async saveDiscrepanciesToFile() {
    if (this.discrepancies.length === 0) {
      this.logger.log('✅ No hay discrepancias para guardar.');
      return;
    }

    const fs = require('fs').promises;
    const path = require('path');
    
    const reportPath = path.join(__dirname, 'comparison-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      discrepancies: this.discrepancies
    };

    try {
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      this.logger.log(`📄 Reporte JSON guardado en: ${reportPath}`);
    } catch (error) {
      this.logger.error(`❌ Error guardando el reporte: ${error.message}`);
    }
  }

  async closeDatabases() {
    try {
      if (this.connectionOld) {
        await this.connectionOld.close();
      }
      if (this.connectionNew) {
        await this.connectionNew.close();
      }
      this.logger.log('🔌 Conexiones cerradas');
      this.logger.close();
    } catch (error) {
      this.logger.error(`❌ Error cerrando conexiones: ${error.message}`);
      this.logger.close();
    }
  }
}

// Función principal
async function main() {
  // Generar nombre de archivo con timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const logFileName = `comparison-${timestamp}.log`;
  
  const comparator = new DatabaseComparator(logFileName);

  try {
    await comparator.connectToDatabases();
    await comparator.compareDocuments();
    await comparator.saveDiscrepanciesToFile();
  } catch (error) {
    comparator.logger.error(`💥 Error durante la ejecución: ${error.message}`);
    process.exit(1);
  } finally {
    await comparator.closeDatabases();
  }

  console.log('✅ Proceso completado exitosamente');
}

// Ejecutar si este archivo es ejecutado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseComparator;