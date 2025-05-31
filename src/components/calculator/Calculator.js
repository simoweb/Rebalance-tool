import React, { useState, useEffect } from 'react';
import PortfolioCharts from '../PortfolioCharts';



const Calculator = () => {
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
    
      const parseLocaleFloat = (value) => {
        if (typeof value === 'number') {
          return value;
        }
        if (typeof value === 'string') {
          const sanitizedValue = value.replace(',', '.');
          const parsed = parseFloat(sanitizedValue);
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0; 
      };
      
      const updateURL = (newAssets, newMethod, newCash) => {
        const params = new URLSearchParams();
        params.set('method', newMethod);
        if (newCash && (newMethod === 'add' || newMethod === 'add_and_rebalance')) { // Mostra cash solo se rilevante
          params.set('cash', newCash);
        }
        newAssets.forEach((asset, index) => {
          if (asset.name || asset.targetPercentage || asset.currentPrice || asset.quantity) {
            params.set(`asset${index}_name`, asset.name);
            params.set(`asset${index}_target`, asset.targetPercentage);
            params.set(`asset${index}_price`, asset.currentPrice);
            params.set(`asset${index}_quantity`, asset.quantity);
          }
        });
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
      };
    
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
          if (cash && (method === 'add' || method === 'add_and_rebalance')) setAvailableCash(cash);
          else setAvailableCash(''); // Pulisci se il metodo non richiede cash
        } else if (!window.location.search) {
            // Opzionale: non fare nulla o resettare solo se non ci sono parametri
        }
      };
  
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
        // Ricalcola solo se tutti i dati necessari sono presenti e validi
        if (isDataComplete(assets, rebalanceMethod, availableCash, getTotalPercentage())) {
            const results = calculateRebalancing();
            if (results) {
                setCalculationResults(results);
                setShowResults(true);
            }
        } else if (showResults) { // Se i dati diventano incompleti, nascondi i vecchi risultati
            setShowResults(false);
            setCalculationResults(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assets, rebalanceMethod, availableCash]); // Dipendenze chiave che triggerano ricalcolo
    
      useEffect(() => {
        loadFromURL();
        const handleURLChange = () => { loadFromURL(); };
        window.addEventListener('popstate', handleURLChange);
        return () => { window.removeEventListener('popstate', handleURLChange); };
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
    
      const addAsset = () => {
        const newAssets = [...assets, { name: '', targetPercentage: '', currentPrice: '', quantity: '' }];
        setAssets(newAssets);
        // updateURL(newAssets, rebalanceMethod, availableCash); // L'useEffect [assets] si occuperà di questo indirettamente
      };
    
      const updateAsset = (index, field, value) => {
        const newAssets = assets.map((asset, i) => i === index ? { ...asset, [field]: value } : asset);
        setAssets(newAssets);
        // updateURL(newAssets, rebalanceMethod, availableCash);
      };
    
      const handleMethodChange = (e) => {
        const newMethod = e.target.value;
        setRebalanceMethod(newMethod);
        if (newMethod === 'sell') setAvailableCash(''); // Pulisci cash se si passa a 'sell'
        // updateURL(assets, newMethod, newMethod === 'sell' ? '' : availableCash);
      };
    
      const handleCashChange = (e) => {
        const newCash = e.target.value;
        setAvailableCash(newCash);
        // updateURL(assets, rebalanceMethod, newCash);
      };

      // Ho modificato isDataComplete per prendere i valori correnti come argomenti
      // per evitare problemi di "stale closure" nell'useEffect di ricalcolo.
      const isDataComplete = (currentAssets, currentMethod, currentCash, currentTotalPercentage) => {
        if (currentAssets.length === 0 || !currentAssets.every(isAssetComplete)) return false;
        
        const totalPercentage = currentTotalPercentage; // Usa la somma passata
        if (Math.abs(totalPercentage - 100) >= 0.01) return false;

        if (currentMethod === 'add' || currentMethod === 'add_and_rebalance') {
          return String(currentCash).trim() !== '';
        }
        return true;
      };

      const isAssetComplete = (asset) => {
        return asset.name.trim() !== '' && 
               String(asset.targetPercentage).trim() !== '' && 
               String(asset.currentPrice).trim() !== '' && 
               String(asset.quantity).trim() !== '';
      };
    
      const getTotalPercentage = () => {
        return assets.reduce((sum, asset) => 
          sum + parseLocaleFloat(asset.targetPercentage), 0
        );
      };
    
      const isCurrentDataComplete = () => { // Funzione helper per il pulsante "Calcola"
        return isDataComplete(assets, rebalanceMethod, availableCash, getTotalPercentage());
      };

      const calculateAssetValue = (asset) => {
        if (!isAssetComplete(asset)) return null;
        return parseLocaleFloat(asset.currentPrice) * parseLocaleFloat(asset.quantity);
      };
    
      const calculateCurrentAllocation = () => {
        const currentTotalValue = assets.reduce((sum, asset) => {
          return sum + (parseLocaleFloat(asset.currentPrice) * parseLocaleFloat(asset.quantity));
        }, 0);
    
        return assets.map(asset => {
          const value = parseLocaleFloat(asset.currentPrice) * parseLocaleFloat(asset.quantity);
          const percentage = currentTotalValue ? (value / currentTotalValue) * 100 : 0;
          return {
            ...asset, 
            currentValue: value, 
            currentPercentage: percentage 
          };
        });
      };
    
    // ... (resto del componente Calculator come prima, inclusa parseLocaleFloat e isQuantityInputFractional)

      const isQuantityInputFractional = (quantityString) => {
  const num = parseLocaleFloat(quantityString); // parseLocaleFloat gestisce la virgola
  return num % 1 !== 0;
};

      const calculateRebalancing = () => {
        let allocations = calculateCurrentAllocation(); 
        const initialTotalValue = allocations.reduce((sum, asset) => sum + asset.currentValue, 0);

        const totalTargetPercentageInput = assets.reduce((sum, asset) => sum + parseLocaleFloat(asset.targetPercentage), 0);
        const scaleFactor = (totalTargetPercentageInput === 0) ? 0 : 100 / totalTargetPercentageInput;

        let finalResults = [];
        let excessCashVal = 0;

        // Helper per decidere l'arrotondamento delle unità
        const getUnitsCalculated = (valueDifference, price, originalQuantityString) => {
            if (price <= 0) return 0;
            const calculatedRawUnits = valueDifference / price;
            const isFractional = isQuantityInputFractional(originalQuantityString);
            return isFractional ? calculatedRawUnits : Math.round(calculatedRawUnits);
        };

        if (rebalanceMethod === 'sell') {
            const calculated = allocations.map(asset => {
                const assetCurrentPrice = parseLocaleFloat(asset.currentPrice);
                const assetQuantityNum = parseLocaleFloat(asset.quantity); // Quantità numerica iniziale
                const finalAssetTargetPercentage = parseLocaleFloat(asset.targetPercentage) * scaleFactor;
                const targetValue = initialTotalValue * (finalAssetTargetPercentage / 100);
                const difference = targetValue - asset.currentValue;
                
                const unitsToAdjust = getUnitsCalculated(difference, assetCurrentPrice, asset.quantity); // Usa helper
                
                const newQuantity = assetQuantityNum + unitsToAdjust;
                return {
                    ...asset,
                    adjustment: unitsToAdjust,
                    adjustmentValueNum: unitsToAdjust * assetCurrentPrice, // L'aggiustamento monetario sarà preciso
                    newQuantity: newQuantity,
                    adjustedTargetPercentageNum: finalAssetTargetPercentage,
                };
            });
            const newPortfolioTotalValue = calculated.reduce((sum, r) => sum + (r.newQuantity * parseLocaleFloat(r.currentPrice)), 0);
            finalResults = calculated.map(r => ({
                ...r, 
                adjustmentValue: r.adjustmentValueNum.toFixed(2),
                newPercentage: (newPortfolioTotalValue > 0 ? ((r.newQuantity * parseLocaleFloat(r.currentPrice)) / newPortfolioTotalValue * 100) : 0).toFixed(2),
                adjustedTargetPercentage: r.adjustedTargetPercentageNum.toFixed(2),
            }));
            const totalNetCashFromSales = finalResults.reduce((sum, r) => sum - r.adjustmentValueNum, 0); 
            excessCashVal = totalNetCashFromSales;

        } else if (rebalanceMethod === 'add_and_rebalance') {
            const addedCash = parseLocaleFloat(availableCash);
            const newTotalPortfolioValue = initialTotalValue + addedCash;

            const calculated = allocations.map(asset => {
                const assetCurrentPrice = parseLocaleFloat(asset.currentPrice);
                const assetQuantityNum = parseLocaleFloat(asset.quantity);
                const finalAssetTargetPercentage = parseLocaleFloat(asset.targetPercentage) * scaleFactor;
                const targetAssetValue = newTotalPortfolioValue * (finalAssetTargetPercentage / 100);
                const valueDifference = targetAssetValue - asset.currentValue;

                const unitsToAdjust = getUnitsCalculated(valueDifference, assetCurrentPrice, asset.quantity); // Usa helper

                const newQuantity = assetQuantityNum + unitsToAdjust;
                return {
                    ...asset,
                    adjustment: unitsToAdjust,
                    adjustmentValueNum: unitsToAdjust * assetCurrentPrice,
                    newQuantity: newQuantity,
                    adjustedTargetPercentageNum: finalAssetTargetPercentage,
                };
            });
            const finalPortfolioValueAfterRebalance = calculated.reduce((sum, r) => sum + (r.newQuantity * parseLocaleFloat(r.currentPrice)), 0);
            finalResults = calculated.map(r => ({
                ...r,
                adjustmentValue: r.adjustmentValueNum.toFixed(2),
                newPercentage: (finalPortfolioValueAfterRebalance > 0 ? ((r.newQuantity * parseLocaleFloat(r.currentPrice)) / finalPortfolioValueAfterRebalance * 100) : 0).toFixed(2),
                adjustedTargetPercentage: r.adjustedTargetPercentageNum.toFixed(2),
            }));
            const totalCashUsedForTransactions = finalResults.reduce((sum, r) => sum + parseLocaleFloat(r.adjustmentValue), 0);
            excessCashVal = addedCash - totalCashUsedForTransactions;

        } else if (rebalanceMethod === 'add') { 
            const availableCashValue = parseLocaleFloat(availableCash);
            let tempTotalValue = initialTotalValue;
            let currentCashPool = availableCashValue;
            let allocationsForThisMethod = JSON.parse(JSON.stringify(allocations));

            let preCalcForAdd = allocationsForThisMethod.map(asset => {
                const assetCurrentPrice = parseLocaleFloat(asset.currentPrice);
                const finalAssetTargetPercentage = parseLocaleFloat(asset.targetPercentage) * scaleFactor;
                const targetValueWithCash = (tempTotalValue + currentCashPool) * (finalAssetTargetPercentage / 100);
                const diff = targetValueWithCash - asset.currentValue;
                
                const unitsToBuyInitially = getUnitsCalculated(diff, assetCurrentPrice, asset.quantity); // Usa helper
                // Assicurati che unitsToBuyInitially sia positivo per un acquisto
                const positiveUnitsToBuy = Math.max(0, unitsToBuyInitially);

                return {
                    ...asset, 
                    unitsToBuyInitially: positiveUnitsToBuy, // Solo unità positive o zero
                    costToBuyInitially: positiveUnitsToBuy * assetCurrentPrice,
                    finalAssetTargetPercentage,
                    unitsSoldPreviously: 0,
                };
            });

            let totalInitialBuyCost = preCalcForAdd.reduce((sum, r) => sum + r.costToBuyInitially, 0);
            const salesToFundPurchases_records = [];

            if (totalInitialBuyCost > currentCashPool) {
                allocationsForThisMethod.forEach(assetForSaleDecision => {
                    const assetCurrentPrice = parseLocaleFloat(assetForSaleDecision.currentPrice);
                    const finalAssetTargetPercentage = parseLocaleFloat(assetForSaleDecision.targetPercentage) * scaleFactor;
                    const targetValueForSaleDecision = initialTotalValue * (finalAssetTargetPercentage / 100);
                    const diffForSale = assetForSaleDecision.currentValue - targetValueForSaleDecision;
                    
                    // Per le vendite, diffForSale positivo significa eccesso.
                    // getUnitsCalculated aspetta una 'valueDifference' dove positivo è target > current.
                    // Quindi per la vendita, la 'differenza' per raggiungere il target è negativa.
                    // targetValueForSaleDecision - assetForSaleDecision.currentValue darà una diff negativa se c'è da vendere.
                    const saleDiff = targetValueForSaleDecision - assetForSaleDecision.currentValue;
                    const unitsToSellCalculated = getUnitsCalculated(saleDiff, assetCurrentPrice, assetForSaleDecision.quantity);
                    const unitsToSell = Math.min(0, unitsToSellCalculated); // Prendi solo valori negativi (vendite) o zero

                    if (unitsToSell < 0) { // Se unitsToSell è negativo, significa che vendiamo Math.abs(unitsToSell)
                        salesToFundPurchases_records.push({
                            name: assetForSaleDecision.name,
                            unitsToSell: Math.abs(unitsToSell), // Memorizza come positivo
                            cashGenerated: Math.abs(unitsToSell) * assetCurrentPrice,
                        });
                    }
                });

                const totalCashGeneratedFromSales = salesToFundPurchases_records.reduce((sum, s) => sum + s.cashGenerated, 0);
                currentCashPool += totalCashGeneratedFromSales;
                tempTotalValue -= totalCashGeneratedFromSales;

                allocationsForThisMethod = allocationsForThisMethod.map(currentAllocAsset => {
                    const saleRecord = salesToFundPurchases_records.find(s => s.name === currentAllocAsset.name);
                    if (saleRecord) {
                        const newQuantityNum = parseLocaleFloat(currentAllocAsset.quantity) - saleRecord.unitsToSell;
                        return { ...currentAllocAsset, quantity: newQuantityNum.toString(), currentValue: newQuantityNum * parseLocaleFloat(currentAllocAsset.currentPrice) };
                    }
                    return currentAllocAsset;
                });

                preCalcForAdd = allocationsForThisMethod.map(assetAfterSale => {
                    const assetCurrentPrice = parseLocaleFloat(assetAfterSale.currentPrice);
                    const finalAssetTargetPercentage = parseLocaleFloat(assetAfterSale.targetPercentage) * scaleFactor;
                    const targetValueWithCash = (tempTotalValue + currentCashPool) * (finalAssetTargetPercentage / 100);
                    const diff = targetValueWithCash - assetAfterSale.currentValue;
                    
                    const unitsToBuyRecalculated = getUnitsCalculated(diff, assetCurrentPrice, assetAfterSale.quantity);
                    const positiveUnitsToBuyRecalculated = Math.max(0, unitsToBuyRecalculated);

                    const saleInfo = salesToFundPurchases_records.find(s => s.name === assetAfterSale.name);
                    return { 
                        ...assetAfterSale, 
                        unitsToBuyInitially: positiveUnitsToBuyRecalculated, 
                        costToBuyInitially: positiveUnitsToBuyRecalculated * assetCurrentPrice, 
                        finalAssetTargetPercentage, 
                        unitsSoldPreviously: saleInfo ? saleInfo.unitsToSell : 0, // unitsToSell qui è positivo
                    };
                });
            }

            let cashSpentInBuys = 0;
            const calculatedAdd = preCalcForAdd.map(r_intermediate_calc => {
                let unitsToBuyFinal = 0;
                const costForThisAssetToReachTarget = r_intermediate_calc.costToBuyInitially; // Basato su unitsToBuyInitially (già arrotondato/frazionato e positivo)
                const assetIsActuallyFractional = isQuantityInputFractional(r_intermediate_calc.quantity); // Usa la quantity (potenzialmente aggiornata ma il tipo non cambia)

                if (costForThisAssetToReachTarget > 0 && (cashSpentInBuys + costForThisAssetToReachTarget <= currentCashPool)) {
                    unitsToBuyFinal = r_intermediate_calc.unitsToBuyInitially; // Questo è già stato calcolato come intero o frazionato
                    // cashSpentInBuys += costForThisAssetToReachTarget; // Non aggiungere qui, ma dopo aver confermato unitsToBuyFinal
                } else if (costForThisAssetToReachTarget > 0 && cashSpentInBuys < currentCashPool) {
                    const remainingCashInPoolForBuys = currentCashPool - cashSpentInBuys;
                    const assetPrice = parseLocaleFloat(r_intermediate_calc.currentPrice);
                    if (assetPrice > 0) {
                        const unitsAffordableRaw = remainingCashInPoolForBuys / assetPrice;
                        unitsToBuyFinal = assetIsActuallyFractional ? unitsAffordableRaw : Math.floor(unitsAffordableRaw);
                    }
                }
                // Assicura che unitsToBuyFinal sia positivo o zero
                unitsToBuyFinal = Math.max(0, unitsToBuyFinal);
                cashSpentInBuys += unitsToBuyFinal * parseLocaleFloat(r_intermediate_calc.currentPrice);

                const netUnitsAdjustment = unitsToBuyFinal - (r_intermediate_calc.unitsSoldPreviously || 0);
                const quantityAfterSalesBeforeThisBuy = parseLocaleFloat(r_intermediate_calc.quantity);
                return { 
                    ...r_intermediate_calc, 
                    adjustment: netUnitsAdjustment, 
                    adjustmentValueNum: netUnitsAdjustment * parseLocaleFloat(r_intermediate_calc.currentPrice), 
                    newQuantity: quantityAfterSalesBeforeThisBuy + unitsToBuyFinal,
                };
            });
            
            const finalPortfolioValueAdd = calculatedAdd.reduce((sum, r) => sum + (r.newQuantity * parseLocaleFloat(r.currentPrice)), 0);
            finalResults = calculatedAdd.map(r_final_calc => {
                const originalAssetData = assets.find(a => a.name === r_final_calc.name); 
                const initialAllocationData = allocations.find(a => a.name === r_final_calc.name); 
                return {
                    name: originalAssetData.name, quantity: originalAssetData.quantity, currentPrice: originalAssetData.currentPrice, targetPercentage: originalAssetData.targetPercentage, 
                    currentValue: initialAllocationData.currentValue, currentPercentage: initialAllocationData.currentPercentage, 
                    adjustment: r_final_calc.adjustment, adjustmentValue: r_final_calc.adjustmentValueNum.toFixed(2), newQuantity: r_final_calc.newQuantity,
                    newPercentage: (finalPortfolioValueAdd > 0 ? ((r_final_calc.newQuantity * parseLocaleFloat(originalAssetData.currentPrice)) / finalPortfolioValueAdd * 100) : 0).toFixed(2),
                    adjustedTargetPercentage: r_final_calc.finalAssetTargetPercentage.toFixed(2), 
                };
            });
            excessCashVal = currentCashPool - cashSpentInBuys;
        }
        
        return { results: finalResults, excessCash: excessCashVal.toFixed(2) };
      };

// ... resto del componente Calculator, assicurati che isQuantityInputFractional sia definito prima di Calculator o al suo interno.
// Se la definisci dentro Calculator, non serve passarla come prop, ma assicurati sia accessibile da calculateRebalancing.
// Per semplicità, l'ho definita fuori (o potrebbe essere all'inizio del file .js).
// Se è dentro il componente Calculator, va bene così.

    
      const handleCalculate = () => {
        if (isCurrentDataComplete()) { // Usa la funzione helper per il check sul pulsante
          const results = calculateRebalancing();
          if (results) { 
            setCalculationResults(results);
            setShowResults(true);
            // Aggiorna URL qui, perché ora abbiamo risultati validi
            updateURL(assets, rebalanceMethod, availableCash);
          } else {
            setShowResults(false);
            setCalculationResults(null);
          }
        } else {
            // Opzionale: mostra un messaggio che i dati non sono completi
            setShowResults(false);
            setCalculationResults(null);
        }
      };
    
      const clearForm = () => {
        setAssets([{ name: '', targetPercentage: '', currentPrice: '', quantity: '' }]);
        setRebalanceMethod('sell');
        setAvailableCash('');
        setShowResults(false);
        setCalculationResults(null);
        window.history.replaceState({}, '', window.location.pathname); // Pulisce URL
        setScrollForm(true);
        setShowClearConfirm(false);
      };
    
      const copyLink = async () => { // Usa i dati correnti per il link
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
            }
          });
          
          const urlToCopy = `${baseUrl}?${params.toString()}#calcolatore`;
          await navigator.clipboard.writeText(urlToCopy);
          setShowCopyTooltip(true);
          setTimeout(() => { setShowCopyTooltip(false); }, 2000);
        } catch (err) { console.error('Failed to copy link:', err); }
      };
      
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
        return () => { navLinks.forEach(link => { link.removeEventListener('click', handleAnchorClick); });
                       document.documentElement.style.scrollBehavior = ''; };
      }, [setIsMenuOpen]);
    
      const removeAsset = (index) => {
        const newAssets = assets.filter((_, i) => i !== index);
        setAssets(newAssets);
        // updateURL(newAssets, rebalanceMethod, availableCash); // L'useEffect si occuperà
      };    

  return (
    <div>
     <section id="calcolatore" className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-teal-400 transform transition-all duration-500 py-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
     <div className="container mx-auto px-4 mb-8">
       <h2 className="text-3xl font-bold text-center mb-12 text-white mt-4">Calcola il Ribilanciamento</h2>
       <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-3xl p-4 md:p-8 dark:bg-gray-800/50">
         <div className="flex flex-col lg:flex-row gap-8">
           {/* Colonna sinistra - Form */}
           <div className="lg:w-1/2 px-2 md:px-0">
             <div className="mb-6">
               <div className="flex items-center">
                 <label className="w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">
                   Metodo
                 </label>
                 <select
                   className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent"
                   value={rebalanceMethod}
                   onChange={handleMethodChange}
                 >
                   <option value="sell">Ribilancia</option>
                   <option value="add">Aggiungi liquidità e ribilancia</option>
                   {/* <option value="add_and_rebalance">Aggiungi liquidità e ribilancia</option> */}
                 </select>
               </div>
             </div>

             {(rebalanceMethod === 'add' || rebalanceMethod === 'add_and_rebalance') && (
               <div className="mb-6">
                 <div className="flex items-center">
                   <label className="w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">
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
                 <div key={index} className="p-6 border rounded-lg bg-gray-50 shadow-sm relative dark:bg-gray-800/50 dark:text-gray-400 dark:border-transparent">
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
                     <div className="flex items-center">
                       <label className="w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">Nome</label>
                       <input type="text" placeholder="es: VWCE" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent" value={asset.name} onChange={(e) => updateAsset(index, 'name', e.target.value)} />
                     </div>
                     <div className="flex items-center">
                       <label className="w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">Target (%)</label>
                       <input type="text" inputMode="decimal" placeholder="es: 60 o 60,5" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent" value={asset.targetPercentage} onChange={(e) => updateAsset(index, 'targetPercentage', e.target.value)} />
                     </div>
                     <div className="flex items-center">
                       <label className="w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">Prezzo (€)</label>
                       <input type="text" inputMode="decimal" placeholder="es: 100 o 100,25" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent" value={asset.currentPrice} onChange={(e) => updateAsset(index, 'currentPrice', e.target.value)} />
                     </div>
                     <div className="flex items-center">
                       <label className="w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">Quantità</label>
                       <input type="text" inputMode="decimal" placeholder="es: 10 o 10,3" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent" value={asset.quantity} onChange={(e) => updateAsset(index, 'quantity', e.target.value)} />
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
                   disabled={!isCurrentDataComplete()} // Usa isCurrentDataComplete per il pulsante
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
                   <div className="flex justify-between items-center mb-6 px-6">
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
                     if (message) { // Mostra solo se c'è un messaggio (cioè non è un caso non gestito o zero in alcuni contesti)
                       return (
                         <div className={`mx-6 mb-6 p-4 border rounded-lg ${excessCashNum >= 0 ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                           <p className="text-sm md:text-base">{message}
                               <span className="ml-2 font-semibold">{excessCashNum.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span>
                           </p>
                         </div>);
                     } return null;
                   })()}
                    {/* Tab Navigation e Content (Grafici/Tabella) come prima */}
                   <div className="border-b border-gray-200 dark:border-gray-700 mb-6 px-6">
                     <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                       <button onClick={() => setActiveTab('grafici')} className={`${activeTab === 'grafici' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Grafici</button>
                       <button onClick={() => setActiveTab('tabella')} className={`${activeTab === 'tabella' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Tabella</button>
                     </nav>
                   </div>
                   {activeTab === 'grafici' ? (
                     <div className="px-6">
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
                                   {(parseLocaleFloat(result.quantity) * parseLocaleFloat(result.currentPrice)).toLocaleString('it-IT', {style: 'currency', currency: 'EUR'})}
                                   {' → '}
                                   {(result.newQuantity * parseLocaleFloat(result.currentPrice)).toLocaleString('it-IT', {style: 'currency', currency: 'EUR'})}
                                 </p>
                               </div>
                             </div>
                             <div className="text-right">
                               <p className={`font-medium ${result.adjustment > 0 ? 'text-green-600 dark:text-green-400' : result.adjustment < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>{result.adjustment > 0 ? '+' : ''}{result.adjustment.toLocaleString('it-IT')} unità</p>
                               <p className="text-sm text-gray-500 dark:text-gray-400">{parseLocaleFloat(result.adjustmentValue).toLocaleString('it-IT', {style: 'currency', currency: 'EUR'})}</p>
                             </div>
                           </div>))}
                       </div>
                       <PortfolioCharts assets={assets} currentAllocation={calculateCurrentAllocation()} />
                     </div>
                   ) : ( /* Tabella */
                     <div className="space-y-4 px-6">
                       {calculationResults.results.map((result, index) => (
                         <div key={index} className="p-4 bg-white rounded-lg shadow-sm dark:bg-gray-700">
                           <div className="flex justify-between items-start mb-3">
                             <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-gray-100">{result.name}</h3>
                             <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">{parseLocaleFloat(result.currentPercentage).toFixed(2)}% → {parseLocaleFloat(result.newPercentage).toFixed(2)}%</span>
                           </div>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div><p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Allocazione target</p><p className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200">{parseLocaleFloat(result.adjustedTargetPercentage).toFixed(2)}%</p></div>
                             <div><p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Quantità attuale</p><p className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200">{parseLocaleFloat(result.quantity).toLocaleString('it-IT')} unità</p></div>
                             <div><p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Aggiustamento</p><p className={`text-sm md:text-base font-medium ${result.adjustment >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{result.adjustment.toLocaleString('it-IT')} unità <span className={`text-xs md:text-sm ml-1`}>({result.adjustment >= 0 ? '+' : ''}{parseLocaleFloat(result.adjustmentValue).toLocaleString('it-IT', {style: 'currency', currency: 'EUR'})})</span></p></div>
                             <div><p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Nuova quantità</p><div className="flex justify-between items-center"><p className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200">{result.newQuantity.toLocaleString('it-IT')} unità</p><p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{(result.newQuantity * parseLocaleFloat(result.currentPrice)).toLocaleString('it-IT', {style: 'currency', currency: 'EUR'})}</p></div></div>
                           </div>
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
             ) : ( <div className="h-full flex items-center justify-center p-8 text-center"><p className="text-gray-500 dark:text-gray-400">{isCurrentDataComplete() ? "Clicca 'Calcola' per vedere i risultati." : (assets.length > 0 && assets.some(a => String(a.targetPercentage).trim() !== '') && Math.abs(getTotalPercentage() - 100) >= 0.01) ? "La somma delle percentuali target deve essere 100%." : "Completa tutti i campi degli asset. Assicurati che la somma delle percentuali target sia 100% e, se necessario, inserisci la liquidità."}</p></div>)}
           </div>
         </div>
       </div>
     </div>
   </section>
    {showClearConfirm && ( <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-auto relative animate-fade-in shadow-2xl"><h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Conferma pulizia form</h3><p className="text-gray-600 dark:text-gray-300 mb-6">Sei sicuro di voler cancellare tutti i dati inseriti? Questa azione non può essere annullata.</p><div className="flex justify-end gap-4"><button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md transition-colors">Annulla</button><button onClick={clearForm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Conferma</button></div></div></div>)}
   </div>
  );
};



export default Calculator; 