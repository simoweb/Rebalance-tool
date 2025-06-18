// utils.js

/**
 * Converte una stringa formattata localmente in un numero float.
 * @param {string} value - La stringa da convertire (es. "1.234,56" o "1,234.56").
 * @returns {number} Il numero float convertito.
 */
export const parseLocaleFloat = (value) => {
    if (typeof value !== 'string') return parseFloat(value); // Gestisce già numeri
    // Tenta di convertire usando Number per gestire sia , che . come separatore decimale
    // e rimuove separatori delle migliaia non necessari.
    // Esempio: "1.234,56" -> "1234,56" -> 1234.56
    // Esempio: "1,234.56" -> "1234.56" -> 1234.56
    let cleanedValue = value.replace(/\./g, '').replace(/,/g, '.');
    // Se c'è un punto e una virgola, e la virgola è l'ultimo separatore, è probabile che la virgola sia il decimale.
    if (value.includes('.') && value.includes(',') && value.indexOf(',') > value.indexOf('.')) {
        cleanedValue = value.replace(/\./g, '').replace(/,/g, '.');
    } else if (value.includes(',') && !value.includes('.')) { // Solo virgola, è decimale
        cleanedValue = value.replace(/,/g, '.');
    } else { // Presumiamo punto come decimale o nessun separatore
        cleanedValue = value.replace(/,/g, ''); // Rimuove virgole se non sono decimali
    }
    const num = parseFloat(cleanedValue);
    return isNaN(num) ? 0 : num;
};


/**
 * Verifica se la quantità originale dell'asset permette valori frazionari.
 * Questo dipende dal tipo di asset.
 * @param {string | number} originalQuantityString - La quantità originale dell'asset.
 * @returns {boolean} True se la quantità è frazionaria, false altrimenti.
 */
export const isQuantityInputFractional = (originalQuantityString) => {
    // Esempio: Implementazione semplice. Potresti volerla basare sul tipo di asset reale.
    // Per ora, controlliamo se la stringa originale conteneva un separatore decimale
    // che indicherebbe una quantità frazionaria.
    if (typeof originalQuantityString === 'number') {
        return originalQuantityString % 1 !== 0; // Se è già un numero, controlla se ha decimali
    }
    return originalQuantityString.includes('.') || originalQuantityString.includes(',');
};

/**
 * Helper per calcolare le unità da aggiustare, gestendo arrotondamenti per quantità intere.
 * @param {number} valueDifference - La differenza di valore (targetValue - currentValue).
 * @param {number} price - Il prezzo corrente dell'asset.
 * @param {string | number} originalQuantityString - La quantità originale dell'asset per determinare la frazionalità.
 * @returns {number} Le unità calcolate, arrotondate o frazionarie.
 */
export const getUnitsCalculated = (valueDifference, price, originalQuantityString) => {
    if (price <= 0) return 0;

    const calculatedRawUnits = valueDifference / price;
    const isFractional = isQuantityInputFractional(originalQuantityString);

    if (isFractional) {
        return calculatedRawUnits; // Per asset frazionabili, restituisci il valore esatto.
    }

    // Logica per quote intere
    if (calculatedRawUnits > 0) {
        // ACQUISTI: Sii prudente, arrotonda per difetto per non superare il budget.
        return Math.floor(calculatedRawUnits);
    } else {
        // VENDITE: Sii pragmatico, arrotonda al più vicino per sbloccare la situazione.
        // Math.round(-0.5) = -1, Math.round(-0.49) = 0.
        return Math.round(calculatedRawUnits);
    }
};



/**
 * Calcola il valore corrente e la percentuale di allocazione per ogni asset.
 * Presuppone che 'assets' sia disponibile nell'ambito (o passato come argomento).
 * @param {Array<Object>} assets - Un array di oggetti asset con currentPrice e quantity.
 * @returns {Array<Object>} Un nuovo array di asset con currentValue e currentPercentage.
 */
export const calculateCurrentAllocation = (assets) => {
    const currentTotalValue = assets.reduce((sum, asset) => {
        return sum + (parseLocaleFloat(asset.currentPrice) * parseLocaleFloat(asset.quantity));
    }, 0);

    return assets.map(asset => {
        const value = parseLocaleFloat(asset.currentPrice) * parseLocaleFloat(asset.quantity);
        const percentage = currentTotalValue ? (value / currentTotalValue) * 100 : 0;
        return {
            ...asset,
            currentValue: value,
            currentPercentage: percentage
        };
    });
};