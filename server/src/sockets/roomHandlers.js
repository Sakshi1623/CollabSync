const Workspace = require('../models/Workspace');
const Channel = require('../models/Channel');

/**
 * Handle joinWorkspace event
 * Verifies user is a member of the workspace before joining the room
 */
const handleJoinWorkspace = async (socket, workspaceId, callback) => {
  try {
    // Find workspace
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return callback?.({ error: 'Workspace not found' });
    }

    // Check if user is a member
    const isMember = workspace.members.some(
      (memberId) => memberId.toString() === socket.userId
    );

    if (!isMember) {
      return callback?.({ error: 'Access denied: not a workspace member' });
    }

    // Join workspace room
    const roomName = `workspace:${workspaceId}`;
    socket.join(roomName);

    console.log(`User ${socket.user.name} joined workspace: ${workspace.name}`);

    callback?.({ ok: true, workspace: { _id: workspace._id, name: workspace.name } });
  } catch (error) {
    console.error('Error joining workspace:', error);
    callback?.({ error: 'Failed to join workspace' });
  }
};

/**
 * Handle joinChannel event
 * Verifies user is a member of the channel's workspace before joining
 */
const handleJoinChannel = async (socket, channelId, callback) => {
  try {
    // Find channel
    const channel = await Channel.findById(channelId).populate('workspace');

    if (!channel) {
      return callback?.({ error: 'Channel not found' });
    }

    // Check if user is a member of the workspace
    const isMember = channel.workspace.members.some(
      (memberId) => memberId.toString() === socket.userId
    );

    if (!isMember) {
      return callback?.({ error: 'Access denied: not a workspace member' });
    }

    // Leave previous channel rooms (optional cleanup)
    // Get all rooms the socket is in and leave channel rooms
    const rooms = Array.from(socket.rooms);
    rooms.forEach((room) => {
      if (room.startsWith('channel:')) {
        socket.leave(room);
      }
    });

    // Join channel room
    const roomName = `channel:${channelId}`;
    socket.join(roomName);

    console.log(`User ${socket.user.name} joined channel: ${channel.name}`);

    callback?.({ ok: true, channel: { _id: channel._id, name: channel.name } });
  } catch (error) {
    console.error('Error joining channel:', error);
    callback?.({ error: 'Failed to join channel' });
  }
};

module.exports = {
  handleJoinWorkspace,
  handleJoinChannel,
};
