// rebalanceAddAndRebalance.js (Versione con Logica Prioritaria)
import { parseLocaleFloat, getUnitsCalculated } from './utils';

export const rebalanceAddAndRebalance = (allocations, initialTotalValue, availableCash, assets, scaleFactor) => {
    const cashToAdd = parseLocaleFloat(availableCash) || 0;
    const newTotalValue = initialTotalValue + cashToAdd;

    // 1. Calcola il piano di ribilanciamento ideale
    let assetsToProcess = allocations.map(asset => {
        const finalAssetTargetPercentage = parseLocaleFloat(asset.targetPercentage) * scaleFactor;
        const targetValue = newTotalValue * (finalAssetTargetPercentage / 100);
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

    // 2. Identifica e ordina per priorità gli asset da comprare e vendere
    const underweightAssets = assetsToProcess
        .filter(a => a.difference > 0)
        .sort((a, b) => b.difference - a.difference); // Dal più sottopesato

    const overweightAssets = assetsToProcess
        .filter(a => a.difference < 0)
        .sort((a, b) => a.difference - b.difference); // Dal più sovrappeso (il più negativo)

    const totalPurchaseNeed = underweightAssets.reduce((sum, a) => sum + a.difference, 0);

    // 3. Esegui le vendite necessarie, in ordine di priorità
    const salesRequired = Math.max(0, totalPurchaseNeed - cashToAdd);
    let cashGeneratedFromSales = 0;

    if (salesRequired > 0) {
        for (const asset of overweightAssets) {
            const assetPrice = parseLocaleFloat(asset.currentPrice);
            if (assetPrice <= 0) continue;

            // Vendi al massimo quanto serve da questo asset per colmare il gap
            const maxCashFromThisAsset = -asset.difference; // Il valore massimo vendibile da questo asset
            const cashToGenerateFromThisAsset = Math.min(maxCashFromThisAsset, salesRequired - cashGeneratedFromSales);
            
            // Usiamo -cashToGenerate... perché getUnitsCalculated si aspetta un valore negativo per le vendite
            const unitsToSell = getUnitsCalculated(-cashToGenerateFromThisAsset, assetPrice, asset.quantity);
            
            if (unitsToSell < 0) {
                const valueOfSale = unitsToSell * assetPrice;
                asset.adjustment = unitsToSell;
                asset.adjustmentValueNum = valueOfSale;
                asset.newQuantity += unitsToSell;
                cashGeneratedFromSales -= valueOfSale; // valueOfSale è negativo
            }

            if (cashGeneratedFromSales >= salesRequired) break; // Fermati se hai raccolto abbastanza
        }
    }

    // 4. Esegui gli acquisti necessari, in ordine di priorità
    let cashAvailableForPurchases = cashToAdd + cashGeneratedFromSales;

    for (const asset of underweightAssets) {
        if (cashAvailableForPurchases <= 0) break;

        const assetPrice = parseLocaleFloat(asset.currentPrice);
        if (assetPrice <= 0) continue;
        
        // Usa la liquidità disponibile per colmare il gap di questo asset
        const moneyNeededForThisAsset = asset.difference;
        const moneyToSpendOnThisAsset = Math.min(cashAvailableForPurchases, moneyNeededForThisAsset);
        const unitsToBuy = getUnitsCalculated(moneyToSpendOnThisAsset, assetPrice, asset.quantity);

        if (unitsToBuy > 0) {
            const costOfPurchase = unitsToBuy * assetPrice;
            
            // Un asset non può essere sia venduto che comprato, quindi possiamo assegnare direttamente
            asset.adjustment = unitsToBuy;
            asset.adjustmentValueNum = costOfPurchase;
            asset.newQuantity = parseLocaleFloat(asset.quantity) + unitsToBuy;

            cashAvailableForPurchases -= costOfPurchase;
        }
    }
    
    // 5. Calcola i risultati finali
    const excessCashVal = Math.max(0, cashAvailableForPurchases);

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