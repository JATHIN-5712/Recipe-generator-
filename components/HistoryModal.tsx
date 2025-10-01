import React, { useState, useEffect } from 'react';
import type { Recipe } from '../types';
import { RecipeCard } from './RecipeCard';

interface HistoryModalProps {
  history: Recipe[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateNote: (recipeName: string, notes: string) => void;
  onToggleFavorite: (recipeName: string) => void;
}

const Highlight: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  // Escape special characters for regex to prevent errors
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.filter(String).map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-200 rounded-sm px-0.5 font-semibold">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};


export const HistoryModal: React.FC<HistoryModalProps> = ({ history, isOpen, onClose, onUpdateNote, onToggleFavorite }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // When modal is closed, reset the state
  useEffect(() => {
    if (!isOpen) {
      setSelectedRecipe(null);
      setSearchQuery('');
      setShowFavoritesOnly(false);
    }
  }, [isOpen]);
  
  const filteredHistory = history.filter(recipe => {
    if (showFavoritesOnly && !recipe.isFavorite) {
        return false;
    }
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const ingredientsMatch = recipe.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(query)
    );
    return recipe.recipeName.toLowerCase().includes(query) || ingredientsMatch;
  }).sort((a, b) => {
    // Show favorite recipes first
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return 0;
  });

  // If a selected recipe is filtered out, deselect it
  useEffect(() => {
    if (selectedRecipe && !filteredHistory.some(r => r.recipeName === selectedRecipe.recipeName)) {
        setSelectedRecipe(null);
    }
  }, [filteredHistory, selectedRecipe]);

  useEffect(() => {
    // If the currently selected recipe is updated in the history, update the view
    if (selectedRecipe) {
        const updatedRecipe = history.find(r => r.recipeName === selectedRecipe.recipeName);
        if (updatedRecipe) {
            setSelectedRecipe(updatedRecipe);
        }
    }
  }, [history, selectedRecipe]);

  if (!isOpen) return null;

  const handleSaveNote = (notes: string) => {
    if (selectedRecipe) {
        onUpdateNote(selectedRecipe.recipeName, notes);
    }
  }
  
  const getListItemClasses = (recipe: Recipe) => {
    if (selectedRecipe?.recipeName === recipe.recipeName) {
        return 'bg-emerald-100';
    }
    if (recipe.isFavorite) {
        // Subtle highlight for non-selected favorites
        return 'bg-amber-50';
    }
    return 'bg-white';
  };


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in-fast" 
      onClick={onClose}
    >
      <div 
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl m-4 relative max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10" 
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Your Saved Recipes</h2>
        
        <div className="flex-grow overflow-hidden">
            {history.length === 0 ? (
                <div className="text-center py-10">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No saved recipes</h3>
                    <p className="mt-1 text-sm text-gray-500">Generate a recipe and it will be saved here automatically.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-6 h-full">
                    <div className="md:col-span-1 border-r pr-4 flex flex-col">
                        <div className="flex justify-between items-center mb-3 flex-shrink-0">
                            <h3 className="text-lg font-semibold">Your Collection</h3>
                             <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={showFavoritesOnly}
                                    onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>Favorites</span>
                            </label>
                        </div>
                        <div className="relative mb-4 flex-shrink-0">
                             <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or ingredient..."
                                className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
                                aria-label="Search saved recipes"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Clear search"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            )}
                        </div>
                        {filteredHistory.length > 0 ? (
                          <ul className="space-y-2 overflow-y-auto flex-grow">
                            {filteredHistory.map((recipe, index) => (
                                <li key={index}>
                                    <div className={`w-full rounded-md flex items-center justify-between transition-colors ${getListItemClasses(recipe)}`}>
                                        <button 
                                            onClick={() => setSelectedRecipe(recipe)}
                                            className="flex-grow text-left p-2 rounded-l-md truncate font-medium hover:bg-gray-100 transition-colors"
                                            aria-label={`View recipe: ${recipe.recipeName}`}
                                        >
                                            <Highlight text={recipe.recipeName} highlight={searchQuery} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleFavorite(recipe.recipeName);
                                            }}
                                            className="p-2 mr-1 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
                                            aria-label={recipe.isFavorite ? `Unfavorite ${recipe.recipeName}` : `Favorite ${recipe.recipeName}`}
                                        >
                                            {recipe.isFavorite ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </li>
                            ))}
                          </ul>
                        ) : (
                           <div className="flex-grow flex items-center justify-center text-center text-gray-500">
                             <p>{showFavoritesOnly ? "You have no favorite recipes." : "No recipes match your search."}</p>
                          </div>
                        )}
                    </div>
                    <div className="md:col-span-2 overflow-y-auto">
                        {selectedRecipe ? (
                            <RecipeCard 
                                recipe={selectedRecipe} 
                                isNotesEditable={true}
                                onSaveNote={handleSaveNote}
                                onToggleFavorite={onToggleFavorite}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-gray-500">
                                <p>{filteredHistory.length > 0 ? 'Select a recipe from the list to view its details.' : 'Clear your filters to see your recipes.'}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
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