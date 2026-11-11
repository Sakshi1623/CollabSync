import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createAnnouncement } from '../services/announcementService';
import { extractApiError } from '../utils/uiHelpers';

const CreateAnnouncementForm = ({ workspaceId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      await createAnnouncement(
        workspaceId,
        formData.title.trim(),
        formData.content.trim(),
        formData.priority
      );
      setFormData({ title: '', content: '', priority: 'normal' });
      onSuccess();
    } catch (err) {
      setError(extractApiError(err, 'Failed to create announcement'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 p-3.5 bg-zinc-950/70 border border-white/10 rounded-xl space-y-3"
    >
      {error && (
        <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="announcement-title" className="block text-xs font-medium text-zinc-300 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="announcement-title"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          placeholder="Announcement title"
        />
      </div>

      <div>
        <label htmlFor="announcement-content" className="block text-xs font-medium text-zinc-300 mb-1">
          Content *
        </label>
        <textarea
          id="announcement-content"
          name="content"
          required
          value={formData.content}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
          placeholder="Write your announcement..."
        />
      </div>

      <div>
        <label htmlFor="announcement-priority" className="block text-xs font-medium text-zinc-300 mb-1">
          Priority
        </label>
        <select
          id="announcement-priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{loading ? 'Posting...' : 'Post'}</span>
        </button>
      </div>
    </form>
  );
};

export default CreateAnnouncementForm;
