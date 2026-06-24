"use client";

import { Download, Eye, Loader2, X, BookOpen, ClipboardList, Calendar, File, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { getRelativeTime } from "@/lib/utils";

interface ResourceProps {
    title: string;
    subject: string;
    semester: string;
    type: "Question Paper" | "Notes" | "Routine" | "Others";
    branch?: string;
    branches?: string[];
    date: string;
    downloadURL?: string;
    createdAt?: { toDate: () => Date };
}


const TYPE_CONFIG: Record<string, {
    Icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    gradient: string;
    badge: string;
    hoverColor: string;
}> = {
    "Question Paper": {
        Icon: ClipboardList,
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-500/10 dark:bg-purple-500/20",
        gradient: "rgba(168, 85, 247, 0.15)",
        badge: "border border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400",
        hoverColor: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
    },
    "Notes": {
        Icon: BookOpen,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-500/10 dark:bg-blue-500/20",
        gradient: "rgba(59, 130, 246, 0.15)",
        badge: "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",
        hoverColor: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    },
    "Routine": {
        Icon: Calendar,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        gradient: "rgba(16, 185, 129, 0.15)",
        badge: "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
        hoverColor: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
    },
    "Others": {
        Icon: File,
        color: "text-zinc-600 dark:text-zinc-400",
        bg: "bg-zinc-500/10 dark:bg-zinc-500/20",
        gradient: "rgba(113, 113, 122, 0.12)",
        badge: "border border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
        hoverColor: "group-hover:text-zinc-800 dark:group-hover:text-zinc-200",
    },
};

function isPreviewable(url?: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase().split("?")[0];
    return (
        lower.endsWith(".pdf") ||
        lower.endsWith(".jpg") ||
        lower.endsWith(".jpeg") ||
        lower.endsWith(".png") ||
        lower.endsWith(".webp")
    );
}

export function ResourceCard({ resource }: { resource: ResourceProps }) {
    const [downloading, setDownloading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const typeConfig = TYPE_CONFIG[resource.type] ?? TYPE_CONFIG["Others"];
    const { Icon } = typeConfig;
    const canPreview = isPreviewable(resource.downloadURL);
    const relativeDate = resource.createdAt
        ? getRelativeTime(resource.createdAt.toDate())
        : resource.date;

    // Lock body scroll when preview modal is open (#12)
    useEffect(() => {
        if (showPreview) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [showPreview]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current || isFocused) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleDownload = () => {
        if (!resource.downloadURL) return;
        try {
            setDownloading(true);
            // Build a filename from the URL or fallback to the title
            let filename = resource.title;
            try {
                const urlParts = resource.downloadURL.split("/");
                const lastPart = urlParts[urlParts.length - 1];
                filename = decodeURIComponent(lastPart.split("?")[0]) || resource.title;
            } catch { /* keep title as filename */ }

            // Use a direct anchor link — the browser handles the download natively
            // with its own progress bar instead of buffering the entire file in JS memory.
            // Vercel Blob supports ?download=1 to force Content-Disposition: attachment.
            const separator = resource.downloadURL.includes("?") ? "&" : "?";
            const downloadUrl = `${resource.downloadURL}${separator}download=1`;

            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = filename;
            a.rel = "noopener noreferrer";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch {
            window.open(resource.downloadURL, "_blank");
        } finally {
            // Small delay so the button doesn't flash instantly
            setTimeout(() => setDownloading(false), 1000);
        }
    };

    return (
        <>
            <div
                ref={divRef}
                onMouseMove={handleMouseMove}
                onFocus={() => { setIsFocused(true); setOpacity(1); }}
                onBlur={() => { setIsFocused(false); setOpacity(0); }}
                onMouseEnter={() => setOpacity(1)}
                onMouseLeave={() => setOpacity(0)}
                className={`glass group relative overflow-hidden rounded-xl p-5 transition-all dark:bg-zinc-900/50 ${showPreview ? "" : "hover:-translate-y-1 hover:shadow-xl"}`}
            >
                {/* Spotlight */}
                <div
                    className="pointer-events-none absolute -inset-px z-0 opacity-0 transition duration-300"
                    style={{
                        opacity,
                        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${typeConfig.gradient}, transparent 40%)`,
                    }}
                />

                {/* Icon + Type Badge */}
                <div className="relative z-10 flex items-start justify-between">
                    <div className={`rounded-lg ${typeConfig.bg} p-3 ${typeConfig.color}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeConfig.badge}`}>
                        {resource.type}
                    </span>
                </div>

                {/* Content */}
                <div className="relative z-10 mt-4">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <span>{resource.branches ? resource.branches.join(", ") : resource.branch}</span>
                        <span>·</span>
                        <span>{resource.semester.replace(" Semester", "")}</span>
                    </div>
                    <h3 className={`line-clamp-2 text-lg font-semibold leading-tight text-foreground transition-colors ${typeConfig.hoverColor}`}>
                        {resource.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{resource.subject}</p>
                </div>

                {/* Relative Date */}
                <div className="relative z-10 mt-3">
                    <span className="text-xs text-muted-foreground/60">{relativeDate}</span>
                </div>

                {/* Actions */}
                <div className="relative z-10 mt-4 flex items-center gap-3">
                    <button
                        onClick={handleDownload}
                        disabled={downloading || !resource.downloadURL}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-foreground py-2 text-sm font-medium text-background transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                    >
                        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        {downloading ? "Downloading..." : "Download"}
                    </button>
                    <button
                        onClick={() => setShowPreview(true)}
                        disabled={!resource.downloadURL || !canPreview}
                        className="flex items-center justify-center rounded-lg border border-input bg-background/50 p-2 text-foreground transition-colors hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        title={canPreview ? "Preview Resource" : "Preview not available for this file type"}
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && resource.downloadURL && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="absolute inset-0" onClick={() => setShowPreview(false)} />
                    <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-white/5 bg-zinc-900/80 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className={`rounded-md p-2 ${typeConfig.bg} ${typeConfig.color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="line-clamp-1 font-semibold text-zinc-100">{resource.title}</h3>
                                    <p className="text-xs text-zinc-400">{resource.subject} · {resource.type}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="rounded-full bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 w-full bg-zinc-900/50 p-2 sm:p-4">
                            {canPreview ? (
                                <iframe
                                    src={resource.downloadURL}
                                    className="h-full w-full rounded-xl border border-white/5 bg-white"
                                    title={resource.title}
                                />
                            ) : (
                                /* Fallback for non-previewable files (DOCX, XLSX, etc.) */
                                <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-white/5 text-center">
                                    <div className="rounded-full bg-zinc-800 p-5">
                                        <AlertCircle className="h-10 w-10 text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-zinc-200">Preview not available</p>
                                        <p className="mt-1 text-sm text-zinc-500">
                                            This file type cannot be previewed in the browser.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleDownload}
                                        disabled={downloading}
                                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-70"
                                    >
                                        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                        {downloading ? "Downloading..." : "Download File"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
