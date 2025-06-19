import React, { useState, useEffect, useCallback } from 'react';
import PortfolioCharts from '../PortfolioCharts';

// Importa le funzioni di utilità
import { parseLocaleFloat, isQuantityInputFractional, calculateCurrentAllocation } from './utils';

// Importa la funzione principale di ribilanciamento
import { calculateRebalancing } from './rebalancingCalculator';
import AssetInputs from '../form/assetInputs';
import Results from '../form/results';


const Calculator = () => {
    // --- State Hooks ---
    const [assets, setAssets] = useState([
        { name: '', targetPercentage: '', currentPrice: '', quantity: '', pmc: '', taxRate: '', isFractionable: false, taxCalculate: false,  }
    ]);
    const [rebalanceMethod, setRebalanceMethod] = useState('sell'); // Default
    const [availableCash, setAvailableCash] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [calculationResults, setCalculationResults] = useState(null);
    
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [scrollForm, setScrollForm] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Aggiunto per coerenza con useEffect
    

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
                params.set(`asset${index}_taxCalculate`, asset.taxCalculate);
                params.set(`asset${index}_fractionable`, asset.isFractionable);
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
            const taxCalculate = params.get(`asset${i}_taxCalculate`);
            const fractionable = params.get(`asset${i}_fractionable`);
            if (!name && !target && !price && !quantity) break;
            newAssets.push({
                name: name || '',
                targetPercentage: target || '',
                currentPrice: price || '',
                taxRate: taxRate || '',
                pmc: pmc || '',
                quantity: quantity || '',
                taxCalculate: taxCalculate === 'true',
                isFractionable: fractionable === 'true',
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
        const newAssets = [...assets, { name: '', targetPercentage: '', currentPrice: '', quantity: '', pmc: '', taxRate: '', isFractionable: false, taxCalculate:false }];
        setAssets(newAssets);
    };

    const updateAsset = (index, field, value) => {
        const newAssets = assets.map((asset, i) => i === index ? { ...asset, [field]: value } : asset);
        console.log(newAssets)
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
        setAssets([{ name: '', targetPercentage: '', currentPrice: '', quantity: '', pmc: '', taxRate: '', isFractionable: false, taxCalculate:false }]);
        setRebalanceMethod('sell');
        setAvailableCash('');
        setShowResults(false);
        setCalculationResults(null);
        window.history.replaceState({}, '', window.location.pathname);
        setScrollForm(true);
        setShowClearConfirm(false);
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
                                            <AssetInputs
                                                key={index}
                                                asset={asset}
                                                index={index}
                                                isAssetComplete={isAssetComplete}
                                                updateAsset={updateAsset}
                                                calculateAssetValue={calculateAssetValue}
                                            />
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

                            <Results 
                            assets={assets} 
                            showResults={showResults} 
                            calculationResults={calculationResults} 
                            isCurrentDataComplete={isCurrentDataComplete} 
                            rebalanceMethod={rebalanceMethod}
                            availableCash={availableCash}
                            getTotalPercentage={getTotalPercentage}
                            setShowClearConfirm={setShowClearConfirm}
                            />
                            
                        </div>
                    </div>
                </div>
            </section>
            {showClearConfirm && (<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-auto relative animate-fade-in shadow-2xl"><h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Conferma pulizia form</h3><p className="text-gray-600 dark:text-gray-300 mb-6">Sei sicuro di voler cancellare tutti i dati inseriti? Questa azione non può essere annullata.</p><div className="flex justify-end gap-4"><button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md transition-colors">Annulla</button><button onClick={clearForm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Conferma</button></div></div></div>)}
        </div>
    );
};

export default Calculator;