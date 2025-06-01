// rebalanceAdd.js (Versione con Logica Prioritaria)
import { parseLocaleFloat, getUnitsCalculated } from './utils';

export const rebalanceAdd = (allocations, initialTotalValue, availableCash, assets, scaleFactor) => {
    const cashToAdd = parseLocaleFloat(availableCash) || 0;
    if (cashToAdd <= 0) {
        // ... (gestione del caso senza liquidità, come prima)
        const emptyResults = allocations.map(asset => ({
            ...asset, adjustment: 0, adjustmentValue: '0.00', adjustmentValueNum: 0,
            newQuantity: parseLocaleFloat(asset.quantity),
            newPercentage: asset.currentPercentage.toFixed(2),
            adjustedTargetPercentage: (parseLocaleFloat(asset.targetPercentage) * scaleFactor).toFixed(2),
            prezzoQuota: parseLocaleFloat(asset.currentPrice).toFixed(2)
        }));
        return { results: emptyResults, excessCash: cashToAdd };
    }

    const newTotalValue = initialTotalValue + cashToAdd;
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

    // 1. Identifica gli asset da acquistare e ordinali dal più sottopesato al meno
    const underweightAssets = assetsToProcess
        .filter(a => a.difference > 0)
        .sort((a, b) => b.difference - a.difference); // Ordina in modo decrescente per 'difference'

    let cashRemaining = cashToAdd;

    // 2. Itera sugli asset sottopesati e compra in ordine di priorità
    for (const asset of underweightAssets) {
        if (cashRemaining <= 0) break; // Se finisce la liquidità, esci

        const assetCurrentPrice = parseLocaleFloat(asset.currentPrice);
        if (assetCurrentPrice <= 0) continue; // Salta se il prezzo non è valido

        // Determina quanti soldi servirebbero per questo asset e quanti ne puoi usare
        const moneyNeededForThisAsset = asset.difference;
        const moneyToSpendOnThisAsset = Math.min(cashRemaining, moneyNeededForThisAsset);

        // Calcola quante unità puoi comprare con i soldi disponibili per questo asset
        const unitsToBuy = getUnitsCalculated(moneyToSpendOnThisAsset, assetCurrentPrice, asset.quantity);

        if (unitsToBuy > 0) {
            const costOfPurchase = unitsToBuy * assetCurrentPrice;
            
            asset.adjustment = unitsToBuy;
            asset.adjustmentValueNum = costOfPurchase;
            asset.newQuantity += unitsToBuy;
            
            cashRemaining -= costOfPurchase; // Sottrai il costo reale dalla liquidità
        }
    }

    // 3. Calcola i risultati finali
    let excessCashVal = Math.max(0, cashRemaining);

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