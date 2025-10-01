
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchBar } from './components/SearchBar';
import { RecipeCard } from './components/RecipeCard';
import { Loader } from './components/Loader';
import { generateRecipe, generateRecipeImage } from './services/geminiService';
import type { Recipe } from './types';
import { Welcome } from './components/Welcome';
import { useAuth } from './hooks/useAuth';
import { AuthModal } from './components/AuthModal';
import { useHistory } from './hooks/useHistory';
import { HistoryModal } from './components/HistoryModal';
import { StartupScreen } from './components/StartupScreen';


function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [ingredients, setIngredients] = useState<string>('');
  const [diet, setDiet] = useState<string>('');
  const [cuisine, setCuisine] = useState<string>('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { currentUser, login, register, logout } = useAuth();
  const { history, addRecipe, updateRecipeNotes, toggleRecipeFavorite } = useHistory(currentUser);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    // Check for a shared recipe in the URL on initial load
    const urlParams = new URLSearchParams(window.location.search);
    const recipeData = urlParams.get('recipe');
    if (recipeData) {
      try {
        const decodedRecipeJson = atob(recipeData);
        const sharedRecipe: Recipe = JSON.parse(decodedRecipeJson);
        setRecipe(sharedRecipe);
        setIsStarted(true); // Skip startup screen if viewing a shared recipe
        // Clean the URL to avoid confusion
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Failed to parse shared recipe from URL", e);
        setError("The shared recipe link is invalid or corrupted.");
        setIsStarted(true); // Show main app with error
      }
    }
  }, []);

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleGenerateRecipe = async () => {
    if (!ingredients.trim()) {
      setError('Please enter some ingredients.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipe(null);

    try {
      const recipeJsonString = await generateRecipe(ingredients, diet, cuisine);
      // Clean the response from markdown and parse
      const cleanedJson = recipeJsonString.replace(/```json|```/g, '').trim();
      const newRecipe: Recipe = JSON.parse(cleanedJson);
      
      // Now, generate an image for the recipe
      const imagePrompt = `A delicious, vibrant, professional food photograph of: ${newRecipe.recipeName}. ${newRecipe.description}`;
      const imageBase64 = await generateRecipeImage(imagePrompt);

      if (imageBase64) {
        newRecipe.imageUrl = `data:image/jpeg;base64,${imageBase64}`;
      } else {
        newRecipe.imageGenError = true;
      }

      setRecipe(newRecipe);

      // Auto-save the recipe to history for guest or logged-in user
      addRecipe(newRecipe);

    } catch (err) {
      console.error('Failed to generate recipe:', err);
      setError('Sorry, I couldn\'t generate a recipe. Please try again with different ingredients.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isStarted) {
    return <StartupScreen onStart={() => setIsStarted(true)} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <Header
        currentUser={currentUser}
        onLogout={logout}
        onLoginClick={() => openAuthModal('login')}
        onRegisterClick={() => openAuthModal('register')}
        onHistoryClick={() => setHistoryModalOpen(true)}
      />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <SearchBar
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            diet={diet}
            onDietChange={(e) => setDiet(e.target.value)}
            cuisine={cuisine}
            onCuisineChange={(e) => setCuisine(e.target.value)}
            onSubmit={handleGenerateRecipe}
            isLoading={isLoading}
          />

          <div className="mt-8 min-h-[400px]">
            {isLoading && <Loader />}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
                <p>{error}</p>
              </div>
            )}
            {!isLoading && !error && recipe && (
                <RecipeCard 
                    recipe={recipe}
                />
            )}
            {!isLoading && !error && !recipe && <Welcome />}
          </div>
        </div>
      </main>
      <Footer />
      {isAuthModalOpen && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthModalOpen(false)}
          onLogin={login}
          onRegister={register}
        />
      )}
       {isHistoryModalOpen && (
        <HistoryModal
          history={history}
          isOpen={isHistoryModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          onUpdateNote={updateRecipeNotes}
          onToggleFavorite={toggleRecipeFavorite}
        />
      )}
    </div>
  );
}

export default App;