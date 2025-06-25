const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

// Servi i file statici dalla cartella public
app.use(express.static('public'));

// Gestione del routing delle lingue
app.get('/en', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index-en.html'));
});

app.get('/en/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index-en.html'));
});

// Tutti gli altri percorsi vanno a index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server di test avviato su http://localhost:${PORT}`);
    console.log(`🏠 Versione italiana: http://localhost:${PORT}/`);
    console.log(`🇬🇧 Versione inglese: http://localhost:${PORT}/en`);
    console.log(`🧪 Test routing: http://localhost:${PORT}/test-routing.html`);
}); 