import { useState } from 'react';
import { Hash, Loader2 } from 'lucide-react';
import { createChannel } from '../services/channelService';
import Modal from './Modal';
import { extractApiError } from '../utils/uiHelpers';

const CreateChannelModal = ({ workspaceId, onClose, onSuccess }) => {
  const [channelName, setChannelName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const channel = await createChannel(channelName.trim(), workspaceId);
      onSuccess(channel);
    } catch (err) {
      setError(extractApiError(err, 'Failed to create channel'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Channel"
      subtitle="All workspace members are automatically added to new channels."
      onClose={onClose}
    >
      {error && (
        <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="channelName" className="block text-sm font-medium text-zinc-300 mb-1.5">
            Channel Name *
          </label>
          <div className="relative">
            <Hash className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="channelName"
              required
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 min-h-[44px] text-base sm:text-sm bg-zinc-950/80 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              placeholder="e.g., design-review"
              autoFocus
            />
          </div>
          <p className="text-sm text-zinc-500 mt-1.5">
            Channel names are normalized to lowercase.
          </p>
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 min-h-[40px] text-sm font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-800 border border-white/10 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[40px] text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Creating...' : 'Create Channel'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;
