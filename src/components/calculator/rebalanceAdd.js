// rebalanceAdd.js
import { parseLocaleFloat, getUnitsCalculated, isQuantityInputFractional } from './utils'; // Importa le funzioni di utilità

/**
 * Esegue il ribilanciamento in modalità "aggiungi denaro".
 * Utilizza il denaro disponibile per acquistare gli asset più sottopesati, senza vendere nulla.
 * @param {Array<Object>} allocations - L'array di asset con i valori e le percentuali correnti.
 * @param {number} initialTotalValue - Il valore totale iniziale del portafoglio.
 * @param {number} availableCash - Il denaro disponibile da aggiungere.
 * @param {Array<Object>} assets - L'array originale di asset (necessario per targetPercentage e originalQuantityString).
 * @param {number} scaleFactor - Fattore di scala per normalizzare le percentuali target.
 * @returns {{results: Array<Object>, excessCash: number}} I risultati del ribilanciamento e il cash residuo.
 */
export const rebalanceAdd = (allocations, initialTotalValue, availableCash, assets, scaleFactor) => {
    const addedCash = parseLocaleFloat(availableCash);
    const newTotalValue = initialTotalValue + addedCash;

    let cashPool = addedCash;
    const adjustedAssets = [];

    const sortedAssets = allocations
        .map(asset => {
            const currentPrice = parseLocaleFloat(asset.currentPrice);
            const currentQuantity = parseLocaleFloat(asset.quantity);
            const finalTargetPct = parseLocaleFloat(asset.targetPercentage) * scaleFactor;
            const targetValue = newTotalValue * (finalTargetPct / 100);
            const valueNeeded = Math.max(0, targetValue - asset.currentValue);

            // Troviamo l'asset originale per passare la sua quantità originale a isQuantityInputFractional
            const originalAsset = assets.find(a => a.name === asset.name);

            return {
                ...asset,
                currentPrice,
                currentQuantity,
                finalTargetPct,
                valueNeeded,
                originalQuantityString: originalAsset.quantity // Passa la quantità originale
            };
        })
        .sort((a, b) => b.valueNeeded - a.valueNeeded); // priorità a chi è più sottopesato

    for (const asset of sortedAssets) {
        if (cashPool <= 0 || asset.valueNeeded <= 0 || asset.currentPrice <= 0) {
            adjustedAssets.push({
                ...asset,
                adjustment: 0,
                adjustmentValueNum: 0,
                newQuantity: asset.currentQuantity
            });
            continue;
        }

        const maxAffordableValue = Math.min(cashPool, asset.valueNeeded);
        const isFractional = isQuantityInputFractional(asset.originalQuantityString);
        const rawUnits = maxAffordableValue / asset.currentPrice;
        const unitsToBuy = isFractional ? rawUnits : Math.floor(rawUnits); // Arrotonda per difetto se intero

        const valueSpent = unitsToBuy * asset.currentPrice;

        cashPool -= valueSpent;

        adjustedAssets.push({
            ...asset,
            adjustment: unitsToBuy,
            adjustmentValueNum: valueSpent,
            newQuantity: asset.currentQuantity + unitsToBuy
        });
    }

    const finalPortfolioValue = adjustedAssets.reduce(
        (sum, r) => sum + (r.newQuantity * r.currentPrice),
        0
    );

    const finalResults = adjustedAssets.map(r => ({
        name: r.name,
        quantity: r.quantity, // L'originale o quella passata in adjustedAssets map.
        currentPrice: r.currentPrice.toFixed(2), // Assicurati che sia formattato
        targetPercentage: r.targetPercentage,
        currentValue: r.currentValue.toFixed(2),
        currentPercentage: r.currentPercentage.toFixed(2),
        adjustment: r.adjustment,
        adjustmentValue: r.adjustmentValueNum.toFixed(2),
        newQuantity: r.newQuantity,
        newPercentage: (finalPortfolioValue > 0
            ? ((r.newQuantity * r.currentPrice) / finalPortfolioValue * 100)
            : 0
        ).toFixed(2),
        adjustedTargetPercentage: r.finalTargetPct.toFixed(2)
    }));

    const excessCashVal = Math.max(0, cashPool); // Fix sicuro: forziamo che non scenda mai sotto zero

    return { results: finalResults, excessCash: excessCashVal };
};