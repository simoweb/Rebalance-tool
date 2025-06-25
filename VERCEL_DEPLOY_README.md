# Deploy su Vercel - Sistema Multilingua

## 🚀 Configurazione Vercel

### File di Configurazione Creati

1. **`vercel.json`** - Configurazione principale per Vercel
2. **`.vercelignore`** - File da escludere dal deploy
3. **Script `vercel-build`** - Comando di build per Vercel

### Configurazione Routing

Il file `vercel.json` configura il routing per:
- `/en` → `index-en.html` (versione inglese)
- `/en/*` → `index-en.html` (qualsiasi percorso sotto /en)
- `/*` → `index.html` (tutti gli altri percorsi)

## 📋 Passi per il Deploy

### 1. Build Locale (Test)
```bash
npm run build
```
Verifica che nella cartella `public/` siano presenti:
- ✅ `index.html`
- ✅ `index-en.html`
- ✅ `bundle.js`
- ✅ `favicon.svg`

### 2. Deploy su Vercel
```bash
# Se non hai Vercel CLI installato
npm i -g vercel

# Deploy
vercel

# Oppure deploy di produzione
vercel --prod
```

### 3. Configurazione Vercel Dashboard

Se usi il dashboard di Vercel:
1. Vai su [vercel.com](https://vercel.com)
2. Importa il repository
3. Configura:
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `public`
   - **Install Command**: `npm install`

## 🧪 Test del Deploy

### Test Locali
```bash
# Test con server locale
npm run test-server

# Test con server di debug
npm run debug-server
```

### Test su Vercel
1. Apri il file `vercel-test.html` nel browser
2. Testa i link di navigazione
3. Verifica che `/en` carichi la versione inglese

## 🔧 Risoluzione Problemi

### Errore 404 su /en
**Possibili cause:**
1. File `index-en.html` non presente nel deploy
2. Configurazione `vercel.json` non corretta
3. Build non completato correttamente

**Soluzioni:**
1. Verifica che `index-en.html` sia nella cartella `public/`
2. Controlla la configurazione in `vercel.json`
3. Riavvia il deploy su Vercel

### File non trovati
**Verifica:**
1. Controlla che tutti i file siano nella cartella `public/`
2. Verifica che `.vercelignore` non escluda file necessari
3. Controlla i log di build su Vercel

### Routing non funziona
**Debug:**
1. Usa `vercel-test.html` per testare
2. Controlla la console del browser
3. Verifica che `vercel.json` sia nella root del progetto

## 📁 Struttura File per Vercel

```
rebalance-tool/
├── public/
│   ├── index.html          # Versione italiana
│   ├── index-en.html       # Versione inglese
│   ├── bundle.js           # JavaScript bundle
│   ├── favicon.svg         # Favicon
│   └── ...                 # Altri file statici
├── src/
│   └── ...                 # Codice sorgente
├── vercel.json             # Configurazione Vercel
├── .vercelignore           # File da ignorare
├── package.json            # Script di build
└── webpack.config.js       # Configurazione build
```

## ✅ Checklist Deploy

- [ ] File `vercel.json` configurato correttamente
- [ ] Script `vercel-build` aggiunto al `package.json`
- [ ] File `.vercelignore` creato
- [ ] Build locale funziona (`npm run build`)
- [ ] File `index-en.html` presente in `public/`
- [ ] Deploy su Vercel completato
- [ ] Test `/en` funziona
- [ ] Test selettore lingua funziona
- [ ] Test parametri URL preservati
- [ ] Test anchor preservati

## 🎯 URL di Test

Dopo il deploy, testa questi URL:
- `https://tuo-dominio.vercel.app/` → Versione italiana
- `https://tuo-dominio.vercel.app/en` → Versione inglese
- `https://tuo-dominio.vercel.app/?test=1` → Italiano con parametri
- `https://tuo-dominio.vercel.app/en?test=1` → Inglese con parametri

## 🔄 Aggiornamenti

Per aggiornare il sito:
1. Fai commit delle modifiche
2. Push su GitHub
3. Vercel farà automaticamente un nuovo deploy
4. Testa le modifiche

## 📞 Supporto

Se hai problemi:
1. Controlla i log di build su Vercel
2. Usa `vercel-test.html` per debug
3. Verifica la configurazione in `vercel.json`
4. Controlla che tutti i file siano presenti 