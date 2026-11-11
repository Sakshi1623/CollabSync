import { useState, useEffect, useRef } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { addMemberToWorkspace } from '../services/workspaceService';
import Modal from './Modal';
import { extractApiError } from '../utils/uiHelpers';

const AddMemberForm = ({ workspaceId, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await addMemberToWorkspace(workspaceId, email.trim());
      setSuccess(result.message || 'Member added successfully');
      setEmail('');
      timerRef.current = setTimeout(() => {
        onSuccess(result.workspace);
      }, 1000);
    } catch (err) {
      setError(extractApiError(err, 'Failed to add member'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add Workspace Member"
      subtitle="Invite an existing registered user by their email address."
      onClose={onClose}
    >
      {error && (
        <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="member-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              id="member-email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-zinc-950/80 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              placeholder="colleague@company.com"
              autoFocus
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1.5">
            The user will automatically gain access to all channels in this workspace.
          </p>
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-800 border border-white/10 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Adding...' : 'Add Member'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMemberForm;
