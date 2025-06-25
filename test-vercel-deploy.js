const fs = require('fs');
const path = require('path');

console.log('🔍 Test Configurazione Vercel Deploy\n');

// Test 1: Verifica file di configurazione
console.log('1. Verifica file di configurazione:');
const configFiles = ['vercel.json', '.vercelignore', 'package.json'];
configFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file} trovato`);
    } else {
        console.log(`   ❌ ${file} NON trovato`);
    }
});

// Test 2: Verifica build
console.log('\n2. Verifica build:');
const publicDir = 'public';
const requiredFiles = ['index.html', 'index-en.html', 'bundle.js', 'styles.css', 'favicon.svg'];

if (fs.existsSync(publicDir)) {
    console.log(`   ✅ Cartella ${publicDir} trovata`);
    requiredFiles.forEach(file => {
        const filePath = path.join(publicDir, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            console.log(`   ✅ ${file} trovato (${(stats.size / 1024).toFixed(1)}KB)`);
        } else {
            console.log(`   ❌ ${file} NON trovato`);
        }
    });
} else {
    console.log(`   ❌ Cartella ${publicDir} NON trovata`);
}

// Test 3: Verifica contenuto vercel.json
console.log('\n3. Verifica contenuto vercel.json:');
try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    console.log('   ✅ vercel.json è JSON valido');
    
    if (vercelConfig.builds && vercelConfig.builds.length > 0) {
        console.log('   ✅ Configurazione builds presente');
    } else {
        console.log('   ❌ Configurazione builds mancante');
    }
    
    if (vercelConfig.rewrites && vercelConfig.rewrites.length > 0) {
        console.log('   ✅ Configurazione rewrites presente');
        vercelConfig.rewrites.forEach((rewrite, index) => {
            console.log(`   📝 Rewrite ${index + 1}: ${rewrite.source} → ${rewrite.destination}`);
        });
    } else {
        console.log('   ❌ Configurazione rewrites mancante');
    }
} catch (error) {
    console.log(`   ❌ Errore nel parsing vercel.json: ${error.message}`);
}

// Test 4: Verifica package.json
console.log('\n4. Verifica package.json:');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('   ✅ package.json è JSON valido');
    
    if (packageJson.scripts && packageJson.scripts.build) {
        console.log('   ✅ Script build presente');
    } else {
        console.log('   ❌ Script build mancante');
    }
    
    if (packageJson.vercel) {
        console.log('   ✅ Configurazione Vercel presente');
    } else {
        console.log('   ⚠️ Configurazione Vercel mancante (opzionale)');
    }
} catch (error) {
    console.log(`   ❌ Errore nel parsing package.json: ${error.message}`);
}

// Test 5: Verifica dimensione bundle
console.log('\n5. Verifica dimensione bundle:');
const bundlePath = path.join(publicDir, 'bundle.js');
if (fs.existsSync(bundlePath)) {
    const stats = fs.statSync(bundlePath);
    const sizeKB = stats.size / 1024;
    console.log(`   📦 Bundle size: ${sizeKB.toFixed(1)}KB`);
    
    if (sizeKB > 500) {
        console.log('   ⚠️ Bundle molto grande (>500KB) - potrebbe causare problemi');
    } else {
        console.log('   ✅ Bundle size accettabile');
    }
} else {
    console.log('   ❌ Bundle non trovato');
}

console.log('\n🎯 Risultato finale:');
console.log('Se tutti i test sono ✅, il deploy dovrebbe funzionare.');
console.log('Se ci sono ❌, risolvi i problemi prima del deploy.');
console.log('\n📋 Prossimi passi:');
console.log('1. vercel --prod');
console.log('2. Testa https://tuo-dominio.vercel.app/en');
console.log('3. Se non funziona, controlla i log su Vercel Dashboard'); 