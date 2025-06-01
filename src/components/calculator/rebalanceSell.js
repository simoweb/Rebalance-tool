// rebalancePortfolio.js (Versione Corretta e Robusta)
import { parseLocaleFloat, getUnitsCalculated } from './utils'; // Importa le funzioni di utilità

/**
 * Esegue un ribilanciamento completo e sicuro del portafoglio.
 * Vende gli asset in sovrappeso, calcola il ricavato esatto, e lo usa per acquistare 
 * gli asset in sottopeso, garantendo che la liquidità finale non sia mai negativa.
 *
 * @param {Array<Object>} allocations - L'array di asset con i valori e le percentuali correnti.
 * @param {number} initialTotalValue - Il valore totale iniziale del portafoglio.
 * @param {Array<Object>} assets - L'array originale di asset.
 * @param {number} scaleFactor - Fattore di scala per normalizzare le percentuali target.
 * @returns {{results: Array<Object>, excessCash: number}} I risultati del ribilanciamento e il cash residuo (sempre >= 0).
 */
export const rebalancePortfolio = (allocations, initialTotalValue, assets, scaleFactor) => {
    // Passaggio 1: Calcola le differenze iniziali e i dati necessari per ogni asset
    let assetsToProcess = allocations.map(asset => {
        const finalAssetTargetPercentage = parseLocaleFloat(asset.targetPercentage) * scaleFactor;
        const targetValue = initialTotalValue * (finalAssetTargetPercentage / 100);
        const difference = targetValue - asset.currentValue;
        return {
            ...asset,
            difference,
            finalAssetTargetPercentage,
            adjustment: 0,
            adjustmentValueNum: 0,
            newQuantity: parseLocaleFloat(asset.quantity),
        };
    });

    // Passaggio 2: Esegui tutte le vendite e calcola la liquidità REALE generata
    let cashPool = 0;
    assetsToProcess.forEach(asset => {
        if (asset.difference < 0) { // Se l'asset è sovrappeso, vendi
            const assetCurrentPrice = parseLocaleFloat(asset.currentPrice);
            const originalAsset = assets.find(a => a.name === asset.name);
            
            const unitsToSell = getUnitsCalculated(asset.difference, assetCurrentPrice, originalAsset.quantity);
            const valueOfSale = unitsToSell * assetCurrentPrice;

            asset.adjustment = unitsToSell;
            asset.adjustmentValueNum = valueOfSale;
            asset.newQuantity += unitsToSell;
            
            cashPool -= valueOfSale; // valueOfSale è negativo, quindi lo sommiamo al pool
        }
    });

    // Passaggio 3: Calcola il fabbisogno totale per gli acquisti e il capitale investibile
    const totalPurchaseNeed = assetsToProcess
        .filter(asset => asset.difference > 0)
        .reduce((sum, asset) => sum + asset.difference, 0);
    
    const investableCash = Math.min(cashPool, totalPurchaseNeed);

    // Passaggio 4: Esegui gli acquisti usando la liquidità disponibile
    if (investableCash > 0) {
        assetsToProcess.forEach(asset => {
            if (asset.difference > 0) { // Se l'asset è sottopeso, acquista
                const assetCurrentPrice = parseLocaleFloat(asset.currentPrice);
                const originalAsset = assets.find(a => a.name === asset.name);

                // Distribuisce il capitale investibile in modo proporzionale
                const cashForThisAsset = (asset.difference / totalPurchaseNeed) * investableCash;
                const unitsToBuy = getUnitsCalculated(cashForThisAsset, assetCurrentPrice, originalAsset.quantity);
                const valueOfPurchase = unitsToBuy * assetCurrentPrice;

                asset.adjustment = unitsToBuy;
                asset.adjustmentValueNum = valueOfPurchase;
                // Partiamo dalla quantità originale per evitare di sommare a un valore già modificato dalle vendite
                asset.newQuantity = parseLocaleFloat(asset.quantity) + unitsToBuy;
            }
        });
    }

    // Passaggio 5: Calcola i totali finali e formatta l'output
    const cashUsedInPurchases = assetsToProcess
        .filter(r => r.adjustment > 0)
        .reduce((sum, r) => sum + r.adjustmentValueNum, 0);

    let excessCashVal = cashPool - cashUsedInPurchases;

    // CLAUSOLA DI SICUREZZA FINALE: Garantisce che la liquidità non sia mai negativa.
    excessCashVal = Math.max(0, excessCashVal);

    const newPortfolioTotalValue = assetsToProcess.reduce((sum, r) => sum + (r.newQuantity * parseLocaleFloat(r.currentPrice)), 0);

    const finalResults = assetsToProcess.map(r => ({
        ...r,
        adjustmentValue: r.adjustmentValueNum.toFixed(2),
        newPercentage: (newPortfolioTotalValue > 0 ? ((r.newQuantity * parseLocaleFloat(r.currentPrice)) / newPortfolioTotalValue * 100) : 0).toFixed(2),
        adjustedTargetPercentage: r.finalAssetTargetPercentage.toFixed(2),
    }));

    return { results: finalResults, excessCash: excessCashVal };
};