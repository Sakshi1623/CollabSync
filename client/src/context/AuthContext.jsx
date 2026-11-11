import { createContext, useState, useContext } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../services/authService';
import { extractApiError } from '../utils/uiHelpers';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const readStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => (localStorage.getItem('token') ? readStoredUser() : null));
  const [loading] = useState(false);
  const [error, setError] = useState(null);

  // Register function
  const register = async (name, email, password) => {
    try {
      setError(null);
      const data = await registerUser(name, email, password);

      setUser(data);
      setToken(data.token);

      // Persist to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      return { success: true };
    } catch (err) {
      const message = extractApiError(err, 'Registration failed');
      setError(message);
      return { success: false, error: message };
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const data = await loginUser(email, password);

      setUser(data);
      setToken(data.token);

      // Persist to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      return { success: true };
    } catch (err) {
      const message = extractApiError(err, 'Login failed');
      setError(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to refresh user:', err);
      logout();
    }
  };

  const value = {
    user,
    setUser,
    token,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
