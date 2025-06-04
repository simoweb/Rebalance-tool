// rebalanceAddAndRebalance.js (Corretto per lo scope di taxOnGain)
import { parseLocaleFloat, getUnitsCalculated } from './utils';

const DEFAULT_TAX_RATE = 0.26; // Tassazione di default al 26%
const MIN_MEANINGFUL_REMAINDER = 0.01; // Soglia minima per il resto

export const rebalanceAddAndRebalance = (allocations, initialTotalValue, availableCash, assets, scaleFactor) => {
    const cashToAdd = parseLocaleFloat(availableCash) || 0;
    const newTotalValue = initialTotalValue + cashToAdd;

    // 1. Calcola il piano di ribilanciamento ideale
    let assetsToProcess = allocations.map(asset => {
        const finalAssetTargetPercentage = parseLocaleFloat(asset.targetPercentage) * scaleFactor;
        const targetValue = newTotalValue * (finalAssetTargetPercentage / 100);
        const difference = targetValue - asset.currentValue;
        return {
            ...asset, difference, finalAssetTargetPercentage, adjustment: 0, adjustmentValueNum: 0,
            newQuantity: parseLocaleFloat(asset.quantity),
            taxAmountNum: 0, // Inizializza taxAmountNum
        };
    });

    // 2. Identifica e ordina per priorità gli asset da comprare e vendere
    const underweightAssets = assetsToProcess
        .filter(a => a.difference > 0)
        .sort((a, b) => b.difference - a.difference); 

    const overweightAssets = assetsToProcess
        .filter(a => a.difference < 0)
        .sort((a, b) => a.difference - b.difference); 

    const totalPurchaseNeed = underweightAssets.reduce((sum, a) => sum + a.difference, 0);

    // 3. Esegui le vendite necessarie, in ordine di priorità (CON TASSE)
    const salesRequired = Math.max(0, totalPurchaseNeed - cashToAdd);
    let cashGeneratedFromSalesNet = 0;

    if (salesRequired > 0) {
        for (const asset of overweightAssets) {
            const assetPrice = parseLocaleFloat(asset.currentPrice);
            const pmc = parseLocaleFloat(asset.pmc); 
            let taxOnGain = 0; // <-- INIZIALIZZA taxOnGain qui per ogni asset venduto

            if (assetPrice <= 0) continue;

            const maxCashFromThisAssetGross = -asset.difference; 
            let cashToAttemptToGenerateGross = Math.min(maxCashFromThisAssetGross, salesRequired - cashGeneratedFromSalesNet);
            
            const unitsToSell = getUnitsCalculated(-cashToAttemptToGenerateGross, assetPrice, asset.quantity);
            
            if (unitsToSell < 0) {
                const grossValueOfSale = Math.abs(unitsToSell * assetPrice);
                let netCashThisTransaction = grossValueOfSale;

                if (pmc > 0) { 
                    const assetTaxRate = asset.taxRate ? parseLocaleFloat(asset.taxRate) / 100 : DEFAULT_TAX_RATE;
                    const costBasisOfSoldShares = Math.abs(unitsToSell * pmc);
                    const capitalGain = grossValueOfSale - costBasisOfSoldShares;
                    if (capitalGain > 0) {
                        taxOnGain = capitalGain * assetTaxRate; // taxOnGain viene aggiornato qui
                        netCashThisTransaction = grossValueOfSale - taxOnGain;
                    }
                }
                
                const assetInMainList = assetsToProcess.find(ap => ap.name === asset.name);
                if(assetInMainList){
                    assetInMainList.adjustment = unitsToSell; 
                    assetInMainList.adjustmentValueNum = -grossValueOfSale;
                    assetInMainList.taxAmountNum = taxOnGain; // Ora taxOnGain è sempre definito
                }
                cashGeneratedFromSalesNet += netCashThisTransaction;
            }

            if (cashGeneratedFromSalesNet >= salesRequired) break;
        }
    }

    // 4. Esegui gli acquisti necessari, con algoritmo ibrido
    let totalCashAvailableForPurchases = cashToAdd + cashGeneratedFromSalesNet;
    const cashToSpendOnPurchases = Math.min(totalCashAvailableForPurchases, totalPurchaseNeed);
    let cashSpentSoFar = 0;

    // 4a. Acquisto Proporzionale Iniziale
    if (cashToSpendOnPurchases > 0 && totalPurchaseNeed > 0) {
        underweightAssets.forEach(asset => {
            const assetPrice = parseLocaleFloat(asset.currentPrice);
            if (assetPrice <= 0) return;

            const cashForThisAsset = (asset.difference / totalPurchaseNeed) * cashToSpendOnPurchases;
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

    // 4b. Ottimizzazione del Resto
    let remainderPool = cashToSpendOnPurchases - cashSpentSoFar;
    let purchasedInLoop = true;
    
    while (remainderPool > MIN_MEANINGFUL_REMAINDER && purchasedInLoop) {
        purchasedInLoop = false;
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
    
    // 5. Calcola i risultati finali
    assetsToProcess.forEach(asset => {
        asset.newQuantity = parseLocaleFloat(asset.quantity) + asset.adjustment;
    });

    const totalCashUsedOnActualPurchases = assetsToProcess.filter(r => r.adjustment > 0).reduce((sum, r) => sum + r.adjustmentValueNum, 0);
    const excessCashVal = Math.max(0, totalCashAvailableForPurchases - totalCashUsedOnActualPurchases);

    const newPortfolioTotalValue = assetsToProcess.reduce((sum, r) => sum + (r.newQuantity * parseLocaleFloat(r.currentPrice)), 0);
    const finalResults = assetsToProcess.map(r => ({
        ...r,
        prezzoQuota: parseLocaleFloat(r.currentPrice).toFixed(2),
        adjustmentValue: r.adjustmentValueNum.toFixed(2),
        taxAmount: r.taxAmountNum.toFixed(2), // Assicurati che taxAmount sia qui se lo usi nel componente React
        newPercentage: (newPortfolioTotalValue > 0 ? ((r.newQuantity * parseLocaleFloat(r.currentPrice)) / newPortfolioTotalValue * 100) : 0).toFixed(2),
        adjustedTargetPercentage: r.finalAssetTargetPercentage.toFixed(2), // Rimossa duplicazione
    }));

    return { results: finalResults, excessCash: excessCashVal };
};