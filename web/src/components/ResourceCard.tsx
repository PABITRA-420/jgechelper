import { FileText, Download, Eye } from "lucide-react";

interface ResourceProps {
    title: string;
    subject: string;
    semester: string;
    type: "Question Paper" | "Notes" | "Syllabus";
    branch: string;
    date: string;
    downloadURL?: string;
}

export function ResourceCard({ resource }: { resource: ResourceProps }) {
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
                <a
                    href={resource.downloadURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-foreground py-2 text-sm font-medium text-background transition-transform active:scale-95"
                >
                    <Download className="h-4 w-4" />
                    Download
                </a>
                <button className="flex items-center justify-center rounded-lg border border-input bg-background/50 p-2 text-foreground transition-colors hover:bg-secondary">
                    <Eye className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
