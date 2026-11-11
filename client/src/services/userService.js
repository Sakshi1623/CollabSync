import api from './api';

/**
 * Get all users (admin only)
 */
export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (userId, role) => {
  const response = await api.patch(`/users/${userId}/role`, { role });
  return response.data;
};

/**
 * Update own profile (name)
 */
export const updateOwnProfile = async (name) => {
  const response = await api.patch('/users/me', { name });
  return response.data;
};
