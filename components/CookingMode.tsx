import React, { useState, useEffect } from 'react';
import type { Recipe } from '../types';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface CookingModeProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
}

export const CookingMode: React.FC<CookingModeProps> = ({ isOpen, onClose, recipe }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { speak, cancel, isSpeaking, isSupported } = useSpeechSynthesis();

  // Reset step and cancel speech when the modal is opened or recipe changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    } else {
      cancel(); // Ensure speech stops when modal is closed
    }
  }, [isOpen, recipe, cancel]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);


  if (!isOpen) return null;

  const totalSteps = recipe.instructions.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const handleReadStep = () => {
    if (isSpeaking) {
        cancel();
    } else {
        const textToRead = `Step ${currentStep + 1}: ${recipe.instructions[currentStep]}`;
        speak(textToRead);
    }
  };

  const handleReadIngredients = () => {
     if (isSpeaking) {
        cancel();
    } else {
        const textToRead = `Ingredients: ${recipe.ingredients.join(', ')}.`;
        speak(textToRead);
    }
  }

  const goToNextStep = () => {
    cancel(); // Stop reading before changing step
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPrevStep = () => {
    cancel(); // Stop reading before changing step
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const ReadAloudButton: React.FC<{ onRead: () => void; ariaLabel: string, text: string }> = ({ onRead, ariaLabel, text }) => (
     <button 
        onClick={onRead}
        className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
        aria-label={isSpeaking ? `Stop reading ${ariaLabel}`: `Read ${ariaLabel} aloud`}
    >
        {isSpeaking ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3.5a.75.75 0 01.75.75v11.5a.75.75 0 01-1.5 0V4.25A.75.75 0 0110 3.5zM5.5 7a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM14.5 7a.75.75 0 000 1.5h-.5a.75.75 0 000-1.5h.5z" />
                <path fillRule="evenodd" d="M8.22 3.714a.75.75 0 011.06 0l2.5 2.5a.75.75 0 01-1.06 1.06L10 6.53 9.28 7.28a.75.75 0 01-1.06-1.06l-2.5-2.5a.75.75 0 010-1.06zM15.28 9.72a.75.75 0 01-1.06 0L13.5 8.97l-.72.72a.75.75 0 01-1.06-1.06l2.5-2.5a.75.75 0 011.06 0l2.5 2.5a.75.75 0 010 1.06z" clipRule="evenodd" />
            </svg>
        )}
        <span>{isSpeaking ? 'Stop' : text}</span>
    </button>
  );


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center animate-fade-in-fast"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-50 rounded-xl shadow-2xl w-full h-full p-4 md:p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 truncate pr-4">
            {recipe.recipeName}
          </h2>
          <button 
            onClick={onClose} 
            className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors" 
            aria-label="Exit Cooking Mode"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Exit</span>
          </button>
        </div>
        
        <div className="flex-grow grid md:grid-cols-3 gap-6 overflow-hidden">
          {/* Ingredients Panel */}
          <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-sm overflow-y-auto flex flex-col">
             <div className="flex justify-between items-center mb-4 sticky top-0 bg-white py-2 flex-shrink-0">
                <h3 className="text-2xl font-bold text-gray-900">Ingredients</h3>
                {isSupported && <ReadAloudButton onRead={handleReadIngredients} ariaLabel="ingredients" text="Read" />}
             </div>
            <ul className="space-y-3 list-disc list-inside text-gray-700 text-lg">
                {recipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                ))}
            </ul>
          </div>

          {/* Instructions Panel */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm flex flex-col">
             <div className="flex-shrink-0 mb-4 flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Instructions</h3>
                    <p className="text-gray-500 font-semibold mt-1">
                        Step {currentStep + 1} of {totalSteps}
                    </p>
                </div>
                 {isSupported && <ReadAloudButton onRead={handleReadStep} ariaLabel="current step" text="Read Step" />}
             </div>
             <div className="flex-grow flex items-center justify-center text-center">
                <p className="text-2xl md:text-4xl leading-relaxed text-gray-800 font-serif">
                    {recipe.instructions[currentStep]}
                </p>
             </div>
             <div className="mt-6 flex-shrink-0">
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div 
                        className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                        style={{ width: `${totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0}%` }}
                        role="progressbar"
                        aria-valuenow={currentStep + 1}
                        aria-valuemin={1}
                        aria-valuemax={totalSteps}
                        aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
                    ></div>
                </div>
                {/* Navigation Buttons */}
                <div className="flex justify-between items-center">
                    <button 
                        onClick={goToPrevStep}
                        disabled={isFirstStep}
                        className="flex items-center space-x-2 bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Previous</span>
                    </button>
                    <button
                        onClick={goToNextStep}
                        disabled={isLastStep}
                        className="flex items-center space-x-2 bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <span>Next</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
             </div>
          </div>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-fast {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        .animate-fade-in-fast {
            animation: fade-in-fast 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};