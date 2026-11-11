const { Server } = require('socket.io');
const socketAuthMiddleware = require('./middleware/socketAuth');
const { handleJoinWorkspace, handleJoinChannel } = require('./roomHandlers');
const { handleSendMessage } = require('./messageHandlers');
const { handleTyping, handleStopTyping } = require('./typingHandlers');
const { handleUserOnline, handleUserOffline } = require('./statusHandlers');

/**
 * Initialize Socket.IO server
 * @param {Object} httpServer - HTTP server instance
 */
const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.name})`);

    // Join personal room for targeted notifications
    socket.join(`user:${socket.userId}`);
    console.log(`User ${socket.user.name} joined personal room: user:${socket.userId}`);

    // Set user online
    handleUserOnline(socket, io);

    // Room management
    socket.on('joinWorkspace', (workspaceId, callback) => {
      handleJoinWorkspace(socket, workspaceId, callback);
    });

    socket.on('joinChannel', (channelId, callback) => {
      handleJoinChannel(socket, channelId, callback);
    });

    // Messaging
    socket.on('sendMessage', (data, callback) => {
      handleSendMessage(socket, io, data, callback);
    });

    // Typing indicators
    socket.on('typing', (data) => {
      handleTyping(socket, io, data);
    });

    socket.on('stopTyping', (data) => {
      handleStopTyping(socket, io, data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id} (User: ${socket.user.name})`);
      handleUserOffline(socket, io);
    });
  });

  console.log('Socket.IO server initialized');

  return io;
};

module.exports = initializeSocket;
