import React from 'react';

const Features = () => {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 mt-8">
            Ribilanciamento Portafoglio
          </h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Strumento gratuito per il ribilanciamento del portafoglio di investimenti. <br />
            Calcola facilmente come riportare i tuoi asset alle percentuali target desiderate, 
            sia attraverso la vendita degli asset in eccesso che tramite l'aggiunta di nuova liquidità.
          </p>
        </div>
        <div className="max-w-6xl mx-auto mb-5">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Gestione Asset */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-32 h-32 rounded-full bg-blue-100/50"></div>
                  <div className="absolute w-24 h-24 rounded-full bg-blue-100/80"></div>
                  <div className="relative w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center shadow-lg">
                    <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 pt-6">Gestione Asset</h3>
              <p className="text-gray-600">
                Inserisci e gestisci facilmente i tuoi asset finanziari con nome, quantità e prezzo corrente.
              </p>
            </div>

            {/* Allocazione Target */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-32 h-32 rounded-full bg-purple-100/50"></div>
                  <div className="absolute w-24 h-24 rounded-full bg-purple-100/80"></div>
                  <div className="relative w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center shadow-lg">
                    <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 pt-6">Allocazione Target</h3>
              <p className="text-gray-600">
                Definisci le percentuali target per ogni asset nel tuo portafoglio ideale.
              </p>
            </div>

            {/* Calcolo Automatico */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-32 h-32 rounded-full bg-rose-100/50"></div>
                  <div className="absolute w-24 h-24 rounded-full bg-rose-100/80"></div>
                  <div className="relative w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center shadow-lg">
                    <svg className="w-10 h-10 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 pt-6">Calcolo Automatico</h3>
              <p className="text-gray-600">
                Ottieni istantaneamente i calcoli per ribilanciare il tuo portafoglio in modo ottimale.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features; 