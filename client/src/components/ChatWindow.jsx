import { Hash, Megaphone, Users } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useMessages } from '../hooks/useMessages';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import MembersList from './MembersList';

const ChatWindow = ({
  showAnnouncements,
  onToggleAnnouncements,
  showMembers,
  onToggleMembers,
}) => {
  const { selectedWorkspace, selectedChannel } = useWorkspace();
  const { messages, loading, error, sendMessage } = useMessages(selectedChannel?._id);

  if (!selectedWorkspace || !selectedChannel) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-zinc-950">
      {/* Unified Channel Header */}
      <div className="bg-zinc-900/70 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 flex items-center justify-center shrink-0">
            <Hash className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-zinc-100 truncate">
              {selectedChannel.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 truncate">
              {selectedWorkspace.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleMembers}
            className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
              showMembers
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                : 'bg-zinc-800/80 text-zinc-300 border-white/10 hover:bg-zinc-800'
            }`}
            title="Toggle members list"
          >
            <Users className="w-4 h-4" />
            <span>{selectedChannel.members?.length || 0}</span>
            <span className="hidden sm:inline">Members</span>
          </button>

          <button
            type="button"
            onClick={onToggleAnnouncements}
            className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
              showAnnouncements
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                : 'bg-zinc-800/80 text-zinc-300 border-white/10 hover:bg-zinc-800'
            }`}
            title="Toggle announcements panel"
          >
            <Megaphone className="w-4 h-4" />
            <span className="hidden sm:inline">Announcements</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <MessageList
            channelId={selectedChannel._id}
            messages={messages}
            loading={loading}
            error={error}
          />
          <MessageInput
            channelId={selectedChannel._id}
            sendMessage={sendMessage}
          />
        </div>

        {/* Members List (inline on lg+, slide-over on smaller viewports) */}
        {showMembers && (
          <>
            <div
              className="fixed top-14 inset-x-0 bottom-0 bg-black/60 z-30 lg:hidden"
              onClick={onToggleMembers}
            />
            <div className="fixed top-14 bottom-0 right-0 z-40 w-full max-w-xs sm:w-64 lg:static lg:h-full lg:z-auto shrink-0 shadow-2xl lg:shadow-none animate-slide-in lg:animate-none">
              <MembersList
                members={selectedChannel.members}
                workspaceMembers={selectedWorkspace.members}
                onClose={onToggleMembers}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
