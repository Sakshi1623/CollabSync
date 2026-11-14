import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

const ForbiddenPage = () => {
  return (
    <div className="min-h-dvh bg-zinc-950 relative overflow-hidden flex items-center justify-center px-4 py-8">
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[30rem] h-[16rem] rounded-full bg-rose-600/10 blur-3xl" />

      <div className="relative max-w-md w-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="text-4xl font-bold tracking-tight text-rose-400 mb-1">403</div>
        <h1 className="text-xl font-semibold text-zinc-100 mb-2">Access Denied</h1>
        <p className="text-sm text-zinc-400 mb-6">
          You don&apos;t have permission to access this page. If you believe this is an error, contact your workspace administrator.
        </p>

        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full min-h-[44px] bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;
