import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, LogOut, Mail, Save, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateOwnProfile } from '../services/userService';
import Navbar from '../components/Navbar';
import { extractApiError, getInitials, getRoleBadgeStyle } from '../utils/uiHelpers';

const ProfilePage = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await updateOwnProfile(name.trim());

      // Update user in context and localStorage
      const updatedUser = { ...user, name: response.user.name };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(extractApiError(err, 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 min-h-[40px] text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Workspaces</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-lg font-bold shrink-0">
              {getInitials(user?.name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                Profile Settings
              </h1>
              <p className="text-sm text-zinc-400 mt-0.5">
                Manage your account information and workspace identity
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-5 sm:p-7">
          {error && (
            <div className="mb-5 px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field */}
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 min-h-[44px] text-base sm:text-sm bg-zinc-950/80 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="Your name"
                  required
                />
              </div>
            </div>

            {/* Email field - read-only */}
            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  id="profile-email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full pl-10 pr-4 py-2.5 min-h-[44px] text-base sm:text-sm border border-zinc-800/80 rounded-xl bg-zinc-950/40 text-zinc-400 cursor-not-allowed"
                />
              </div>
              <p className="mt-1.5 text-sm text-zinc-500">Email cannot be changed</p>
            </div>

            {/* Role & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-white/5">
                <span className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Role
                </span>
                <span
                  className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${getRoleBadgeStyle(
                    user?.role
                  )}`}
                >
                  {user?.role}
                </span>
                <p className="mt-2 text-xs sm:text-sm text-zinc-500">
                  Only admins can change user roles
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-white/5">
                <span className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Account Status
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
                    user?.status === 'online'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      user?.status === 'online' ? 'bg-emerald-400' : 'bg-zinc-500'
                    }`}
                  />
                  <span>{user?.status || 'offline'}</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-white/10">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>

              <button
                type="submit"
                disabled={loading || name.trim() === user?.name}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
