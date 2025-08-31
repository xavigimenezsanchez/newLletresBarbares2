#!/usr/bin/env node

/**
 * Script para gestionar archivos de log de comparación
 */

const fs = require('fs').promises;
const path = require('path');

class LogManager {
  constructor() {
    this.scriptsDir = __dirname;
  }

  async listLogs() {
    try {
      const files = await fs.readdir(this.scriptsDir);
      const logFiles = files.filter(file => 
        file.endsWith('.log') && 
        (file.startsWith('comparison-') || file.startsWith('test-comparison-'))
      );

      if (logFiles.length === 0) {
        console.log('📂 No se encontraron archivos de log');
        return;
      }

      console.log('📂 ARCHIVOS DE LOG ENCONTRADOS:');
      console.log('='.repeat(50));

      const logInfo = await Promise.all(logFiles.map(async (file) => {
        const filePath = path.join(this.scriptsDir, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime,
          sizeFormatted: this.formatBytes(stats.size)
        };
      }));

      // Ordenar por fecha de modificación (más reciente primero)
      logInfo.sort((a, b) => b.modified - a.modified);

      logInfo.forEach((log, index) => {
        const dateStr = log.modified.toLocaleString('es-ES');
        console.log(`${index + 1}. ${log.name}`);
        console.log(`   📅 ${dateStr}`);
        console.log(`   📏 ${log.sizeFormatted}`);
        console.log('');
      });

      return logInfo;
    } catch (error) {
      console.error('❌ Error listando logs:', error.message);
    }
  }

  async viewLog(fileName) {
    try {
      const filePath = path.join(this.scriptsDir, fileName);
      const content = await fs.readFile(filePath, 'utf8');
      
      console.log(`📄 CONTENIDO DE ${fileName}:`);
      console.log('='.repeat(80));
      console.log(content);
    } catch (error) {
      console.error(`❌ Error leyendo ${fileName}:`, error.message);
    }
  }

  async cleanOldLogs(daysOld = 7) {
    try {
      const files = await fs.readdir(this.scriptsDir);
      const logFiles = files.filter(file => 
        file.endsWith('.log') && 
        (file.startsWith('comparison-') || file.startsWith('test-comparison-'))
      );

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let deletedCount = 0;

      for (const file of logFiles) {
        const filePath = path.join(this.scriptsDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          console.log(`🗑️  Eliminado: ${file}`);
          deletedCount++;
        }
      }

      if (deletedCount === 0) {
        console.log(`✅ No hay logs más antiguos de ${daysOld} días para eliminar`);
      } else {
        console.log(`✅ Eliminados ${deletedCount} archivos de log antiguos`);
      }
    } catch (error) {
      console.error('❌ Error limpiando logs:', error.message);
    }
  }

  async getLogsSummary() {
    try {
      const logs = await this.listLogs();
      if (!logs || logs.length === 0) return;

      const totalSize = logs.reduce((sum, log) => sum + log.size, 0);
      const comparisonLogs = logs.filter(log => log.name.startsWith('comparison-'));
      const testLogs = logs.filter(log => log.name.startsWith('test-comparison-'));

      console.log('📊 RESUMEN DE LOGS:');
      console.log('='.repeat(50));
      console.log(`Total de archivos: ${logs.length}`);
      console.log(`Comparaciones completas: ${comparisonLogs.length}`);
      console.log(`Pruebas: ${testLogs.length}`);
      console.log(`Tamaño total: ${this.formatBytes(totalSize)}`);
      
      if (logs.length > 0) {
        console.log(`Más reciente: ${logs[0].modified.toLocaleString('es-ES')}`);
        console.log(`Más antiguo: ${logs[logs.length - 1].modified.toLocaleString('es-ES')}`);
      }
    } catch (error) {
      console.error('❌ Error generando resumen:', error.message);
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

async function main() {
  const manager = new LogManager();
  const command = process.argv[2];
  const param = process.argv[3];

  switch (command) {
    case 'list':
      await manager.listLogs();
      break;
    
    case 'view':
      if (!param) {
        console.log('❌ Uso: node manage-logs.js view <nombre-archivo>');
        process.exit(1);
      }
      await manager.viewLog(param);
      break;
    
    case 'clean':
      const days = param ? parseInt(param) : 7;
      if (isNaN(days)) {
        console.log('❌ El número de días debe ser un número válido');
        process.exit(1);
      }
      await manager.cleanOldLogs(days);
      break;
    
    case 'summary':
      await manager.getLogsSummary();
      break;
    
    default:
      console.log('📋 GESTOR DE LOGS DE COMPARACIÓN');
      console.log('='.repeat(50));
      console.log('Comandos disponibles:');
      console.log('');
      console.log('📂 node manage-logs.js list');
      console.log('   Lista todos los archivos de log');
      console.log('');
      console.log('📄 node manage-logs.js view <archivo>');
      console.log('   Muestra el contenido de un archivo de log');
      console.log('');
      console.log('🗑️  node manage-logs.js clean [días]');
      console.log('   Elimina logs más antiguos de X días (por defecto 7)');
      console.log('');
      console.log('📊 node manage-logs.js summary');
      console.log('   Muestra resumen de todos los logs');
      console.log('');
      console.log('Ejemplos:');
      console.log('  node manage-logs.js list');
      console.log('  node manage-logs.js view comparison-2024-01-15.log');
      console.log('  node manage-logs.js clean 3');
      console.log('  node manage-logs.js summary');
      break;
  }
}

// Ejecutar si este archivo es ejecutado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = LogManager;