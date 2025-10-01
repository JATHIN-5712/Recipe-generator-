import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Vite replaces `process.env.API_KEY` in your code with the value 
      // of `API_KEY` from your .env file during the build process.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})
