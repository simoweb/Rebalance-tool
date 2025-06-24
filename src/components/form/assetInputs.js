import React, { useState, useEffect, useCallback } from 'react';
function AssetInputs({ asset, index, isAssetComplete, updateAsset, calculateAssetValue }) {
    const [taxCalculate, settaxCalculate] = useState(false);
    const [farzionable, setFarzionable] = useState(false);
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="label-form">Nome</label>
                    <input
                        type="text"
                        placeholder="es: VWCE"
                        className="input-form"
                        value={asset.name}
                        onChange={(e) => updateAsset(index, 'name', e.target.value)}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="label-form">Target (%)</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder="es: 60 o 60,5"
                        className="input-form"
                        value={asset.targetPercentage}
                        onChange={(e) => updateAsset(index, 'targetPercentage', e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="label-form">Prezzo (€)</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder="es: 100 o 100,25"
                        className="input-form"
                        value={asset.currentPrice}
                        onChange={(e) => updateAsset(index, 'currentPrice', e.target.value)}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="label-form">Quantità</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder="es: 10 o 10,3"
                        className="input-form"
                        value={asset.quantity}
                        onChange={(e) => updateAsset(index, 'quantity', e.target.value)}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="label-form-check mb-1">Frazionabile</label>
                    <label className="relative inline-flex items-center cursor-pointer ml-2">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={asset.isFractionable}
                            onChange={(e) => updateAsset(index, 'isFractionable', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors"></div>
                        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
                    </label>
                </div>

                <div className="flex flex-col">
                    <label className="label-form-check mb-1">Calcolo imposte</label>
                    <label className="relative inline-flex items-center cursor-pointer ml-2">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={asset.taxCalculate}
                            onChange={(e) => updateAsset(index, 'taxCalculate', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors"></div>
                        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
                    </label>
                </div>
            </div>




            {asset.taxCalculate && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="label-form">PMC</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder="es: 100 o 100,25"
                            className="input-form"
                            value={asset.pmc}
                            onChange={(e) => updateAsset(index, 'pmc', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="label-form">Tax rate</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder="es: 26%, 12,5%"
                            className="input-form"
                            value={asset.taxRate}
                            onChange={(e) => updateAsset(index, 'taxRate', e.target.value)}
                        />
                    </div>
                </div>
            )}
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
