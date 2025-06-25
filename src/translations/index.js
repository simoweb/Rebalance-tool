import it from './it.json';
import en from './en.json';

// Configurazione delle lingue disponibili
export const languages = {
  it: {
    name: 'Italiano',
    flag: '🇮🇹',
    translations: it
  },
  en: {
    name: 'English',
    flag: '🇺🇸',
    translations: en
  }
};

// Hook per gestire le traduzioni
export const useTranslations = (language = 'it') => {
  const translations = languages[language]?.translations || languages.it.translations;
  
  // Funzione per ottenere una traduzione usando dot notation
  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Ritorna la chiave se non trova la traduzione
      }
    }
    
    return value;
  };
  
  return { t, language, translations };
};

// Funzione per ottenere la lingua dal browser
export const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0];
  
  return languages[langCode] ? langCode : 'it';
};

// Funzione per salvare la lingua nel localStorage
export const saveLanguage = (language) => {
  localStorage.setItem('preferredLanguage', language);
};

// Funzione per ottenere la lingua salvata
export const getSavedLanguage = () => {
  return localStorage.getItem('preferredLanguage') || getBrowserLanguage();
};

export default languages; 