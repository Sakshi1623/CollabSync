import { useEffect, useRef } from 'react';
import { BellOff, Check, Megaphone, MessageSquare } from 'lucide-react';

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Just now';

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const NotificationDropdown = ({
  notifications = [],
  unreadCount = 0,
  loading = false,
  markAsRead,
  onClose,
}) => {
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="fixed sm:absolute right-3 sm:right-0 top-14 sm:top-auto sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-96 bg-zinc-900 rounded-xl shadow-2xl shadow-black/70 border border-white/10 z-50 max-h-[28rem] overflow-hidden flex flex-col animate-slide-in"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-zinc-900/95">
        <h3 className="text-sm font-semibold text-zinc-100">Notifications</h3>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            {unreadCount} unread
          </span>
        )}
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1 divide-y divide-white/5">
        {loading ? (
          <div className="p-6 text-center text-sm text-zinc-400">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            <BellOff className="w-9 h-9 mx-auto mb-2.5 text-zinc-600" />
            <p className="text-sm font-medium text-zinc-400">All caught up</p>
            <p className="text-xs text-zinc-500 mt-1">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <div
              key={notification._id || `${notification.type}-${index}`}
              className={`px-4 py-3 transition-colors hover:bg-white/[0.03] ${
                !notification.isRead ? 'bg-indigo-500/[0.06]' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center ${
                    notification.type === 'announcement'
                      ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                  }`}
                >
                  {notification.type === 'announcement' ? (
                    <Megaphone className="w-4 h-4" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 leading-snug">
                    {notification.message}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>

                {!notification.isRead && notification._id && (
                  <button
                    type="button"
                    onClick={() => markAsRead(notification._id)}
                    className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/20 transition-colors cursor-pointer"
                    title="Mark as read"
                  >
                    <Check className="w-3 h-3" />
                    <span>Read</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
