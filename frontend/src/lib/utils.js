import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names safely, resolving conflicts.
 * Usage: cn('px-4 py-2', isActive && 'bg-blue-500')
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a file size in bytes to a human-readable string.
 */
export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 B';
  const k     = 1024;
  const dm    = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i     = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Return a short relative timestamp: "2 hours ago", "just now", etc.
 */
export function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs  / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

/**
 * Derive a colour class for a file-type badge from a MIME type string.
 */
export function fileTypeColor(mimeType = '') {
  if (mimeType.startsWith('image/'))       return 'bg-purple-100 text-purple-700';
  if (mimeType.startsWith('video/'))       return 'bg-pink-100 text-pink-700';
  if (mimeType.startsWith('audio/'))       return 'bg-yellow-100 text-yellow-700';
  if (mimeType.includes('pdf'))            return 'bg-red-100 text-red-700';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
                                           return 'bg-green-100 text-green-700';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
                                           return 'bg-orange-100 text-orange-700';
  if (mimeType.includes('word') || mimeType.includes('document'))
                                           return 'bg-blue-100 text-blue-700';
  return 'bg-gray-100 text-gray-700';
}

/**
 * Format an expiry date as a human-readable string with remaining time.
 * Returns null if no expiry date is provided.
 *
 * Examples:
 *  - "Expires in 23h 45m"
 *  - "Expires in 6d 2h"
 *  - "Expired 2h ago"
 */
export function formatExpiry(dateStr) {
  if (!dateStr) return null;
  const expiry = new Date(dateStr);
  const now    = Date.now();
  const diff   = expiry.getTime() - now;

  if (diff <= 0) {
    // Already expired — show how long ago
    const ago  = Math.abs(diff);
    const mins = Math.floor(ago / 60_000);
    if (mins < 60) return `Expired ${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs  < 24) return `Expired ${hrs}h ago`;
    return `Expired ${Math.floor(hrs / 24)}d ago`;
  }

  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `Expires in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `Expires in ${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `Expires in ${days}d ${hrs % 24}h`;
}

/**
 * Returns true if the given expiry date string is in the past.
 */
export function isExpired(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < Date.now();
}
