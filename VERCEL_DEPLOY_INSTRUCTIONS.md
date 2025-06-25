# 🚀 Deploy su Vercel - Istruzioni

## ✅ Configurazione Completata

Tutti i file sono configurati correttamente:
- ✅ `vercel.json` - Routing semplificato
- ✅ `package.json` - Script di build
- ✅ `.vercelignore` - File da escludere
- ✅ `public/` - File di build pronti

## 📋 Passi per il Deploy

### 1. **Verifica Build Locale**
```bash
npm run build
```
Assicurati che tutti i file siano in `public/`:
- `index.html` (24KB)
- `index-en.html` (37KB)
- `bundle.js` (369KB)
- `styles.css` (36KB)
- `favicon.svg` (320B)

### 2. **Deploy su Vercel**

#### Opzione A: Vercel CLI
```bash
# Installa Vercel CLI (se non già installato)
npm i -g vercel

# Deploy
vercel

# Oppure deploy di produzione
vercel --prod
```

#### Opzione B: Dashboard Vercel
1. Vai su [vercel.com](https://vercel.com)
2. Importa il repository GitHub
3. Configura:
   - **Framework Preset**: `Other`
   - **Build Command**: `npm run build`
   - **Output Directory**: `public`
   - **Install Command**: `npm install`

### 3. **Configurazione Automatica**
Vercel dovrebbe rilevare automaticamente:
- Il comando di build dal `package.json`
- La cartella di output (`public`)
- Le regole di routing dal `vercel.json`

## 🧪 Test del Deploy

Dopo il deploy, testa questi URL:
- `https://tuo-dominio.vercel.app/` → Versione italiana
- `https://tuo-dominio.vercel.app/en` → Versione inglese
- `https://tuo-dominio.vercel.app/?test=1` → Con parametri
- `https://tuo-dominio.vercel.app/en?test=1` → Inglese con parametri

## 🔧 Risoluzione Problemi

### Se il deploy fallisce:

1. **Controlla i log di build** su Vercel Dashboard
2. **Verifica che Node.js sia supportato** (versione 18+)
3. **Controlla che tutti i file siano presenti** in `public/`
4. **Riprova con configurazione minima** (solo `vercel.json` con rewrites)

### Se `/en` non funziona:

1. **Verifica che `index-en.html` sia nel deploy**
2. **Controlla che le regole di rewrite siano attive**
3. **Testa l'accesso diretto** a `/index-en.html`
4. **Controlla la console del browser** per errori

### Se i file non si caricano:

1. **Verifica che `bundle.js` e `styles.css` siano presenti**
2. **Controlla che i riferimenti nei file HTML siano corretti**
3. **Verifica che `.vercelignore` non escluda file necessari**

## 📊 Configurazione Attuale

### `vercel.json` (Semplificato)
```json
{
  "rewrites": [
    {
      "source": "/en",
      "destination": "/index-en.html"
    },
    {
      "source": "/en/(.*)",
      "destination": "/index-en.html"
    }
  ]
}
```

### `package.json` (Script)
```json
{
  "scripts": {
    "build": "NODE_ENV=production webpack --mode production",
    "vercel-build": "npm run build"
  }
}
```

## 🎯 Risultato Atteso

Dopo un deploy riuscito:
- ✅ `/` → Carica `index.html` (versione italiana)
- ✅ `/en` → Carica `index-en.html` (versione inglese)
- ✅ `/en/qualsiasi-cosa` → Carica `index-en.html`
- ✅ Parametri URL e anchor preservati
- ✅ Selettore lingua funziona correttamente

## 📞 Supporto

Se continui ad avere problemi:
1. Controlla i log dettagliati su Vercel Dashboard
2. Usa `node test-vercel-deploy.js` per verificare la configurazione
3. Prova a deployare solo i file statici senza build
4. Contatta il supporto Vercel se necessario 