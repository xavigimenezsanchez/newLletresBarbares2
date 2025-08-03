const { exec } = require('child_process');

console.log('🌐 Provant connexió de xarxa...');

// Probar ping a Google DNS
exec('ping -c 3 8.8.8.8', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ No hi ha connexió a Internet');
    return;
  }
  console.log('✅ Connexió a Internet OK');
  
  // Probar resolución DNS
  exec('nslookup cluster0.kx7ne.mongodb.net', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Problema de resolució DNS');
      console.log('💡 Prova:');
      console.log('   - Canviar DNS a 8.8.8.8 o 1.1.1.1');
      console.log('   - Verificar connexió VPN si en tens una');
    } else {
      console.log('✅ Resolució DNS OK');
      console.log('📡 MongoDB Atlas és accessible');
    }
  });
}); 