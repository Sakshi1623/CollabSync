import { useTypingIndicator } from '../hooks/useTypingIndicator';

const TypingIndicator = ({ channelId }) => {
  const { typingUsers } = useTypingIndicator(channelId);

  if (typingUsers.length === 0) return null;

  const typingText = (() => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} is typing...`;
    }
    if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
    }
    return `${typingUsers.length} people are typing...`;
  })();

  return (
    <div className="flex items-center gap-2 text-sm text-zinc-400 italic px-1 py-1">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
        <span
          className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
          style={{ animationDelay: '0.12s' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
          style={{ animationDelay: '0.24s' }}
        />
      </div>
      <span>{typingText}</span>
    </div>
  );
};

export default TypingIndicator;
