import React, { useState, useEffect } from 'react';
import Calculator from './components/calculator/Calculator';
import Navigation from './components/navbar/Navigation';
import Disclaimer from './components/Disclaimer';
import { Analytics } from '@vercel/analytics/react';

const Nav = () => {
  return (
  <>
  <Analytics />
    {/* Menu di navigazione */}
    <Navigation />
  </>
  )
}
const App = () => {
  
  return (
    <div>
      {/* Banner Disclaimer */}
      <Disclaimer  />

    {/* Sezione calcolatore */}
    <Calculator />
    

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

export  {App,Nav}; 