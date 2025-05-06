import React, { useState, useEffect } from 'react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Aggiungiamo un piccolo delay per assicurarci che il componente sia montato
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (e) => {
    e.preventDefault();
    const target = document.getElementById('calcolatore');
    if (target) {
      const offset = 80; // Per tenere conto della navbar fixed
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-indigo-400 to-teal-400 animate-gradient bg-[length:400%_400%]">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]"></div>
      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={`text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight opacity-0 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'translate-y-4'}`}>
            Ottimizza il Tuo Portafoglio<br />
            <span className="text-teal-50">in Pochi Click</span>
          </h1>
          <p className={`text-xl md:text-2xl text-white/90 mb-8 opacity-0 transition-all duration-1000 ease-out delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'translate-y-4'}`}>
            Calcola facilmente come ribilanciare i tuoi investimenti e mantieni<br />
            la tua strategia di asset allocation sempre allineata agli obiettivi
          </p>
          <a 
            href="#calcolatore" 
            onClick={handleScroll}
            className={`inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold text-lg hover:bg-indigo-50 transition-all duration-200 transform hover:scale-105 opacity-0 ${isVisible ? 'opacity-100 animate-bounce-subtle' : ''}`}
          >
            Inizia Ora
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero; 