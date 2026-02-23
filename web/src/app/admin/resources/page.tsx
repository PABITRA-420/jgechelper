"use client";

import { UploadForm } from "@/components/UploadForm";
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Eye, EyeOff, Trash2, FileText, Download, ExternalLink } from "lucide-react";

function ResourceList() {
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Real-time listener for resources
        const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const toggleVisibility = async (id: string, currentStatus: boolean) => {
        try {
            // If explicit false -> currently hidden -> set to true (show)
            // If undefined or true -> currently visible -> set to false (hide)
            const isHidden = currentStatus === false;
            await updateDoc(doc(db, "resources", id), { visible: isHidden }); // If hidden, make visible (true). If visible, make hidden (false).
        } catch (err) {
            console.error("Error toggling visibility:", err);
            alert("Failed to update status");
        }
    }

    const deleteResource = async (id: string) => {
        if (!confirm("Are you sure you want to delete this resource? This cannot be undone.")) return;
        try {
            await deleteDoc(doc(db, "resources", id));
            // Note: In a real app, you should also delete the file from Storage using the downloadURL or file path reference.
            // For now, we just delete the metadata record.
        } catch (err) {
            console.error("Error deleting resource:", err);
            alert("Failed to delete resource");
        }
    }

    if (loading) return <div className="text-center text-sm text-muted-foreground">Loading resources...</div>;

    return (
        <div className="space-y-3">
            {resources.map((resource) => (
                <div key={resource.id} className="flex flex-col gap-4 rounded-lg border border-zinc-100 bg-zinc-50 p-4 transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium">{resource.title}</p>
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <span className="rounded bg-zinc-200 px-1.5 py-0.5 dark:bg-zinc-800">{resource.branch}</span>
                                <span className="rounded bg-zinc-200 px-1.5 py-0.5 dark:bg-zinc-800">{resource.semester}</span>
                                <span>• {resource.subject}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <a
                            href={resource.downloadURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-2 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            title="View/Download PDF"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>

                        <button
                            onClick={() => toggleVisibility(resource.id, resource.visible)}
                            className={`rounded p-2 text-xs font-bold transition-colors ${resource.visible === false ? 'bg-zinc-200 text-zinc-500' : 'bg-green-100 text-green-600'}`}
                            title={resource.visible === false ? "Show Resource" : "Hide Resource"}
                        >
                            {resource.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>

                        <button
                            onClick={() => deleteResource(resource.id)}
                            className="rounded p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                            title="Delete Resource"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ))}
            {resources.length === 0 && (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 text-center dark:border-zinc-800">
                    <p className="text-sm text-muted-foreground">No resources uploaded yet.</p>
                </div>
            )}
        </div>
    )
}

export default function AdminResourcesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
                <p className="text-muted-foreground">Upload, manage, and audit study materials.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <UploadForm />
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
                    <h3 className="mb-4 text-lg font-semibold">Manage Resources</h3>
                    <ResourceList />
                </div>
            </div>
        </div>
    );
}
