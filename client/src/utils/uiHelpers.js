/**
 * Shared UI styling and formatting helpers for CollabSync.
 */

const ROLE_BADGE_STYLES = {
  admin: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
  leader: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
  member: 'bg-zinc-700/40 text-zinc-300 border border-zinc-600/50',
};

const PRIORITY_BADGE_STYLES = {
  low: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
  normal: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
  high: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
};

export const getRoleBadgeStyle = (role) =>
  ROLE_BADGE_STYLES[role] || ROLE_BADGE_STYLES.member;

export const getPriorityBadgeStyle = (priority) =>
  PRIORITY_BADGE_STYLES[priority] || PRIORITY_BADGE_STYLES.normal;

export const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const extractApiError = (err, fallback = 'Something went wrong') =>
  err?.response?.data?.message ||
  err?.response?.data?.errors?.[0]?.msg ||
  err?.response?.data?.errors?.[0]?.message ||
  err?.message ||
  fallback;

