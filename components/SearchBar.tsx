import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  diet: string;
  onDietChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  cuisine: string;
  onCuisineChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, diet, onDietChange, cuisine, onCuisineChange, onSubmit, isLoading }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="diet" className="block text-sm font-medium text-gray-700 mb-1">
            Dietary Preference
          </label>
          <select
            id="diet"
            name="diet"
            value={diet}
            onChange={onDietChange}
            disabled={isLoading}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 bg-white"
            aria-label="Select dietary preference"
          >
            <option value="">None</option>
            <option value="Vegan">Vegan</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Gluten-Free">Gluten-Free</option>
            <option value="Keto">Keto</option>
            <option value="Paleo">Paleo</option>
          </select>
        </div>
        <div>
          <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">
            Cuisine Type
          </label>
          <input
            type="text"
            id="cuisine"
            name="cuisine"
            value={cuisine}
            onChange={onCuisineChange}
            placeholder="e.g., Italian, Mexican, Thai"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
            disabled={isLoading}
            aria-label="Enter cuisine type"
          />
        </div>
      </div>
      <label htmlFor="ingredients" className="block text-lg font-semibold text-gray-700 mb-2">
        What ingredients do you have?
      </label>
      <p className="text-sm text-gray-500 mb-4">
        Enter a few ingredients separated by commas (e.g., chicken, rice, broccoli) and let AI create a recipe for you.
      </p>
      <textarea
        id="ingredients"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder="e.g., ground beef, onions, tomatoes, pasta"
        className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 resize-none"
        disabled={isLoading}
        aria-label="Enter ingredients"
      />
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="mt-4 w-full flex justify-center items-center bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors duration-300"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          'Generate Recipe'
        )}
      </button>
    </div>
  );
};
