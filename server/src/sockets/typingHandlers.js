/**
 * Handle typing event
 * Broadcasts typing status to other users in the channel
 */
const handleTyping = (socket, io, data) => {
  const { channelId } = data;

  if (!channelId) {
    return;
  }

  const roomName = `channel:${channelId}`;

  // Broadcast to all clients in the channel except sender
  socket.to(roomName).emit('typing', {
    channelId,
    userId: socket.userId,
    userName: socket.user.name,
  });
};

/**
 * Handle stopTyping event
 * Broadcasts that user stopped typing
 */
const handleStopTyping = (socket, io, data) => {
  const { channelId } = data;

  if (!channelId) {
    return;
  }

  const roomName = `channel:${channelId}`;

  // Broadcast to all clients in the channel except sender
  socket.to(roomName).emit('stopTyping', {
    channelId,
    userId: socket.userId,
  });
};

module.exports = {
  handleTyping,
  handleStopTyping,
};
