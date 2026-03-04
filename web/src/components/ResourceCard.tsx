import { FileText, Download, Eye, Loader2 } from "lucide-react";
import { useState } from "react";

interface ResourceProps {
    title: string;
    subject: string;
    semester: string;
    type: "Question Paper" | "Notes" | "Routine" | "Others";
    branch: string;
    date: string;
    downloadURL?: string;
}

export function ResourceCard({ resource }: { resource: ResourceProps }) {
    const [downloading, setDownloading] = useState(false);

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
        <div className="glass group relative overflow-hidden rounded-xl p-5 transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900/50">
            <div className="flex items-start justify-between">
                <div className="rounded-lg bg-blue-500/10 p-3 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                    <FileText className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    {resource.semester}
                </span>
            </div>

            <div className="mt-4">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span>{resource.branch}</span>
                    <span>•</span>
                    <span>{resource.type}</span>
                </div>
                <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {resource.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{resource.subject}</p>
            </div>

            <div className="mt-6 flex items-center gap-3">
                <button
                    onClick={handleDownload}
                    disabled={downloading || !resource.downloadURL}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-foreground py-2 text-sm font-medium text-background transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                >
                    {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {downloading ? "Downloading..." : "Download"}
                </button>
                <a
                    href={resource.downloadURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-lg border border-input bg-background/50 p-2 text-foreground transition-colors hover:bg-secondary"
                    title="View Resource"
                >
                    <Eye className="h-4 w-4" />
                </a>
            </div>
        </div>
    );
}
