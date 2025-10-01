import React, { useState } from 'react';
import type { UserCredentials } from '../types';

interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onLogin: (credentials: Pick<UserCredentials, 'username' | 'password'>) => Promise<void>;
  onRegister: (credentials: UserCredentials) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onLogin, onRegister }) => {
  const [isLoginMode, setIsLoginMode] = useState(mode === 'login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(undefined);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Username and password cannot be empty.");
      return;
    }
    
    setIsLoading(true);

    try {
      if (isLoginMode) {
        await onLogin({ username, password });
      } else {
        if (!name.trim() || !email.trim()) {
          setError("Name and email cannot be empty.");
          setIsLoading(false);
          return;
        }
        await onRegister({ username, password, name, email, profilePhoto });
      }
      onClose(); // Close modal on success
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setError(null);
    setUsername('');
    setPassword('');
    setName('');
    setEmail('');
    setProfilePhoto(undefined);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in-fast" onClick={onClose}>
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md m-4 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{isLoginMode ? 'Welcome Back!' : 'Create Your Account'}</h2>
        
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center mb-4" role="alert">
                <p>{error}</p>
            </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLoginMode && (
            <>
              <div className="mb-4 flex flex-col items-center">
                <label htmlFor="profilePhoto" className="cursor-pointer group">
                  <span className="sr-only">Choose profile photo</span>
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-emerald-500 transition-colors relative">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                       <div className="text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-xs mt-1 block">Optional Photo</span>
                       </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                  </div>
                </label>
                <input id="profilePhoto" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </div>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
                  placeholder="Enter your full name" required />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
                  placeholder="Enter your email" required />
              </div>
            </>
          )}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              id="username" type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
              placeholder="Enter your username" required />
          </div>
          <div className="mb-6">
            <label htmlFor="password"className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
              placeholder="Enter your password" required />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors duration-300"
          >
            {isLoading ? 'Processing...' : (isLoginMode ? 'Login' : 'Register')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {isLoginMode ? "Don't have an account?" : "Already have an account?"}
          <button onClick={switchMode} className="font-semibold text-emerald-600 hover:text-emerald-700 ml-1">
            {isLoginMode ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
      <style>{`
        @keyframes fade-in-fast {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        .animate-fade-in-fast {
            animation: fade-in-fast 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};