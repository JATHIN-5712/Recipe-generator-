
import React from 'react';

interface StartupScreenProps {
  onStart: () => void;
}

export const StartupScreen: React.FC<StartupScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-emerald-400 to-green-600 text-white fixed inset-0 z-50 overflow-hidden animate-gradient">
      <div className="text-center p-4 flex flex-col items-center">
        <div className="animate-fade-in-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}>
            <svg className="mx-auto h-20 w-20 mb-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
            </svg>
        </div>

        <div className="animate-fade-in-up opacity-0 mb-8" style={{ animationFillMode: 'forwards', animationDelay: '0.4s' }}>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.3)' }}>
            AI Recipe Generator
          </h1>
          <p className="text-lg text-emerald-100 tracking-wider mt-3" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.2)' }}>
            Created by JATHIN BHARGAV
          </p>
        </div>
        
        <p className="text-lg md:text-xl mb-10 max-w-md mx-auto animate-fade-in-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.6s' }}>
          Turn your ingredients into delicious meals with the power of AI.
        </p>

        <button
          onClick={onStart}
          className="bg-white text-emerald-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-emerald-50 transform hover:scale-105 transition-all duration-300 shadow-lg opacity-0 animate-button-in"
        >
          Start
        </button>
      </div>
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        @keyframes fade-in-up {
            0% { 
              opacity: 0; 
              transform: translateY(20px); 
            }
            100% { 
              opacity: 1; 
              transform: translateY(0); 
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out;
        }
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .animate-button-in {
          animation: fade-in-up 0.8s ease-out 0.8s forwards,
                     pulse-subtle 2.5s ease-in-out 1.6s infinite;
        }
      `}</style>
    </div>
  );
};
