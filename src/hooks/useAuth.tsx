
import { useState, useEffect } from 'react';

// Mock types for frontend-only version
interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface Session {
  user: User;
  access_token: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock authentication - simulate logged in user
    const mockUser: User = {
      id: 'mock-user-123',
      email: 'demo@example.com',
      user_metadata: {
        full_name: 'Demo User'
      }
    };
    
    const mockSession: Session = {
      user: mockUser,
      access_token: 'mock-token'
    };

    // Simulate loading delay
    setTimeout(() => {
      setUser(mockUser);
      setSession(mockSession);
      setLoading(false);
    }, 1000);
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    // Mock sign up
    console.log('Mock sign up:', { email, fullName });
    return { data: null, error: null };
  };

  const signIn = async (email: string, password: string) => {
    // Mock sign in
    console.log('Mock sign in:', { email });
    return { data: null, error: null };
  };

  const signOut = async () => {
    // Mock sign out
    setUser(null);
    setSession(null);
    return { error: null };
  };

  const resendConfirmation = async (email: string) => {
    // Mock resend confirmation
    console.log('Mock resend confirmation:', { email });
    return { error: null };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resendConfirmation,
  };
};
