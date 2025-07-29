
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
    // No backend - return empty result
    return { 
      data: { user: null }, 
      error: { message: "No backend connected" }
    };
  };

  const signIn = async (email: string, password: string) => {
    // No backend - return empty result
    return { 
      data: { user: null }, 
      error: { message: "No backend connected" }
    };
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('mockUser');
    return { error: null };
  };

  const resendConfirmation = async (email: string) => {
    // No backend - return error
    return { error: { message: "No backend connected" } };
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
