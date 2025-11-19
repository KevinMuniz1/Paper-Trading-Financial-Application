// should be added
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to decode JWT
const decodeToken = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.userId,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName
    };
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
};

// Helper to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    if (storedToken && !isTokenExpired(storedToken)) {
      const decoded = decodeToken(storedToken);
      if (decoded) {
        setToken(storedToken);
        setUser(decoded);
      } else {
        localStorage.removeItem('token');
      }
    } else {
      localStorage.removeItem('token');
    }
    
    setLoading(false);
  }, []);

  const login = (newToken: string) => {
    const decoded = decodeToken(newToken);
    if (decoded) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(decoded);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!user,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}