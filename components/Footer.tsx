
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-auto">
      <div className="container mx-auto px-4 py-4 text-center text-gray-500">
        <p>Powered by Gemini. &copy; {new Date().getFullYear()} AI Recipe Generator. All rights reserved.</p>
      </div>
    </footer>
  );
};
