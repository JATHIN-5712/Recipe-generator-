export interface Recipe {
  recipeName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  notes?: string; // User's personal notes on the recipe
  imageUrl?: string; // URL for the AI-generated recipe image
  isFavorite?: boolean; // To mark a recipe as a favorite
  imageGenError?: boolean; // To track if image generation failed
}

// For displaying user info - does not contain sensitive data
export interface CurrentUser {
    username: string;
    name: string;
    profilePhoto?: string; // Stored as a base64 string
}

// For handling auth forms and storing user data
export interface UserCredentials extends CurrentUser {
    password: string;
    email: string;
}