
import { useState, useEffect } from 'react';

interface MockUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name: string;
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    // Mock sign up - simulate success
    const mockUser: MockUser = {
      id: 'mock-user-id',
      email,
      user_metadata: {
        full_name: fullName,
      }
    };
    
    setUser(mockUser);
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    
    return { 
      data: { user: mockUser }, 
      error: null 
    };
  };

  const signIn = async (email: string, password: string) => {
    // Mock sign in - simulate success
    const mockUser: MockUser = {
      id: 'mock-user-id',
      email,
      user_metadata: {
        full_name: 'Demo User',
      }
    };
    
    setUser(mockUser);
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    
    return { 
      data: { user: mockUser }, 
      error: null 
    };
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('mockUser');
    return { error: null };
  };

  const resendConfirmation = async (email: string) => {
    // Mock resend - simulate success
    return { error: null };
  };

  return {
    user,
    session: user ? { user } : null,
    loading,
    signUp,
    signIn,
    signOut,
    resendConfirmation,
  };
};
