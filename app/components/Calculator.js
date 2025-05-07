'use client';

import React, { useState, useEffect } from 'react';
import PortfolioCharts from './PortfolioCharts';
import Hero from './Hero';
import FAQ from './FAQ';
import AssetForm from './AssetForm';
import Footer from './Footer';
import Navigation from './Navigation';
import Disclaimer from './Disclaimer';

export default function Calculator() {
  const [assets, setAssets] = useState([
    { name: '', targetPercentage: '', currentPrice: '', quantity: '' }
  ]);
  const [rebalanceMethod, setRebalanceMethod] = useState('sell');
  const [availableCash, setAvailableCash] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [calculationResults, setCalculationResults] = useState(null);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('grafici');

  // Controlla se il disclaimer è stato chiuso in precedenza
  useEffect(() => {
    const disclaimerClosed = localStorage.getItem('disclaimerClosed');
    if (disclaimerClosed === 'true') {
      setShowDisclaimer(false);
    } else {
      setShowDisclaimer(true);
      localStorage.setItem('disclaimerClosed', 'false');
    }
  }, []);

  // Funzione per chiudere il disclaimer
  const closeDisclaimer = () => {
    setShowDisclaimer(false);
    localStorage.setItem('disclaimerClosed', 'true');
  };

  // Funzione per codificare i dati del form nell'URL
  const updateURL = (newAssets, newMethod, newCash) => {
    const params = new URLSearchParams();
    
    // Aggiungi il metodo di ribilanciamento
    params.set('method', newMethod);
    
    // Aggiungi la liquidità disponibile se presente
    if (newCash) {
      params.set('cash', newCash);
    }
    
    // Aggiungi gli asset
    newAssets.forEach((asset, index) => {
      if (asset.name || asset.targetPercentage || asset.currentPrice || asset.quantity) {
        params.set(`asset${index}_name`, asset.name);
        params.set(`asset${index}_target`, asset.targetPercentage);
        params.set(`asset${index}_price`, asset.currentPrice);
        params.set(`asset${index}_quantity`, asset.quantity);
      }
    });
    
    // Aggiorna l'URL senza ricaricare la pagina
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  // Funzione per leggere i parametri dall'URL
  const loadFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const method = params.get('method');
    const cash = params.get('cash');
    const newAssets = [];
    let i = 0;

    while (true) {
      const name = params.get(`asset${i}_name`);
      const target = params.get(`asset${i}_target`);
      const price = params.get(`asset${i}_price`);
      const quantity = params.get(`asset${i}_quantity`);

      if (!name && !target && !price && !quantity) break;

      newAssets.push({
        name: name || '',
        targetPercentage: target || '',
        currentPrice: price || '',
        quantity: quantity || ''
      });

      i++;
    }

    if (newAssets.length > 0) {
      setAssets(newAssets);
      if (method) setRebalanceMethod(method);
      if (cash) setAvailableCash(cash);
    }
  };

  // Aggiungiamo un nuovo useEffect per gestire il calcolo dopo l'aggiornamento degli stati
  useEffect(() => {
    if (window.location.search && isDataComplete()) {
      const results = calculateRebalancing();
      if (results) {
        setCalculationResults(results);
        setShowResults(true);
      }
    }
  }, [assets, rebalanceMethod, availableCash]);

  // Carica i dati dall'URL al mount del componente e quando l'URL cambia
  useEffect(() => {
    if (window.location.search) {
      loadFromURL();
    }
    
    // Aggiungi un listener per i cambiamenti dell'URL
    const handleURLChange = () => {
      if (window.location.search) {
        loadFromURL();
      } else {
        clearForm();
      }
    };

    window.addEventListener('popstate', handleURLChange);
    
    return () => {
      window.removeEventListener('popstate', handleURLChange);
    };
  }, []);

  const addAsset = () => {
    const newAssets = [...assets, { name: '', targetPercentage: '', currentPrice: '', quantity: '' }];
    setAssets(newAssets);
    setShowResults(false);
    updateURL(newAssets, rebalanceMethod, availableCash);
  };

  const updateAsset = (index, field, value) => {
    const newAssets = [...assets];
    newAssets[index] = { ...newAssets[index], [field]: value };
    setAssets(newAssets);
    setShowResults(false);
    updateURL(newAssets, rebalanceMethod, availableCash);
  };

  const handleMethodChange = (e) => {
    const newMethod = e.target.value;
    setRebalanceMethod(newMethod);
    updateURL(assets, newMethod, availableCash);
  };

  const handleCashChange = (e) => {
    const newCash = e.target.value;
    setAvailableCash(newCash);
    updateURL(assets, rebalanceMethod, newCash);
  };

  const isAssetComplete = (asset) => {
    return asset.name.trim() !== '' && 
           asset.targetPercentage !== '' && 
           asset.currentPrice !== '' && 
           asset.quantity !== '';
  };

  const getTotalPercentage = () => {
    return assets.reduce((sum, asset) => 
      sum + (parseFloat(asset.targetPercentage) || 0), 0
    );
  };

  const isPercentageValid = () => {
    const totalPercentage = getTotalPercentage();
    return Math.abs(totalPercentage - 100) < 0.01;
  };

  const isDataComplete = () => {
    const assetsComplete = assets.every(isAssetComplete);
    if (!assetsComplete) return false;
    if (!isPercentageValid()) return false;
    if (rebalanceMethod === 'add') {
      return availableCash !== '';
    }
    return true;
  };

  const calculateAssetValue = (asset) => {
    if (!isAssetComplete(asset)) return null;
    return (parseFloat(asset.currentPrice) || 0) * (parseInt(asset.quantity) || 0);
  };

  const calculateCurrentAllocation = () => {
    const totalValue = assets.reduce((sum, asset) => {
      return sum + (parseFloat(asset.currentPrice) || 0) * (parseInt(asset.quantity) || 0);
    }, 0);

    return assets.map(asset => {
      const value = (parseFloat(asset.currentPrice) || 0) * (parseInt(asset.quantity) || 0);
      const currentPercentage = totalValue ? (value / totalValue) * 100 : 0;
      return {
        ...asset,
        currentValue: value,
        currentPercentage
      };
    });
  };

  const calculateRebalancing = () => {
    const currentAllocations = calculateCurrentAllocation();
    const totalValue = currentAllocations.reduce((sum, asset) => sum + asset.currentValue, 0);

    if (rebalanceMethod === 'sell') {
      const totalTargetPercentage = assets.reduce((sum, asset) => sum + parseFloat(asset.targetPercentage), 0);
      const scaleFactor = 100 / totalTargetPercentage;

      const results = currentAllocations.map(asset => {
        const adjustedTargetPercentage = parseFloat(asset.targetPercentage) * scaleFactor;
        const targetValue = totalValue * (adjustedTargetPercentage / 100);
        const difference = targetValue - asset.currentValue;
        const unitsToAdjust = Math.round(difference / parseFloat(asset.currentPrice));
        const actualAdjustmentValue = unitsToAdjust * parseFloat(asset.currentPrice);
        
        return {
          ...asset,
          adjustment: unitsToAdjust,
          adjustmentValue: actualAdjustmentValue.toFixed(2),
          newQuantity: parseInt(asset.quantity) + unitsToAdjust,
          newPercentage: ((parseInt(asset.quantity) + unitsToAdjust) * parseFloat(asset.currentPrice) / totalValue * 100).toFixed(2),
          adjustedTargetPercentage: adjustedTargetPercentage.toFixed(2)
        };
      });

      const totalAdjustmentValue = results.reduce((sum, result) => 
        sum + parseFloat(result.adjustmentValue), 0
      );

      return {
        results,
        excessCash: Math.abs(totalAdjustmentValue).toFixed(2)
      };
    } else {
      const availableCashValue = parseFloat(availableCash) || 0;
      const newTotalValue = totalValue + availableCashValue;

      const results = currentAllocations.map(asset => {
        const targetValue = newTotalValue * (parseFloat(asset.targetPercentage) / 100);
        const difference = targetValue - asset.currentValue;
        const unitsToAdd = Math.floor(difference / parseFloat(asset.currentPrice));
        const actualAdjustmentValue = unitsToAdd * parseFloat(asset.currentPrice);

        return {
          ...asset,
          adjustment: unitsToAdd,
          adjustmentValue: actualAdjustmentValue.toFixed(2),
          newQuantity: parseInt(asset.quantity) + unitsToAdd,
          newPercentage: ((parseInt(asset.quantity) + unitsToAdd) * parseFloat(asset.currentPrice) / newTotalValue * 100).toFixed(2)
        };
      });

      const totalSpent = results.reduce((sum, result) => 
        sum + parseFloat(result.adjustmentValue), 0
      );

      return {
        results,
        excessCash: (availableCashValue - totalSpent).toFixed(2)
      };
    }
  };

  const handleCalculate = () => {
    if (isDataComplete()) {
      const results = calculateRebalancing();
      setCalculationResults(results);
      setShowResults(true);
    }
  };

  const clearForm = () => {
    setAssets([{ name: '', targetPercentage: '', currentPrice: '', quantity: '' }]);
    setRebalanceMethod('sell');
    setAvailableCash('');
    setShowResults(false);
    setCalculationResults(null);
    setShowClearConfirm(false);
    window.history.replaceState({}, '', window.location.pathname);
  };

  const copyLink = async () => {
    const currentURL = window.location.href;
    try {
      await navigator.clipboard.writeText(currentURL);
      setShowCopyTooltip(true);
      setTimeout(() => setShowCopyTooltip(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleAnchorClick = (e) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href').slice(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const offset = 80; // Altezza della barra di navigazione + margine
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = (e) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href').slice(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const offset = 80; // Altezza della barra di navigazione + margine
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const removeAsset = (index) => {
    if (assets.length > 1) {
      const newAssets = assets.filter((_, i) => i !== index);
      setAssets(newAssets);
      setShowResults(false);
      updateURL(newAssets, rebalanceMethod, availableCash);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleAnchorClick={handleAnchorClick}
      />
      
      <Hero />

      <div id="calcolatore" className="container mx-auto px-4 py-8">
        <AssetForm
          assets={assets}
          rebalanceMethod={rebalanceMethod}
          availableCash={availableCash}
          showResults={showResults}
          calculationResults={calculationResults}
          showCopyTooltip={showCopyTooltip}
          showClearConfirm={showClearConfirm}
          updateAsset={updateAsset}
          handleMethodChange={handleMethodChange}
          handleCashChange={handleCashChange}
          handleCalculate={handleCalculate}
          addAsset={addAsset}
          removeAsset={removeAsset}
          copyLink={copyLink}
          clearForm={clearForm}
          setShowClearConfirm={setShowClearConfirm}
          getTotalPercentage={getTotalPercentage}
        />

        {showResults && calculationResults && (
          <div id="grafici" className="mt-8">
            <PortfolioCharts
              assets={assets}
              calculationResults={calculationResults}
            />
          </div>
        )}
      </div>

      <FAQ />
      <Footer />
      
      {showDisclaimer && (
        <Disclaimer onClose={closeDisclaimer} />
      )}
    </div>
  );
} 