import React, { useState, useEffect, useCallback } from 'react';
import PortfolioCharts from '../PortfolioCharts';

// Importa le funzioni di utilità
import { parseLocaleFloat, isQuantityInputFractional, calculateCurrentAllocation } from './utils';

// Importa la funzione principale di ribilanciamento
import { calculateRebalancing } from './rebalancingCalculator';


const Calculator = () => {
    // --- State Hooks ---
    const [assets, setAssets] = useState([
        { name: '', targetPercentage: '', currentPrice: '', quantity: '' }
    ]);
    const [rebalanceMethod, setRebalanceMethod] = useState('sell'); // Default
    const [availableCash, setAvailableCash] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [calculationResults, setCalculationResults] = useState(null);
    const [showCopyTooltip, setShowCopyTooltip] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [scrollForm, setScrollForm] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Aggiunto per coerenza con useEffect
    const [activeTab, setActiveTab] = useState('grafici');

    // --- Funzioni di Utilità (rimangono qui solo quelle specifiche per il componente UI) ---

    // `isAssetComplete` è una funzione che dipende dallo stato `assets` locale,
    // quindi ha senso mantenerla qui.
    const isAssetComplete = useCallback((asset) => {
        return asset.name.trim() !== '' &&
               String(asset.targetPercentage).trim() !== '' &&
               String(asset.currentPrice).trim() !== '' &&
               String(asset.quantity).trim() !== '';
    }, []); // Non ha dipendenze esterne mutabili

    // `getTotalPercentage` dipende dallo stato `assets` locale
    const getTotalPercentage = useCallback(() => {
        return assets.reduce((sum, asset) =>
            sum + parseLocaleFloat(asset.targetPercentage), 0
        );
    }, [assets]); // Dipende da `assets`

    // `isDataComplete` ora usa `isAssetComplete` e `getTotalPercentage` (che sono useCallback)
    // o prende i valori direttamente come argomenti come hai già fatto nel tuo codice.
    // Manteniamo la versione che prende gli argomenti per l'uso nell'useEffect
    const isDataComplete = useCallback((currentAssets, currentMethod, currentCash, currentTotalPercentage) => {
        if (currentAssets.length === 0 || !currentAssets.every(isAssetComplete)) return false;

        const totalPercentage = currentTotalPercentage;
        if (Math.abs(totalPercentage - 100) >= 0.01) return false;

        if (currentMethod === 'add' || currentMethod === 'add_and_rebalance') {
            return String(currentCash).trim() !== '';
        }
        return true;
    }, [isAssetComplete]); // Dipende da `isAssetComplete`

    // `isCurrentDataComplete` è un helper per il pulsante, usa lo stato corrente
    const isCurrentDataComplete = useCallback(() => {
        return isDataComplete(assets, rebalanceMethod, availableCash, getTotalPercentage());
    }, [assets, rebalanceMethod, availableCash, isDataComplete, getTotalPercentage]);

    // `calculateAssetValue` dipende dagli asset e parseLocaleFloat
    const calculateAssetValue = useCallback((asset) => {
        if (!isAssetComplete(asset)) return null;
        return parseLocaleFloat(asset.currentPrice) * parseLocaleFloat(asset.quantity);
    }, [isAssetComplete]);


    // --- Funzioni per la gestione dell'URL ---
    // Queste funzioni rimangono qui perché gestiscono l'interazione con lo stato del componente.
    const updateURL = useCallback((newAssets, newMethod, newCash) => {
        const params = new URLSearchParams();
        params.set('method', newMethod);
        if (newCash && (newMethod === 'add' || newMethod === 'add_and_rebalance')) {
            params.set('cash', newCash);
        }
        newAssets.forEach((asset, index) => {
            if (asset.name || asset.targetPercentage || asset.currentPrice || asset.quantity) {
                params.set(`asset${index}_name`, asset.name);
                params.set(`asset${index}_target`, asset.targetPercentage);
                params.set(`asset${index}_price`, asset.currentPrice);
                params.set(`asset${index}_quantity`, asset.quantity);
                params.set(`asset${index}_pmc`, asset.quantity);
                params.set(`asset${index}_taxRate`, asset.taxRate);
            }
        });
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    }, []);

    const loadFromURL = useCallback(() => {
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
            const pmc = params.get(`asset${i}_pmc`);
            const taxRate = params.get(`asset${i}_taxRate`);
            if (!name && !target && !price && !quantity) break;
            newAssets.push({
                name: name || '',
                targetPercentage: target || '',
                currentPrice: price || '',
                taxRate: taxRate || '',
                pmc: pmc || '',
                quantity: quantity || ''
            });
            i++;
        }
        if (newAssets.length > 0) {
            setAssets(newAssets);
            if (method) setRebalanceMethod(method);
            if (cash && (method === 'add' || method === 'add_and_rebalance')) setAvailableCash(cash);
            else setAvailableCash('');
        } else if (!window.location.search) {
            // Opzionale: non fare nulla o resettare solo se non ci sono parametri
        }
    }, []);

    // --- useEffect Hooks ---
    useEffect(() => {
        if (scrollForm) {
            const target = document.querySelector('#calcolatore');
            if (target) {
                const offset = 80;
                const targetPosition = target.offsetTop - offset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
            setScrollForm(false);
        }
    }, [scrollForm]);

    useEffect(() => {
        // Questa funzione ora chiama la funzione `calculateRebalancing` importata.
        // Passa tutti i dati necessari come argomenti.
        if (isDataComplete(assets, rebalanceMethod, availableCash, getTotalPercentage())) {
            // Chiamata alla funzione importata
            const results = calculateRebalancing(assets, rebalanceMethod, availableCash);
            if (results) {
                setCalculationResults(results);
                setShowResults(true);
            }
        } else if (showResults) {
            setShowResults(false);
            setCalculationResults(null);
        }
    }, [assets, rebalanceMethod, availableCash, isDataComplete, getTotalPercentage]); // Dipendenze chiave

    useEffect(() => {
        loadFromURL();
        const handleURLChange = () => { loadFromURL(); };
        window.addEventListener('popstate', handleURLChange);
        return () => { window.removeEventListener('popstate', handleURLChange); };
    }, [loadFromURL]); // Dipende da `loadFromURL`

    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        const handleAnchorClick = (e) => {
            const hrefAttr = e.currentTarget.getAttribute('href');
            if (hrefAttr && hrefAttr.startsWith('#')) {
                e.preventDefault();
                const element = document.querySelector(hrefAttr);
                if (element) {
                    const offset = 80;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = element.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    if (typeof setIsMenuOpen === 'function') { setIsMenuOpen(false); }
                }
            }
        };
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => { link.addEventListener('click', handleAnchorClick); });
        return () => {
            navLinks.forEach(link => { link.removeEventListener('click', handleAnchorClick); });
            document.documentElement.style.scrollBehavior = '';
        };
    }, []); // Non dipende da setIsMenuOpen, è una funzione setter da React

    // --- Handlers per gli input (rimangono qui perché gestiscono lo stato) ---
    const addAsset = () => {
        const newAssets = [...assets, { name: '', targetPercentage: '', currentPrice: '', quantity: '', pmc: '', taxRate: ''  }];
        setAssets(newAssets);
    };

    const updateAsset = (index, field, value) => {
        const newAssets = assets.map((asset, i) => i === index ? { ...asset, [field]: value } : asset);
        setAssets(newAssets);
    };

    const handleMethodChange = (e) => {
        const newMethod = e.target.value;
        setRebalanceMethod(newMethod);
        if (newMethod === 'sell') setAvailableCash('');
    };

    const handleCashChange = (e) => {
        const newCash = e.target.value;
        setAvailableCash(newCash);
    };

    const handleCalculate = () => {
        // L'effettivo ricalcolo avviene nell'useEffect in base alle dipendenze.
        // Questo pulsante semplicemente assicura che lo stato sia pulito se i dati non sono completi
        // o forza un aggiornamento dell'URL se i dati sono completi.
        if (isCurrentDataComplete()) {
            // Il ricalcolo avverrà automaticamente tramite l'useEffect quando lo stato cambia
            // Questo è principalmente per il `updateURL` e per mostrare/nascondere i risultati
            setShowResults(true); // Assicurati che i risultati siano visibili se i dati sono completi
            updateURL(assets, rebalanceMethod, availableCash);
        } else {
            setShowResults(false);
            setCalculationResults(null);
        }
    };

    const clearForm = () => {
        setAssets([{ name: '', targetPercentage: '', currentPrice: '', quantity: '', pmc: '', taxRate: '' }]);
        setRebalanceMethod('sell');
        setAvailableCash('');
        setShowResults(false);
        setCalculationResults(null);
        window.history.replaceState({}, '', window.location.pathname);
        setScrollForm(true);
        setShowClearConfirm(false);
    };

    const copyLink = async () => {
        try {
            const baseUrl = window.location.href.split('?')[0].split('#')[0];
            const params = new URLSearchParams();
            params.set('method', rebalanceMethod);
            if (availableCash && (rebalanceMethod === 'add' || rebalanceMethod === 'add_and_rebalance')) {
                params.set('cash', availableCash);
            }
            assets.forEach((asset, index) => {
                if (asset.name || asset.targetPercentage || asset.currentPrice || asset.quantity) {
                    params.set(`asset${index}_name`, asset.name);
                    params.set(`asset${index}_target`, asset.targetPercentage);
                    params.set(`asset${index}_price`, asset.currentPrice);
                    params.set(`asset${index}_quantity`, asset.quantity);
                    params.set(`asset${index}_pmc`, asset.pmc);
                    params.set(`asset${index}_taxRate`, asset.taxRate);
                }
            });

            const urlToCopy = `${baseUrl}?${params.toString()}#calcolatore`;
            await navigator.clipboard.writeText(urlToCopy);
            setShowCopyTooltip(true);
            setTimeout(() => { setShowCopyTooltip(false); }, 2000);
        } catch (err) { console.error('Failed to copy link:', err); }
    };

    const removeAsset = (index) => {
        const newAssets = assets.filter((_, i) => i !== index);
        setAssets(newAssets);
    };

    // --- Render del Componente ---
    return (
        <div>
            <section id="calcolatore" className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-teal-400 transform transition-all duration-500 py-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="container mx-auto px-4 mb-8">
                    <h2 className="text-3xl font-bold text-center mb-12 text-white mt-4">Calcola il Ribilanciamento</h2>
                    <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-3xl px-3 pt-5 pb-5 md:p-8 dark:bg-gray-800/50">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Colonna sinistra - Form */}
                            <div className="lg:w-1/2 px-2 md:px-0">
                                <div className="mb-6">
                                    <div className="flex flex-col md:flex-row md:px-6">
                                        <label className="w-full md:w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">
                                            Metodo
                                        </label>
                                        <select
                                            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent"
                                            value={rebalanceMethod}
                                            onChange={handleMethodChange}
                                        >
                                            <option value="sell">Ribilancia</option>
                                            <option value="add_and_rebalance">Aggiungi liquidità e ribilancia</option>
                                            <option value="add">Aggiungi liquidità</option>
                                        </select>
                                    </div>
                                </div>

                                {(rebalanceMethod === 'add' || rebalanceMethod === 'add_and_rebalance') && (
                                    <div className="mb-6">
                                        <div className="c">
                                            <label className="w-full md:w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">
                                                Liquidità (€)
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="es: 1000 o 1000,50"
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent"
                                                value={availableCash}
                                                onChange={handleCashChange}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {assets.map((asset, index) => (
                                        <div key={index} className="p-5 md:p-6 border rounded-lg bg-gray-50 shadow-sm relative dark:bg-gray-800/50 dark:text-gray-400 dark:border-transparent">
                                            {assets.length > 1 && (
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
                                                {/* Input fields (Nome, Target, Prezzo, Quantità) come prima */}
                                                <div className="flex flex-col md:flex-row">
                                                    <label className="w-full md:w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">Nome</label>
                                                    <input type="text" placeholder="es: VWCE" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent" value={asset.name} onChange={(e) => updateAsset(index, 'name', e.target.value)} />
                                                </div>
                                                <div className="flex flex-col md:flex-row">
                                                    <label className="w-full md:w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">Target (%)</label>
                                                    <input type="text" inputMode="decimal" placeholder="es: 60 o 60,5" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent" value={asset.targetPercentage} onChange={(e) => updateAsset(index, 'targetPercentage', e.target.value)} />
                                                </div>
                                                <div className="flex flex-col md:flex-row">
                                                    <label className="w-full md:w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">Prezzo (€)</label>
                                                    <input type="text" inputMode="decimal" placeholder="es: 100 o 100,25" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent" value={asset.currentPrice} onChange={(e) => updateAsset(index, 'currentPrice', e.target.value)} />
                                                </div>
                                                <div className="flex flex-col md:flex-row">
                                                    <label className="w-full md:w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">PMC</label>
                                                    <input type="text" inputMode="decimal" placeholder="es: 100 o 100,25" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent" value={asset.pmc} onChange={(e) => updateAsset(index, 'pmc', e.target.value)} />
                                                </div>
                                                <div className="flex flex-col md:flex-row">
                                                    <label className="w-full md:w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">Quantità</label>
                                                    <input type="text" inputMode="decimal" placeholder="es: 10 o 10,3" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent" value={asset.quantity} onChange={(e) => updateAsset(index, 'quantity', e.target.value)} />
                                                </div>
                                                <div className="flex flex-col md:flex-row">
                                                    <label className="w-full md:w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">Tax rate</label>
                                                    <input type="text" inputMode="decimal" placeholder="es: 26%, 12,5%" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent" value={asset.taxRate} onChange={(e) => updateAsset(index, 'taxRate', e.target.value)} />
                                                </div>

                                                {isAssetComplete(asset) && (
                                                    <div className="mt-4 p-4 bg-white rounded-lg shadow-sm dark:bg-gray-700">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-base font-medium text-gray-500 dark:text-gray-400">Valore totale:</span>
                                                            <span className="text-xl font-semibold text-gray-900 dark:text-gray-200">
                                                                {calculateAssetValue(asset)?.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-6 mt-8">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <button onClick={addAsset} className="w-full md:flex-1 bg-gray-600 text-white py-3 px-6 text-lg rounded-lg hover:bg-gray-700 transition-colors">Aggiungi Asset</button>
                                        <button
                                            onClick={handleCalculate}
                                            disabled={!isCurrentDataComplete()}
                                            className={`w-full md:flex-1 py-3 px-6 text-lg rounded-lg transition-colors ${isCurrentDataComplete() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                        >Calcola</button>
                                    </div>
                                    {/* Alert somma percentuali */}
                                    {assets.some(asset => String(asset.targetPercentage).trim() !== '') && (
                                        <div className={`p-4 rounded-lg ${Math.abs(getTotalPercentage() - 100) < 0.01 ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                                            <div className="flex justify-between items-center">
                                                <span>Totale percentuali target:</span>
                                                <span className="font-semibold">{getTotalPercentage().toFixed(2)}%</span>
                                            </div>
                                            {Math.abs(getTotalPercentage() - 100) >= 0.01 && (<p className="text-sm mt-2">La somma delle percentuali target deve essere 100%.</p>)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Colonna destra - Risultati (come prima, ma con logica per visualizzare i dati da calculationResults) */}
                            <div className="lg:w-1/2">
                                {showResults && calculationResults && calculationResults.results ? (
                                    <div className="sticky top-8">
                                        <div className="bg-gray-50 rounded-lg pt-4 pb-4 dark:bg-gray-800/70 backdrop-blur-sm">
                                            {/* Intestazione Risultati e Condividi Link */}
                                            <div className="flex justify-between flex-col md:flex-row items-center mb-6 px-2 md:px-6">
                                                <h2 className="text-lg md:text-xl font-semibold dark:text-gray-300">Risultati del Ribilanciamento</h2>
                                                <div className="relative">
                                                    <button onClick={copyLink} className="flex items-center justify-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                                        Condividi Link
                                                    </button>
                                                    {showCopyTooltip && (<div className="absolute bottom-full right-0 transform translate-y-[-8px] mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded shadow-lg whitespace-nowrap z-10">Link copiato!<div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div></div>)}
                                                </div>
                                            </div>
                                            {/* Liquidità in eccesso */}
                                            {(() => {
                                                const excessCashNum = parseLocaleFloat(calculationResults.excessCash);

                                                let message = '';
                                                if (rebalanceMethod === 'sell') {
                                                    message = excessCashNum >= 0 ? 'Liquidità netta generata:' : 'Valore netto investito:';
                                                } else if (rebalanceMethod === 'add' || rebalanceMethod === 'add_and_rebalance') {
                                                    message = excessCashNum >= 0 ? 'Liquidità non utilizzata:' : 'Deficit di liquidità (oltre quella fornita):';
                                                }
                                                if (message) {
                                                    return (
                                                        <div className={`mx-6 mb-6 p-4 border rounded-lg ${excessCashNum >= 0 ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                                            <p className="text-sm md:text-base">{message}
                                                                <span className="ml-2 font-semibold">{excessCashNum.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span>
                                                            </p>
                                                        </div>);
                                                } return null;
                                            })()}
                                            {/* Tab Navigation e Content (Grafici/Tabella) come prima */}
                                            <div className="border-b border-gray-200 dark:border-gray-700 mb-6 px-2 md:px-6">
                                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                                    <button onClick={() => setActiveTab('grafici')} className={`${activeTab === 'grafici' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Grafici</button>
                                                    <button onClick={() => setActiveTab('tabella')} className={`${activeTab === 'tabella' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Tabella</button>
                                                </nav>
                                            </div>
                                            {activeTab === 'grafici' ? (
                                                <div className="px-2 md:px-6">
                                                    <div className="mb-8 space-y-3">
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">Riepilogo Operazioni</h3>
                                                        {calculationResults.results.map((result, index) => (
                                                          
                                                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm dark:bg-gray-700">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className={`w-2 h-8 rounded-full ${result.adjustment > 0 ? 'bg-green-500' : result.adjustment < 0 ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                                                                    <div>
                                                                      
                                                                        <p className="font-medium text-gray-900 dark:text-gray-100">{result.name}</p>
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{parseLocaleFloat(result.currentPercentage).toFixed(2)}% → {parseLocaleFloat(result.newPercentage).toFixed(2)}%</p>
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                            {(parseLocaleFloat(result.quantity) * parseLocaleFloat(result.currentPrice)).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                                                                            {' → '}
                                                                            {(result.newQuantity * parseLocaleFloat(result.currentPrice)).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                                                                        </p>
                                                                       
                                                                        {/* Nuova Quantità e Valore */}
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">        
                                                                                      Prezzo unità: {parseFloat(result.prezzoQuota).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                                                                          </p>

                                                                       
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                  <p className={`font-medium ${result.adjustment > 0 ? 'text-green-600 dark:text-green-400' : result.adjustment < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                                                      {result.adjustment > 0 ? '+' : ''}{result.adjustment.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 8 })} unità
                                                                  </p>
                                                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                      {parseLocaleFloat(result.adjustmentValue).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                                                                  </p>
                                                                  {/* ---- MOSTRA TASSE QUI ---- */}
                                                                  {result.adjustment < 0 && parseFloat(result.taxAmount) > 0 && (
                                                                      <p className="text-xs text-red-500 dark:text-red-400">
                                                                          Tasse: {parseFloat(result.taxAmount).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                                                                      </p>
                                                                  )}
                                                                  {/* ---- FINE SEZIONE TASSE ---- */}
                                                              </div>
                                                               
                                                            </div>))}
                                                    </div>
                                                    {/* Qui passiamo la calculateCurrentAllocation importata al PortfolioCharts */}
                                                    <PortfolioCharts assets={assets} currentAllocation={calculateCurrentAllocation(assets)} />
                                                </div>
                                            ) : ( /* Tabella */
                                                <div className="space-y-4 px-2 md:px-6">
                                                    {calculationResults.results.map((result, index) => (
                                                        <div key={index} className="p-4 bg-white rounded-lg shadow-sm dark:bg-gray-700">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-gray-100">{result.name}</h3>
                                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">{parseLocaleFloat(result.currentPercentage).toFixed(2)}% → {parseLocaleFloat(result.newPercentage).toFixed(2)}%</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div><p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Allocazione target</p><p className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200">{parseLocaleFloat(result.adjustedTargetPercentage).toFixed(2)}%</p></div>
                                                                <div><p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Quantità attuale</p><p className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200">{parseLocaleFloat(result.quantity).toLocaleString('it-IT')} unità</p></div>
                                                                <div><p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Aggiustamento</p><p className={`text-sm md:text-base font-medium ${result.adjustment >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{result.adjustment.toLocaleString('it-IT')} unità <span className={`text-xs md:text-sm ml-1`}>({result.adjustment >= 0 ? '+' : ''}{parseLocaleFloat(result.adjustmentValue).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })})</span></p></div>
                                                                <div><p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Nuova quantità</p><div className="flex justify-between items-center"><p className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200">{result.newQuantity.toLocaleString('it-IT')} unità</p><p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{(result.newQuantity * parseLocaleFloat(result.currentPrice)).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</p></div></div>
                                                            </div>
                                                             <div>
                                                            
                                                        </div>
                                                        
                                                        {/* ---- MOSTRA TASSE QUI ---- */}
                                                        {result.adjustment < 0 && parseFloat(result.taxAmount) > 0 && (
                                                            <div>
                                                                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Tasse Pagate</p>
                                                                <p className="text-sm md:text-base font-medium text-red-600 dark:text-red-400">
                                                                    {parseFloat(result.taxAmount).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                                                                </p>
                                                            </div>
                                                        )}
                                                        </div>))}
                                                </div>)}
                                            <div className="mt-8 flex flex-col sm:flex-row gap-4 px-6">
                                                <div className="relative">
                                                    <button onClick={copyLink} className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                                        Condividi Link
                                                    </button>

                                                    {showCopyTooltip && (
                                                        <div className="absolute bottom-full right-0 transform mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded shadow-lg whitespace-nowrap">
                                                            Link copiato!
                                                            <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="relative">
                                                    <button onClick={() => setShowClearConfirm(true)} className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Pulisci Form</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) :
                                    (

                                        <div className="h-full flex items-center justify-center p-8 text-center flex-col">
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">{isCurrentDataComplete() ? "Clicca 'Calcola' per vedere i risultati." : (assets.length > 0 && assets.some(a => String(a.targetPercentage).trim() !== '') && Math.abs(getTotalPercentage() - 100) >= 0.01) ?
                                                    "La somma delle percentuali target deve essere 100%." :
                                                    "Completa tutti i campi degli asset. Assicurati che la somma delle percentuali target sia 100% e, se necessario, inserisci la liquidità."
                                                }</p>
                                            </div>
                                            {isCurrentDataComplete()  ? "" :  (
                                                assets.length > 0 && assets.some(a => String(a.targetPercentage).trim() !== '') && Math.abs(getTotalPercentage() - 100) >= 0.01 &&
                                            
                                            <div className="relative mt-4">
                                                    <button onClick={() => setShowClearConfirm(true)} className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Pulisci Form</button>
                                                </div>
                                            )
                                            }

                                            {isCurrentDataComplete() ? "" : (assets.length > 0 && assets.some(a => String(a.targetPercentage).trim() !== '') && Math.abs(getTotalPercentage() - 100) >= 0.01) ?
                                                "" :
                                                <div className='items-center justify-center'>
                                                    <h5 className='text-lg mt-5'>Carica esempi</h5>
                                                   <div className='items-center justify-center'>
    <button
        onClick={() => {
            window.location.href = `?method=sell&asset0_name=PHAU&asset0_target=25&asset0_price=275%2C17&asset0_quantity=26&asset0_pmc=240&asset0_taxRate=26&asset1_name=PJS1&asset1_target=25&asset1_price=98%2C18&asset1_quantity=63&asset1_pmc=95&asset1_taxRate=12%2C5&asset2_name=SWDA&asset2_target=25&asset2_price=100%2C05&asset2_quantity=58&asset2_pmc=85&asset2_taxRate=26&asset3_name=XG7S&asset3_target=25&asset3_price=220%2C52&asset3_quantity=28&asset3_pmc=210&asset3_taxRate=12%2C5#calcolatore`;
        }}
        className="mx-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg text-sm hover:from-green-600 hover:to-green-800 transition-colors mt-5"
    >
        Permanent Portfolio
    </button>

    <button
        onClick={() => {
            window.location.href = `?method=sell&asset0_name=SWDA&asset0_target=20&asset0_price=100,00&asset0_quantity=10&asset0_pmc=85&asset0_taxRate=26&asset1_name=IUSN&asset1_target=20&asset1_price=90,00&asset1_quantity=12&asset1_pmc=80&asset1_taxRate=26&asset2_name=PHAU&asset2_target=20&asset2_price=270,00&asset2_quantity=4&asset2_pmc=240&asset2_taxRate=26&asset3_name=IBGL&asset3_target=20&asset3_price=120,00&asset3_quantity=8&asset3_pmc=130&asset3_taxRate=12,5&asset4_name=EUNA&asset4_target=20&asset4_price=100,00&asset4_quantity=9&asset4_pmc=95&asset4_taxRate=26#calcolatore`;
        }}
        className="mx-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg text-sm hover:from-yellow-500 hover:to-yellow-700 transition-colors mt-5"
    >
        Golden Butterfly
    </button>

    <button
        onClick={() => {
            window.location.href = `?method=sell&asset0_name=SWDA&asset0_target=30&asset0_price=100,00&asset0_quantity=12&asset0_pmc=85&asset0_taxRate=26&asset1_name=IBGL&asset1_target=40&asset1_price=120,00&asset1_quantity=10&asset1_pmc=130&asset1_taxRate=12,5&asset2_name=EUNA&asset2_target=15&asset2_price=100,00&asset2_quantity=6&asset2_pmc=90&asset2_taxRate=26&asset3_name=PHAU&asset3_target=7.5&asset3_price=270,00&asset3_quantity=2&asset3_pmc=240&asset3_taxRate=26&asset4_name=CRUD&asset4_target=7.5&asset4_price=25,00&asset4_quantity=8&asset4_pmc=30&asset4_taxRate=26#calcolatore`;
        }}
        className="mx-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg text-sm hover:from-blue-600 hover:to-blue-800 transition-colors mt-5"
    >
        All Weather Portfolio
    </button>

                                                    <button
                                                        onClick={() => {
                                                            window.location.href = `?method=sell&asset0_name=SWDA&asset0_target=60&asset0_price=100,00&asset0_quantity=15&asset0_pmc=85&asset0_taxRate=26&asset1_name=AGGH&asset1_target=40&asset1_price=85,00&asset1_quantity=10&asset1_pmc=90&asset1_taxRate=12,5#calcolatore`;
                                                        }}
                                                        className="mx-2 px-3 py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-lg text-sm hover:from-gray-600 hover:to-gray-800 transition-colors mt-5"
                                                    >
                                                        Portafoglio 60/40
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            window.location.href = `?method=sell&asset0_name=SWDA&asset0_target=50&asset0_price=100,00&asset0_quantity=10&asset0_pmc=85&asset0_taxRate=26&asset1_name=BTC&asset1_target=25&asset1_price=35000,00&asset1_quantity=0,05&asset1_pmc=25000&asset1_taxRate=26&asset2_name=ETH&asset2_target=25&asset2_price=1900,00&asset2_quantity=0,7&asset2_pmc=2200&asset2_taxRate=26#calcolatore`;
                                                        }}
                                                        className="mx-2 px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-700 text-white rounded-lg text-sm hover:from-pink-600 hover:to-purple-800 transition-colors mt-5"
                                                    >
                                                        Crypto + Azioni (50/50)
                                                    </button>

    <button
        onClick={() => {
            window.location.href = `?method=sell&asset0_name=BTC&asset0_target=40&asset0_price=35000,00&asset0_quantity=0,06&asset0_pmc=25000&asset0_taxRate=26&asset1_name=ETH&asset1_target=30&asset1_price=1900,00&asset1_quantity=0,8&asset1_pmc=2200&asset1_taxRate=26&asset2_name=SOL&asset2_target=15&asset2_price=150,00&asset2_quantity=5&asset2_pmc=100&asset2_taxRate=26&asset3_name=USDC&asset3_target=15&asset3_price=1,00&asset3_quantity=100&asset3_pmc=1&asset3_taxRate=0#calcolatore`;
        }}
        className="mx-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg text-sm hover:from-orange-600 hover:to-yellow-600 transition-colors mt-5"
    >
        Crypto Diversificato
    </button>
</div>

                                                </div>
                                            }

                                        </div>

                                    )}

                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {showClearConfirm && (<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-auto relative animate-fade-in shadow-2xl"><h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Conferma pulizia form</h3><p className="text-gray-600 dark:text-gray-300 mb-6">Sei sicuro di voler cancellare tutti i dati inseriti? Questa azione non può essere annullata.</p><div className="flex justify-end gap-4"><button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md transition-colors">Annulla</button><button onClick={clearForm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Conferma</button></div></div></div>)}
        </div>
    );
};

export default Calculator;