// rebalancingCalculator.js
import { calculateCurrentAllocation, parseLocaleFloat } from './utils';
import { rebalancePortfolio } from './rebalanceSell';
import { rebalanceAdd } from './rebalanceAdd';
import { rebalanceAddAndRebalance } from './rebalanceAddAndRebalance';

// Assicurati che 'assets', 'rebalanceMethod', 'availableCash' siano disponibili qui.
// Per un contesto di esempio, li definiamo come variabili globali o li passeresti come argomenti
// a una funzione che orchestra il tutto.
// Esempio:
// const assets = [ /* ... i tuoi asset ... */ ];
// const rebalanceMethod = 'add_and_rebalance'; // o 'sell', 'add'
// const availableCash = '1000'; // Se rebalanceMethod è 'add' o 'add_and_rebalance'

export const calculateRebalancing = (assets, rebalanceMethod, availableCash) => {
    let allocations = calculateCurrentAllocation(assets);
    const initialTotalValue = allocations.reduce((sum, asset) => sum + asset.currentValue, 0);

    const totalTargetPercentageInput = assets.reduce((sum, asset) => sum + parseLocaleFloat(asset.targetPercentage), 0);
    const scaleFactor = (totalTargetPercentageInput === 0) ? 0 : 100 / totalTargetPercentageInput;

    let finalResults;
    let excessCashVal;

    if (rebalanceMethod === 'sell') {
        ({ results: finalResults, excessCash: excessCashVal } = rebalancePortfolio(allocations, initialTotalValue, assets, scaleFactor));
    } else if (rebalanceMethod === 'add') {
        ({ results: finalResults, excessCash: excessCashVal } = rebalanceAdd(allocations, initialTotalValue, availableCash, assets, scaleFactor));
    } else if (rebalanceMethod === 'add_and_rebalance') {
        ({ results: finalResults, excessCash: excessCashVal } = rebalanceAddAndRebalance(allocations, initialTotalValue, availableCash, assets, scaleFactor));
    } else {
        // Gestisci il caso di un metodo non valido o predefinito
        finalResults = [];
        excessCashVal = 0;
    }

    return { results: finalResults, excessCash: excessCashVal.toFixed(2) };
};