"use client";

import { UploadForm } from "@/components/UploadForm";
import { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Eye, EyeOff, Trash2, FileText, ExternalLink, Edit2, ArrowUp, ArrowDown } from "lucide-react";

type ResourceType = {
    id: string;
    title: string;
    branch?: string;
    branches?: string[];
    semester?: string;
    subject?: string;
    type?: string;
    downloadURL?: string;
    visible?: boolean;
    orderSequence?: number;
    createdAt?: { toMillis: () => number };
};

function ResourceList({ onEdit }: { onEdit: (resource: ResourceType) => void }) {
    const [resources, setResources] = useState<ResourceType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all and sort client-side by orderSequence (asc), then by createdAt (desc)
        const q = query(collection(db, "resources"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResourceType));

            docs.sort((a: ResourceType, b: ResourceType) => {
                const orderA = a.orderSequence ?? Number.MAX_SAFE_INTEGER;
                const orderB = b.orderSequence ?? Number.MAX_SAFE_INTEGER;
                if (orderA !== orderB) return orderA - orderB;
                const timeA = a.createdAt?.toMillis() || 0;
                const timeB = b.createdAt?.toMillis() || 0;
                return timeB - timeA; // Descending time
            });

            setResources(docs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const toggleVisibility = async (id: string, currentStatus?: boolean) => {
        try {
            const isHidden = currentStatus === false;
            await updateDoc(doc(db, "resources", id), { visible: isHidden });
        } catch (err) {
            console.error("Error toggling visibility:", err);
            alert("Failed to update status");
        }
    }

    const deleteResource = async (id: string) => {
        if (!confirm("Are you sure you want to delete this resource? This cannot be undone.")) return;
        try {
            await deleteDoc(doc(db, "resources", id));
        } catch (err) {
            console.error("Error deleting resource:", err);
            alert("Failed to delete resource");
        }
    }

    const moveUp = async (index: number) => {
        if (index === 0) return;
        const current = resources[index];
        const prev = resources[index - 1];

        const currentOrder = current.orderSequence ?? index;
        const prevOrder = prev.orderSequence ?? (index - 1);

        try {
            await updateDoc(doc(db, "resources", current.id), { orderSequence: prevOrder });
            await updateDoc(doc(db, "resources", prev.id), { orderSequence: currentOrder });
        } catch (err) {
            console.error("Failed to move item up", err);
        }
    }

    const moveDown = async (index: number) => {
        if (index === resources.length - 1) return;
        const current = resources[index];
        const next = resources[index + 1];

        const currentOrder = current.orderSequence ?? index;
        const nextOrder = next.orderSequence ?? (index + 1);

        try {
            await updateDoc(doc(db, "resources", current.id), { orderSequence: nextOrder });
            await updateDoc(doc(db, "resources", next.id), { orderSequence: currentOrder });
        } catch (err) {
            console.error("Failed to move item down", err);
        }
    }

    if (loading) return <div className="text-center text-sm text-muted-foreground">Loading resources...</div>;

    return (
        <div className="space-y-3">
            {resources.map((resource, index) => (
                <div key={resource.id} className="flex flex-col gap-4 rounded-lg border border-zinc-100 bg-zinc-50 p-4 transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        {/* Order Controls */}
                        <div className="flex flex-col items-center gap-1 opacity-50 transition-opacity hover:opacity-100 sm:mr-2">
                            <button
                                onClick={() => moveUp(index)}
                                disabled={index === 0}
                                className="rounded bg-zinc-200 p-0.5 text-zinc-600 hover:bg-zinc-300 disabled:opacity-30 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                                title="Move Up"
                            >
                                <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                                onClick={() => moveDown(index)}
                                disabled={index === resources.length - 1}
                                className="rounded bg-zinc-200 p-0.5 text-zinc-600 hover:bg-zinc-300 disabled:opacity-30 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                                title="Move Down"
                            >
                                <ArrowDown className="h-3 w-3" />
                            </button>
                        </div>

                        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium">{resource.title}</p>
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <span className="rounded bg-zinc-200 px-1.5 py-0.5 dark:bg-zinc-800">{resource.branches ? resource.branches.join(', ') : resource.branch}</span>
                                <span className="rounded bg-zinc-200 px-1.5 py-0.5 dark:bg-zinc-800">{resource.semester}</span>
                                <span>• {resource.subject}</span>
                                <span>• {resource.type || "Unknown"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                            onClick={() => onEdit(resource)}
                            className="rounded p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                            title="Edit Resource"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>

                        <a
                            href={resource.downloadURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-2 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            title="View/Download Document"
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
    const [editingResource, setEditingResource] = useState<ResourceType | null>(null);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
                <p className="text-muted-foreground">Upload, manage, and audit study materials.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <UploadForm editingResource={editingResource} onClearEdit={() => setEditingResource(null)} />
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
                    <h3 className="mb-4 text-lg font-semibold">Manage Resources</h3>
                    <ResourceList onEdit={(res) => setEditingResource(res)} />
                </div>
            </div>
        </div>
    );
}
