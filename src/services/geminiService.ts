import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    recipeName: {
      type: Type.STRING,
      description: "A creative and appealing name for the dish."
    },
    description: {
      type: Type.STRING,
      description: "A short, enticing summary of the recipe."
    },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "A list of all ingredients, including quantity and preparation (e.g., '1 cup of flour, sifted')."
    },
    instructions: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "A list of numbered, step-by-step instructions for preparing the dish."
    },
    prepTime: {
        type: Type.STRING,
        description: "Estimated preparation time, e.g., '15 minutes'."
    },
    cookTime: {
        type: Type.STRING,
        description: "Estimated cooking time, e.g., '30 minutes'."
    },
    calories: {
      type: Type.STRING,
      description: "Estimated total calories for one serving, e.g., '450 kcal'."
    },
    protein: {
      type: Type.STRING,
      description: "Estimated total protein in grams for one serving, e.g., '30g'."
    },
    carbs: {
      type: Type.STRING,
      description: "Estimated total carbohydrates in grams for one serving, e.g., '40g'."
    },
    fat: {
      type: Type.STRING,
      description: "Estimated total fat in grams for one serving, e.g., '20g'."
    },
  },
  required: ["recipeName", "description", "ingredients", "instructions", "prepTime", "cookTime"]
};


export const generateRecipe = async (ingredients: string, diet: string, cuisine: string): Promise<string> => {
  let prompt = `Generate a single, complete recipe that creatively uses the following ingredients: ${ingredients}.`;

  if (cuisine.trim()) {
    prompt += ` The recipe should be a ${cuisine.trim()} style dish.`;
  }
  
  if (diet.trim()) {
    prompt += ` The recipe must be ${diet.trim()}.`;
  }

  prompt += ` Also include common pantry staples if needed. Provide a creative recipe name, a short, enticing description, a list of all ingredients with quantities, step-by-step instructions, preparation time, and cooking time. Finally, provide an estimated nutritional breakdown for a single serving, including calories, protein, carbs, and fat.`;


  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for text:", error);
    throw new Error("Failed to generate recipe from Gemini API.");
  }
};

export const generateRecipeImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }
    return null;
  } catch (error) {
     console.error("Error calling Gemini API for image:", error);
     // Return null instead of throwing, so the recipe text can still be shown
     return null;
  }
};

export const translateRecipe = async (recipeToTranslate: Recipe, language: string): Promise<Recipe> => {
    // We only need to translate the text fields
    const textContent = {
        recipeName: recipeToTranslate.recipeName,
        description: recipeToTranslate.description,
        ingredients: recipeToTranslate.ingredients,
        instructions: recipeToTranslate.instructions,
        prepTime: recipeToTranslate.prepTime,
        cookTime: recipeToTranslate.cookTime,
        calories: recipeToTranslate.calories,
        protein: recipeToTranslate.protein,
        carbs: recipeToTranslate.carbs,
        fat: recipeToTranslate.fat,
    };

    const prompt = `Translate the following recipe JSON object to ${language}. Maintain the exact JSON structure and keys. Only translate the string values for 'recipeName', 'description', 'prepTime', 'cookTime', and the strings within the 'ingredients' and 'instructions' arrays. Do not translate the values for nutritional info like 'calories', 'protein', etc. unless it contains translatable words like 'grams'.\n\n${JSON.stringify(textContent, null, 2)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema
            }
        });
        const cleanedJson = response.text.replace(/```json|```/g, '').trim();
        const translated = JSON.parse(cleanedJson);
        // Combine translated text with non-translated data
        return { ...recipeToTranslate, ...translated };
    } catch (error) {
        console.error(`Error translating recipe to ${language}:`, error);
        throw new Error(`Failed to translate recipe.`);
    }
};

export const scaleIngredients = async (ingredients: string[], factor: number): Promise<string[]> => {
  const prompt = `You are an expert recipe assistant. A user wants to scale their recipe.
  Carefully analyze the following list of ingredients and multiply all numerical quantities by a factor of ${factor}.
  - Maintain the original format, units, and ingredient names precisely.
  - If an ingredient has a range (e.g., "1-2 cloves"), scale both numbers.
  - If an ingredient uses fractions (e.g., "1/2 cup"), convert it to a decimal, multiply, and then represent the result as a simplified fraction if appropriate, or a decimal if not (e.g., "1/2 cup" * 2 becomes "1 cup"; "1/4 cup" * 1.5 becomes "3/8 cup").
  - If an ingredient has no specific numerical quantity (e.g., "a pinch of salt", "salt to taste"), keep it exactly as it is.
  - Ensure the output is ONLY a valid JSON array of strings, with each string being a scaled ingredient. Do not include any other text or formatting.

  Here are the ingredients:
  ${JSON.stringify(ingredients)}`;

  const scaledIngredientsSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.STRING
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: scaledIngredientsSchema,
        temperature: 0.1, // Be precise for this task
      }
    });

    const cleanedJson = response.text.replace(/```json|```/g, '').trim();
    const scaledList = JSON.parse(cleanedJson);
    
    // Basic validation to ensure the AI returned the correct type
    if (Array.isArray(scaledList) && scaledList.every(item => typeof item === 'string')) {
        return scaledList;
    } else {
        throw new Error("Parsed response is not a valid string array.");
    }

  } catch (error) {
    console.error(`Error scaling ingredients by factor ${factor}:`, error);
    throw new Error(`Failed to scale ingredients.`);
  }
};