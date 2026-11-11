import api from './api';

/**
 * Get all workspaces the user is a member of
 */
export const getWorkspaces = async () => {
  const response = await api.get('/workspaces');
  return response.data;
};

/**
 * Create a new workspace
 */
export const createWorkspace = async (name, description) => {
  const response = await api.post('/workspaces', {
    name,
    description,
  });
  return response.data;
};

/**
 * Add a member to a workspace by email
 */
export const addMemberToWorkspace = async (workspaceId, email) => {
  const response = await api.post(`/workspaces/${workspaceId}/members`, {
    email,
  });
  return response.data;
};
