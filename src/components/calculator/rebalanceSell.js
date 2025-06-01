// rebalancePortfolio.js (Versione Finale con Algoritmo Ibrido)
import { parseLocaleFloat, getUnitsCalculated } from './utils';

export const rebalancePortfolio = (allocations, initialTotalValue, assets, scaleFactor) => {
    // 1. Calcola il piano di ribilanciamento ideale
    let assetsToProcess = allocations.map(asset => {
        const finalAssetTargetPercentage = parseLocaleFloat(asset.targetPercentage) * scaleFactor;
        const targetValue = initialTotalValue * (finalAssetTargetPercentage / 100);
        const difference = targetValue - asset.currentValue;
        return {
            ...asset, difference, finalAssetTargetPercentage, adjustment: 0, adjustmentValueNum: 0,
            newQuantity: parseLocaleFloat(asset.quantity),
        };
    });

    // 2. Esegui tutte le vendite necessarie per generare il cash pool
    let cashPool = 0;
    const overweightAssets = assetsToProcess.filter(a => a.difference < 0);
    overweightAssets.forEach(asset => {
        const assetPrice = parseLocaleFloat(asset.currentPrice);
        if (assetPrice <= 0) return;

        const unitsToSell = getUnitsCalculated(asset.difference, assetPrice, asset.quantity);
        if (unitsToSell < 0) {
            const valueOfSale = unitsToSell * assetPrice;
            asset.adjustment = unitsToSell;
            asset.adjustmentValueNum = valueOfSale;
            cashPool -= valueOfSale; // valueOfSale è negativo
        }
    });

    // 3. Esegui gli acquisti utilizzando l'algoritmo ibrido
    const underweightAssets = assetsToProcess
        .filter(a => a.difference > 0)
        .sort((a,b) => b.difference - a.difference); // Ordina per priorità

    const totalPurchaseNeed = underweightAssets.reduce((sum, a) => sum + a.difference, 0);
    const cashToSpend = Math.min(cashPool, totalPurchaseNeed);
    let cashSpentSoFar = 0;

    // 3a. Acquisto Proporzionale Iniziale
    if (cashToSpend > 0 && totalPurchaseNeed > 0) {
        underweightAssets.forEach(asset => {
            const assetPrice = parseLocaleFloat(asset.currentPrice);
            if (assetPrice <= 0) return;

            const cashForThisAsset = (asset.difference / totalPurchaseNeed) * cashToSpend;
            const unitsToBuy = getUnitsCalculated(cashForThisAsset, assetPrice, asset.quantity);
            if (unitsToBuy > 0) {
                const costOfPurchase = unitsToBuy * assetPrice;
                asset.adjustment += unitsToBuy;
                asset.adjustmentValueNum += costOfPurchase;
                cashSpentSoFar += costOfPurchase;
            }
        });
    }

    // 3b. Ottimizzazione del Resto
    let remainderPool = cashToSpend - cashSpentSoFar;
    let purchasedInLoop = true;
    while (remainderPool > 0 && purchasedInLoop) {
        purchasedInLoop = false;
        // Ri-ordina ogni volta per dare priorità a chi è più vicino al prossimo acquisto
        underweightAssets.sort((a, b) => (parseLocaleFloat(a.currentPrice) - (a.adjustmentValueNum % parseLocaleFloat(a.currentPrice))) - (parseLocaleFloat(b.currentPrice) - (b.adjustmentValueNum % parseLocaleFloat(b.currentPrice))));
        for (const asset of underweightAssets) {
            const assetPrice = parseLocaleFloat(asset.currentPrice);
            if (assetPrice > 0 && remainderPool >= assetPrice) {
                asset.adjustment += 1;
                asset.adjustmentValueNum += assetPrice;
                remainderPool -= assetPrice;
                purchasedInLoop = true;
                break; 
            }
        }
    }

    // 4. Calcoli finali
    assetsToProcess.forEach(asset => {
        asset.newQuantity = parseLocaleFloat(asset.quantity) + asset.adjustment;
    });

    const totalCashUsedOnPurchases = assetsToProcess.filter(r => r.adjustment > 0).reduce((sum, r) => sum + r.adjustmentValueNum, 0);
    const excessCashVal = Math.max(0, cashPool - totalCashUsedOnPurchases);
    
    const newPortfolioTotalValue = assetsToProcess.reduce((sum, r) => sum + (r.newQuantity * parseLocaleFloat(r.currentPrice)), 0);
    const finalResults = assetsToProcess.map(r => ({
        ...r,
        prezzoQuota: parseLocaleFloat(r.currentPrice).toFixed(2),
        adjustmentValue: r.adjustmentValueNum.toFixed(2),
        newPercentage: (newPortfolioTotalValue > 0 ? ((r.newQuantity * parseLocaleFloat(r.currentPrice)) / newPortfolioTotalValue * 100) : 0).toFixed(2),
        adjustedTargetPercentage: r.finalAssetTargetPercentage.toFixed(2),
    }));

    return { results: finalResults, excessCash: excessCashVal };
};