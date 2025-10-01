import { useState, useEffect } from 'react';
import type { Recipe, CurrentUser } from '../types';

const HISTORY_STORAGE_KEY = 'recipeAppHistory';
const GUEST_USER_KEY = '_guest';

interface RecipeHistoryStore {
  [username: string]: Recipe[];
}

const getHistoryStore = (): RecipeHistoryStore => {
  try {
    const store = localStorage.getItem(HISTORY_STORAGE_KEY);
    return store ? JSON.parse(store) : {};
  } catch (error) {
    console.error("Failed to parse history from local storage", error);
    return {};
  }
};

const saveHistoryStore = (store: RecipeHistoryStore) => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error("Failed to save history to local storage", error);
  }
};

export const useHistory = (user: CurrentUser | null) => {
  const [history, setHistory] = useState<Recipe[]>([]);

  useEffect(() => {
    const store = getHistoryStore();
    if (user?.username) {
      // User is logged in, handle potential merge of guest history
      const userKey = user.username;
      const guestHistory = store[GUEST_USER_KEY] || [];
      const userHistory = store[userKey] || [];
      
      let finalUserHistory = userHistory;
      let storeNeedsUpdate = false;

      // If there's guest history, merge it into the user's history
      if (guestHistory.length > 0) {
        const userRecipeNames = new Set(userHistory.map(r => r.recipeName));
        const recipesToMerge = guestHistory.filter(r => !userRecipeNames.has(r.recipeName));
        
        if (recipesToMerge.length > 0) {
          finalUserHistory = [...userHistory, ...recipesToMerge];
          store[userKey] = finalUserHistory;
          // Clear guest history after successful merge
          delete store[GUEST_USER_KEY]; 
          storeNeedsUpdate = true;
        }
      }
      
      if (storeNeedsUpdate) {
        saveHistoryStore(store);
      }
      
      setHistory(finalUserHistory);
    } else {
      // User is logged out (is a guest)
      setHistory(store[GUEST_USER_KEY] || []);
    }
  }, [user]);

  const getCurrentUserKey = () => user?.username || GUEST_USER_KEY;

  const addRecipe = (recipe: Recipe) => {
    const userKey = getCurrentUserKey();
    const store = getHistoryStore();
    const currentHistory = store[userKey] || [];

    // Prevent duplicates based on recipe name
    if (currentHistory.some(r => r.recipeName === recipe.recipeName)) {
      console.warn("Recipe is already saved in history.");
      return;
    }

    const recipeWithDefaults = { 
        ...recipe,
        isFavorite: recipe.isFavorite ?? false,
        notes: recipe.notes ?? '' 
    };
    const newHistory = [...currentHistory, recipeWithDefaults];
    
    setHistory(newHistory);

    store[userKey] = newHistory;
    saveHistoryStore(store);
  };

  const updateRecipeNotes = (recipeName: string, notes: string) => {
    const userKey = getCurrentUserKey();
    const store = getHistoryStore();
    const currentHistory = store[userKey] || [];

    const newHistory = currentHistory.map(recipe => 
      recipe.recipeName === recipeName ? { ...recipe, notes } : recipe
    );

    setHistory(newHistory);

    store[userKey] = newHistory;
    saveHistoryStore(store);
  };

  const toggleRecipeFavorite = (recipeName: string) => {
    const userKey = getCurrentUserKey();
    const store = getHistoryStore();
    const currentHistory = store[userKey] || [];
    
    const newHistory = currentHistory.map(recipe =>
        recipe.recipeName === recipeName
        ? { ...recipe, isFavorite: !recipe.isFavorite }
        : recipe
    );

    setHistory(newHistory);

    store[userKey] = newHistory;
    saveHistoryStore(store);
  };

  return { history, addRecipe, updateRecipeNotes, toggleRecipeFavorite };
};