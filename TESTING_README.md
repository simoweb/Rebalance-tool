# Test del Sistema di Cambio Lingua

## 🚀 Come Testare

### Opzione 1: Server di Sviluppo Webpack (Raccomandato)
```bash
npm start
```
- Apre automaticamente il browser su `http://localhost:8080`
- Il routing delle lingue è configurato tramite `historyApiFallback` in webpack.config.js
- Testa: `http://localhost:8080/en` per la versione inglese

### Opzione 2: Server di Test Express
```bash
npm run test-server
```
- Avvia un server Express su `http://localhost:3001`
- Gestisce manualmente il routing delle lingue
- Utile per testare il comportamento in produzione

### Opzione 3: File di Test Statico
Apri `test-routing.html` nel browser per testare i link di navigazione.

## 🧪 Test da Eseguire

### 1. Navigazione Base
- [ ] `http://localhost:8080/` → Versione italiana
- [ ] `http://localhost:8080/en` → Versione inglese

### 2. Test con Parametri URL
- [ ] `http://localhost:8080/?method=sell` → Italiano con parametri
- [ ] `http://localhost:8080/en?method=sell` → Inglese con parametri

### 3. Test con Anchor
- [ ] `http://localhost:8080/#calcolatore` → Italiano con anchor
- [ ] `http://localhost:8080/en#calcolatore` → Inglese con anchor

### 4. Test Completo
- [ ] `http://localhost:8080/?method=sell#calcolatore` → Italiano completo
- [ ] `http://localhost:8080/en?method=sell#calcolatore` → Inglese completo

### 5. Test del Selettore Lingua
- [ ] Clicca sul selettore lingua nella navbar
- [ ] Seleziona "English" → dovrebbe navigare a `/en`
- [ ] Seleziona "Italiano" → dovrebbe navigare a `/`

## 🔧 Risoluzione Problemi

### Errore "Cannot GET /en"
**Causa**: Il server di sviluppo non gestisce il routing delle lingue.

**Soluzioni**:
1. **Usa il server di test**: `npm run test-server`
2. **Verifica webpack.config.js**: Assicurati che `historyApiFallback` sia configurato
3. **Riavvia il server**: `npm start`

### Il selettore lingua non funziona
**Causa**: Il `LanguageSelector` non naviga correttamente.

**Verifica**:
1. Controlla la console del browser per errori JavaScript
2. Verifica che `window.location.href` funzioni
3. Controlla che il `LanguageContext` rilevi correttamente la lingua dall'URL

### La versione inglese non si carica
**Causa**: File `index-en.html` non trovato o JavaScript non caricato.

**Verifica**:
1. Controlla che `public/index-en.html` esista
2. Verifica che il riferimento a `bundle.js` sia corretto
3. Controlla la console per errori di caricamento

## 📁 File Importanti

- `webpack.config.js` - Configurazione routing sviluppo
- `public/_redirects` - Configurazione routing Netlify
- `netlify.toml` - Configurazione alternativa Netlify
- `test-server.js` - Server di test Express
- `public/index-en.html` - Versione inglese
- `src/components/LanguageSelector.js` - Componente cambio lingua
- `src/context/LanguageContext.js` - Context gestione lingua

## 🚀 Deploy in Produzione

### Netlify
Il sistema è configurato per funzionare automaticamente su Netlify:
- `_redirects` gestisce il routing
- `netlify.toml` fornisce configurazione alternativa

### Altri Hosting
Adatta le regole di rewrite del tuo hosting per:
- `/en` → `index-en.html`
- `/` → `index.html`
- Preservare parametri URL e anchor

## ✅ Checklist Completa

- [ ] Navigazione diretta funziona
- [ ] Parametri URL preservati
- [ ] Anchor preservati
- [ ] Selettore lingua funziona
- [ ] Rilevamento automatico lingua
- [ ] localStorage funziona
- [ ] Meta tag SEO corretti
- [ ] Sitemap aggiornata
- [ ] Robots.txt configurato
- [ ] Test su mobile
- [ ] Test su diversi browser 