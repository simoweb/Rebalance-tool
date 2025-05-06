import React from 'react';

const WhyRebalance = () => {
  return (
    <section id="perche" className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col-reverse md:flex-row items-center gap-12">
            {/* Colonna testo */}
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">
                Perché Ribilanciare il Portafoglio?
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Il ribilanciamento periodico del portafoglio è fondamentale per mantenere il livello di rischio desiderato nel tempo. 
                Quando alcuni asset performano meglio di altri, il loro peso nel portafoglio aumenta, alterando l'allocazione originale 
                e potenzialmente esponendoti a rischi maggiori o minori di quelli previsti.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mt-4">
                Ribilanciare significa vendere gli asset che hanno superato il target e comprare quelli sottopesati, 
                applicando in automatico il principio "compra basso, vendi alto".
              </p>
              <div className="mt-8 flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Controllo del rischio</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Disciplina negli investimenti</span>
                </div>
              </div>
            </div>
            
            {/* Colonna icona */}
            <div className="md:w-1/2 mb-8 md:mb-0">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-32 md:w-56 h-32 md:h-56 rounded-full bg-indigo-100/50"></div>
                <div className="absolute w-24 md:w-44 h-24 md:h-44 rounded-full bg-indigo-100/80"></div>
                <div className="relative w-20 md:w-36 h-20 md:h-36 rounded-full bg-indigo-50 flex items-center justify-center shadow-lg">
                  <svg className="w-10 md:w-16 h-10 md:h-16 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyRebalance; 