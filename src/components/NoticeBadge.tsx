import React from "react";

interface NoticeBadgeProps {
    publishDate: string | Date;
}

export default function NoticeBadge({ publishDate }: NoticeBadgeProps) {
    // Calculate if the date is within the last 7 days
    const isNew = (() => {
        try {
            const date = new Date(publishDate);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        } catch {
            return false;
        }
    })();

    if (!isNew) return null;

    return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 animate-pulse-shadow cursor-pointer">
            NEW
        </span>
    );
}
