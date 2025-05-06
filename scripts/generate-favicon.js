const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/favicon.svg'));

sharp(svgBuffer)
  .resize(32, 32)
  .png()
  .toFile(path.join(__dirname, '../public/favicon.png'))
  .then(() => console.log('Favicon PNG generata con successo'))
  .catch(err => console.error('Errore nella generazione della favicon PNG:', err)); 