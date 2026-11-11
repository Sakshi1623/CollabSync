import api from './api';

/**
 * Get all channels in a workspace
 */
export const getWorkspaceChannels = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}/channels`);
  return response.data;
};

/**
 * Create a new channel in a workspace
 */
export const createChannel = async (name, workspaceId) => {
  const response = await api.post('/channels', {
    name,
    workspace: workspaceId,
  });
  return response.data;
};
