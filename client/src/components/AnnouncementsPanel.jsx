import { useState } from 'react';
import { Loader2, Megaphone, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAnnouncements } from '../hooks/useAnnouncements';
import CreateAnnouncementForm from './CreateAnnouncementForm';
import { getPriorityBadgeStyle } from '../utils/uiHelpers';

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AnnouncementsPanel = ({ workspaceId, onClose }) => {
  const { user } = useAuth();
  const { announcements, loading, error, loadAnnouncements } = useAnnouncements(workspaceId);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const canCreate = user?.role === 'admin' || user?.role === 'leader';

  return (
    <div className="h-full flex flex-col bg-zinc-900/95 border-l border-white/10">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-white/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Announcements</h2>
          </div>

          <div className="flex items-center gap-1.5">
            {canCreate && (
              <button
                type="button"
                onClick={() => setShowCreateForm((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
              >
                {showCreateForm ? (
                  <span>Cancel</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>New</span>
                  </>
                )}
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close announcements panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {showCreateForm && (
          <CreateAnnouncementForm
            workspaceId={workspaceId}
            onSuccess={() => {
              setShowCreateForm(false);
              loadAnnouncements();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        )}
      </div>

      {/* Announcements List */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="mb-3 px-3.5 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-zinc-400 py-10">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Loading announcements...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center text-zinc-500 py-12 px-4">
            <div className="w-11 h-11 rounded-xl bg-zinc-800/80 border border-white/10 flex items-center justify-center mx-auto mb-3">
              <Megaphone className="w-5 h-5 text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-zinc-300">No announcements yet</p>
            {canCreate ? (
              <p className="text-sm text-zinc-500 mt-1">
                Click &ldquo;New&rdquo; above to broadcast an update.
              </p>
            ) : (
              <p className="text-sm text-zinc-500 mt-1">
                Important workspace updates will appear here.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <article
                key={announcement._id}
                className="bg-zinc-950/60 rounded-xl p-3.5 border border-white/10 hover:border-white/15 transition-colors break-words overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-zinc-100 leading-snug flex-1">
                    {announcement.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md shrink-0 ${getPriorityBadgeStyle(
                      announcement.priority
                    )}`}
                  >
                    {announcement.priority}
                  </span>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed mb-3 whitespace-pre-wrap break-words">
                  {announcement.content}
                </p>

                <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-white/5">
                  <span className="truncate">By {announcement.author?.name || 'Admin'}</span>
                  <span className="shrink-0">{formatDate(announcement.createdAt)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPanel;
