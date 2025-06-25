import React, { useState, useEffect, useCallback } from 'react';
import { parseLocaleFloat, calculateCurrentAllocation } from '../calculator/utils'
import PortfolioCharts from '../PortfolioCharts';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslations } from '../../translations';

function Results({
    assets,
    showResults,
    calculationResults,
    isCurrentDataComplete,
    rebalanceMethod,
    availableCash,
    getTotalPercentage,
    setShowClearConfirm
}) {
    console.log(calculationResults)
    const [showCopyTooltip, setShowCopyTooltip] = useState(false);
    const [activeTab, setActiveTab] = useState('grafici');
    const { language } = useLanguage();
    const { t } = useTranslations(language);

    const copyLink = async () => {
        try {
            const baseUrl = window.location.href.split('?')[0].split('#')[0];
            const params = new URLSearchParams();
            params.set('method', rebalanceMethod);
            if (availableCash && (rebalanceMethod === 'add' || rebalanceMethod === 'add_and_rebalance')) {
                params.set('cash', availableCash);
            }
            assets.forEach((asset, index) => {
                if (asset.name || asset.targetPercentage || asset.currentPrice || asset.quantity) {
                    params.set(`asset${index}_name`, asset.name);
                    params.set(`asset${index}_target`, asset.targetPercentage);
                    params.set(`asset${index}_price`, asset.currentPrice);
                    params.set(`asset${index}_quantity`, asset.quantity);
                    params.set(`asset${index}_pmc`, asset.pmc);
                    params.set(`asset${index}_taxRate`, asset.taxRate);
                    params.set(`asset${index}_fractionable`, asset.isFractionable);
                    params.set(`asset${index}_taxCalculate`, asset.taxCalculate);
                }
            });

            const urlToCopy = `${baseUrl}?${params.toString()}#calcolatore`;
            await navigator.clipboard.writeText(urlToCopy);
            setShowCopyTooltip(true);
            setTimeout(() => { setShowCopyTooltip(false); }, 2000);
        } catch (err) { console.error('Failed to copy link:', err); }
    };
    return (
        <div className="lg:w-1/2">
            {showResults && calculationResults && calculationResults.results ? (
                <div className="sticky top-8">
                    <div className="bg-gray-50 rounded-lg pt-4 pb-4 dark:bg-gray-800/70 backdrop-blur-sm">
                        {/* Intestazione Risultati e Condividi Link */}
                        <div className="flex justify-between flex-col md:flex-row items-center mb-6 px-2 md:px-6">
                            <h2 className="text-lg md:text-xl font-semibold dark:text-gray-300">{t('calculator.results.title')}</h2>
                            <div className="relative">
                                <button onClick={copyLink} className="flex items-center justify-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                    {t('calculator.results.shareLink')}
                                </button>
                                {showCopyTooltip && (<div className="absolute bottom-full right-0 transform translate-y-[-8px] mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded shadow-lg whitespace-nowrap z-10">{t('calculator.results.linkCopied')}<div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div></div>)}
                            </div>
                        </div>
                        {/* Liquidità in eccesso */}
                        {(() => {
                            const excessCashNum = parseLocaleFloat(calculationResults.excessCash);

                            let message = '';
                            if (rebalanceMethod === 'sell') {
                                message = excessCashNum >= 0 ? t('calculator.results.excessCash.sellPositive') : t('calculator.results.excessCash.sellNegative');
                            } else if (rebalanceMethod === 'add' || rebalanceMethod === 'add_and_rebalance') {
                                message = excessCashNum >= 0 ? t('calculator.results.excessCash.addPositive') : t('calculator.results.excessCash.addNegative');
                            }
                            if (message) {
                                return (
                                    <div className={`mx-6 mb-6 p-4 border rounded-lg ${excessCashNum >= 0 ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                        <p className="text-sm md:text-base">{message}
                                            <span className="ml-2 font-semibold">{excessCashNum.toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { style: 'currency', currency: 'EUR' })}</span>
                                        </p>
                                    </div>);
                            } return null;
                        })()}
                        {/* Tab Navigation e Content (Grafici/Tabella) come prima */}
                        <div className="border-b border-gray-200 dark:border-gray-700 mb-6 px-2 md:px-6">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button onClick={() => setActiveTab('grafici')} className={`${activeTab === 'grafici' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('calculator.results.tabs.charts')}</button>
                                <button onClick={() => setActiveTab('tabella')} className={`${activeTab === 'tabella' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('calculator.results.tabs.table')}</button>
                            </nav>
                        </div>
                        {activeTab === 'grafici' ? (
                            <div className="px-2 md:px-6">
                                <div className="mb-8 space-y-3">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">{t('calculator.results.summary.title')}</h3>
                                    {calculationResults.results.map((result, index) => (

                                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm dark:bg-gray-700">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-2 h-8 rounded-full ${result.adjustment > 0 ? 'bg-green-500' : result.adjustment < 0 ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                                                <div>

                                                    <p className="font-medium text-gray-900 dark:text-gray-100">{result.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{parseLocaleFloat(result.currentPercentage).toFixed(2)}% {t('calculator.results.summary.currentToNew')} {parseLocaleFloat(result.newPercentage).toFixed(2)}%</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {(parseLocaleFloat(result.quantity) * parseLocaleFloat(result.currentPrice)).toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { style: 'currency', currency: 'EUR' })}
                                                        {' → '}
                                                        {(result.newQuantity * parseLocaleFloat(result.currentPrice)).toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { style: 'currency', currency: 'EUR' })}
                                                    </p>

                                                    {/* Nuova Quantità e Valore */}
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {t('calculator.results.summary.pricePerUnit')} {parseFloat(result.prezzoQuota).toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { style: 'currency', currency: 'EUR' })}
                                                    </p>


                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-medium ${result.adjustment > 0 ? 'text-green-600 dark:text-green-400' : result.adjustment < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                                    {result.adjustment > 0 ? '+' : ''}{result.adjustment.toLocaleString(language === 'it' ? 'it-IT' : 'en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 5,
                                                    })} {t('calculator.results.summary.units')}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {parseLocaleFloat(result.adjustmentValue).toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { style: 'currency', currency: 'EUR' })}
                                                </p>
                                                {/* ---- MOSTRA TASSE QUI ---- */}
                                                {result.adjustment < 0 && parseFloat(result.taxAmount) > 0 && (
                                                    <p className="text-xs text-red-500 dark:text-red-400">
                                                        {t('calculator.results.summary.taxes')} {parseFloat(result.taxAmount).toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { style: 'currency', currency: 'EUR' })}
                                                    </p>
                                                )}
                                                {/* ---- FINE SEZIONE TASSE ---- */}
                                            </div>

                                        </div>))}
                                </div>
                                {/* Qui passiamo la calculateCurrentAllocation importata al PortfolioCharts */}
                                <PortfolioCharts assets={assets} currentAllocation={calculateCurrentAllocation(assets)} />
                            </div>
                        ) : ( /* Tabella */
                            <div className="space-y-4 px-2 md:px-6">
                                {calculationResults.results.map((result, index) => (
                                    <div key={index} className="p-4 bg-white rounded-lg shadow-sm dark:bg-gray-700">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-gray-100">{result.name}</h3>
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">{parseLocaleFloat(result.currentPercentage).toFixed(2)}% → {parseLocaleFloat(result.newPercentage).toFixed(2)}%</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div><p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{t('calculator.results.table.targetAllocation')}</p><p className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200">{parseLocaleFloat(result.adjustedTargetPercentage).toFixed(2)}%</p></div>
                                            <div><p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{t('calculator.results.table.currentQuantity')}</p><p className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200">{parseLocaleFloat(result.quantity).toLocaleString(language === 'it' ? 'it-IT' : 'en-US')} {t('calculator.results.summary.units')}</p></div>
                                            <div><p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{t('calculator.results.table.adjustment')}</p><p className={`text-sm md:text-base font-medium ${result.adjustment >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{result.adjustment.toLocaleString(language === 'it' ? 'it-IT' : 'en-US')} {t('calculator.results.summary.units')} <span className={`text-xs md:text-sm ml-1`}>({result.adjustment >= 0 ? '+' : ''}{parseLocaleFloat(result.adjustmentValue).toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { style: 'currency', currency: 'EUR' })})</span></p></div>
                                            <div><p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{t('calculator.results.table.newQuantity')}</p><div className="flex justify-between items-center"><p className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200">{result.newQuantity.toLocaleString(language === 'it' ? 'it-IT' : 'en-US')} {t('calculator.results.summary.units')}</p><p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{(result.newQuantity * parseLocaleFloat(result.currentPrice)).toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { style: 'currency', currency: 'EUR' })}</p></div></div>
                                        </div>
                                        <div>

                                        </div>

                                        {/* ---- MOSTRA TASSE QUI ---- */}
                                        {result.adjustment < 0 && parseFloat(result.taxAmount) > 0 && (
                                            <div>
                                                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{t('calculator.results.table.taxesPaid')}</p>
                                                <p className="text-sm md:text-base font-medium text-red-600 dark:text-red-400">
                                                    {parseFloat(result.taxAmount).toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { style: 'currency', currency: 'EUR' })}
                                                </p>
                                            </div>
                                        )}
                                    </div>))}
                            </div>)}
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 px-6">
                            <div className="relative">
                                <button onClick={copyLink} className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                    {t('calculator.results.shareLink')}
                                </button>

                                {showCopyTooltip && (
                                    <div className="absolute bottom-full right-0 transform mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded shadow-lg whitespace-nowrap">
                                        {t('calculator.results.linkCopied')}
                                        <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <button onClick={() => setShowClearConfirm(true)} className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>{t('calculator.form.buttons.clearForm')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            ) :
                (

                    <div className="h-full flex items-center justify-center p-8 text-center flex-col">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">{isCurrentDataComplete() ? t('calculator.form.validation.clickCalculate') : (assets.length > 0 && assets.some(a => String(a.targetPercentage).trim() !== '') && Math.abs(getTotalPercentage() - 100) >= 0.01) ?
                                t('calculator.form.validation.totalMustBe100') :
                                t('calculator.form.validation.completeAllFields')
                            }</p>
                        </div>
                        {isCurrentDataComplete() ? "" : (
                            assets.length > 0 && assets.some(a => String(a.targetPercentage).trim() !== '') && Math.abs(getTotalPercentage() - 100) >= 0.01 &&

                            <div className="relative mt-4">
                                <button onClick={() => setShowClearConfirm(true)} className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>{t('calculator.form.buttons.clearForm')}</button>
                            </div>
                        )
                        }

                        {isCurrentDataComplete() ? "" : (assets.length > 0 && assets.some(a => String(a.targetPercentage).trim() !== '') && Math.abs(getTotalPercentage() - 100) >= 0.01) ?
                            "" :
                            <div className='items-center justify-center'>
                                <h5 className='text-lg mt-5'>Carica esempi</h5>
                                <div className='items-center justify-center'>
                                    <button
                                        onClick={() => {
                                            window.location.href = `?method=sell&asset0_name=PHAU&asset0_target=25&asset0_price=275%2C17&asset0_quantity=26&asset0_pmc=240&asset0_taxRate=26&asset0_fractionable=false&asset0_taxCalculate=true&asset1_name=PJS1&asset1_target=25&asset1_price=98%2C18&asset1_quantity=63&asset1_pmc=95&asset1_taxRate=12%2C5&asset1_fractionable=false&asset1_taxCalculate=true&asset2_name=SWDA&asset2_target=25&asset2_price=100%2C05&asset2_quantity=58&asset2_pmc=85&asset2_taxRate=26&asset2_fractionable=false&asset2_taxCalculate=true&asset3_name=XG7S&asset3_target=25&asset3_price=220%2C52&asset3_quantity=28&asset3_pmc=210&asset3_taxRate=12%2C5&asset3_fractionable=false&asset3_taxCalculate=true#calcolatore`;
                                        }}
                                        className="mx-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg text-sm hover:from-green-600 hover:to-green-800 transition-colors mt-5"
                                    >
                                        Permanent Portfolio
                                    </button>

                                    <button
                                        onClick={() => {
                                            window.location.href = `?method=sell&asset0_name=SWDA&asset0_target=20&asset0_price=100%2C00&asset0_quantity=10&asset0_pmc=85&asset0_taxRate=26&asset0_fractionable=false&asset0_taxCalculate=true&asset1_name=IUSN&asset1_target=20&asset1_price=90%2C00&asset1_quantity=12&asset1_pmc=80&asset1_taxRate=26&asset1_fractionable=false&asset1_taxCalculate=true&asset2_name=PHAU&asset2_target=20&asset2_price=270%2C00&asset2_quantity=4&asset2_pmc=240&asset2_taxRate=26&asset2_fractionable=false&asset2_taxCalculate=true&asset3_name=IBGL&asset3_target=20&asset3_price=120%2C00&asset3_quantity=8&asset3_pmc=130&asset3_taxRate=12%2C5&asset3_fractionable=false&asset3_taxCalculate=true&asset4_name=EUNA&asset4_target=20&asset4_price=100%2C00&asset4_quantity=9&asset4_pmc=95&asset4_taxRate=26&asset4_fractionable=false&asset4_taxCalculate=true#calcolatore`;
                                        }}
                                        className="mx-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg text-sm hover:from-yellow-500 hover:to-yellow-700 transition-colors mt-5"
                                    >
                                        Golden Butterfly
                                    </button>

                                    <button
                                        onClick={() => {
                                            window.location.href = `?method=sell&asset0_name=SWDA&asset0_target=30&asset0_price=100%2C00&asset0_quantity=12&asset0_pmc=85&asset0_taxRate=26&asset0_fractionable=false&asset0_taxCalculate=true&asset1_name=IBGL&asset1_target=40&asset1_price=120%2C00&asset1_quantity=10&asset1_pmc=130&asset1_taxRate=12%2C5&asset1_fractionable=false&asset1_taxCalculate=true&asset2_name=EUNA&asset2_target=15&asset2_price=100%2C00&asset2_quantity=6&asset2_pmc=90&asset2_taxRate=26&asset2_fractionable=false&asset2_taxCalculate=true&asset3_name=PHAU&asset3_target=7.5&asset3_price=270%2C00&asset3_quantity=2&asset3_pmc=240&asset3_taxRate=26&asset3_fractionable=false&asset3_taxCalculate=true&asset4_name=CRUD&asset4_target=7.5&asset4_price=25%2C00&asset4_quantity=8&asset4_pmc=30&asset4_taxRate=26&asset4_fractionable=false&asset4_taxCalculate=true#calcolatore`;
                                        }}
                                        className="mx-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg text-sm hover:from-blue-600 hover:to-blue-800 transition-colors mt-5"
                                    >
                                        All Weather Portfolio
                                    </button>

                                    <button
                                        onClick={() => {
                                            window.location.href = `http://localhost:8080/?method=sell&asset0_name=SWDA&asset0_target=60&asset0_price=100%2C00&asset0_quantity=15&asset0_pmc=85&asset0_taxRate=26&asset0_fractionable=false&asset0_taxCalculate=true&asset1_name=AGGH&asset1_target=40&asset1_price=85%2C00&asset1_quantity=10&asset1_pmc=90&asset1_taxRate=12%2C5&asset1_fractionable=false&asset1_taxCalculate=true#calcolatore`;
                                        }}
                                        className="mx-2 px-3 py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-lg text-sm hover:from-gray-600 hover:to-gray-800 transition-colors mt-5"
                                    >
                                        Portafoglio 60/40
                                    </button>

                                    <button
                                        onClick={() => {
                                            window.location.href = `?method=sell&asset0_name=SWDA&asset0_target=50&asset0_price=100%2C00&asset0_quantity=10&asset0_pmc=85&asset0_taxRate=26&asset0_fractionable=false&asset0_taxCalculate=true&asset1_name=BTC&asset1_target=25&asset1_price=35000%2C00&asset1_quantity=0%2C05&asset1_pmc=25000&asset1_taxRate=26&asset1_fractionable=true&asset1_taxCalculate=true&asset2_name=ETH&asset2_target=25&asset2_price=1900%2C00&asset2_quantity=0%2C7&asset2_pmc=2200&asset2_taxRate=26&asset2_fractionable=true&asset2_taxCalculate=true#calcolatore`;
                                        }}
                                        className="mx-2 px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-700 text-white rounded-lg text-sm hover:from-pink-600 hover:to-purple-800 transition-colors mt-5"
                                    >
                                        Crypto + Azioni (50/50)
                                    </button>

                                    <button
                                        onClick={() => {
                                            window.location.href = `?method=sell&asset0_name=BTC&asset0_target=40&asset0_price=35000%2C00&asset0_quantity=0%2C06&asset0_pmc=25000&asset0_taxRate=26&asset0_fractionable=true&asset0_taxCalculate=true&asset1_name=ETH&asset1_target=30&asset1_price=1900%2C00&asset1_quantity=0%2C8&asset1_pmc=2200&asset1_taxRate=26&asset1_fractionable=true&asset1_taxCalculate=true&asset2_name=SOL&asset2_target=15&asset2_price=150%2C00&asset2_quantity=5&asset2_pmc=100&asset2_taxRate=26&asset2_fractionable=true&asset2_taxCalculate=true&asset3_name=USDC&asset3_target=15&asset3_price=1%2C00&asset3_quantity=100&asset3_pmc=1&asset3_taxRate=0&asset3_fractionable=false&asset3_taxCalculate=false#calcolatore`;
                                        }}
                                        className="mx-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg text-sm hover:from-orange-600 hover:to-yellow-600 transition-colors mt-5"
                                    >
                                        Crypto Diversificato
                                    </button>
                                </div>

                            </div>
                        }

                    </div>

                )}

        </div>
    )
}
export default Results;