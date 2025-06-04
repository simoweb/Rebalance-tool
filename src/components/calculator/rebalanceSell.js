// rebalancePortfolio.js (Versione Finale con Algoritmo Ibrido - Corretta)
import { parseLocaleFloat, getUnitsCalculated } from './utils';

const DEFAULT_TAX_RATE = 0.26; // Tassazione di default al 26%
const MIN_MEANINGFUL_REMAINDER = 0.01; // Soglia minima per il resto (es. 1 centesimo)

export const rebalancePortfolio = (allocations, initialTotalValue, assets, scaleFactor) => {
    // 1. Calcola il piano di ribilanciamento ideale
    let assetsToProcess = allocations.map(asset => {
        const finalAssetTargetPercentage = parseLocaleFloat(asset.targetPercentage) * scaleFactor;
        const targetValue = initialTotalValue * (finalAssetTargetPercentage / 100);
        const difference = targetValue - asset.currentValue;
        return {
            ...asset, difference, finalAssetTargetPercentage, 
            adjustment: 0, 
            adjustmentValueNum: 0,
             taxAmountNum: 0, 
            newQuantity: parseLocaleFloat(asset.quantity),
        };
    });

    // 2. Esegui tutte le vendite necessarie per generare il cash pool
    let cashPool = 0;
    const overweightAssets = assetsToProcess.filter(a => a.difference < 0);

    // rebalancePortfolio.js (Finale con Tasse nei Risultati)
// ...
    overweightAssets.forEach(asset => {
        const assetPrice = parseLocaleFloat(asset.currentPrice);
        const pmc = parseLocaleFloat(asset.pmc);
        if (assetPrice <= 0) return;
        const unitsToSell = getUnitsCalculated(asset.difference, assetPrice, asset.quantity);
        
         if (unitsToSell < 0) {
            const grossValueOfSale = Math.abs(unitsToSell * assetPrice);
            let netCashGenerated = grossValueOfSale;
            let taxOnGain = 0; 

            // IL BLOCCO INCRIMINATO INIZIA QUI
            if (pmc > 0) { // Se pmc non è > 0, questo blocco viene saltato
                const assetTaxRate = asset.taxRate ? parseLocaleFloat(asset.taxRate) / 100 : DEFAULT_TAX_RATE;
                const costBasisOfSoldShares = Math.abs(unitsToSell * pmc); // Dichiarata QUI DENTRO
                const capitalGain = grossValueOfSale - costBasisOfSoldShares; // Usata QUI DENTRO

                if (capitalGain > 0) {
                    taxOnGain = capitalGain * assetTaxRate; 
                    netCashGenerated = grossValueOfSale - taxOnGain;
                }
            }
            // FINE BLOCCO INCRIMINATO
            
            cashPool += netCashGenerated;
            const assetInMainList = assetsToProcess.find(ap => ap.name === asset.name);
            if(assetInMainList){
                assetInMainList.adjustment = unitsToSell;
                assetInMainList.adjustmentValueNum = -grossValueOfSale;
                assetInMainList.taxAmountNum = taxOnGain; 
            }
        }
    });


    // 3. Esegui gli acquisti utilizzando l'algoritmo ibrido
    const underweightAssets = assetsToProcess
        .filter(a => a.difference > 0)
        .sort((a,b) => b.difference - a.difference); // Ordina per 'difference' decrescente (più urgente prima)

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
                const assetInMainList = assetsToProcess.find(ap => ap.name === asset.name);
                if(assetInMainList){
                    assetInMainList.adjustment += unitsToBuy; 
                    assetInMainList.adjustmentValueNum += costOfPurchase;
                }
                cashSpentSoFar += costOfPurchase;
            }
        });
    }

    // 3b. Ottimizzazione del Resto
    let remainderPool = cashToSpend - cashSpentSoFar;
    let purchasedInLoop = true;
    
    while (remainderPool > MIN_MEANINGFUL_REMAINDER && purchasedInLoop) {
        purchasedInLoop = false;
        // Ri-ordina: priorità a chi necessita di meno soldi per la prossima quota (prezzo più basso)
        // o chi è più lontano dal target (se vogliamo essere più precisi sul rebalance)
        // Un semplice sort per prezzo più basso per usare il resto è efficace:
        underweightAssets.sort((a, b) => parseLocaleFloat(a.currentPrice) - parseLocaleFloat(b.currentPrice));
        
        for (const asset of underweightAssets) {
            const assetPrice = parseLocaleFloat(asset.currentPrice);
            if (assetPrice > 0 && remainderPool >= assetPrice) {
                const assetInMainList = assetsToProcess.find(ap => ap.name === asset.name);
                if(assetInMainList){
                    assetInMainList.adjustment += 1;
                    assetInMainList.adjustmentValueNum += assetPrice;
                }
                remainderPool -= assetPrice;
                purchasedInLoop = true;
                break; 
            }
        }
    }

    // 4. Calcoli finali: aggiorna la newQuantity basata sull'adjustment finale
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
            taxAmount: r.taxAmountNum.toFixed(2), // <-- AGGIUNGI TASSE FORMATE
        newPercentage: (newPortfolioTotalValue > 0 ? ((r.newQuantity * parseLocaleFloat(r.currentPrice)) / newPortfolioTotalValue * 100) : 0).toFixed(2),
        adjustedTargetPercentage: r.finalAssetTargetPercentage.toFixed(2),
    }));

    return { results: finalResults, excessCash: excessCashVal };
};