import React from 'react';
import type { CurrentUser } from '../types';

interface HeaderProps {
  currentUser: CurrentUser | null;
  onLogout: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onHistoryClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onLoginClick, onRegisterClick, onHistoryClick }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <svg className="h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0c-.454-.303-.977-.454-1.5-.454V12c0-1.654 1.346-3 3-3v3c0 1.654 1.346 3 3 3s3-1.346 3-3v-3c0-1.654 1.346-3 3-3v3c0 1.654 1.346 3 3 3s3-1.346 3-3v-3c1.654 0 3 1.346 3 3v3.546z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 13V9M12 9H9.5a2.5 2.5 0 00-2.5 2.5V13M12 9h2.5a2.5 2.5 0 012.5 2.5V13" />
          </svg>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
            AI Recipe Generator
          </h1>
        </div>
        <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <div className="flex items-center space-x-3">
                    {currentUser.profilePhoto ? (
                        <img src={currentUser.profilePhoto} alt="Profile" className="h-10 w-10 rounded-full object-cover border-2 border-emerald-500" />
                    ) : (
                       <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg border-2 border-emerald-600" title={currentUser.name}>
                          {currentUser.name.charAt(0).toUpperCase()}
                       </div>
                    )}
                    <span className="text-gray-700 hidden sm:block">Welcome, <span className="font-semibold">{currentUser.name}</span>!</span>
                </div>
                 <button onClick={onHistoryClick} className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                  History
                </button>
                <button onClick={onLogout} className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={onLoginClick} className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Login
                </button>
                <button onClick={onRegisterClick} className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors duration-300">
                  Register
                </button>
              </>
            )}
        </div>
      </div>
    </header>
  );
};