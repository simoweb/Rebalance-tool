import React, { useState, useEffect } from 'react';
import PortfolioCharts from './components/PortfolioCharts';
import { Analytics } from "@vercel/analytics/react";
import Hero from './components/Hero';
import FAQ from './components/FAQ';
import IconsDetail from './components/IconsDetail';
import WhyDetail from './components/WhyDetail';
import WhenDetail from './components/WhenDetail';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import Disclaimer from './components/Disclaimer';

const App = () => {
  const [assets, setAssets] = useState([
    { name: '', targetPercentage: '', currentPrice: '', quantity: '' }
  ]);
  const [rebalanceMethod, setRebalanceMethod] = useState('sell');
  const [availableCash, setAvailableCash] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [calculationResults, setCalculationResults] = useState(null);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  //const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('grafici');

  

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

  // Aggiorna l'URL quando cambia il metodo di ribilanciamento
  const handleMethodChange = (e) => {
    const newMethod = e.target.value;
    setRebalanceMethod(newMethod);
    updateURL(assets, newMethod, availableCash);
  };

  // Aggiorna l'URL quando cambia la liquidità disponibile
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
    return Math.abs(totalPercentage - 100) < 0.01; // Considera valido se la differenza è minore di 0.01
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
      // Calcola il valore target totale basato sulla somma delle percentuali target
      const totalTargetPercentage = assets.reduce((sum, asset) => sum + parseFloat(asset.targetPercentage), 0);
      const scaleFactor = 100 / totalTargetPercentage;

      const results = currentAllocations.map(asset => {
        // Scala la percentuale target in base al totale delle percentuali
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

      // Calcola la liquidità in eccesso
      const totalAdjustmentValue = results.reduce((sum, result) => 
        sum + parseFloat(result.adjustmentValue), 0
      );

      return {
        results,
        excessCash: Math.abs(totalAdjustmentValue).toFixed(2)
      };

    } else {
      // Verifica se la liquidità disponibile è sufficiente
      const availableCashValue = parseFloat(availableCash) || 0;
      const totalTargetPercentage = assets.reduce((sum, asset) => sum + parseFloat(asset.targetPercentage), 0);
      const scaleFactor = 100 / totalTargetPercentage;

      const results = currentAllocations.map(asset => {
        const adjustedTargetPercentage = parseFloat(asset.targetPercentage) * scaleFactor;
        const targetValue = (totalValue + availableCashValue) * (adjustedTargetPercentage / 100);
        const difference = targetValue - asset.currentValue;
        const unitsToAdd = Math.max(0, Math.round(difference / parseFloat(asset.currentPrice)));
        const actualAdditionValue = unitsToAdd * parseFloat(asset.currentPrice);
        
        return {
          ...asset,
          adjustment: unitsToAdd,
          adjustmentValue: actualAdditionValue.toFixed(2),
          newQuantity: parseInt(asset.quantity) + unitsToAdd,
          newPercentage: ((parseInt(asset.quantity) + unitsToAdd) * parseFloat(asset.currentPrice) / (totalValue + availableCashValue) * 100).toFixed(2),
          adjustedTargetPercentage: adjustedTargetPercentage.toFixed(2)
        };
      });

      // Calcola la liquidità non utilizzata
      const totalInvestment = results.reduce((sum, result) => 
        sum + parseFloat(result.adjustmentValue), 0
      );
      
      return {
        results,
        excessCash: (availableCashValue - totalInvestment).toFixed(2)
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

  // Funzione per pulire il form e l'URL
  const clearForm = () => {
    setAssets([{ name: '', targetPercentage: '', currentPrice: '', quantity: '' }]);
    setRebalanceMethod('sell');
    setAvailableCash('');
    setShowResults(false);
    setCalculationResults(null);
    // Pulisci l'URL
    window.history.replaceState({}, '', window.location.pathname);
    setShowClearConfirm(false);
  };

  // Funzione per copiare il link negli appunti
  const copyLink = async () => {
    try {
      const baseUrl = window.location.href.replace(/#.*$/, ''); // rimuove qualsiasi hash
      const urlWithHash = `${baseUrl}#calcolatore`;
      await navigator.clipboard.writeText(urlWithHash);
      setShowCopyTooltip(true);
      setTimeout(() => {
        setShowCopyTooltip(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };
  

  // Aggiungo la gestione dello scroll fluido
  useEffect(() => {
    // Aggiungo scroll-behavior: smooth al documento
    document.documentElement.style.scrollBehavior = 'smooth';

    // Gestisco il click sui link di navigazione
    const handleAnchorClick = (e) => {
      const href = e.currentTarget.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    // Aggiungo l'event listener a tutti i link di navigazione
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
      link.addEventListener('click', handleAnchorClick);
    });

    // Cleanup
    return () => {
      navLinks.forEach(link => {
        link.removeEventListener('click', handleAnchorClick);
      });
    };
  }, []);

  const handleScroll = (e) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    const targetId = href.replace('#', '');
    const target = document.getElementById(targetId);
    
    if (target) {
      const offset = 80; // Per tenere conto della navbar fixed
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Chiudi il menu mobile se aperto
      setIsMenuOpen(false);
    }
  };

  const removeAsset = (index) => {
    setAssets(prevAssets => {
      const newAssets = [...prevAssets];
      newAssets.splice(index, 1);
      return newAssets;
    });
    // Reset results when removing an asset
    setShowResults(false);
    setCalculationResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner Disclaimer */}
      <Disclaimer  />

      {/* Menu di navigazione */}
      <Navigation />

      {/* Hero Section */}
      <Hero />

      {/* Contenitore per le sezioni informative */}
      <div className="bg-gradient-to-br from-white via-indigo-50 to-white relative pb-16">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
       {/* Sezione caratteristiche principali */}
       
      <IconsDetail />
      {/* Divisore */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* Sezione Perché Ribilanciare */}
   <WhyDetail />
    
  {/* Divisore */}
  <div className="max-w-4xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* Sezione Frequenza di Ribilanciamento */}
      <WhenDetail />
     
    </div>

    {/* Sezione calcolatore */}
    <section id="calcolatore" className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-teal-400 transform transition-all duration-500 py-20">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-3xl font-bold text-center mb-12 text-white mt-4">Calcola il Ribilanciamento</h2>

        <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-3xl p-4 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Colonna sinistra - Form */}
            <div className="lg:w-1/2 px-2 md:px-0">
              {/* Metodo di ribilanciamento */}
              <div className="mb-6">
                <div className="flex items-center">
                  <label className="w-1/3 text-sm md:text-base font-medium text-gray-700">
                    Metodo
                  </label>
                  <select
                    className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                    value={rebalanceMethod}
                    onChange={handleMethodChange}
                  >
                    <option value="sell">Vendi asset in eccesso</option>
                    <option value="add">Aggiungi liquidità</option>
                  </select>
                </div>
              </div>

              {/* Campo liquidità disponibile */}
              {rebalanceMethod === 'add' && (
                <div className="mb-6">
                  <div className="flex items-center">
                    <label className="w-1/3 text-sm md:text-base font-medium text-gray-700">
                      Liquidità (€)
                    </label>
                    <input
                      type="number"
                      placeholder="es: 1000"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={availableCash}
                      onChange={handleCashChange}
                    />
                  </div>
                </div>
              )}

              {/* Lista degli asset */}
              <div className="space-y-6">
                {assets.map((asset, index) => (
                  <div key={index} className="p-6 border rounded-lg bg-gray-50 shadow-sm relative">
                    {/* Pulsante di rimozione solo per gli asset dopo il primo */}
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeAsset(index)}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full shadow-md border border-gray-200 hover:border-red-200 transition-all duration-200 group"
                        title="Rimuovi asset"
                      >
                        <svg className="w-5 h-5 transform group-hover:rotate-90 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <label className="w-1/3 text-sm md:text-base font-medium text-gray-700">
                          Nome
                        </label>
                        <input
                          type="text"
                          placeholder="es: VWCE"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          value={asset.name}
                          onChange={(e) => updateAsset(index, 'name', e.target.value)}
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <label className="w-1/3 text-sm md:text-base font-medium text-gray-700">
                          Target (%)
                        </label>
                        <input
                          type="number"
                          placeholder="es: 60"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          value={asset.targetPercentage}
                          onChange={(e) => updateAsset(index, 'targetPercentage', e.target.value)}
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <label className="w-1/3 text-sm md:text-base font-medium text-gray-700">
                          Prezzo (€)
                        </label>
                        <input
                          type="number"
                          placeholder="es: 100"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          value={asset.currentPrice}
                          onChange={(e) => updateAsset(index, 'currentPrice', e.target.value)}
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <label className="w-1/3 text-sm md:text-base font-medium text-gray-700">
                          Quantità
                        </label>
                        <input
                          type="number"
                          placeholder="es: 10"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          value={asset.quantity}
                          onChange={(e) => updateAsset(index, 'quantity', e.target.value)}
                        />
                      </div>

                      {isAssetComplete(asset) && (
                        <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-base font-medium text-gray-500">Valore totale:</span>
                            <span className="text-xl font-semibold text-gray-900">
                              {calculateAssetValue(asset)?.toLocaleString('it-IT', {
                                style: 'currency',
                                currency: 'EUR'
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pulsanti e Alert */}
              <div className="space-y-6 mt-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    onClick={addAsset}
                    className="w-full md:flex-1 bg-gray-600 text-white py-3 px-6 text-lg rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Aggiungi Asset
                  </button>
                  <button
                    onClick={handleCalculate}
                    disabled={!isDataComplete()}
                    className={`w-full md:flex-1 py-3 px-6 text-lg rounded-lg transition-colors ${
                      isDataComplete()
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Calcola
                  </button>
                </div>

                {/* Alert somma percentuali prima del pulsante Calcola */}
                {assets.some(asset => asset.targetPercentage !== '') && (
                  <div className={`p-4 rounded-lg ${
                    getTotalPercentage() === 100
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span>Totale percentuali:</span>
                      <span className="font-semibold">{getTotalPercentage().toFixed(2)}%</span>
                    </div>
                    {getTotalPercentage() !== 100 && (
                      <p className="text-sm mt-2">
                        La somma delle percentuali deve essere 100%
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Colonna destra - Risultati */}
            <div className="lg:w-1/2">
              {showResults && calculationResults ? (
                <div className="sticky top-8">
                  <div className="bg-gray-50 rounded-lg pt-4 pb-4">
                    <div className="flex justify-between items-center mb-6 px-6">
                      <h2 className="text-lg md:text-xl font-semibold">Risultati del Ribilanciamento</h2>
                      <div className="relative">
                        <button
                          onClick={copyLink}
                          className="flex items-center justify-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Condividi Link
                        </button>
                        {showCopyTooltip && (
                          <div className="absolute bottom-full right-0 transform mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded shadow-lg whitespace-nowrap">
                            Link copiato!
                            <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Liquidità in eccesso o non utilizzata */}
                    {(() => {
                      const excessCash = parseFloat(calculationResults.excessCash);
                      if (excessCash > 0) {
                        return (
                          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm md:text-base text-yellow-800">
                              {rebalanceMethod === 'sell' ? 
                                'Liquidità generata dalla vendita:' : 
                                'Liquidità non utilizzata:'
                              }
                                <span className="ml-2 font-semibold">
                                  {excessCash.toLocaleString('it-IT', {
                                    style: 'currency',
                                    currency: 'EUR'
                                  })}
                                </span>
                              </p>
                            </div>
                          );
                      }
                      return null;
                    })()}

                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 mb-6">
                      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                          onClick={() => setActiveTab('grafici')}
                          className={`${
                            activeTab === 'grafici'
                              ? 'border-indigo-500 text-indigo-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                          Grafici
                        </button>
                        <button
                          onClick={() => setActiveTab('tabella')}
                          className={`${
                            activeTab === 'tabella'
                              ? 'border-indigo-500 text-indigo-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                          Tabella
                        </button>
                      </nav>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'grafici' ? (
                      <div>
                        {/* Riepilogo operazioni */}
                        <div className="mb-8 space-y-3">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Riepilogo Operazioni</h3>
                          {calculationResults.results.map((result, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className={`w-2 h-8 rounded-full ${result.adjustment > 0 ? 'bg-green-500' : result.adjustment < 0 ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                                <div>
                                  <p className="font-medium text-gray-900">{result.name}</p>
                                  <p className="text-sm text-gray-500">{result.currentPercentage.toFixed(2)}% → {result.newPercentage}%</p>
                                  <p className="text-sm text-gray-500">
                                    {(parseInt(result.quantity) * parseFloat(result.currentPrice)).toLocaleString('it-IT', {
                                      style: 'currency',
                                      currency: 'EUR'
                                    })}
                                    {' → '}
                                    {(result.newQuantity * parseFloat(result.currentPrice)).toLocaleString('it-IT', {
                                      style: 'currency',
                                      currency: 'EUR'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-medium ${result.adjustment > 0 ? 'text-green-600' : result.adjustment < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                  {result.adjustment > 0 ? '+' : ''}{result.adjustment} unità
                                </p>
                                <p className="text-sm text-gray-500">
                                  {result.adjustmentValue}€
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Grafici del portafoglio */}
                        <PortfolioCharts 
                          assets={assets} 
                          currentAllocation={calculateCurrentAllocation()} 
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {calculationResults.results.map((result, index) => (
                          <div key={index} className="p-4 bg-white rounded-lg shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-base md:text-lg font-medium text-gray-900">{result.name}</h3>
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs md:text-sm font-medium">
                                {result.currentPercentage.toFixed(2)}% → {result.newPercentage}%
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs md:text-sm text-gray-500">Allocazione target</p>
                                <p className="text-sm md:text-base font-medium">{result.adjustedTargetPercentage}%</p>
                              </div>
                              <div>
                                <p className="text-xs md:text-sm text-gray-500">Quantità attuale</p>
                                <p className="text-sm md:text-base font-medium">{result.quantity} unità</p>
                              </div>
                              <div>
                                <p className="text-xs md:text-sm text-gray-500">Aggiustamento</p>
                                <p className={`text-sm md:text-base font-medium ${result.adjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {result.adjustment} unità
                                  <span className={`text-xs md:text-sm ml-1 ${result.adjustment >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    ({result.adjustment >= 0 ? '+' : ''}{result.adjustmentValue}€)
                                  </span>
                                </p>
                              </div>
                              <div>
                                <p className="text-xs md:text-sm text-gray-500">Nuova quantità</p>
                                <div className="flex justify-between items-center">
                                  <p className="text-sm md:text-base font-medium">{result.newQuantity} unità</p>
                                  <p className="text-xs md:text-sm text-gray-600">
                                    {(result.newQuantity * parseFloat(result.currentPrice)).toLocaleString('it-IT', {
                                      style: 'currency',
                                      currency: 'EUR'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pulsanti di azione */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <button
                          onClick={copyLink}
                          className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Condividi Link
                        </button>
                        {showCopyTooltip && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded shadow-lg whitespace-nowrap">
                            Link copiato!
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setShowClearConfirm(true)}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Pulisci Form
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500 text-center">
                    {isDataComplete() 
                      ? "Clicca 'Calcola' per vedere i risultati del ribilanciamento"
                      : assets.every(isAssetComplete) && !isPercentageValid()
                        ? "La somma delle percentuali target deve essere 100%"
                        : "Completa l'inserimento di tutti gli asset\nper procedere con il calcolo"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Sezione FAQ */}
    <FAQ />

    {/* Footer */}
    <Footer />

    {/* Modale di conferma per la pulizia del form */}
    {showClearConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4 relative animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Conferma pulizia form</h3>
          <p className="text-gray-600 mb-6">
            Sei sicuro di voler cancellare tutti i dati inseriti? Questa azione non può essere annullata.
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={clearForm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Conferma
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Stili globali */}
    <style>{`
      @keyframes bounceSoft {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      .animate-bounce-subtle {
        animation: bounceSoft 2s infinite;
      }

      @keyframes gradient {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      .animate-gradient {
        animation: gradient 15s ease infinite;
      }
    `}</style>
  
  </div>
);
};

export default App; 