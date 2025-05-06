import React from 'react';

const Animations = () => {
  return (
    <style>{`
      @keyframes fadeIn {
        from { 
          opacity: 0; 
          transform: translateY(10px);
        }
        to { 
          opacity: 1; 
          transform: translateY(0);
        }
      }
      
      @keyframes bounceSoft {
        0% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0); }
      }

      .animate-fade-in {
        animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      .animate-fade-in-delay {
        animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
        opacity: 0;
      }

      .animate-bounce-subtle {
        animation: bounceSoft 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }

      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .animate-gradient {
        animation: gradient 15s ease infinite;
      }
    `}</style>
  );
};

export default Animations; 