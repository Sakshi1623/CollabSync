import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createWorkspace } from '../services/workspaceService';
import Modal from './Modal';
import { extractApiError } from '../utils/uiHelpers';

const CreateWorkspaceModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await createWorkspace(formData.name.trim(), formData.description.trim());
      onSuccess(result?.workspace);
    } catch (err) {
      setError(extractApiError(err, 'Failed to create workspace'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Workspace"
      subtitle="A default #general channel will be created automatically."
      onClose={onClose}
    >
      {error && (
        <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="workspace-name" className="block text-xs font-medium text-zinc-300 mb-1.5">
            Workspace Name *
          </label>
          <input
            type="text"
            id="workspace-name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm bg-zinc-950/80 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder="e.g., Engineering Team"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="workspace-description" className="block text-xs font-medium text-zinc-300 mb-1.5">
            Description
          </label>
          <textarea
            id="workspace-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3.5 py-2.5 text-sm bg-zinc-950/80 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all"
            placeholder="What is this workspace for?"
          />
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
            <span>{loading ? 'Creating...' : 'Create Workspace'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateWorkspaceModal;
