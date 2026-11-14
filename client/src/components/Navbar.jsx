import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layers, LogOut, Menu, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import NotificationBell from './NotificationBell';
import { getInitials, getRoleBadgeStyle } from '../utils/uiHelpers';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Workspaces', icon: Layers, show: true },
    { to: '/profile', label: 'Profile', icon: User, show: true },
    { to: '/admin', label: 'Admin', icon: Shield, show: user?.role === 'admin' },
  ];

  return (
    <header className="h-14 bg-zinc-900/90 backdrop-blur-md border-b border-white/10 px-3 sm:px-5 flex items-center justify-between gap-3 shrink-0 z-30">
      {/* Left: Mobile sidebar trigger, brand, and route links */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden min-h-[40px] min-w-[40px] p-2 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Toggle navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0 group min-h-[40px]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-950/60 group-hover:from-indigo-400 group-hover:to-violet-500 transition-all">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold tracking-tight text-zinc-100">
            CollabSync
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 ml-2 pl-3 border-l border-white/10">
          {navLinks
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>
      </div>

      {/* Right: Socket status, notifications, user pill, logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium border ${
            isConnected
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/25'
          }`}
          title={isConnected ? 'Real-time connection active' : 'Connecting to server'}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span>{isConnected ? 'Live' : 'Offline'}</span>
        </div>

        <NotificationBell />

        <Link
          to="/profile"
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors min-h-[40px]"
          title="Profile Settings"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-xs font-semibold shrink-0">
            {getInitials(user?.name)}
          </div>
          <span className="hidden sm:inline text-sm font-medium text-zinc-200 max-w-32 truncate">
            {user?.name}
          </span>
          <span
            className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeStyle(
              user?.role
            )}`}
          >
            {user?.role}
          </span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 bg-zinc-800/80 hover:bg-rose-600/20 hover:text-rose-200 border border-white/10 hover:border-rose-500/30 transition-colors cursor-pointer min-h-[40px]"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
