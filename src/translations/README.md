# Sistema di Traduzioni

Questo sistema permette di gestire le traduzioni del sito in modo semplice e scalabile.

## Struttura

```
src/translations/
├── index.js          # Configurazione e hook per le traduzioni
├── it.json           # Traduzioni in italiano
├── en.json           # Traduzioni in inglese
└── README.md         # Questo file
```

## Come utilizzare le traduzioni

### 1. Importare gli hook necessari

```javascript
import { useLanguage } from '../context/LanguageContext';
import { useTranslations } from '../translations';
```

### 2. Utilizzare le traduzioni in un componente

```javascript
const MyComponent = () => {
  const { language } = useLanguage();
  const { t } = useTranslations(language);
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.description')}</p>
    </div>
  );
};
```

### 3. Cambiare lingua

```javascript
const { changeLanguage } = useLanguage();

// Cambiare a inglese
changeLanguage('en');

// Cambiare a italiano
changeLanguage('it');
```

## Struttura delle chiavi di traduzione

Le traduzioni sono organizzate in sezioni logiche:

- `meta`: Metadati della pagina (titolo, descrizione)
- `navigation`: Elementi di navigazione
- `hero`: Sezione principale della homepage
- `features`: Caratteristiche del tool
- `whyRebalance`: Sezione "Perché ribilanciare"
- `calculator`: Tutto ciò che riguarda il calcolatore
- `disclaimer`: Messaggio di disclaimer
- `footer`: Footer del sito

### Esempio di struttura nidificata

```json
{
  "calculator": {
    "form": {
      "assetInputs": {
        "name": "Nome",
        "namePlaceholder": "es: VWCE"
      }
    }
  }
}
```

Per accedere a `namePlaceholder`: `t('calculator.form.assetInputs.namePlaceholder')`

## Aggiungere una nuova lingua

1. Creare un nuovo file JSON nella cartella `translations/` (es: `fr.json`)
2. Copiare la struttura da `it.json` e tradurre tutti i testi
3. Aggiungere la nuova lingua in `index.js`:

```javascript
export const languages = {
  it: { /* ... */ },
  en: { /* ... */ },
  fr: {
    name: 'Français',
    flag: '🇫🇷',
    translations: fr
  }
};
```

## Funzionalità

- **Rilevamento automatico della lingua del browser**
- **Salvataggio della preferenza nel localStorage**
- **Fallback alla lingua italiana se la lingua non è supportata**
- **Supporto per formattazione delle valute in base alla lingua**

## Note

- Le traduzioni vengono caricate dinamicamente
- Il sistema supporta chiavi nidificate usando la dot notation
- Se una chiave non viene trovata, viene mostrata la chiave stessa come fallback
- Le preferenze di lingua vengono salvate nel localStorage del browser 