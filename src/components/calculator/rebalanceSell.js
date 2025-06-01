// rebalancePortfolio.js
import { parseLocaleFloat, getUnitsCalculated } from './utils';

export const rebalancePortfolio = (allocations, initialTotalValue, assets, scaleFactor) => {
    // ... (la logica di calcolo rimane invariata) ...
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

    let cashPool = 0;
    assetsToProcess.forEach(asset => {
        if (asset.difference < 0) {
            const assetCurrentPrice = parseLocaleFloat(asset.currentPrice);
            const originalAsset = assets.find(a => a.name === asset.name);
            const unitsToSell = getUnitsCalculated(asset.difference, assetCurrentPrice, originalAsset.quantity);
            const valueOfSale = unitsToSell * assetCurrentPrice;

            asset.adjustment = unitsToSell;
            asset.adjustmentValueNum = valueOfSale;
            asset.newQuantity += unitsToSell;
            cashPool -= valueOfSale;
        }
    });

    const totalPurchaseNeed = assetsToProcess
        .filter(asset => asset.difference > 0)
        .reduce((sum, asset) => sum + asset.difference, 0);
    
    const investableCash = Math.min(cashPool, totalPurchaseNeed);

    if (investableCash > 0) {
        assetsToProcess.forEach(asset => {
            if (asset.difference > 0) {
                const assetCurrentPrice = parseLocaleFloat(asset.currentPrice);
                const originalAsset = assets.find(a => a.name === asset.name);
                const cashForThisAsset = (asset.difference / totalPurchaseNeed) * investableCash;
                const unitsToBuy = getUnitsCalculated(cashForThisAsset, assetCurrentPrice, originalAsset.quantity);
                
                asset.adjustment = unitsToBuy;
                asset.adjustmentValueNum = unitsToBuy * assetCurrentPrice;
                asset.newQuantity = parseLocaleFloat(asset.quantity) + unitsToBuy;
            }
        });
    }

    const cashUsedInPurchases = assetsToProcess.filter(r => r.adjustment > 0).reduce((sum, r) => sum + r.adjustmentValueNum, 0);
    let excessCashVal = cashPool - cashUsedInPurchases;
    excessCashVal = Math.max(0, excessCashVal);

    const newPortfolioTotalValue = assetsToProcess.reduce((sum, r) => sum + (r.newQuantity * parseLocaleFloat(r.currentPrice)), 0);
    
    // MODIFICA APPLICATA QUI
    const finalResults = assetsToProcess.map(r => ({
        ...r,
        prezzoQuota: parseLocaleFloat(r.currentPrice).toFixed(2), // Aggiunto e formattato
        adjustmentValue: r.adjustmentValueNum.toFixed(2),
        newPercentage: (newPortfolioTotalValue > 0 ? ((r.newQuantity * parseLocaleFloat(r.currentPrice)) / newPortfolioTotalValue * 100) : 0).toFixed(2),
        adjustedTargetPercentage: r.finalAssetTargetPercentage.toFixed(2),
    }));

    return { results: finalResults, excessCash: excessCashVal };
};