/**
 * Shared utility functions for the JGECHelper application.
 */

/**
 * Returns a human-friendly relative time string from a Date object.
 * Example outputs: "Just now", "5m ago", "3h ago", "2d ago", "1w ago", "3mo ago"
 */
export function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths >= 1) return `${diffMonths}mo ago`;
    if (diffWeeks >= 1) return `${diffWeeks}w ago`;
    if (diffDays >= 1) return `${diffDays}d ago`;
    if (diffHours >= 1) return `${diffHours}h ago`;
    if (diffMins >= 1) return `${diffMins}m ago`;
    return "Just now";
}

/**
 * Returns a human-friendly relative time string from a millisecond timestamp.
 * Useful for Firestore `toMillis()` timestamps.
 */
export function getRelativeTimeFromMs(timestampMs: number): string {
    const diffMs = Date.now() - timestampMs;
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return ""; // fallback: show formatted date only
}
