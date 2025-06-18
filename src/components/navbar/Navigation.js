import React, { useState,useEffect } from 'react';
import Link from './Link';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])
  const handleScroll = (e) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    const targetId = href.replace('#', '');
    const target = document.getElementById(targetId);
    
    if (target) {
      const offset = 80; // Per tenere conto della navbar fixed
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Chiudi il menu mobile se aperto
      setIsMenuOpen(false);
    }
  };
  return ( 
    <nav className="bg-white shadow-sm w-full fixed top-0 z-50 transition-transform duration-300 dark:bg-gray-800">
      <div className="container w-full lg:max-w-screen-lg mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-base md:text-xl font-bold tracking-widest">
              <span className="text-indigo-600">Rebalance</span>
              <span className="text-teal-500">Tool</span>
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                 strokeWidth="1.5" stroke="currentColor"
                 className="w-4 h-4 md:w-6 md:h-6 text-indigo-600 ml-0">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          </div>

          {/* Menu Desktop */}
          <div className="hidden lg:flex space-x-8 items-center">
            <Link handleScroll={handleScroll} anchor="#perche">Perché Ribilanciare</Link>
            <Link handleScroll={handleScroll} anchor="#quando"> Quando Ribilanciare</Link>
            <Link handleScroll={handleScroll} anchor="#faq"> FAQ</Link>
            <Link handleScroll={handleScroll} anchor="#calcolatore" isButton="true"> Calcolatore</Link>
          </div>
          {/* Hamburger Menu Button */}
          <button 
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg 
              className="w-6 h-6 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          <button className="hidden lg:flex ml-4" onClick={() => setDarkMode(prev => !prev)}>
      {darkMode ? 
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 dark:stroke-indigo-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </svg>
      : 
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
      </svg>
      }
    </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-full opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="px-4 py-1 mb-2">
          <button className="" onClick={() => setDarkMode(prev => !prev)}>
              {darkMode ? 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 dark:stroke-indigo-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
                : 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              }
          </button>
        </div>
        <div className="py-2 space-y-1 pb-4">
          <Link handleScroll={handleScroll} anchor="#perche">Perché Ribilanciare</Link>
            <Link handleScroll={handleScroll} anchor="#quando" addClass="block"> Quando Ribilanciare</Link>
            <Link handleScroll={handleScroll} anchor="#calcolatore" addClass="block"> Calcolatore</Link>
            <Link handleScroll={handleScroll} anchor="#faq" addClass="block"> FAQ</Link>
          
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 