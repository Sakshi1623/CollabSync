import api from './api';

/**
 * Get user's notifications
 */
export const getNotifications = async (unreadOnly = false) => {
  const params = {};
  if (unreadOnly) {
    params.unreadOnly = 'true';
  }
  const response = await api.get('/notifications', { params });
  return response.data;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread/count');
  return response.data.count;
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
};
