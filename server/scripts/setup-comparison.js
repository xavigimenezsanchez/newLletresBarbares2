#!/usr/bin/env node

/**
 * Script de configuración para preparar el entorno de comparación
 * Verifica conexiones y configuración antes de ejecutar la comparación
 */

const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

async function checkFileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function testConnection(uri, name) {
  try {
    console.log(`🔌 Probando conexión a ${name}...`);
    const connection = mongoose.createConnection(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000
    });

    await new Promise((resolve, reject) => {
      connection.once('open', resolve);
      connection.once('error', reject);
      
      // Timeout manual
      setTimeout(() => reject(new Error('Timeout de conexión')), 10000);
    });

    await connection.close();
    console.log(`✅ Conexión exitosa a ${name}`);
    return true;
  } catch (error) {
    console.log(`❌ Error conectando a ${name}: ${error.message}`);
    return false;
  }
}

async function checkCollectionExists(uri, collectionName, dbName) {
  try {
    const connection = mongoose.createConnection(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000
    });

    await new Promise((resolve, reject) => {
      connection.once('open', resolve);
      connection.once('error', reject);
    });

    const collections = await connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    const exists = collectionNames.includes(collectionName);
    
    if (exists) {
      const collection = connection.db.collection(collectionName);
      const count = await collection.countDocuments();
      console.log(`✅ Colección '${collectionName}' encontrada en ${dbName} (${count} documentos)`);
    } else {
      console.log(`❌ Colección '${collectionName}' NO encontrada en ${dbName}`);
      console.log(`   Colecciones disponibles: ${collectionNames.join(', ')}`);
    }

    await connection.close();
    return exists;
  } catch (error) {
    console.log(`❌ Error verificando colección en ${dbName}: ${error.message}`);
    return false;
  }
}

async function loadEnvVariables() {
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, 'comparison-env.example');
  
  console.log('📁 Verificando configuración...');
  
  const envExists = await checkFileExists(envPath);
  const envExampleExists = await checkFileExists(envExamplePath);
  
  if (!envExists) {
    console.log('❌ Archivo .env no encontrado');
    if (envExampleExists) {
      console.log(`💡 Copia ${envExamplePath} a ${envPath} y configúralo`);
    }
    return null;
  }
  
  console.log('✅ Archivo .env encontrado');
  
  // Cargar variables de entorno del archivo local
  const envContent = await fs.readFile(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return envVars;
}

async function main() {
  console.log('🚀 Configuración de comparación de bases de datos');
  console.log('='.repeat(60));
  
  // 1. Verificar estructura de directorios
  console.log('\n1️⃣ Verificando estructura de archivos...');
  
  const scriptsDir = __dirname;
  const mainScriptPath = path.join(scriptsDir, 'compare-databases.js');
  const testScriptPath = path.join(scriptsDir, 'test-comparison.js');
  
  const mainScriptExists = await checkFileExists(mainScriptPath);
  const testScriptExists = await checkFileExists(testScriptPath);
  
  if (!mainScriptExists) {
    console.log('❌ Script principal no encontrado: compare-databases.js');
    process.exit(1);
  }
  
  if (!testScriptExists) {
    console.log('❌ Script de prueba no encontrado: test-comparison.js');
    process.exit(1);
  }
  
  console.log('✅ Scripts encontrados');
  
  // 2. Cargar variables de entorno
  console.log('\n2️⃣ Cargando configuración...');
  
  const envVars = await loadEnvVariables();
  if (!envVars) {
    console.log('\n🔧 INSTRUCCIONES DE CONFIGURACIÓN:');
    console.log('='.repeat(60));
    console.log('1. Copia el archivo de ejemplo:');
    console.log('   cp comparison-env.example .env');
    console.log('2. Edita el archivo .env con las URIs correctas');
    console.log('3. Ejecuta este script nuevamente');
    process.exit(1);
  }
  
  const DB_OLD_URI = envVars.DB_OLD_URI;
  const DB_NEW_URI = envVars.MONGODB_URI;
  
  if (!DB_OLD_URI || !DB_NEW_URI) {
    console.log('❌ Variables de entorno faltantes:');
    if (!DB_OLD_URI) console.log('   - DB_OLD_URI');
    if (!DB_NEW_URI) console.log('   - MONGODB_URI');
    process.exit(1);
  }
  
  console.log('✅ Variables de entorno cargadas');
  
  // 3. Probar conexiones
  console.log('\n3️⃣ Probando conexiones...');
  
  const oldDbConnected = await testConnection(DB_OLD_URI, 'DBOld');
  const newDbConnected = await testConnection(DB_NEW_URI, 'DBNew');
  
  if (!oldDbConnected || !newDbConnected) {
    console.log('\n❌ Error en las conexiones de base de datos');
    console.log('\n🔧 POSIBLES SOLUCIONES:');
    console.log('='.repeat(60));
    console.log('1. Verifica que las URIs sean correctas');
    console.log('2. Comprueba las credenciales de acceso');
    console.log('3. Asegúrate de que las IPs estén en la whitelist');
    console.log('4. Verifica la conectividad de red');
    process.exit(1);
  }
  
  // 4. Verificar colecciones
  console.log('\n4️⃣ Verificando colecciones...');
  
  const oldCollectionExists = await checkCollectionExists(DB_OLD_URI, 'documents', 'DBOld');
  const newCollectionExists = await checkCollectionExists(DB_NEW_URI, 'articles', 'DBNew');
  
  if (!oldCollectionExists || !newCollectionExists) {
    console.log('\n❌ Colecciones faltantes');
    console.log('\n🔧 VERIFICAR:');
    console.log('='.repeat(60));
    if (!oldCollectionExists) {
      console.log('1. La colección "documents" existe en DBOld?');
    }
    if (!newCollectionExists) {
      console.log('2. La colección "articles" existe en DBNew?');
    }
    process.exit(1);
  }
  
  // 5. Todo configurado correctamente
  console.log('\n✅ CONFIGURACIÓN COMPLETA');
  console.log('='.repeat(60));
  console.log('Todo está configurado correctamente. Puedes ejecutar:');
  console.log('');
  console.log('🧪 Prueba pequeña (10 documentos):');
  console.log('   npm run test-compare');
  console.log('   node test-comparison.js');
  console.log('');
  console.log('🧪 Prueba grande (100 documentos):');
  console.log('   npm run test-compare:large');
  console.log('   node test-comparison.js 100');
  console.log('');
  console.log('🚀 Comparación completa:');
  console.log('   npm run compare-dbs');
  console.log('   node compare-databases.js');
  console.log('');
  console.log('📊 Recomendación: Empieza con la prueba pequeña.');
}

// Ejecutar si este archivo es ejecutado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Error durante la configuración:', error);
    process.exit(1);
  });
}

module.exports = { loadEnvVariables, testConnection, checkCollectionExists };