// rebalanceAddAndRebalance.js (Versione Finale con Logica Prioritaria e Tasse)
import { parseLocaleFloat, getUnitsCalculated } from './utils';

const DEFAULT_TAX_RATE = 0.26;

export const rebalanceAddAndRebalance = (allocations, initialTotalValue, availableCash, assets, scaleFactor) => {
    const cashToAdd = parseLocaleFloat(availableCash) || 0;
    const newTotalValue = initialTotalValue + cashToAdd;

    // 1. Calcola il piano di ribilanciamento ideale
    let assetsToProcess = allocations.map(asset => {
        const finalAssetTargetPercentage = parseLocaleFloat(asset.targetPercentage) * scaleFactor;
        const targetValue = newTotalValue * (finalAssetTargetPercentage / 100);
        const difference = targetValue - asset.currentValue;
        return {
            ...asset, difference, finalAssetTargetPercentage,
            adjustment: 0, adjustmentValueNum: 0, taxAmountNum: 0,
            newQuantity: parseLocaleFloat(asset.quantity),
        };
    });

    // 2. Identifica e ordina per priorità
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
            if (cashGeneratedFromSalesNet >= salesRequired) break;

            const assetPrice = parseLocaleFloat(asset.currentPrice);
            const pmc = parseLocaleFloat(asset.pmc);
            if (assetPrice <= 0) continue;

            const maxCashFromThisAssetGross = -asset.difference;
            const cashToAttemptToGenerateGross = Math.min(maxCashFromThisAssetGross, salesRequired - cashGeneratedFromSalesNet);
            const unitsToSell = getUnitsCalculated(-cashToAttemptToGenerateGross, assetPrice, asset.isFractionable, false);

            const taxCalculate = asset.taxCalculate;
            if (unitsToSell < 0) {
                const grossValueOfSale = Math.abs(unitsToSell * assetPrice);
                let netCashThisTransaction = grossValueOfSale;
                let taxOnGain = 0;

                if (pmc > 0 && taxCalculate === true) {
                    const assetTaxRate = asset.taxRate ? parseLocaleFloat(asset.taxRate) / 100 : DEFAULT_TAX_RATE;
                    const costBasisOfSoldShares = Math.abs(unitsToSell * pmc);
                    const capitalGain = grossValueOfSale - costBasisOfSoldShares;
                    if (capitalGain > 0) {
                        taxOnGain = capitalGain * assetTaxRate;
                        netCashThisTransaction = grossValueOfSale - taxOnGain;
                    }
                }

                const assetInMainList = assetsToProcess.find(ap => ap.name === asset.name);
                if (assetInMainList) {
                    assetInMainList.adjustment = unitsToSell;
                    assetInMainList.adjustmentValueNum = -grossValueOfSale;
                    assetInMainList.taxAmountNum = taxOnGain;
                }
                cashGeneratedFromSalesNet += netCashThisTransaction;
            }
        }
    }

    // 4. Esegui gli acquisti con logica prioritaria ("greedy")
    let cashAvailable = cashToAdd + cashGeneratedFromSalesNet;
    for (const asset of underweightAssets) {
        if (cashAvailable <= 0) break;

        const assetPrice = parseLocaleFloat(asset.currentPrice);
        if (assetPrice <= 0) continue;

        const moneyNeeded = asset.difference;
        const moneyToSpend = Math.min(cashAvailable, moneyNeeded);
        const unitsToBuy = getUnitsCalculated(moneyToSpend, assetPrice, asset.isFractionable, true);

        if (unitsToBuy > 0) {
            const costOfPurchase = unitsToBuy * assetPrice;
            const assetInMainList = assetsToProcess.find(ap => ap.name === asset.name);
            if (assetInMainList) {
                assetInMainList.adjustment = unitsToBuy;
                assetInMainList.adjustmentValueNum = costOfPurchase;
            }
            cashAvailable -= costOfPurchase;
        }
    }

    // 5. Calcoli finali
    assetsToProcess.forEach(asset => {
        asset.newQuantity = parseLocaleFloat(asset.quantity) + asset.adjustment;
    });

    const initialCashAvailableForPurchases = cashToAdd + cashGeneratedFromSalesNet;
    const totalCashUsedOnPurchases = assetsToProcess
        .filter(r => r.adjustment > 0)
        .reduce((sum, r) => sum + r.adjustmentValueNum, 0);
    const excessCashVal = Math.max(0, initialCashAvailableForPurchases - totalCashUsedOnPurchases);

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
