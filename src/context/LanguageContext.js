import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSavedLanguage, saveLanguage } from '../translations';

const LanguageContext = createContext();

// Evento personalizzato per sincronizzare la lingua tra le istanze
const LANGUAGE_CHANGE_EVENT = 'languageChange';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('it');

  useEffect(() => {
    const savedLang = getSavedLanguage();
    setLanguage(savedLang);

    // Ascolta i cambiamenti di lingua da altre istanze
    const handleLanguageChange = (event) => {
      const newLanguage = event.detail.language;
      setLanguage(newLanguage);
    };

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);

    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);
    };
  }, []);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    saveLanguage(newLanguage);
    
    // Notifica altre istanze del cambio di lingua
    window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, {
      detail: { language: newLanguage }
    }));
  };

  const value = {
    language,
    changeLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 