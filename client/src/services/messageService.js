import api from './api';

/**
 * Get message history for a channel
 */
export const getChannelMessages = async (channelId, limit = 50, before = null) => {
  const params = { limit };
  if (before) {
    params.before = before;
  }

  const response = await api.get(`/channels/${channelId}/messages`, { params });
  return response.data;
};
