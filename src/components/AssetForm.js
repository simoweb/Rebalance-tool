import React from 'react';

const AssetForm = ({ 
  assets, 
  handleAssetChange, 
  addAsset, 
  removeAsset, 
  handleSubmit,
  rebalanceMethod,
  setRebalanceMethod,
  availableCash,
  setAvailableCash,
  showClearConfirm,
  handleClearClick,
  clearForm
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">Inserisci i tuoi asset</h2>
      <form onSubmit={handleSubmit}>
        {assets.map((asset, index) => (
          <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg relative group">
            <button
              type="button"
              onClick={() => removeAsset(index)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
              title="Rimuovi asset"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Asset
                </label>
                <input
                  type="text"
                  value={asset.name}
                  onChange={(e) => handleAssetChange(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target %
                </label>
                <input
                  type="number"
                  value={asset.targetPercentage}
                  onChange={(e) => handleAssetChange(index, 'targetPercentage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prezzo Attuale (€)
                </label>
                <input
                  type="number"
                  value={asset.currentPrice}
                  onChange={(e) => handleAssetChange(index, 'currentPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantità
                </label>
                <input
                  type="number"
                  value={asset.quantity}
                  onChange={(e) => handleAssetChange(index, 'quantity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  min="0"
                  step="0.000001"
                  required
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={addAsset}
            className="inline-flex items-center px-4 py-2 border border-indigo-500 text-indigo-500 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Aggiungi Asset
          </button>
          
          {showClearConfirm ? (
            <button
              type="button"
              onClick={clearForm}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              Conferma Reset
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClearClick}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Reset Form
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metodo di Ribilanciamento
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="sell"
                  checked={rebalanceMethod === 'sell'}
                  onChange={(e) => setRebalanceMethod(e.target.value)}
                  className="form-radio text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2">Vendita</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="add"
                  checked={rebalanceMethod === 'add'}
                  onChange={(e) => setRebalanceMethod(e.target.value)}
                  className="form-radio text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2">Aggiunta Liquidità</span>
              </label>
            </div>
          </div>

          {rebalanceMethod === 'add' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Liquidità Disponibile (€)
              </label>
              <input
                type="number"
                value={availableCash}
                onChange={(e) => setAvailableCash(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                min="0"
                step="0.01"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Calcola Ribilanciamento
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssetForm; 