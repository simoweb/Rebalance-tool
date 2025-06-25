# Sistema di Cambio Lingua - Rebalance Tool

## Panoramica

Il sistema implementa un cambio lingua completo che naviga fisicamente tra pagine HTML separate per ottimizzare la SEO, mantenendo al contempo la funzionalità React per l'interfaccia utente.

## Struttura dei File

```
public/
├── index.html          # Versione italiana (default)
├── index-en.html       # Versione inglese
├── _redirects          # Regole di redirect per Netlify
├── sitemap.xml         # Sitemap multilingua
└── robots.txt          # Configurazione per i motori di ricerca

src/
├── components/
│   └── LanguageSelector.js  # Componente per il cambio lingua
├── context/
│   └── LanguageContext.js   # Context per la gestione della lingua
└── translations/
    ├── it.json         # Traduzioni italiane
    ├── en.json         # Traduzioni inglesi
    └── index.js        # Configurazione e hook
```

## Come Funziona

### 1. **Rilevamento Automatico della Lingua**
- Il sistema rileva automaticamente la lingua dall'URL:
  - `/` → Italiano
  - `/en` → Inglese
- La lingua viene salvata nel localStorage per le visite successive

### 2. **Navigazione tra Pagine**
- Quando l'utente cambia lingua tramite il selettore, viene reindirizzato alla pagina corrispondente
- I parametri URL e gli anchor vengono preservati durante la navigazione

### 3. **Gestione React**
- L'app React si carica su entrambe le pagine
- Il `LanguageContext` rileva automaticamente la lingua dall'URL
- L'interfaccia si adatta alla lingua corretta

## URL Supportati

### Versione Italiana
- `https://rebalancetool.com/`
- `https://rebalancetool.com/?method=sell`
- `https://rebalancetool.com/#calcolatore`
- `https://rebalancetool.com/?method=sell#calcolatore`

### Versione Inglese
- `https://rebalancetool.com/en`
- `https://rebalancetool.com/en?method=sell`
- `https://rebalancetool.com/en#calcolatore`
- `https://rebalancetool.com/en?method=sell#calcolatore`

## Ottimizzazioni SEO

### Meta Tag
- **Title** e **Description** specifici per ogni lingua
- **Keywords** ottimizzate per ogni mercato
- **Open Graph** e **Twitter Cards** per social sharing
- **Hreflang** per indicare le versioni alternative
- **Canonical** per evitare contenuti duplicati

### Sitemap
- Include entrambe le versioni linguistiche
- Tag hreflang per indicare le alternative
- Priorità e frequenza di aggiornamento

### Robots.txt
- Permette l'indicizzazione completa
- Riferimento al sitemap
- Crawl-delay per non sovraccaricare il server

## Configurazione Hosting

### Netlify
Il file `_redirects` gestisce automaticamente il routing:
```
# Language redirects - preserve query parameters and hash
/en /index-en.html 200
/en/ /index-en.html 200

# Default redirect to Italian version - preserve query parameters and hash
/ /index.html 200

# Handle all other routes - preserve query parameters and hash
/* /index.html 200
```

### Altri Hosting
Adatta le regole di rewrite del tuo hosting per:
- `/en` → `index-en.html`
- `/` → `index.html`
- Preservare parametri URL e anchor

## Test del Sistema

Usa il file `test-language-switch.html` per testare:
1. Navigazione diretta tra le lingue
2. Preservazione dei parametri URL
3. Preservazione degli anchor
4. Combinazione di parametri e anchor

## Vantaggi

### SEO
- ✅ **Nessun contenuto duplicato** (grazie ai tag canonical e hreflang)
- ✅ **Indicizzazione ottimale** per entrambe le lingue
- ✅ **Social sharing** ottimizzato per ogni lingua
- ✅ **Sitemap** che aiuta i motori di ricerca
- ✅ **URL semantici** per ogni versione linguistica

### UX
- ✅ **Navigazione istantanea** tra le lingue
- ✅ **Preservazione dello stato** (parametri URL, anchor)
- ✅ **Rilevamento automatico** della lingua preferita
- ✅ **Interfaccia coerente** su entrambe le versioni

### Tecnico
- ✅ **Separazione delle responsabilità** (HTML per SEO, React per UX)
- ✅ **Facilità di manutenzione** (file separati per ogni lingua)
- ✅ **Scalabilità** (facile aggiungere nuove lingue)
- ✅ **Performance** (caricamento ottimizzato per ogni lingua)

## Aggiungere una Nuova Lingua

1. **Crea il file HTML**: `public/index-[codice].html`
2. **Aggiungi le traduzioni**: `src/translations/[codice].json`
3. **Configura la lingua**: Aggiungi in `src/translations/index.js`
4. **Aggiorna il routing**: Aggiungi regole in `public/_redirects`
5. **Aggiorna il sitemap**: Aggiungi la nuova URL in `public/sitemap.xml`

## Note Importanti

- **Build Process**: Assicurati che i file JavaScript React siano accessibili da entrambe le pagine HTML
- **Caching**: Configura il caching appropriato per i file statici
- **Analytics**: Configura Google Analytics per tracciare le diverse versioni linguistiche
- **Testing**: Testa sempre su un ambiente di staging prima del deploy in produzione 