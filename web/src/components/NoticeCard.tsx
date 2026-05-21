import { Calendar, AlertCircle, ExternalLink, Megaphone, BookOpen, TreePalm, FileText, ImageIcon } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { getRelativeTimeFromMs } from "@/lib/utils";

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

// Category badge color map
const categoryStyles: Record<string, string> = {
    General: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    Exam: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    Holiday: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    Urgent: "bg-red-500 text-white",
};

// Category icon map
const categoryIcons: Record<string, React.ReactNode> = {
    General: <Megaphone className="h-3 w-3" />,
    Exam: <BookOpen className="h-3 w-3" />,
    Holiday: <TreePalm className="h-3 w-3" />,
    Urgent: <AlertCircle className="h-3 w-3" />,
};



/** Returns the right icon based on file extension */
function getAttachmentIcon(name?: string) {
    if (!name) return <FileText className="h-4 w-4" />;
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText className="h-4 w-4" />;
    if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext || "")) return <ImageIcon className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
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

    const badgeStyle = categoryStyles[notice.category] || categoryStyles.General;
    const badgeIcon = categoryIcons[notice.category] || categoryIcons.General;

    // Relative time (memoized)
    const relativeTime = useMemo(() => {
        if (notice.createdAt && notice.createdAt > 0) {
            return getRelativeTimeFromMs(notice.createdAt);
        }
        return "";
    }, [notice.createdAt]);

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
                    willChange: "background",
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(${isUrgent ? '239, 68, 68' : '59, 130, 246'}, 0.15), transparent 40%)`,
                }}
            />
            <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        {/* Category badge with icon and distinct color */}
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyle}`}>
                            {badgeIcon}
                            {notice.category}
                        </span>
                        {isNew && (
                            <span className="animate-beat rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                                New
                            </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {relativeTime ? (
                                <span title={notice.date}>{relativeTime}</span>
                            ) : (
                                notice.date
                            )}
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
                                {getAttachmentIcon(notice.attachmentName)}
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
