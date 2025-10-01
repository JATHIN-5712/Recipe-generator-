
import React from 'react';

export const Welcome: React.FC = () => {
  return (
    <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <svg className="mx-auto h-16 w-16 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
      </svg>
      <h2 className="mt-4 text-2xl font-bold text-gray-800">Ready to Cook Something New?</h2>
      <p className="mt-2 text-gray-600 max-w-md mx-auto">
        Enter the ingredients you have in the box above, and our AI will whip up a custom recipe just for you. Let's turn your leftovers into a masterpiece!
      </p>
    </div>
  );
};
