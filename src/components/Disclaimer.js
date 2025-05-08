import React, { useState, useEffect } from 'react';

const Disclaimer = () => {
   const [showDisclaimer, setShowDisclaimer] = useState(true);
   // Controlla se il disclaimer è stato chiuso in precedenza
  useEffect(() => {
    const disclaimerClosed = localStorage.getItem('disclaimerClosed');
    if (disclaimerClosed === 'true') {
      setShowDisclaimer(false);
    } else {
      setShowDisclaimer(true);
      localStorage.setItem('disclaimerClosed', 'false');
    }
  }, []);

  // Funzione per chiudere il disclaimer
  const closeDisclaimer = () => {
    setShowDisclaimer(false);
    localStorage.setItem('disclaimerClosed', 'true');
  };
  if (!showDisclaimer) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="p-2 rounded-lg bg-yellow-50 shadow-lg sm:p-3">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-0 flex-1 flex items-center">
              <span className="flex p-2 rounded-lg bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              <p className="ml-3 font-medium text-yellow-900">
                <span className="inline">
                  Questo strumento è fornito a solo scopo informativo. Si consiglia di verificare sempre i risultati e consultare un professionista prima di prendere decisioni di investimento.
                </span>
              </p>
            </div>
            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
              <button
                type="button"
                onClick={closeDisclaimer}
                className="-mr-1 flex p-2 rounded-md hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600"
              >
                <span className="sr-only">Chiudi</span>
                <svg className="h-6 w-6 text-yellow-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer; 