import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
} from '../services/notificationService';

/**
 * Custom hook to manage notifications with real-time updates
 */
export const useNotifications = () => {
  const { socket, isConnected } = useSocket();
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const [notifs, count] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    if (!token) return;
    let active = true;

    Promise.resolve().then(() => {
      if (active) {
        loadNotifications();
      }
    });

    return () => {
      active = false;
    };
  }, [token, loadNotifications]);

  // Listen for new notifications via Socket.IO
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (notification) => {
      // Announcement notifications emitted by backend do not include _id or createdAt;
      // refresh from API so the dropdown has valid IDs and timestamps.
      if (!notification?._id) {
        loadNotifications();
        return;
      }

      setNotifications((prev) => {
        if (prev.some((item) => item._id === notification._id)) {
          return prev;
        }
        return [notification, ...prev];
      });

      setUnreadCount((prev) => prev + 1);
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket, isConnected, loadNotifications]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!notificationId) return;

    try {
      await markNotificationAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
  };
};
