import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { getWorkspaceAnnouncements } from '../services/announcementService';
import { extractApiError } from '../utils/uiHelpers';

/**
 * Custom hook to manage announcements with real-time updates
 */
export const useAnnouncements = (workspaceId) => {
  const { socket, isConnected } = useSocket();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load announcements
  const loadAnnouncements = useCallback(async () => {
    if (!workspaceId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getWorkspaceAnnouncements(workspaceId);
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to load announcements:', err);
      setError(extractApiError(err, 'Failed to load announcements'));
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  // Initial load when workspaceId changes
  useEffect(() => {
    if (!workspaceId) return;
    let active = true;

    Promise.resolve().then(() => {
      if (active) {
        loadAnnouncements();
      }
    });

    return () => {
      active = false;
    };
  }, [workspaceId, loadAnnouncements]);

  // Listen for new announcements via Socket.IO
  useEffect(() => {
    if (!socket || !isConnected || !workspaceId) return;

    const handleNewAnnouncement = (announcement) => {
      const targetWorkspaceId = announcement.workspace?._id || announcement.workspace;
      if (targetWorkspaceId !== workspaceId) return;

      setAnnouncements((prev) => {
        if (prev.some((item) => item._id === announcement._id)) {
          return prev;
        }
        return [announcement, ...prev];
      });
    };

    socket.on('newAnnouncement', handleNewAnnouncement);

    return () => {
      socket.off('newAnnouncement', handleNewAnnouncement);
    };
  }, [socket, isConnected, workspaceId]);

  return {
    announcements,
    loading,
    error,
    loadAnnouncements,
  };
};
