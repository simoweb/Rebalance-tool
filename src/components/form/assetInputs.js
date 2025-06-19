import React, { useState, useEffect, useCallback } from 'react';
function AssetInputs({ asset, index, isAssetComplete, updateAsset, calculateAssetValue }) {
    const [taxCalculate, settaxCalculate] = useState(false);
    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row">
                <label className="w-full md:w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">Nome</label>
                <input
                  type="text"
                  placeholder="es: VWCE"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent"
                  value={asset.name}
                  onChange={(e) => updateAsset(index, 'name', e.target.value)}
                />
            </div>
            <div className="flex flex-col md:flex-row">
                <label className="w-full md:w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">Target (%)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="es: 60 o 60,5"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent"
                  value={asset.targetPercentage}
                  onChange={(e) => updateAsset(index, 'targetPercentage', e.target.value)}
                />
            </div>
            <div className="flex flex-col md:flex-row">
                <label className="w-full md:w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">Prezzo (€)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="es: 100 o 100,25"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent"
                  value={asset.currentPrice}
                  onChange={(e) => updateAsset(index, 'currentPrice', e.target.value)}
                />
            </div>
            <div className="flex flex-col md:flex-row">
                <label className="w-full md:w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">Frazionabile</label>
                <div className="w-full">
                    <input
                      type="checkbox"
                      className="shadow focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent"
                      checked={asset.isFractionable}
                      onChange={(e) => updateAsset(index, 'isFractionable', e.target.checked)}
                    />
                </div>
            </div>
            <div className="flex flex-col md:flex-row">
                <label className="w-full md:w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">Calcolo imposte</label>
                <div className="w-full">
                    <input
                      type="checkbox"
                      className="shadow focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent"
                      checked={asset.taxCalculate}
                      onChange={(e) => updateAsset(index, 'taxCalculate', e.target.checked)}
                    />
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row">
                <label className="w-full md:w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">Quantità</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="es: 10 o 10,3"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent"
                  value={asset.quantity}
                  onChange={(e) => updateAsset(index, 'quantity', e.target.value)}
                />
            </div>
            <div className="flex flex-col md:flex-row">
                <label className="w-full md:w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">PMC</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="es: 100 o 100,25"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent"
                  value={asset.pmc}
                  onChange={(e) => updateAsset(index, 'pmc', e.target.value)}
                />
            </div>
            <div className="flex flex-col md:flex-row">
                <label className="w-full md:w-1/3 text-sm md:text-base font-medium text-gray-700 dark:text-gray-400">Tax rate</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="es: 26%, 12,5%"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-400 dark:border-transparent"
                  value={asset.taxRate}
                  onChange={(e) => updateAsset(index, 'taxRate', e.target.value)}
                />
            </div>

            {isAssetComplete(asset) && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-sm dark:bg-gray-700">
                    <div className="flex justify-between items-center">
                        <span className="text-base font-medium text-gray-500 dark:text-gray-400">Valore totale:</span>
                        <span className="text-xl font-semibold text-gray-900 dark:text-gray-200">
                            {calculateAssetValue(asset)?.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AssetInputs;
