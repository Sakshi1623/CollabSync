import { useEffect, useRef } from 'react';
import { AlertCircle, Loader2, MessageSquareText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TypingIndicator from './TypingIndicator';
import { getInitials } from '../utils/uiHelpers';

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const MessageList = ({ channelId, messages = [], loading, error }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-sm text-zinc-400">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Loading messages...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-3">
            <MessageSquareText className="w-6 h-6 text-zinc-500" />
          </div>
          <p className="text-sm font-medium text-zinc-300">No messages yet</p>
          <p className="text-xs text-zinc-500 mt-1">
            Be the first to start the conversation in this channel.
          </p>
        </div>
      ) : (
        messages.map((message) => {
          const senderId = message.sender?._id || message.sender;
          const senderName = message.sender?.name || 'Unknown';
          const isOwnMessage = senderId === user?._id;

          return (
            <div
              key={message._id}
              className={`flex items-end gap-2.5 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              {!isOwnMessage && (
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center text-xs font-semibold shrink-0">
                  {getInitials(senderName)}
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-xl rounded-2xl px-4 py-2.5 ${
                  isOwnMessage
                    ? 'bg-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-950/40'
                    : 'bg-zinc-900 border border-white/10 text-zinc-100 rounded-bl-sm'
                }`}
              >
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span
                    className={`text-xs font-semibold ${
                      isOwnMessage ? 'text-indigo-100' : 'text-zinc-300'
                    }`}
                  >
                    {isOwnMessage ? 'You' : senderName}
                  </span>
                  <span
                    className={`text-[11px] ${
                      isOwnMessage ? 'text-indigo-200/80' : 'text-zinc-500'
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
            </div>
          );
        })
      )}

      {/* Typing Indicator */}
      <TypingIndicator key={channelId} channelId={channelId} />

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
