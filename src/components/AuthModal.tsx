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
    <div className="fixed