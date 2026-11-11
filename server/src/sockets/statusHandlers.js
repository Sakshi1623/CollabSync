const User = require('../models/User');

/**
 * Handle user connection - set status to online
 */
const handleUserOnline = async (socket, io) => {
  try {
    // Update user status to online
    await User.findByIdAndUpdate(socket.userId, { status: 'online' });

    console.log(`User ${socket.user.name} is now online`);

    // Broadcast online status to all connected clients
    io.emit('onlineStatus', {
      userId: socket.userId,
      status: 'online',
    });
  } catch (error) {
    console.error('Error setting user online:', error);
  }
};

/**
 * Handle user disconnection - set status to offline
 */
const handleUserOffline = async (socket, io) => {
  try {
    // Update user status to offline
    await User.findByIdAndUpdate(socket.userId, { status: 'offline' });

    console.log(`User ${socket.user.name} is now offline`);

    // Broadcast offline status to all connected clients
    io.emit('onlineStatus', {
      userId: socket.userId,
      status: 'offline',
    });
  } catch (error) {
    console.error('Error setting user offline:', error);
  }
};

module.exports = {
  handleUserOnline,
  handleUserOffline,
};
