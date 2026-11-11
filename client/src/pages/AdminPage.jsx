import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Search, Shield, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, updateUserRole } from '../services/userService';
import Navbar from '../components/Navbar';
import { extractApiError, getInitials, getRoleBadgeStyle } from '../utils/uiHelpers';

const AdminPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(extractApiError(err, 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadUsers();
    });
  }, [loadUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdating(userId);
      setError('');
      await updateUserRole(userId, newRole);

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      setError(extractApiError(err, 'Failed to update role'));
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((u) => u.role === 'admin').length,
      online: users.filter((u) => u.status === 'online').length,
    }),
    [users]
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Workspaces</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                  User Management
                </h1>
                <p className="text-sm text-zinc-400 mt-0.5">
                  Manage organization members, roles, and access levels
                </p>
              </div>
            </div>

            {/* Search filter */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, role..."
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-zinc-900 border border-white/10 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-900/90 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400">Total Users</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1 tabular-nums">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-zinc-900/90 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400">Administrators</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1 tabular-nums">{stats.admins}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-zinc-900/90 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400">Online Now</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">{stats.online}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-zinc-900/90 border border-white/10 rounded-2xl p-12 flex items-center justify-center gap-2.5 text-sm text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <span>Loading users...</span>
          </div>
        ) : (
          <div className="bg-zinc-900/90 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-zinc-950/60">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Assign Role
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => {
                    const isSelf = user._id === currentUser?._id;
                    return (
                      <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 text-zinc-200 flex items-center justify-center text-xs font-semibold shrink-0">
                              {getInitials(user.name)}
                            </div>
                            <div className="text-sm font-medium text-zinc-100">
                              {user.name}
                              {isSelf && (
                                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full capitalize ${getRoleBadgeStyle(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            disabled={updating === user._id || isSelf}
                            title={isSelf ? 'You cannot change your own role' : 'Change user role'}
                            className="text-sm bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <option value="admin">Admin</option>
                            <option value="leader">Leader</option>
                            <option value="member">Member</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
                              user.status === 'online'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.status === 'online' ? 'bg-emerald-400' : 'bg-zinc-500'
                              }`}
                            />
                            <span>{user.status || 'offline'}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-10 text-sm text-zinc-500">
                {searchQuery ? 'No users match your search' : 'No users found'}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
