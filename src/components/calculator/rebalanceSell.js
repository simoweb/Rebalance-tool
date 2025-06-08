// rebalancePortfolio.js (Versione Finale con Logica Prioritaria Semplificata)
import { parseLocaleFloat, getUnitsCalculated } from './utils';

const DEFAULT_TAX_RATE = 0.26; 

export const rebalancePortfolio = (allocations, initialTotalValue, assets, scaleFactor) => {
    // 1. Calcola il piano di ribilanciamento ideale
    let assetsToProcess = allocations.map(asset => {
        const finalAssetTargetPercentage = parseLocaleFloat(asset.targetPercentage) * scaleFactor;
        const targetValue = initialTotalValue * (finalAssetTargetPercentage / 100);
        const difference = targetValue - asset.currentValue;
        return {
            ...asset, difference, finalAssetTargetPercentage, 
            adjustment: 0, adjustmentValueNum: 0, taxAmountNum: 0,
            newQuantity: parseLocaleFloat(asset.quantity),
        };
    });

    // 2. Esegui tutte le vendite necessarie per generare il cash pool (CON TASSE)
    let cashPool = 0;
    const overweightAssets = assetsToProcess.filter(a => a.difference < 0);
    overweightAssets.forEach(asset => {
        const assetPrice = parseLocaleFloat(asset.currentPrice);
        const pmc = parseLocaleFloat(asset.pmc);
        if (assetPrice <= 0) return;

        const unitsToSell = getUnitsCalculated(asset.difference, assetPrice, asset.quantity);
        if (unitsToSell < 0) {
            const grossValueOfSale = Math.abs(unitsToSell * assetPrice);
            let netCashGenerated = grossValueOfSale;
            let taxOnGain = 0;
            if (pmc > 0) {
                const assetTaxRate = asset.taxRate ? parseLocaleFloat(asset.taxRate) / 100 : DEFAULT_TAX_RATE;
                const costBasisOfSoldShares = Math.abs(unitsToSell * pmc);
                const capitalGain = grossValueOfSale - costBasisOfSoldShares;
                if (capitalGain > 0) {
                    taxOnGain = capitalGain * assetTaxRate;
                    netCashGenerated = grossValueOfSale - taxOnGain;
                }
            }
            cashPool += netCashGenerated;
            const assetInMainList = assetsToProcess.find(ap => ap.name === asset.name);
            if(assetInMainList){
                assetInMainList.adjustment = unitsToSell;
                assetInMainList.adjustmentValueNum = -grossValueOfSale;
                assetInMainList.taxAmountNum = taxOnGain;
            }
        }
    });

    // 3. Esegui gli acquisti con logica prioritaria ("greedy")
    const underweightAssets = assetsToProcess
        .filter(a => a.difference > 0)
        .sort((a,b) => b.difference - a.difference); // Ordina per più sottopesato prima

    let cashAvailable = cashPool;
    for (const asset of underweightAssets) {
        if (cashAvailable <= 0) break;

        const assetPrice = parseLocaleFloat(asset.currentPrice);
        if (assetPrice <= 0) continue;

        // Spendi il necessario per questo asset, senza superare la liquidità disponibile
        const moneyNeeded = asset.difference;
        const moneyToSpend = Math.min(cashAvailable, moneyNeeded);
        const unitsToBuy = getUnitsCalculated(moneyToSpend, assetPrice, asset.quantity);

        if (unitsToBuy > 0) {
            const costOfPurchase = unitsToBuy * assetPrice;
            const assetInMainList = assetsToProcess.find(ap => ap.name === asset.name);
            if(assetInMainList){
                assetInMainList.adjustment = unitsToBuy; // Sovrascrive (ma un asset non è sia venduto che comprato)
                assetInMainList.adjustmentValueNum = costOfPurchase;
            }
            cashAvailable -= costOfPurchase;
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
        taxAmount: r.taxAmountNum.toFixed(2),
        newPercentage: (newPortfolioTotalValue > 0 ? ((r.newQuantity * parseLocaleFloat(r.currentPrice)) / newPortfolioTotalValue * 100) : 0).toFixed(2),
        adjustedTargetPercentage: r.finalAssetTargetPercentage.toFixed(2),
    }));

    return { results: finalResults, excessCash: excessCashVal };
};