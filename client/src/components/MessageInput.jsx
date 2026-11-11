import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { useTypingIndicator } from '../hooks/useTypingIndicator';

const MAX_LENGTH = 2000;

const MessageInput = ({ channelId, sendMessage }) => {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { emitTyping, stopTyping } = useTypingIndicator(channelId);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setContent(value);

    if (value.length > 0) {
      emitTyping();
    } else {
      stopTyping();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() || sending) return;

    if (content.length > MAX_LENGTH) {
      setError(`Message cannot exceed ${MAX_LENGTH} characters`);
      return;
    }

    try {
      setSending(true);
      setError('');
      stopTyping();

      await sendMessage(content.trim());
      setContent('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > MAX_LENGTH;

  return (
    <div className="bg-zinc-900/80 backdrop-blur-md border-t border-white/10 p-3 sm:p-4 shrink-0">
      {error && (
        <div className="mb-2.5 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex items-end gap-2.5">
          <textarea
            value={content}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Message this channel..."
            rows="2"
            disabled={sending}
            className={`flex-1 px-3.5 py-2.5 text-sm bg-zinc-950/80 border rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isOverLimit
                ? 'border-rose-500 focus:ring-rose-500/25'
                : 'border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500/20'
            }`}
          />

          <button
            type="submit"
            disabled={!content.trim() || sending || isOverLimit}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 h-10 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
            aria-label="Send message"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{sending ? 'Sending' : 'Send'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between mt-1.5 px-0.5">
          <span className="text-[11px] text-zinc-500 hidden sm:inline">
            Enter to send · Shift+Enter for new line
          </span>
          <span
            className={`text-[11px] ml-auto tabular-nums ${
              isOverLimit ? 'text-rose-400 font-medium' : 'text-zinc-500'
            }`}
          >
            {characterCount} / {MAX_LENGTH}
          </span>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
