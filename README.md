# AI Recipe Generator

An intelligent web application that generates unique recipes from ingredients you have on hand, powered by the Google Gemini API.

## ✨ Features

*   **Dynamic Recipe Generation**: Enter your ingredients, and let the AI create a complete recipe.
*   **Customization**: Specify dietary preferences (Vegan, Keto, etc.) and cuisine types (Italian, Mexican, etc.).
*   **AI-Generated Images**: Get a unique, AI-generated image for each recipe to visualize the final dish.
*   **Recipe Scaling**: Easily adjust ingredient quantities for different serving sizes (1x, 2x, 4x).
*   **Multi-language Translation**: Translate recipes into Spanish, French, German, Hindi, Telugu, and more with a single click.
*   **Cooking Mode**: A step-by-step, full-screen view of instructions, designed for use in the kitchen.
*   **Read Aloud**: Have the recipe ingredients and instructions read to you with text-to-speech.
*   **User Accounts & History**: Register and log in to save your recipe history, add personal notes, and mark favorites.
*   **Shareable Recipes**: Share your creations with a unique, shareable link.

## 🛠️ Tech Stack

*   **Frontend**: React, TypeScript, Tailwind CSS
*   **AI**: Google Gemini API (`gemini-2.5-flash` for text, `imagen-4.0-generate-001` for images)
*   **Dependencies**: Loaded via ES Module Import Maps (no local `node_modules` required for the base project).

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

You will need a Google Gemini API key to run this application.

*   **Gemini API Key**: You can get your free key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/ai-recipe-generator.git
    cd ai-recipe-generator
    ```

2.  **Create an environment file:**
    Duplicate the `.env.example` file and rename it to `.env`.

    ```sh
    cp .env.example .env
    ```

3.  **Add your API Key:**
    Open the newly created `.env` file and replace `"YOUR_GEMINI_API_KEY"` with your actual Gemini API key.

    ```
    API_KEY="AI...your...key...here"
    ```

### Running the Application

This project is configured to run in a modern development environment that supports direct transpilation and serving of TypeScript/JSX files (e.g., Project IDX).

To run it in a standard local environment, you will need a development server that can handle this, such as Vite.

**Example using Vite:**

1.  Initialize a new Vite project with the React + TypeScript template.
2.  Copy the source files from this repository into the `src` directory of the new Vite project.
3.  Install dependencies: `npm install`.
4.  Run the dev server: `npm run dev`.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by JATHIN BHARGAV.