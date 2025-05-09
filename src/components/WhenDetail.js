import React from 'react';

const WhenDetail = () => {
  return (
    <section id="quando" className="py-20">
    <div className="container mx-auto px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Colonna icona */}
          <div className="md:w-1/2">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-32 md:w-56 h-32 md:h-56 rounded-full bg-teal-100/50"></div>
              <div className="absolute w-24 md:w-44 h-24 md:h-44 rounded-full bg-teal-100/80"></div>
              <div className="relative w-20 md:w-36 h-20 md:h-36 rounded-full bg-teal-50 flex items-center justify-center shadow-lg">
                <svg className="w-10 md:w-16 h-10 md:h-16 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008H16.5V15z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Colonna testo */}
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Ogni Quanto Ribilanciare?
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed dark:text-gray-400">
              La frequenza ideale di ribilanciamento dipende da diversi fattori, tra cui la volatilità degli asset 
              e i costi di transazione. In generale, si consiglia di:
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-teal-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Ribilanciamento Periodico</h3>
                  <p className="text-gray-600 mt-1 dark:text-gray-400">Controllare il portafoglio ogni 6-12 mesi e ribilanciare se necessario</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-teal-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Ribilanciamento a Soglia</h3>
                  <p className="text-gray-600 mt-1 dark:text-gray-400">Intervenire quando un asset si discosta del 5-10% dal target</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-teal-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Ribilanciamento Opportunistico</h3>
                  <p className="text-gray-600 mt-1 dark:text-gray-400">Approfittare di nuovi investimenti o prelievi per ribilanciare</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};

export default WhenDetail; 