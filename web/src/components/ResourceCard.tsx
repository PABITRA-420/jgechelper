import { FileText, Download, Eye, Loader2, X } from "lucide-react";
import { useState, useRef } from "react";

interface ResourceProps {
    title: string;
    subject: string;
    semester: string;
    type: "Question Paper" | "Notes" | "Routine" | "Others";
    branch?: string;
    branches?: string[];
    date: string;
    downloadURL?: string;
}

export function ResourceCard({ resource }: { resource: ResourceProps }) {
    const [downloading, setDownloading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

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

    const handleDownload = async () => {
        if (!resource.downloadURL) return;

        try {
            setDownloading(true);
            const response = await fetch(resource.downloadURL);
            const blob = await response.blob();

            // Create a temporary link to trigger the download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            // Extract filename from URL or use a fallback
            let filename = resource.title;
            try {
                const urlParts = resource.downloadURL.split('/');
                const lastPart = urlParts[urlParts.length - 1];
                // Clean up any query parameters from the filename
                filename = decodeURIComponent(lastPart.split('?')[0]) || resource.title;
            } catch (e) {
                console.error("Could not parse filename", e);
            }
            // Add correct extension if it doesn't have one
            if (!filename.includes('.')) {
                const mimeExtMap: Record<string, string> = {
                    'application/pdf': '.pdf',
                    'image/jpeg': '.jpg',
                    'image/png': '.png',
                    'image/webp': '.webp',
                    'application/msword': '.doc',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
                    'application/vnd.ms-excel': '.xls',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
                    'text/plain': '.txt'
                };
                const ext = mimeExtMap[blob.type] || '';
                filename += ext;
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed", error);
            // Fallback to opening in new tab if direct download fails due to CORS
            window.open(resource.downloadURL, '_blank');
        } finally {
            setDownloading(false);
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
            className={`glass group relative overflow-hidden rounded-xl p-5 transition-all dark:bg-zinc-900/50 ${showPreview ? '' : 'hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-blue-900/10'}`}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-0"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`,
                }}
            />
            <div className="relative z-10 flex items-start justify-between">
                <div className="rounded-lg bg-blue-500/10 p-3 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                    <FileText className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    {resource.semester}
                </span>
            </div>

            <div className="relative z-10 mt-4">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span>{resource.branches ? resource.branches.join(', ') : resource.branch}</span>
                    <span>•</span>
                    <span>{resource.type}</span>
                </div>
                <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {resource.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{resource.subject}</p>
            </div>

            <div className="relative z-10 mt-6 flex items-center gap-3">
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
                    disabled={!resource.downloadURL}
                    className="flex items-center justify-center rounded-lg border border-input bg-background/50 p-2 text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                    title="Preview Resource"
                >
                    <Eye className="h-4 w-4" />
                </button>
            </div>
        </div>

        {/* Preview Modal */}
        {showPreview && resource.downloadURL && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                {/* Backdrop Click */}
                <div className="absolute inset-0" onClick={() => setShowPreview(false)} />
                
                <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/5 bg-zinc-900/80 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-md bg-blue-500/20 p-2 text-blue-400">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-100 line-clamp-1">{resource.title}</h3>
                                <p className="text-xs text-zinc-400">{resource.subject} • {resource.type}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowPreview(false)}
                            className="rounded-full bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* IFrame Content */}
                    <div className="flex-1 w-full bg-zinc-900/50 p-2 sm:p-4">
                        <iframe 
                            src={resource.downloadURL} 
                            className="h-full w-full rounded-xl border border-white/5 bg-white"
                            title={resource.title}
                        />
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
