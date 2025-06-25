const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3002;

// Middleware per loggare tutte le richieste
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url}`);
    next();
});

// Servi i file statici dalla cartella public
app.use(express.static('public'));

// Gestione specifica per /en
app.get('/en', (req, res) => {
    console.log('🎯 Gestendo /en');
    const filePath = path.join(__dirname, 'public', 'index-en.html');
    
    if (fs.existsSync(filePath)) {
        console.log('✅ File index-en.html trovato');
        res.sendFile(filePath);
    } else {
        console.log('❌ File index-en.html NON trovato');
        res.status(404).send('File index-en.html non trovato');
    }
});

app.get('/en/*', (req, res) => {
    console.log('🎯 Gestendo /en/*');
    const filePath = path.join(__dirname, 'public', 'index-en.html');
    
    if (fs.existsSync(filePath)) {
        console.log('✅ File index-en.html trovato');
        res.sendFile(filePath);
    } else {
        console.log('❌ File index-en.html NON trovato');
        res.status(404).send('File index-en.html non trovato');
    }
});

// Tutti gli altri percorsi vanno a index.html
app.get('*', (req, res) => {
    console.log('🎯 Gestendo percorso generico:', req.url);
    const filePath = path.join(__dirname, 'public', 'index.html');
    
    if (fs.existsSync(filePath)) {
        console.log('✅ File index.html trovato');
        res.sendFile(filePath);
    } else {
        console.log('❌ File index.html NON trovato');
        res.status(404).send('File index.html non trovato');
    }
});

app.listen(PORT, () => {
    console.log(`🔍 Server di debug avviato su http://localhost:${PORT}`);
    console.log(`🏠 Versione italiana: http://localhost:${PORT}/`);
    console.log(`🇬🇧 Versione inglese: http://localhost:${PORT}/en`);
    console.log(`🧪 Test semplice: http://localhost:${PORT}/test-simple.html`);
    
    // Verifica che i file esistano
    const files = ['index.html', 'index-en.html', 'bundle.js'];
    files.forEach(file => {
        const filePath = path.join(__dirname, 'public', file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file} trovato`);
        } else {
            console.log(`❌ ${file} NON trovato`);
        }
    });
}); 