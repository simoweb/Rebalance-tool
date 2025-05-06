import React from 'react';

const AssetForm = ({ 
  assets, 
  updateAsset, 
  rebalanceMethod, 
  handleMethodChange,
  availableCash,
  handleCashChange,
  addAsset,
  handleCalculate,
  isDataComplete,
  isAssetComplete,
  calculateAssetValue,
  getTotalPercentage,
  isPercentageValid,
  handleClearClick,
  clearForm,
  showClearConfirm
}) => {
  const totalPercentage = getTotalPercentage();
  const isValid = isPercentageValid();

  return (
    <div className="lg:w-1/2 px-2 md:px-0">
      {/* Metodo di ribilanciamento */}
      <div className="mb-6">
        <div className="flex items-center">
          <label className="w-1/3 text-sm md:text-base font-medium text-gray-700">
            Metodo
          </label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="sell"
                checked={rebalanceMethod === 'sell'}
                onChange={handleMethodChange}
                className="form-radio text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-gray-700">Vendi asset in eccesso</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="add"
                checked={rebalanceMethod === 'add'}
                onChange={handleMethodChange}
                className="form-radio text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-gray-700">Aggiungi liquidità</span>
            </label>
          </div>
        </div>
      </div>

      {/* Campo liquidità disponibile */}
      {rebalanceMethod === 'add' && (
        <div className="mb-6">
          <div className="flex items-center">
            <label className="w-1/3 text-sm md:text-base font-medium text-gray-700">
              Liquidità (€)
            </label>
            <input
              type="number"
              placeholder="es: 1000"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={availableCash}
              onChange={handleCashChange}
            />
          </div>
        </div>
      )}

      {/* Totale percentuale */}
      {assets.some(asset => asset.targetPercentage !== '') && (
        <div className={`mb-6 p-4 rounded-lg ${
          isValid 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex justify-between items-center">
            <span>Totale percentuali:</span>
            <span className="font-semibold">{totalPercentage.toFixed(2)}%</span>
          </div>
          {!isValid && (
            <p className="text-sm mt-2">
              La somma delle percentuali deve essere 100%
            </p>
          )}
        </div>
      )}

      {/* Lista degli asset */}
      <div className="space-y-6">
        {assets.map((asset, index) => (
          <div key={index} className="p-6 border rounded-lg bg-gray-50 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center">
                <label className="w-1/3 text-sm md:text-base font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  placeholder="es: VWCE"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={asset.name}
                  onChange={(e) => updateAsset(index, 'name', e.target.value)}
                />
              </div>
              
              <div className="flex items-center">
                <label className="w-1/3 text-sm md:text-base font-medium text-gray-700">
                  Target (%)
                </label>
                <input
                  type="number"
                  placeholder="es: 60"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={asset.targetPercentage}
                  onChange={(e) => updateAsset(index, 'targetPercentage', e.target.value)}
                />
              </div>
              
              <div className="flex items-center">
                <label className="w-1/3 text-sm md:text-base font-medium text-gray-700">
                  Prezzo (€)
                </label>
                <input
                  type="number"
                  placeholder="es: 100"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={asset.currentPrice}
                  onChange={(e) => updateAsset(index, 'currentPrice', e.target.value)}
                />
              </div>
              
              <div className="flex items-center">
                <label className="w-1/3 text-sm md:text-base font-medium text-gray-700">
                  Quantità
                </label>
                <input
                  type="number"
                  placeholder="es: 10"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={asset.quantity}
                  onChange={(e) => updateAsset(index, 'quantity', e.target.value)}
                />
              </div>

              {isAssetComplete(asset) && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-gray-500">Valore totale:</span>
                    <span className="text-xl font-semibold text-gray-900">
                      {calculateAssetValue(asset)?.toLocaleString('it-IT', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pulsanti */}
      <div className="space-y-6 mt-8">
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={addAsset}
            className="w-full md:flex-1 bg-gray-600 text-white py-3 px-6 text-lg rounded-lg hover:bg-gray-700 transition-colors"
          >
            Aggiungi Asset
          </button>
          <button
            onClick={showClearConfirm ? clearForm : handleClearClick}
            className={`w-full md:flex-1 py-3 px-6 text-lg rounded-lg transition-colors ${
              showClearConfirm
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {showClearConfirm ? 'Conferma Reset' : 'Reset Form'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetForm; 