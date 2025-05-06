import React from 'react';
import PortfolioCharts from './PortfolioCharts';

const Results = ({
  showResults,
  calculationResults,
  rebalanceMethod,
  assets,
  calculateCurrentAllocation,
  copyLink,
  showCopyTooltip,
  handleClearClick,
  clearForm,
  showClearConfirm
}) => {
  if (!showResults || !calculationResults) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center">
        <div className="text-gray-500">
          Completa i dati degli asset per visualizzare i risultati del ribilanciamento
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Risultati Ribilanciamento</h3>
        <div className="flex space-x-2">
          <button
            onClick={copyLink}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showCopyTooltip ? 'Link Copiato!' : 'Copia Link'}
            <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={showClearConfirm ? clearForm : handleClearClick}
            className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
              showClearConfirm
                ? 'text-red-700 bg-red-100 hover:bg-red-200'
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
          >
            {showClearConfirm ? 'Conferma Reset' : 'Reset Form'}
            <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              {rebalanceMethod === 'sell' ? (
                <>
                  Liquidità generata dalla vendita: <span className="font-medium">{new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(calculationResults.excessCash)}</span>
                </>
              ) : (
                <>
                  Liquidità non utilizzata: <span className="font-medium">{new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(calculationResults.excessCash)}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% Attuale</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% Target</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qt. Attuale</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Variazione</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qt. Nuova</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valore (€)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {calculationResults.results.map((result, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.name}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-500">{result.currentPercentage.toFixed(2)}%</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-500">{result.targetPercentage.toFixed(2)}%</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-500">{result.currentQuantity}</td>
                <td className={`px-3 py-4 whitespace-nowrap text-sm text-right ${result.adjustment > 0 ? 'text-green-600' : result.adjustment < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                  {result.adjustment > 0 ? '+' : ''}{result.adjustment}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-500">{result.newQuantity}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                  {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(result.newValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Allocazione Attuale</h4>
        <PortfolioCharts
          assets={assets}
          currentAllocation={calculateCurrentAllocation()}
        />
      </div>
    </div>
  );
};

export default Results; 