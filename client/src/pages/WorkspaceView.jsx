import { useState } from 'react';
import { FolderKanban, Hash, Megaphone, Menu } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import ChatWindow from '../components/ChatWindow';
import AnnouncementsPanel from '../components/AnnouncementsPanel';

const WorkspaceView = ({ onOpenSidebar }) => {
  const { selectedWorkspace, selectedChannel, channels, setSelectedChannel } = useWorkspace();
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showMembers, setShowMembers] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  if (!selectedWorkspace) {
    return (
      <main className="flex-1 flex items-center justify-center bg-zinc-950 p-6">
        <div className="max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FolderKanban className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">
            Welcome to CollabSync
          </h2>
          <p className="text-sm text-zinc-400 mb-6">
            Select a workspace from the sidebar to collaborate in channels, or create a new one if you&apos;re a leader or admin.
          </p>
          {onOpenSidebar && (
            <button
              type="button"
              onClick={onOpenSidebar}
              className="md:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>Browse Workspaces</span>
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex min-w-0 min-h-0 overflow-hidden relative">
      {selectedChannel ? (
        <ChatWindow
          showAnnouncements={showAnnouncements}
          onToggleAnnouncements={() => setShowAnnouncements((prev) => !prev)}
          showMembers={showMembers}
          onToggleMembers={() => setShowMembers((prev) => !prev)}
        />
      ) : (
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
          <div className="bg-zinc-900/70 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-zinc-100 truncate">
                {selectedWorkspace.name}
              </h1>
              {selectedWorkspace.description && (
                <p className="text-sm text-zinc-400 truncate">
                  {selectedWorkspace.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowAnnouncements((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-sm font-medium border transition-colors cursor-pointer shrink-0 ${
                showAnnouncements
                  ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                  : 'bg-zinc-800/80 text-zinc-300 border-white/10 hover:bg-zinc-800'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Announcements</span>
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Hash className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-100 mb-1.5">
                {selectedWorkspace.name}
              </h2>
              <p className="text-sm text-zinc-400 mb-5">
                {channels.length > 0
                  ? 'Select a channel to jump into the conversation.'
                  : 'No channels exist in this workspace yet.'}
              </p>

              {channels.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {channels.map((channel) => (
                    <button
                      type="button"
                      key={channel._id}
                      onClick={() => setSelectedChannel(channel)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[40px] rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-sm font-medium text-zinc-200 transition-colors cursor-pointer"
                    >
                      <Hash className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{channel.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Announcements Panel (inline on xl+, slide-over drawer on smaller viewports) */}
      {showAnnouncements && (
        <>
          <div
            className="fixed top-14 inset-x-0 bottom-0 bg-black/60 z-30 xl:hidden"
            onClick={() => setShowAnnouncements(false)}
          />
          <div className="fixed top-14 bottom-0 right-0 w-full max-w-sm sm:w-96 z-40 xl:static xl:h-full xl:z-auto xl:w-96 shrink-0">
            <AnnouncementsPanel
              workspaceId={selectedWorkspace._id}
              onClose={() => setShowAnnouncements(false)}
            />
          </div>
        </>
      )}
    </main>
  );
};

export default WorkspaceView;
