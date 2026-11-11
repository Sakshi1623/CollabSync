import { useState, useEffect, useMemo } from 'react';
import { Users, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { getInitials, getRoleBadgeStyle } from '../utils/uiHelpers';

const MembersList = ({ members = [], workspaceMembers = [], onClose }) => {
  const { socket, isConnected } = useSocket();
  const [statusOverrides, setStatusOverrides] = useState({});

  // Listen for real-time online/offline status updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleOnlineStatus = ({ userId, status }) => {
      setStatusOverrides((prev) => ({
        ...prev,
        [userId]: status,
      }));
    };

    socket.on('onlineStatus', handleOnlineStatus);

    return () => {
      socket.off('onlineStatus', handleOnlineStatus);
    };
  }, [socket, isConnected]);

  // Enrich channel members with workspace member metadata (e.g., role) if available
  const enrichedMembers = useMemo(() => {
    const workspaceMap = new Map(
      workspaceMembers.map((wm) => [wm._id, wm])
    );

    return members.map((member) => {
      const wsMember = workspaceMap.get(member._id);
      const role = member.role || wsMember?.role;
      const effectiveStatus = statusOverrides[member._id] ?? member.status;
      return {
        ...member,
        role,
        isOnline: effectiveStatus === 'online',
      };
    });
  }, [members, workspaceMembers, statusOverrides]);

  const onlineCount = enrichedMembers.filter((m) => m.isOnline).length;

  return (
    <aside className="h-full w-64 bg-zinc-900/95 border-l border-white/10 flex flex-col overflow-hidden">
      <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Users className="w-4 h-4 text-zinc-400 shrink-0" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 truncate">
            Members ({enrichedMembers.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-emerald-400">
            {onlineCount} online
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 cursor-pointer"
              aria-label="Close members list"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {enrichedMembers.map((member) => (
          <div
            key={member._id}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/[0.04] transition-colors"
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-semibold text-zinc-200">
                {getInitials(member.name)}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-zinc-900 ${
                  member.isOnline ? 'bg-emerald-500' : 'bg-zinc-600'
                }`}
                title={member.isOnline ? 'Online' : 'Offline'}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">
                {member.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {member.role ? (
                  <span
                    className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${getRoleBadgeStyle(
                      member.role
                    )}`}
                  >
                    {member.role}
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-500">
                    {member.isOnline ? 'Online' : 'Offline'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default MembersList;
