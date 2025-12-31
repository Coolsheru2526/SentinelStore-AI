// frontend/src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  store_id: string;
  role: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    store_id: string;
  }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set up axios defaults
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }
      
        // Set auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get user data
        const response = await axios.get(`${API_URL}/auth/me`);
        setUser(response.data.user);
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Try to refresh token
        try {
          const refreshed = await refreshToken(); // This is the fixed line
          if (!refreshed) {
            clearAuth();
          }
        } catch (err) {
          console.error('Token refresh failed:', err);
          clearAuth();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Set up axios interceptor for token refresh
  useEffect(() => {
    const requestInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshed = await refreshToken();
            if (refreshed) {
              // Retry the original request with the new token
              originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
              return axios(originalRequest);
            }
          } catch (err) {
            // If refresh fails, log the user out
            logout();
            return Promise.reject(err);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(requestInterceptor);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { access_token, refresh_token, user: userData } = response.data;
      
      // Store tokens
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Set user
      setUser(userData);
      navigate('/dashboard'); // Redirect to dashboard after login
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    store_id: string;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      const { access_token, refresh_token, user: userResponse } = response.data;
      
      // Store tokens
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Set user from the API response
      setUser(userResponse);
      navigate('/dashboard'); // Redirect to dashboard after registration
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  const clearAuth = () => {
    // Clear tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Clear auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear user
    setUser(null);
  };

  const refreshToken = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token } = response.data;
      
      // Store new tokens
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      
      // Update auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Get user data
      const userResponse = await axios.get(`${API_URL}/auth/me`);
      setUser(userResponse.data.user);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshToken,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};