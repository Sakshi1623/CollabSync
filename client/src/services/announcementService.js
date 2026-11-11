import api from './api';

/**
 * Get announcements for a workspace
 */
export const getWorkspaceAnnouncements = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}/announcements`);
  return response.data;
};

/**
 * Create a new announcement
 */
export const createAnnouncement = async (workspaceId, title, content, priority = 'normal') => {
  const response = await api.post('/announcements', {
    workspace: workspaceId,
    title,
    content,
    priority,
  });
  return response.data;
};
