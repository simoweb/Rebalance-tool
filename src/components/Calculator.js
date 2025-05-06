import React from 'react';
import AssetForm from './AssetForm';
import Results from './Results';

const Calculator = ({
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
  showResults,
  calculationResults,
  calculateCurrentAllocation,
  copyLink,
  showCopyTooltip,
  setShowClearConfirm,
  clearForm
}) => {
  const handleClearClick = () => {
    setShowClearConfirm(true);
    setTimeout(() => {
      setShowClearConfirm(false);
    }, 3000);
  };

  return (
    <section id="calcolatore" className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-teal-400 transform transition-all duration-500 py-20">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-3xl font-bold text-center mb-12 text-white mt-4">Calcola il Ribilanciamento</h2>

        <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-3xl p-4 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <AssetForm
              assets={assets}
              updateAsset={updateAsset}
              rebalanceMethod={rebalanceMethod}
              handleMethodChange={handleMethodChange}
              availableCash={availableCash}
              handleCashChange={handleCashChange}
              addAsset={addAsset}
              handleCalculate={handleCalculate}
              isDataComplete={isDataComplete}
              isAssetComplete={isAssetComplete}
              calculateAssetValue={calculateAssetValue}
              getTotalPercentage={getTotalPercentage}
              isPercentageValid={isPercentageValid}
              handleClearClick={handleClearClick}
              clearForm={clearForm}
              showClearConfirm={showClearConfirm}
            />

            <div className="lg:w-1/2">
              <Results
                showResults={showResults}
                calculationResults={calculationResults}
                rebalanceMethod={rebalanceMethod}
                assets={assets}
                calculateCurrentAllocation={calculateCurrentAllocation}
                copyLink={copyLink}
                showCopyTooltip={showCopyTooltip}
                handleClearClick={handleClearClick}
                clearForm={clearForm}
                showClearConfirm={showClearConfirm}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator; 