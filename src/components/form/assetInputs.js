import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslations } from '../../translations';

function AssetInputs({ asset, index, isAssetComplete, updateAsset, calculateAssetValue }) {
    const [taxCalculate, settaxCalculate] = useState(false);
    const [farzionable, setFarzionable] = useState(false);
    const { language } = useLanguage();
    const { t } = useTranslations(language);
    
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="label-form">{t('calculator.form.assetInputs.name')}</label>
                    <input
                        type="text"
                        placeholder={t('calculator.form.assetInputs.namePlaceholder')}
                        className="input-form"
                        value={asset.name}
                        onChange={(e) => updateAsset(index, 'name', e.target.value)}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="label-form">{t('calculator.form.assetInputs.targetPercentage')}</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder={t('calculator.form.assetInputs.targetPercentagePlaceholder')}
                        className="input-form"
                        value={asset.targetPercentage}
                        onChange={(e) => updateAsset(index, 'targetPercentage', e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="label-form">{t('calculator.form.assetInputs.price')}</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder={t('calculator.form.assetInputs.pricePlaceholder')}
                        className="input-form"
                        value={asset.currentPrice}
                        onChange={(e) => updateAsset(index, 'currentPrice', e.target.value)}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="label-form">{t('calculator.form.assetInputs.quantity')}</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder={t('calculator.form.assetInputs.quantityPlaceholder')}
                        className="input-form"
                        value={asset.quantity}
                        onChange={(e) => updateAsset(index, 'quantity', e.target.value)}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="label-form-check mb-1">{t('calculator.form.assetInputs.fractionable')}</label>
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
                    <label className="label-form-check mb-1">{t('calculator.form.assetInputs.taxCalculation')}</label>
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
                        <label className="label-form">{t('calculator.form.assetInputs.pmc')}</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder={t('calculator.form.assetInputs.pmcPlaceholder')}
                            className="input-form"
                            value={asset.pmc}
                            onChange={(e) => updateAsset(index, 'pmc', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="label-form">{t('calculator.form.assetInputs.taxRate')}</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder={t('calculator.form.assetInputs.taxRatePlaceholder')}
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
                        <span className="text-base font-medium text-gray-500 dark:text-gray-400">{t('calculator.form.assetInputs.totalValue')}</span>
                        <span className="text-xl font-semibold text-gray-900 dark:text-gray-200">
                            {calculateAssetValue(asset)?.toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { style: 'currency', currency: 'EUR' })}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AssetInputs;
