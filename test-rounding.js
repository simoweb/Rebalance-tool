// Test per verificare l'arrotondamento corretto
const { getUnitsCalculated } = require('./src/components/calculator/utils.js');

console.log('🧪 Test Arrotondamento Asset\n');

// Test 1: Asset frazionabile - non deve essere arrotondato
console.log('1. Asset Frazionabile (ETF):');
const fractionalAsset = {
    valueDifference: 1000, // 1000€ da investire
    price: 25.50, // Prezzo per quota
    isFractionable: true
};

const fractionalUnits = getUnitsCalculated(
    fractionalAsset.valueDifference, 
    fractionalAsset.price, 
    fractionalAsset.isFractionable, 
    true
);

console.log(`   💰 Valore da investire: ${fractionalAsset.valueDifference}€`);
console.log(`   📈 Prezzo per quota: ${fractionalAsset.price}€`);
console.log(`   📊 Quote calcolate: ${fractionalUnits}`);
console.log(`   ✅ Dovrebbe essere: ${fractionalAsset.valueDifference / fractionalAsset.price}`);
console.log(`   🔍 Arrotondato? ${fractionalUnits !== fractionalAsset.valueDifference / fractionalAsset.price ? 'SÌ ❌' : 'NO ✅'}\n`);

// Test 2: Asset non frazionabile - deve essere arrotondato
console.log('2. Asset Non Frazionabile (Azione):');
const nonFractionalAsset = {
    valueDifference: 1000, // 1000€ da investire
    price: 25.50, // Prezzo per azione
    isFractionable: false
};

const nonFractionalUnits = getUnitsCalculated(
    nonFractionalAsset.valueDifference, 
    nonFractionalAsset.price, 
    nonFractionalAsset.isFractionable, 
    true
);

console.log(`   💰 Valore da investire: ${nonFractionalAsset.valueDifference}€`);
console.log(`   📈 Prezzo per azione: ${nonFractionalAsset.price}€`);
console.log(`   📊 Azioni calcolate: ${nonFractionalUnits}`);
console.log(`   ✅ Dovrebbe essere: ${Math.floor(nonFractionalAsset.valueDifference / nonFractionalAsset.price)}`);
console.log(`   🔍 Arrotondato correttamente? ${nonFractionalUnits === Math.floor(nonFractionalAsset.valueDifference / nonFractionalAsset.price) ? 'SÌ ✅' : 'NO ❌'}\n`);

// Test 3: Vendita di asset frazionabile
console.log('3. Vendita Asset Frazionabile:');
const fractionalSell = {
    valueDifference: -1000, // -1000€ da vendere
    price: 25.50, // Prezzo per quota
    isFractionable: true
};

const fractionalSellUnits = getUnitsCalculated(
    fractionalSell.valueDifference, 
    fractionalSell.price, 
    fractionalSell.isFractionable, 
    false
);

console.log(`   💰 Valore da vendere: ${Math.abs(fractionalSell.valueDifference)}€`);
console.log(`   📈 Prezzo per quota: ${fractionalSell.price}€`);
console.log(`   📊 Quote da vendere: ${fractionalSellUnits}`);
console.log(`   ✅ Dovrebbe essere: ${fractionalSell.valueDifference / fractionalSell.price}`);
console.log(`   🔍 Arrotondato? ${fractionalSellUnits !== fractionalSell.valueDifference / fractionalSell.price ? 'SÌ ❌' : 'NO ✅'}\n`);

// Test 4: Vendita di asset non frazionabile
console.log('4. Vendita Asset Non Frazionabile:');
const nonFractionalSell = {
    valueDifference: -1000, // -1000€ da vendere
    price: 25.50, // Prezzo per azione
    isFractionable: false
};

const nonFractionalSellUnits = getUnitsCalculated(
    nonFractionalSell.valueDifference, 
    nonFractionalSell.price, 
    nonFractionalSell.isFractionable, 
    false
);

console.log(`   💰 Valore da vendere: ${Math.abs(nonFractionalSell.valueDifference)}€`);
console.log(`   📈 Prezzo per azione: ${nonFractionalSell.price}€`);
console.log(`   📊 Azioni da vendere: ${nonFractionalSellUnits}`);
console.log(`   ✅ Dovrebbe essere: ${Math.round(nonFractionalSell.valueDifference / nonFractionalSell.price)}`);
console.log(`   🔍 Arrotondato correttamente? ${nonFractionalSellUnits === Math.round(nonFractionalSell.valueDifference / nonFractionalSell.price) ? 'SÌ ✅' : 'NO ❌'}\n`);

console.log('🎯 Risultato finale:');
console.log('Se tutti i test mostrano ✅, l\'arrotondamento funziona correttamente!');
console.log('Gli asset frazionabili NON devono essere arrotondati.');
console.log('Gli asset non frazionabili devono essere arrotondati appropriatamente.'); 