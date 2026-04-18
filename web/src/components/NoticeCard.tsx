import { Calendar, AlertCircle, Paperclip, ExternalLink } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface NoticeProps {
    id: number | string;
    title: string;
    date: string;
    category: "General" | "Exam" | "Holiday" | "Urgent";
    description: string;
    attachmentUrl?: string;
    attachmentName?: string;
    createdAt?: number;
}

export function NoticeCard({ notice }: { notice: NoticeProps }) {
    const isUrgent = notice.category === "Urgent";
    const [isNew, setIsNew] = useState(false);

    // Spotlight logic
    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current || isFocused) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    useEffect(() => {
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        let diff = -1;
        if (notice.createdAt && notice.createdAt > 0) {
            diff = Date.now() - notice.createdAt;
        } else if (notice.date && notice.date !== "Unknown Date") {
            const parsed = new Date(notice.date).getTime();
            if (!isNaN(parsed)) {
                diff = Date.now() - parsed;
            }
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsNew(diff >= -86400000 && diff < sevenDaysMs);
    }, [notice]);

    return (
        <div 
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={() => { setIsFocused(true); setOpacity(1); }}
            onBlur={() => { setIsFocused(false); setOpacity(0); }}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}
            className={`glass relative overflow-hidden rounded-xl border p-6 transition-all hover:bg-secondary/50 dark:hover:bg-zinc-900/80 hover:-translate-y-1 hover:shadow-xl ${isUrgent ? "border-red-500/50 bg-red-500/5 dark:hover:shadow-red-900/10" : "border-border dark:hover:shadow-white/5"}`}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-0"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(${isUrgent ? '239, 68, 68' : '59, 130, 246'}, 0.15), transparent 40%)`,
                }}
            />
            <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${isUrgent
                            ? "bg-red-500 text-white"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                            }`}>
                            {notice.category}
                        </span>
                        {isNew && (
                            <span className="animate-beat rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                                New
                            </span>
                        )}
                        <span className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {notice.date}
                        </span>
                    </div>

                    <h3 className="text-lg font-semibold leading-tight text-foreground">
                        {notice.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {notice.description}
                    </p>

                    {notice.attachmentUrl && (
                        <div className="mt-4">
                            <a
                                href={notice.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-blue-400 dark:hover:bg-zinc-800"
                            >
                                <Paperclip className="h-4 w-4" />
                                {notice.attachmentName || "View Attachment"}
                                <ExternalLink className="h-3 w-3 opacity-50" />
                            </a>
                        </div>
                    )}
                </div>

                {isUrgent && (
                    <div className="flex-shrink-0 text-red-500">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                )}
            </div>
        </div>
    );
}
