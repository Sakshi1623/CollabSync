import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * Custom hook to handle typing indicators with debounce
 */
export const useTypingIndicator = (channelId) => {
  const { socket, isConnected } = useSocket();
  const [typingState, setTypingState] = useState({ channelId: null, users: [] });
  const typingTimeoutRef = useRef(null);
  const autoClearTimeoutsRef = useRef(new Map());
  const channelRef = useRef(channelId);

  useEffect(() => {
    channelRef.current = channelId;
  }, [channelId]);

  // Listen for typing events
  useEffect(() => {
    if (!socket || !isConnected) return;

    const clearAutoTimeout = (userId) => {
      const existing = autoClearTimeoutsRef.current.get(userId);
      if (existing) {
        clearTimeout(existing);
        autoClearTimeoutsRef.current.delete(userId);
      }
    };

    const handleTyping = ({ channelId: typingChannelId, userId, userName }) => {
      if (typingChannelId !== channelRef.current) return;

      setTypingState((prev) => {
        const currentUsers = prev.channelId === typingChannelId ? prev.users : [];
        if (currentUsers.some((u) => u.userId === userId)) {
          return { channelId: typingChannelId, users: currentUsers };
        }
        return {
          channelId: typingChannelId,
          users: [...currentUsers, { userId, userName }],
        };
      });

      clearAutoTimeout(userId);
      const timer = setTimeout(() => {
        setTypingState((prev) => {
          if (prev.channelId !== typingChannelId) return prev;
          return {
            ...prev,
            users: prev.users.filter((u) => u.userId !== userId),
          };
        });
        autoClearTimeoutsRef.current.delete(userId);
      }, 3000);
      autoClearTimeoutsRef.current.set(userId, timer);
    };

    const handleStopTyping = ({ channelId: typingChannelId, userId }) => {
      if (typingChannelId !== channelRef.current) return;
      clearAutoTimeout(userId);

      setTypingState((prev) => {
        if (prev.channelId !== typingChannelId) return prev;
        return {
          ...prev,
          users: prev.users.filter((u) => u.userId !== userId),
        };
      });
    };

    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);

    const timeoutsMap = autoClearTimeoutsRef.current;
    return () => {
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
      timeoutsMap.forEach((timer) => clearTimeout(timer));
      timeoutsMap.clear();
    };
  }, [socket, isConnected]);

  // Emit typing event (debounced)
  const emitTyping = useCallback(() => {
    if (!socket || !isConnected || !channelId) return;

    socket.emit('typing', { channelId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { channelId });
    }, 2000);
  }, [socket, isConnected, channelId]);

  // Stop typing
  const stopTyping = useCallback(() => {
    if (!socket || !isConnected || !channelId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit('stopTyping', { channelId });
  }, [socket, isConnected, channelId]);

  const typingUsers = typingState.channelId === channelId ? typingState.users : [];

  return {
    typingUsers,
    emitTyping,
    stopTyping,
  };
};
