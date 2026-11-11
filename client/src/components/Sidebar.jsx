import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FolderKanban,
  Hash,
  Layers,
  Loader2,
  Plus,
  Shield,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { getWorkspaces } from '../services/workspaceService';
import { getWorkspaceChannels } from '../services/channelService';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import CreateChannelModal from './CreateChannelModal';
import AddMemberForm from './AddMemberForm';

const Sidebar = ({ isOpen = false, onClose }) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const location = useLocation();
  const {
    workspaces,
    setWorkspaces,
    selectedWorkspace,
    setSelectedWorkspace,
    selectedChannel,
    setSelectedChannel,
    channels,
    setChannels,
  } = useWorkspace();

  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const canCreate = user?.role === 'admin' || user?.role === 'leader';
  const isAdmin = user?.role === 'admin';

  const loadWorkspaces = useCallback(async (preferredWorkspaceId = null) => {
    try {
      setLoading(true);
      const data = await getWorkspaces();
      setWorkspaces(data);

      setSelectedWorkspace((current) => {
        if (preferredWorkspaceId) {
          return data.find((w) => w._id === preferredWorkspaceId) || data[0] || null;
        }
        if (current) {
          return data.find((w) => w._id === current._id) || data[0] || null;
        }
        return data[0] || null;
      });
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setLoading(false);
    }
  }, [setWorkspaces, setSelectedWorkspace]);

  const loadChannels = useCallback(
    async (workspaceId, preferredChannelId = null) => {
      try {
        const data = await getWorkspaceChannels(workspaceId);
        setChannels(data);

        setSelectedChannel((current) => {
          if (data.length === 0) return null;
          if (preferredChannelId) {
            return data.find((ch) => ch._id === preferredChannelId) || data[0];
          }
          if (current) {
            const refreshed = data.find((ch) => ch._id === current._id);
            if (refreshed) return refreshed;
          }
          return data.find((ch) => ch.name === 'general') || data[0];
        });
      } catch (error) {
        console.error('Failed to load channels:', error);
      }
    },
    [setChannels, setSelectedChannel]
  );

  // Load workspaces on mount
  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      if (active) {
        loadWorkspaces();
      }
    });

    return () => {
      active = false;
    };
  }, [loadWorkspaces]);

  // Load channels when workspace changes
  useEffect(() => {
    if (!selectedWorkspace?._id) return;
    let active = true;

    Promise.resolve().then(() => {
      if (active) {
        loadChannels(selectedWorkspace._id);
      }
    });

    return () => {
      active = false;
    };
  }, [selectedWorkspace?._id, loadChannels]);

  // Join workspace socket room for real-time announcements
  useEffect(() => {
    if (!socket || !isConnected || !selectedWorkspace?._id) return;

    socket.emit('joinWorkspace', selectedWorkspace._id, (response) => {
      if (response?.error) {
        console.error('Failed to join workspace room:', response.error);
      }
    });
  }, [socket, isConnected, selectedWorkspace?._id]);

  const handleWorkspaceSelect = (workspace) => {
    if (workspace._id === selectedWorkspace?._id) return;
    setSelectedWorkspace(workspace);
    setSelectedChannel(null);
  };

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
    onClose?.();
  };

  const handleWorkspaceCreated = (createdWorkspace) => {
    setShowWorkspaceModal(false);
    setSelectedChannel(null);
    loadWorkspaces(createdWorkspace?._id);
  };

  const handleChannelCreated = (createdChannel) => {
    setShowChannelModal(false);
    if (selectedWorkspace) {
      loadChannels(selectedWorkspace._id, createdChannel?._id);
    }
  };

  const handleMemberAdded = (updatedWorkspace) => {
    setShowAddMemberForm(false);
    if (updatedWorkspace?._id) {
      setSelectedWorkspace(updatedWorkspace);
      setWorkspaces((prev) =>
        prev.map((w) => (w._id === updatedWorkspace._id ? updatedWorkspace : w))
      );
    }
    if (selectedWorkspace) {
      loadChannels(selectedWorkspace._id, selectedChannel?._id);
    }
  };

  const sidebarContent = (
    <aside className="w-64 h-full bg-zinc-900/95 border-r border-white/10 text-zinc-100 flex flex-col">
      {/* Mobile Drawer Header */}
      <div className="md:hidden px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold">Navigation</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 cursor-pointer"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Route Links */}
      <div className="sm:hidden p-3 border-b border-white/10 space-y-1">
        <Link
          to="/profile"
          onClick={onClose}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            location.pathname === '/profile'
              ? 'bg-white/10 text-white'
              : 'text-zinc-300 hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4 text-zinc-400" />
          <span>Profile Settings</span>
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            onClick={onClose}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              location.pathname === '/admin'
                ? 'bg-white/10 text-white'
                : 'text-zinc-300 hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4 text-zinc-400" />
            <span>Admin Panel</span>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center gap-2 text-xs text-zinc-400 p-4">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Loading workspaces...</span>
        </div>
      ) : (
        <>
          {/* Workspaces Section */}
          <div className="p-3.5 border-b border-white/10">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Workspaces
              </h2>
              {canCreate && (
                <button
                  type="button"
                  onClick={() => setShowWorkspaceModal(true)}
                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Create Workspace"
                  aria-label="Create Workspace"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto">
              {workspaces.length === 0 ? (
                <p className="text-xs text-zinc-500 px-2 py-2">No workspaces yet</p>
              ) : (
                workspaces.map((workspace) => {
                  const isActive = selectedWorkspace?._id === workspace._id;
                  return (
                    <button
                      type="button"
                      key={workspace._id}
                      onClick={() => handleWorkspaceSelect(workspace)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950/60'
                          : 'text-zinc-300 hover:bg-white/5 hover:text-zinc-100'
                      }`}
                    >
                      <FolderKanban
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-indigo-200' : 'text-zinc-500'
                        }`}
                      />
                      <span className="truncate">{workspace.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Channels Section */}
          {selectedWorkspace && (
            <div className="p-3.5 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-2.5 px-1">
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Channels
                </h2>
                {canCreate && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowChannelModal(true)}
                      className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Create Channel"
                      aria-label="Create Channel"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddMemberForm(true)}
                      className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Add Member to Workspace"
                      aria-label="Add Member"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                {channels.length === 0 ? (
                  <p className="text-xs text-zinc-500 px-2 py-2">No channels yet</p>
                ) : (
                  channels.map((channel) => {
                    const isActive = selectedChannel?._id === channel._id;
                    return (
                      <button
                        type="button"
                        key={channel._id}
                        onClick={() => handleChannelSelect(channel)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-white/10 text-white font-medium'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                        }`}
                      >
                        <Hash
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-indigo-400' : 'text-zinc-500'
                          }`}
                        />
                        <span className="truncate">{channel.name}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Links Footer (Desktop) */}
      <div className="hidden sm:block p-3 border-t border-white/10 space-y-1">
        <Link
          to="/profile"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile Settings</span>
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
          </Link>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <div className="hidden md:block shrink-0 h-full">{sidebarContent}</div>

      {/* Mobile slide-over drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={onClose}
          />
          <div className="relative z-50 h-full">{sidebarContent}</div>
        </div>
      )}

      {/* Modals */}
      {showWorkspaceModal && (
        <CreateWorkspaceModal
          onClose={() => setShowWorkspaceModal(false)}
          onSuccess={handleWorkspaceCreated}
        />
      )}

      {showChannelModal && selectedWorkspace && (
        <CreateChannelModal
          workspaceId={selectedWorkspace._id}
          onClose={() => setShowChannelModal(false)}
          onSuccess={handleChannelCreated}
        />
      )}

      {showAddMemberForm && selectedWorkspace && (
        <AddMemberForm
          workspaceId={selectedWorkspace._id}
          onClose={() => setShowAddMemberForm(false)}
          onSuccess={handleMemberAdded}
        />
      )}
    </>
  );
};

export default Sidebar;
