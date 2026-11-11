import api from './api';

/**
 * Register a new user
 */
export const registerUser = async (name, email, password) => {
  const response = await api.post('/auth/register', {
    name,
    email,
    password,
  });
  return response.data;
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
