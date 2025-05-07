import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-sm text-gray-500">
            <p className="mb-4">
              Strumento sviluppato per aiutare gli investitori a mantenere 
              l'allocazione desiderata del proprio portafoglio nel tempo.
            </p>
            <p className='font-bold text-black-900'>Questo strumento è fornito a solo scopo informativo.<br></br> Si consiglia di verificare sempre i risultati e consultare un professionista prima di prendere decisioni di investimento.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 