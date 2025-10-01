import { useState, useEffect } from 'react';
import type { UserCredentials, CurrentUser } from '../types';

// NOTE: Storing user data, especially passwords, in localStorage is highly insecure
// and not suitable for production. This is for demonstration purposes only.
// In a real application, use a secure backend with password hashing.
const USERS_STORAGE_KEY = 'recipeAppUsers';
const CURRENT_USER_SESSION_KEY = 'recipeAppCurrentUser';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    // Check session storage on initial load to maintain login state
    try {
      const storedUser = sessionStorage.getItem(CURRENT_USER_SESSION_KEY);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from session storage", error);
      sessionStorage.removeItem(CURRENT_USER_SESSION_KEY);
    }
  }, []);

  const getUsers = (): UserCredentials[] => {
    try {
      const users = localStorage.getItem(USERS_STORAGE_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error("Failed to parse users from local storage", error);
      return [];
    }
  };

  const saveUsers = (users: UserCredentials[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const login = ({ username, password }: Pick<UserCredentials, 'username' | 'password'>): Promise<void> => {
    return new Promise((resolve, reject) => {
      const users = getUsers();
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        const userToStore: CurrentUser = { 
            username: user.username,
            name: user.name,
            profilePhoto: user.profilePhoto
        };
        setCurrentUser(userToStore);
        sessionStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(userToStore));
        resolve();
      } else {
        reject(new Error("Invalid username or password."));
      }
    });
  };

  const register = (credentials: UserCredentials): Promise<void> => {
    return new Promise((resolve, reject) => {
       if (!credentials.username || !credentials.password || !credentials.name || !credentials.email) {
        return reject(new Error("All fields are required."));
      }
      const users = getUsers();
      if (users.some(u => u.username === credentials.username)) {
        reject(new Error("Username already exists."));
      } else if (users.some(u => u.email === credentials.email)) {
        reject(new Error("Email already registered."));
      } else {
        saveUsers([...users, credentials]);

        const userToStore: CurrentUser = { 
            username: credentials.username,
            name: credentials.name,
            profilePhoto: credentials.profilePhoto
        };
        setCurrentUser(userToStore);
        sessionStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(userToStore));
        resolve();
      }
    });
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem(CURRENT_USER_SESSION_KEY);
  };

  return { currentUser, login, register, logout };
};