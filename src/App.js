import React, { useState, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react";
import Hero from './components/Hero';
import FAQ from './components/FAQ';
import IconsDetail from './components/IconsDetail';
import WhyDetail from './components/WhyDetail';
import WhenDetail from './components/WhenDetail';
import Calculator from './components/Calculator';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import Disclaimer from './components/Disclaimer';

const App = () => {
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner Disclaimer */}
      <Disclaimer  />

      {/* Menu di navigazione */}
      <Navigation />

      {/* Hero Section */}
      <Hero />

      {/* Contenitore per le sezioni informative */}
      <div className="bg-gradient-to-br from-white via-indigo-50 to-white relative pb-16">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
       {/* Sezione caratteristiche principali */}
       
      <IconsDetail />
      {/* Divisore */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* Sezione Perché Ribilanciare */}
      <WhyDetail />
    
      {/* Divisore */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* Sezione Frequenza di Ribilanciamento */}
      <WhenDetail />
     
    </div>

    {/* Sezione calcolatore */}
    <Calculator />
 

    {/* Sezione FAQ */}
    <FAQ />

    {/* Footer */}
    <Footer />

    

    {/* Stili globali */}
    <style>{`
      @keyframes bounceSoft {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      .animate-bounce-subtle {
        animation: bounceSoft 2s infinite;
      }

      @keyframes gradient {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      .animate-gradient {
        animation: gradient 15s ease infinite;
      }
    `}</style>
  
  </div>
  );
};

export default App; 