#!/usr/bin/env node

/**
 * Script de prueba para comparar una muestra pequeña de documentos
 * Útil para probar la configuración antes de ejecutar la comparación completa
 */

const DatabaseComparator = require('./compare-databases');

class TestDatabaseComparator extends DatabaseComparator {
  constructor(sampleSize = 10) {
    // Generar nombre de archivo de log específico para tests
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const logFileName = `test-comparison-${sampleSize}-${timestamp}.log`;
    
    super(logFileName);
    this.sampleSize = sampleSize;
  }

  async compareDocuments() {
    try {
      this.logger.section(`🧪 COMPARACIÓN DE PRUEBA (${this.sampleSize} documentos)`);
      
      // Obtener solo una muestra pequeña de documentos
      const oldDocuments = await this.OldDocument.find({}).limit(this.sampleSize);
      this.stats.totalOldDocuments = oldDocuments.length;
      
      this.logger.log(`📊 Documentos de prueba: ${this.stats.totalOldDocuments}`);

      if (this.stats.totalOldDocuments === 0) {
        this.logger.log('⚠️  No se encontraron documentos en DBOld');
        return;
      }

      for (const oldDoc of oldDocuments) {
        this.logger.log(`🔍 Comparando: ${oldDoc.url}`);
        await this.compareDocument(oldDoc);
      }

      this.logger.log('✅ Prueba completada');
      this.printResults();
    } catch (error) {
      this.logger.error(`❌ Error durante la prueba: ${error.message}`);
      throw error;
    }
  }

  printResults() {
    this.logger.section('🧪 RESULTADOS DE LA PRUEBA');
    this.logger.log(`Documentos de prueba: ${this.stats.totalOldDocuments}`, false);
    this.logger.log(`Encontrados en DBNew: ${this.stats.foundInNew}`, false);
    this.logger.log(`No encontrados en DBNew: ${this.stats.notFoundInNew}`, false);
    this.logger.log(`Pasaron validación: ${this.stats.passedValidation}`, false);
    this.logger.log(`Fallaron validación: ${this.stats.failedValidation}`, false);
    this.logger.log(`Total de discrepancias: ${this.discrepancies.length}`, false);

    if (this.discrepancies.length > 0) {
      this.logger.section('🚨 DISCREPANCIAS ENCONTRADAS EN LA PRUEBA');
      
      this.discrepancies.forEach((disc, index) => {
        this.logger.subsection(`${index + 1}. ${disc.type}`);
        this.logger.log(`   URL: ${disc.url}`, false);
        this.logger.log(`   Título: ${disc.title}`, false);
        this.logger.log(`   Error: ${disc.message}`, false);
        
        if (disc.oldData && disc.newData) {
          this.logger.log(`   Datos antiguos: ${JSON.stringify(disc.oldData)}`, false);
          this.logger.log(`   Datos nuevos: ${JSON.stringify(disc.newData)}`, false);
        }
      });
    } else {
      this.logger.log('✅ ¡No se encontraron discrepancias en la muestra!');
    }

    // Proyección de resultados
    if (this.stats.totalOldDocuments > 0) {
      const successRate = this.stats.foundInNew > 0 
        ? ((this.stats.passedValidation / this.stats.foundInNew) * 100).toFixed(2)
        : '0.00';
      
      const foundRate = ((this.stats.foundInNew / this.stats.totalOldDocuments) * 100).toFixed(2);
      
      this.logger.section('📊 PROYECCIÓN BASADA EN LA MUESTRA');
      this.logger.log(`Tasa de documentos encontrados: ${foundRate}%`, false);
      this.logger.log(`Tasa de éxito en validación: ${successRate}%`, false);
      
      if (this.stats.totalOldDocuments < 50) {
        this.logger.log('⚠️  ADVERTENCIA: Muestra pequeña, los resultados pueden no ser representativos');
      }
    }
  }
}

async function testComparison(sampleSize) {
  const size = sampleSize || parseInt(process.argv[2]) || 10;
  
  const comparator = new TestDatabaseComparator(size);

  try {
    await comparator.connectToDatabases();
    await comparator.compareDocuments();
    
    comparator.logger.section('💡 PRÓXIMOS PASOS');
    
    if (comparator.discrepancies.length === 0) {
      comparator.logger.log('✅ La configuración parece correcta.');
      comparator.logger.log('   Puedes ejecutar la comparación completa con:');
      comparator.logger.log('   node compare-databases.js');
    } else {
      comparator.logger.log('⚠️  Se encontraron discrepancias en la muestra.');
      comparator.logger.log('   Revisa los resultados antes de ejecutar la comparación completa.');
      comparator.logger.log('   Para una muestra más grande usa:');
      comparator.logger.log(`   node test-comparison.js 50`);
    }
    
  } catch (error) {
    comparator.logger.error(`💥 Error durante la prueba: ${error.message}`);
    
    comparator.logger.section('🔧 POSIBLES SOLUCIONES');
    comparator.logger.log('1. Verifica las URIs de las bases de datos en el archivo .env');
    comparator.logger.log('2. Asegúrate de que las credenciales sean correctas');
    comparator.logger.log('3. Comprueba la conectividad de red');
    comparator.logger.log('4. Verifica que las colecciones "documents" y "articles" existan');
    
    process.exit(1);
  } finally {
    await comparator.closeDatabases();
  }

  console.log('✅ Prueba completada');
}

// Ejecutar si este archivo es ejecutado directamente
if (require.main === module) {
  testComparison().catch(console.error);
}

module.exports = TestDatabaseComparator;