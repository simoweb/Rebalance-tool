// rebalanceAddAndRebalance.js
import { parseLocaleFloat, getUnitsCalculated, isQuantityInputFractional } from './utils'; // Importa le funzioni di utilità

/**
 * Esegue il ribilanciamento in modalità "aggiungi e ribilancia".
 * Utilizza il denaro disponibile e vende asset in eccesso per acquistare asset sottopesati.
 * @param {Array<Object>} allocations - L'array di asset con i valori e le percentuali correnti.
 * @param {number} initialTotalValue - Il valore totale iniziale del portafoglio.
 * @param {number} availableCash - Il denaro disponibile da aggiungere.
 * @param {Array<Object>} assets - L'array originale di asset (necessario per targetPercentage e originalQuantityString).
 * @param {number} scaleFactor - Fattore di scala per normalizzare le percentuali target.
 * @returns {{results: Array<Object>, excessCash: number}} I risultati del ribilanciamento e il cash residuo.
 */
export const rebalanceAddAndRebalance = (allocations, initialTotalValue, availableCash, assets, scaleFactor) => {
    const availableCashValue = parseLocaleFloat(availableCash);
    let tempTotalValue = initialTotalValue;
    let currentCashPool = availableCashValue;
    // Creiamo una copia profonda per non modificare l'array originale passato
    let allocationsForThisMethod = JSON.parse(JSON.stringify(allocations));

    let preCalcForAdd = allocationsForThisMethod.map(asset => {
        const assetCurrentPrice = parseLocaleFloat(asset.currentPrice);
        const finalAssetTargetPercentage = parseLocaleFloat(asset.targetPercentage) * scaleFactor;
        const targetValueWithCash = (tempTotalValue + currentCashPool) * (finalAssetTargetPercentage / 100);
        const diff = targetValueWithCash - asset.currentValue;

        // Troviamo l'asset originale per passare la sua quantità originale a getUnitsCalculated
        const originalAsset = assets.find(a => a.name === asset.name);
        const unitsToBuyInitially = getUnitsCalculated(diff, assetCurrentPrice, originalAsset.quantity);
        // Assicurati che unitsToBuyInitially sia positivo per un acquisto
        const positiveUnitsToBuy = Math.max(0, unitsToBuyInitially);

        return {
            ...asset,
            unitsToBuyInitially: positiveUnitsToBuy, // Solo unità positive o zero
            costToBuyInitially: positiveUnitsToBuy * assetCurrentPrice,
            finalAssetTargetPercentage,
            unitsSoldPreviously: 0,
            originalQuantityString: originalAsset.quantity // Passa la quantità originale
        };
    });

    let totalInitialBuyCost = preCalcForAdd.reduce((sum, r) => sum + r.costToBuyInitially, 0);
    const salesToFundPurchases_records = [];

    if (totalInitialBuyCost > currentCashPool) {
        allocationsForThisMethod.forEach(assetForSaleDecision => {
            const assetCurrentPrice = parseLocaleFloat(assetForSaleDecision.currentPrice);
            const finalAssetTargetPercentage = parseLocaleFloat(assetForSaleDecision.targetPercentage) * scaleFactor;
            const targetValueForSaleDecision = initialTotalValue * (finalAssetTargetPercentage / 100);
            const diffForSale = assetForSaleDecision.currentValue - targetValueForSaleDecision; // Positivo se in eccesso

            // Per le vendite, diffForSale positivo significa eccesso.
            // getUnitsCalculated aspetta una 'valueDifference' dove positivo è target > current,
            // quindi per la vendita, la 'differenza' per raggiungere il target è negativa.
            const saleDiff = targetValueForSaleDecision - assetForSaleDecision.currentValue;
            const originalAsset = assets.find(a => a.name === assetForSaleDecision.name);
            const unitsToSellCalculated = getUnitsCalculated(saleDiff, assetCurrentPrice, originalAsset.quantity);
            const unitsToSell = Math.min(0, unitsToSellCalculated); // Prendi solo valori negativi (vendite) o zero

            if (unitsToSell < 0) { // Se unitsToSell è negativo, significa che vendiamo Math.abs(unitsToSell)
                salesToFundPurchases_records.push({
                    name: assetForSaleDecision.name,
                    unitsToSell: Math.abs(unitsToSell), // Memorizza come positivo
                    cashGenerated: Math.abs(unitsToSell) * assetCurrentPrice,
                });
            }
        });

        const totalCashGeneratedFromSales = salesToFundPurchases_records.reduce((sum, s) => sum + s.cashGenerated, 0);
        currentCashPool += totalCashGeneratedFromSales;
        tempTotalValue -= totalCashGeneratedFromSales; // Il valore totale del portafoglio diminuisce delle vendite

        // Aggiorna le quantità degli asset in `allocationsForThisMethod` dopo le vendite
        allocationsForThisMethod = allocationsForThisMethod.map(currentAllocAsset => {
            const saleRecord = salesToFundPurchases_records.find(s => s.name === currentAllocAsset.name);
            if (saleRecord) {
                const newQuantityNum = parseLocaleFloat(currentAllocAsset.quantity) - saleRecord.unitsToSell;
                return {
                    ...currentAllocAsset,
                    quantity: newQuantityNum.toString(), // Mantieni la quantità come stringa se preferisci
                    currentValue: newQuantityNum * parseLocaleFloat(currentAllocAsset.currentPrice)
                };
            }
            return currentAllocAsset;
        });

        // Ricalcola preCalcForAdd con le nuove quantità e il nuovo cashPool
        preCalcForAdd = allocationsForThisMethod.map(assetAfterSale => {
            const assetCurrentPrice = parseLocaleFloat(assetAfterSale.currentPrice);
            const finalAssetTargetPercentage = parseLocaleFloat(assetAfterSale.targetPercentage) * scaleFactor;
            const targetValueWithCash = (tempTotalValue + currentCashPool) * (finalAssetTargetPercentage / 100);
            const diff = targetValueWithCash - assetAfterSale.currentValue;

            const originalAsset = assets.find(a => a.name === assetAfterSale.name);
            const unitsToBuyRecalculated = getUnitsCalculated(diff, assetCurrentPrice, originalAsset.quantity);
            const positiveUnitsToBuyRecalculated = Math.max(0, unitsToBuyRecalculated);

            const saleInfo = salesToFundPurchases_records.find(s => s.name === assetAfterSale.name);
            return {
                ...assetAfterSale,
                unitsToBuyInitially: positiveUnitsToBuyRecalculated,
                costToBuyInitially: positiveUnitsToBuyRecalculated * assetCurrentPrice,
                finalAssetTargetPercentage,
                unitsSoldPreviously: saleInfo ? saleInfo.unitsToSell : 0, // unitsToSell qui è positivo
                originalQuantityString: originalAsset.quantity // Passa la quantità originale
            };
        });
    }

    let cashSpentInBuys = 0;
    const calculatedAdd = preCalcForAdd.map(r_intermediate_calc => {
        let unitsToBuyFinal = 0;
        const costForThisAssetToReachTarget = r_intermediate_calc.costToBuyInitially;
        const assetIsActuallyFractional = isQuantityInputFractional(r_intermediate_calc.originalQuantityString);

        if (costForThisAssetToReachTarget > 0 && (cashSpentInBuys + costForThisAssetToReachTarget <= currentCashPool)) {
            unitsToBuyFinal = r_intermediate_calc.unitsToBuyInitially;
        } else if (costForThisAssetToReachTarget > 0 && cashSpentInBuys < currentCashPool) {
            const remainingCashInPoolForBuys = currentCashPool - cashSpentInBuys;
            const assetPrice = parseLocaleFloat(r_intermediate_calc.currentPrice);
            if (assetPrice > 0) {
                const unitsAffordableRaw = remainingCashInPoolForBuys / assetPrice;
                unitsToBuyFinal = assetIsActuallyFractional ? unitsAffordableRaw : Math.floor(unitsAffordableRaw);
            }
        }
        unitsToBuyFinal = Math.max(0, unitsToBuyFinal);
        cashSpentInBuys += unitsToBuyFinal * parseLocaleFloat(r_intermediate_calc.currentPrice);

        const netUnitsAdjustment = unitsToBuyFinal - (r_intermediate_calc.unitsSoldPreviously || 0);
        // Utilizza la quantità aggiornata dopo le vendite per il calcolo della nuova quantità
        const quantityAfterSalesBeforeThisBuy = parseLocaleFloat(r_intermediate_calc.quantity);
        return {
            ...r_intermediate_calc,
            adjustment: netUnitsAdjustment,
            adjustmentValueNum: netUnitsAdjustment * parseLocaleFloat(r_intermediate_calc.currentPrice),
            newQuantity: quantityAfterSalesBeforeThisBuy + unitsToBuyFinal,
        };
    });

    const finalPortfolioValueAdd = calculatedAdd.reduce((sum, r) => sum + (r.newQuantity * parseLocaleFloat(r.currentPrice)), 0);
    const finalResults = calculatedAdd.map(r_final_calc => {
        const originalAssetData = assets.find(a => a.name === r_final_calc.name);
        const initialAllocationData = allocations.find(a => a.name === r_final_calc.name); // Usa l'allocazione originale per current value/percentage
        return {
            name: originalAssetData.name,
            quantity: originalAssetData.quantity,
            currentPrice: originalAssetData.currentPrice,
            targetPercentage: originalAssetData.targetPercentage,
            currentValue: initialAllocationData.currentValue,
            currentPercentage: initialAllocationData.currentPercentage,
            adjustment: r_final_calc.adjustment,
            adjustmentValue: r_final_calc.adjustmentValueNum.toFixed(2),
            newQuantity: r_final_calc.newQuantity,
            newPercentage: (finalPortfolioValueAdd > 0 ? ((r_final_calc.newQuantity * parseLocaleFloat(originalAssetData.currentPrice)) / finalPortfolioValueAdd * 100) : 0).toFixed(2),
            adjustedTargetPercentage: r_final_calc.finalAssetTargetPercentage.toFixed(2),
        };
    });
    const excessCashVal = currentCashPool - cashSpentInBuys;

    return { results: finalResults, excessCash: excessCashVal };
};