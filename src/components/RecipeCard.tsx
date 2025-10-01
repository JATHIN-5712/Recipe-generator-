import React, { useState, useEffect } from 'react';
import type { Recipe } from '../types';
import { translateRecipe, scaleIngredients } from '../services/geminiService';
import { CookingMode } from './CookingMode';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface RecipeCardProps {
  recipe: Recipe;
  isNotesEditable?: boolean;
  onSaveNote?: (notes: string) => void;
  onToggleFavorite?: (recipeName: string) => void;
}

type Tab = 'ingredients' | 'instructions' | 'notes';

const InfoPill: React.FC<{ icon: React.ReactNode; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full text-sm">
        {icon}
        <span className="font-semibold">{label}:</span>
        <span>{value}</span>
    </div>
);

const NutritionInfo: React.FC<{ icon: React.ReactNode; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg flex-1 min-w-[70px]">
        <div className="text-emerald-600 mb-1">{icon}</div>
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span className="font-bold text-gray-800 text-sm">{value}</span>
    </div>
);


export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isNotesEditable = false, onSaveNote, onToggleFavorite }) => {
  const [displayRecipe, setDisplayRecipe] = useState<Recipe>(recipe);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('original');
  const [translationError, setTranslationError] = useState<string | null>(null);

  const [isCopied, setIsCopied] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [notes, setNotes] = useState(recipe.notes || '');
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('ingredients');

  const [scaleFactor, setScaleFactor] = useState(1);
  const [isScaling, setIsScaling] = useState(false);
  const [scalingError, setScalingError] = useState<string | null>(null);
  const [isCookingModeOpen, setIsCookingModeOpen] = useState(false);
  
  const { speak, cancel, isSpeaking, isSupported } = useSpeechSynthesis();


  // If the parent component passes a new recipe, reset all state
  useEffect(() => {
    setDisplayRecipe(recipe);
    setNotes(recipe.notes || '');
    setTargetLanguage('original');
    setTranslationError(null);
    setActiveTab('ingredients');
    setScaleFactor(1);
    setScalingError(null);
    setIsCookingModeOpen(false);
    // Stop any speech from the previous recipe
    cancel();
  }, [recipe, cancel]);


  const handleTranslate = async (language: string) => {
    setTargetLanguage(language);
    setTranslationError(null);

    const originalRecipeWithScaling = {
        ...recipe,
        ingredients: scaleFactor === 1 ? recipe.ingredients : displayRecipe.ingredients,
    };

    if (language === 'original') {
        setDisplayRecipe(originalRecipeWithScaling);
        return;
    }

    setIsTranslating(true);
    try {
        const translatedContent = await translateRecipe(originalRecipeWithScaling, language);
        setDisplayRecipe({
            ...originalRecipeWithScaling,
            ...translatedContent,
        });
    } catch (e) {
        console.error("Translation failed", e);
        setTranslationError("Sorry, we couldn't translate this recipe. Please try again.");
    } finally {
        setIsTranslating(false);
    }
  };

  const handleScaleChange = async (newFactor: number) => {
    setScaleFactor(newFactor);
    setScalingError(null);

    // Create a mutable recipe object for this operation
    let recipeToUpdate = { ...displayRecipe };

    if (newFactor === 1) {
      recipeToUpdate.ingredients = recipe.ingredients;
    } else {
        setIsScaling(true);
        try {
          const scaledIngredientsList = await scaleIngredients(recipe.ingredients, newFactor);
          recipeToUpdate.ingredients = scaledIngredientsList;
        } catch (e) {
          console.error("Scaling failed", e);
          setScalingError("Sorry, could not scale ingredients. Please try again.");
          setIsScaling(false);
          return; // Exit if scaling fails
        } finally {
          setIsScaling(false);
        }
    }
    
    // If a translation is active, re-translate the scaled recipe
    if (targetLanguage !== 'original') {
        setIsTranslating(true);
        try {
            const recipeWithNewIngredients = {...recipe, ingredients: recipeToUpdate.ingredients};
            const translatedContent = await translateRecipe(recipeWithNewIngredients, targetLanguage);
            recipeToUpdate = {...recipeToUpdate, ...translatedContent};
        } catch (e) {
            console.error("Re-translation after scaling failed", e);
            setTranslationError("Could not update translation for new serving size.");
        } finally {
            setIsTranslating(false);
        }
    }
    
    setDisplayRecipe(recipeToUpdate);
  };


  const handleSaveNote = () => {
    if (onSaveNote) {
        onSaveNote(notes);
        setIsNoteSaved(true);
        setTimeout(() => setIsNoteSaved(false), 2500);
    }
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
        onToggleFavorite(recipe.recipeName);
    }
  };

  const getShareableData = () => {
    const recipeToShare = {
      recipeName: recipe.recipeName,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
    };

    const recipeJson = JSON.stringify(recipeToShare);
    const encodedRecipe = btoa(recipeJson);
    
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const shareUrl = `${baseUrl}?recipe=${encodedRecipe}`;

    return { shareUrl };
  };

  const handleNativeShare = async () => {
    const { shareUrl } = getShareableData();
    const shareData = {
        title: recipe.recipeName,
        text: `Check out this recipe for ${recipe.recipeName}!`,
        url: shareUrl,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                console.log('Share action was canceled by the user.');
            } else {
                console.error('Error sharing recipe:', error);
            }
        }
    }
    setIsShareMenuOpen(false);
  };

  const handleShareByEmail = () => {
    const { shareUrl } = getShareableData();
    const subject = encodeURIComponent(`Recipe: ${recipe.recipeName}`);
    const body = encodeURIComponent(
      `Hi!\n\nI found this great recipe for "${recipe.recipeName}" and thought you might like it.\n\n${recipe.description}\n\nYou can view the full recipe here:\n${shareUrl}\n\nEnjoy!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setIsShareMenuOpen(false);
  };

  const handleCopyLink = async () => {
    const { shareUrl } = getShareableData();
    const clipboardText = `Check out this recipe I found: ${shareUrl}`;
    try {
        await navigator.clipboard.writeText(clipboardText);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
            setIsShareMenuOpen(false);
        }, 2000); // Close modal after showing "Copied!" for a bit
    } catch (error) {
        console.error('Failed to copy link to clipboard:', error);
        alert('Failed to copy link. Please try again.');
        setIsShareMenuOpen(false);
    }
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      cancel();
    } else {
      const textToRead = `
        Recipe: ${displayRecipe.recipeName}.
        ${displayRecipe.description}.
        Preparation time is ${displayRecipe.prepTime}.
        Cooking time is ${displayRecipe.cookTime}.
        The ingredients are: ${displayRecipe.ingredients.join(', ')}.
        The instructions are as follows: ${displayRecipe.instructions.map((step, i) => `Step ${i + 1}. ${step}`).join(' ')}
      `;
      speak(textToRead);
    }
  };

  const TabButton: React.FC<{tab: Tab, label: string}> = ({ tab, label }) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === tab
            ? 'border-emerald-500 text-emerald-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
        aria-current={activeTab === tab ? 'page' : undefined}
    >
        {label}
    </button>
  );


  return (
    <>
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
      {recipe.imageUrl ? (
        <img src={recipe.imageUrl} alt={`A generated image of ${recipe.recipeName}`} className="w-full h-64 object-cover" />
      ) : recipe.imageGenError && (
         <div className="w-full h-64 bg-gray-200 flex flex-col items-center justify-center text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 010-2.828L14 8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Image could not be generated.</p>
        </div>
      )}
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-start mb-4">
            <div className="flex-grow">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{displayRecipe.recipeName}</h2>
                <p className="text-gray-600 pr-4">{displayRecipe.description}</p>
            </div>
            <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                {onToggleFavorite && (
                    <button
                        onClick={handleToggleFavorite}
                        className={`p-2 rounded-full transition-colors duration-300 ${recipe.isFavorite ? 'text-amber-500 bg-amber-100 hover:bg-amber-200' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'}`}
                        aria-label={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                )}
                 {isSupported && (
                  <button
                    onClick={handleReadAloud}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                    aria-label={isSpeaking ? 'Stop reading recipe' : 'Read recipe aloud'}
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
                    <span>{isSpeaking ? 'Stop' : 'Read'}</span>
                  </button>
                )}
                <button 
                    onClick={() => setIsShareMenuOpen(true)}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                    aria-label="Share this recipe"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 110-2.684 3 3 0 010 2.684z" />
                    </svg>
                    <span>Share</span>
                </button>
                 <button
                    onClick={() => setIsCookingModeOpen(true)}
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                    aria-label="Start Cooking Mode"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM4 11a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM15 11a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zM5.636 5.636a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM12.95 12.95a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM5.636 14.364a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM12.95 7.05a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0z" />
                    </svg>
                    <span>Cook</span>
                </button>
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
           <InfoPill 
             icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
             label="Prep"
             value={displayRecipe.prepTime}
           />
           <InfoPill 
             icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" /></svg>}
             label="Cook"
             value={displayRecipe.cookTime}
           />
            <div className="relative ml-auto">
                <select 
                    value={targetLanguage}
                    onChange={(e) => handleTranslate(e.target.value)}
                    disabled={isTranslating}
                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 appearance-none disabled:opacity-70 disabled:cursor-wait"
                    aria-label="Select language to translate recipe"
                >
                    <option value="original">Original (English)</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Telugu">Telugu</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
        </div>
        
        {isTranslating && (
             <div className="text-center py-2 text-sm text-gray-600">
                 <p>Translating...</p>
             </div>
        )}
        {translationError && (
             <div className="text-center py-2 text-sm text-red-600">
                 <p>{translationError}</p>
             </div>
        )}

        {displayRecipe.calories && (
          <div className="my-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Estimated Nutrition (per serving)</h3>
              <div className="flex justify-around items-stretch gap-2 md:gap-4">
                  <NutritionInfo 
                      icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" /></svg>}
                      label="Calories"
                      value={displayRecipe.calories}
                  />
                  <NutritionInfo 
                      icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                      label="Protein"
                      value={displayRecipe.protein || '-'}
                  />
                  <NutritionInfo 
                      icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4m16 0-2-8H6l-2 8m16 0v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2m16 0h.01" /></svg>}
                      label="Carbs"
                      value={displayRecipe.carbs || '-'}
                  />
                  <NutritionInfo 
                      icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21.5c-4.2 0-8-3.3-8-8.5C4 7 12 2 12 2s8 5 8 8.5c0 5.2-3.8 8.5-8 8.5z" /></svg>}
                      label="Fat"
                      value={displayRecipe.fat || '-'}
                  />
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">*Nutritional information is an AI-generated estimate and may not be accurate.</p>
          </div>
        )}

        <div className="border-b border-gray-200 mb-6">
            <div className="flex justify-between items-end -mb-px">
                <nav className="flex space-x-6" aria-label="Tabs">
                    <TabButton tab="ingredients" label="Ingredients" />
                    <TabButton tab="instructions" label="Instructions" />
                    {isNotesEditable && (
                        <TabButton tab="notes" label="Personal Notes" />
                    )}
                </nav>
                 {activeTab === 'ingredients' && (
                    <div className="pb-2">
                        <span className="text-sm font-medium text-gray-600 mr-2">Servings:</span>
                        <div className="inline-flex rounded-md shadow-sm" role="group">
                            {[1, 2, 4].map(factor => (
                                <button
                                    key={factor}
                                    type="button"
                                    onClick={() => handleScaleChange(factor)}
                                    disabled={isScaling}
                                    className={`px-3 py-1 text-sm font-medium border transition-colors
                                        ${scaleFactor === factor 
                                            ? 'bg-emerald-600 text-white border-emerald-600 z-10' 
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }
                                        ${factor === 1 ? 'rounded-l-lg' : ''}
                                        ${factor === 4 ? 'rounded-r-lg' : ''}
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                >
                                    {factor}x
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
        
        <div>
            {activeTab === 'ingredients' && (
                <div>
                    {isScaling && <p className="text-sm text-center text-gray-600 py-2">Adjusting quantities...</p>}
                    {scalingError && <p className="text-sm text-center text-red-600 py-2">{scalingError}</p>}
                    <h3 className="sr-only">Ingredients</h3>
                    <ul className="space-y-2 list-disc list-inside text-gray-700">
                        {displayRecipe.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                        ))}
                    </ul>
                </div>
            )}
            {activeTab === 'instructions' && (
                <div>
                    <h3 className="sr-only">Instructions</h3>
                    <ol className="space-y-4 text-gray-700">
                        {displayRecipe.instructions.map((step, index) => (
                        <li key={index} className="flex">
                            <span className="bg-emerald-600 text-white rounded-full h-6 w-6 text-sm font-bold flex items-center justify-center mr-3 flex-shrink-0">{index + 1}</span>
                            <span>{step}</span>
                        </li>
                        ))}
                    </ol>
                </div>
            )}
            {isNotesEditable && activeTab === 'notes' && (
                <div>
                    <h3 className="sr-only">Personal Notes</h3>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add your own notes, tips, or modifications here..."
                        className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 resize-y"
                    />
                    <button
                        onClick={handleSaveNote}
                        disabled={isNoteSaved}
                        className="mt-3 bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 transition-colors duration-300"
                    >
                        {isNoteSaved ? 'Saved!' : 'Save Note'}
                    </button>
                </div>
            )}
        </div>
      </div>
       <style>
        {`
        @keyframes fade-in {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
        @keyframes fade-in-fast {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        .animate-fade-in-fast {
            animation: fade-in-fast 0.2s ease-out forwards;
        }
        @keyframes modal-pop-in {
            0% { opacity: 0; transform: scale(0.95) translateY(10px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-pop-in {
            animation: modal-pop-in 0.2s ease-out forwards;
        }
        `}
      </style>
    </div>
    {isShareMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in-fast" onClick={() => setIsShareMenuOpen(false)}>
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-xs m-4 animate-modal-pop-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Share Recipe</h3>
              <button onClick={() => setIsShareMenuOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="space-y-3">
              {navigator.share && (
                  <button onClick={handleNativeShare} className="w-full flex items-center space-x-3 text-left p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 110-2.684 3 3 0 010 2.684z" /></svg>
                      <span className="font-semibold text-gray-700">Share via...</span>
                  </button>
              )}
              <button onClick={handleShareByEmail} className="w-full flex items-center space-x-3 text-left p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span className="font-semibold text-gray-700">Share by Email</span>
              </button>
              <button onClick={handleCopyLink} className="w-full flex items-center space-x-3 text-left p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-75" disabled={isCopied}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <span className="font-semibold text-gray-700">{isCopied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    <CookingMode
        isOpen={isCookingModeOpen}
        onClose={() => setIsCookingModeOpen(false)}
        recipe={displayRecipe}
      />
    </>
  );
};