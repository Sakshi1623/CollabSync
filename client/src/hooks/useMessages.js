import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { getChannelMessages } from '../services/messageService';
import { extractApiError } from '../utils/uiHelpers';

/**
 * Custom hook to manage messages for a channel.
 * Loads history via REST and appends live messages from Socket.IO.
 */
export const useMessages = (channelId) => {
  const { socket, isConnected } = useSocket();
  const [messagesState, setMessagesState] = useState({ channelId: null, items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const channelRef = useRef(channelId);

  useEffect(() => {
    channelRef.current = channelId;
  }, [channelId]);

  // Load message history
  const loadMessages = useCallback(async () => {
    if (!channelId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getChannelMessages(channelId);
      setMessagesState({ channelId, items: data });
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError(extractApiError(err, 'Failed to load messages'));
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  // Join channel room and load history when channel changes
  useEffect(() => {
    if (!socket || !isConnected || !channelId) return;
    let active = true;

    socket.emit('joinChannel', channelId, (response) => {
      if (!active) return;
      if (response?.error) {
        console.error('Failed to join channel:', response.error);
        setError(response.error);
      } else {
        loadMessages();
      }
    });

    return () => {
      active = false;
    };
  }, [socket, isConnected, channelId, loadMessages]);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleReceiveMessage = (message) => {
      const msgChannelId = message.channel?._id || message.channel;
      if (msgChannelId !== channelRef.current) return;

      setMessagesState((prev) => {
        const currentItems = prev.channelId === msgChannelId ? prev.items : [];
        if (currentItems.some((m) => m._id === message._id)) {
          return prev;
        }
        return { channelId: msgChannelId, items: [...currentItems, message] };
      });
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [socket, isConnected]);

  // Send message function
  const sendMessage = useCallback(
    (content) =>
      new Promise((resolve, reject) => {
        if (!socket || !isConnected) {
          reject(new Error('Socket not connected'));
          return;
        }

        if (!channelId) {
          reject(new Error('No channel selected'));
          return;
        }

        socket.emit('sendMessage', { channelId, content }, (response) => {
          if (response?.error) {
            reject(new Error(response.error));
          } else {
            resolve(response?.message);
          }
        });
      }),
    [socket, isConnected, channelId]
  );

  const messages = messagesState.channelId === channelId ? messagesState.items : [];

  return {
    messages,
    loading,
    error,
    sendMessage,
    loadMessages,
  };
};
