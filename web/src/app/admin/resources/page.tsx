"use client";

import { UploadForm } from "@/components/UploadForm";
import { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Eye, EyeOff, Trash2, FileText, ExternalLink, Edit2, ArrowUp, ArrowDown, RotateCcw, Archive, Search, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ConfirmModal";
import { getRelativeTime } from "@/lib/utils";

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
    createdAt?: { toMillis: () => number; toDate: () => Date };
    isDeleted?: boolean;
    deletedAt?: { toDate: () => Date };
};

// Branch color chips config
const BRANCH_COLORS: Record<string, string> = {
    CSE: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    IT: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20",
    ECE: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
    ME: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    EE: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20",
    CE: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
};



/* ─── Resource List ─── */
function ResourceList({ onEdit }: { onEdit: (resource: ResourceType) => void }) {
    const { user } = useAuth();
    const [resources, setResources] = useState<ResourceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title" | "subject" | "manual">("newest");
    const [viewTrash, setViewTrash] = useState(false);

    // Filter state — improvement #2
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBranch, setFilterBranch] = useState("All");
    const [filterType, setFilterType] = useState("All");

    // Confirm modal state — improvement #1
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        title: string;
        message: string;
        confirmLabel: string;
        confirmVariant: "danger" | "warning";
        onConfirm: () => void;
    }>({ open: false, title: "", message: "", confirmLabel: "", confirmVariant: "danger", onConfirm: () => {} });

    useEffect(() => {
        const q = query(collection(db, "resources"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResourceType));
            setResources(docs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const sortedResources = [...resources]
        .filter(r => viewTrash ? r.isDeleted === true : (r.isDeleted !== true))
        .filter(r => {
            if (filterBranch !== "All") {
                const hasBranch = r.branches?.includes(filterBranch) || r.branch === filterBranch;
                if (!hasBranch) return false;
            }
            if (filterType !== "All" && r.type !== filterType) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return (r.title || "").toLowerCase().includes(q) || (r.subject || "").toLowerCase().includes(q);
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "manual") {
                const orderA = a.orderSequence ?? Number.MAX_SAFE_INTEGER;
                const orderB = b.orderSequence ?? Number.MAX_SAFE_INTEGER;
                if (orderA !== orderB) return orderA - orderB;
                return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
            }
            if (sortBy === "newest") return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
            if (sortBy === "oldest") return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
            if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
            if (sortBy === "subject") return (a.subject || "").localeCompare(b.subject || "");
            return 0;
        });

    // — improvement #9: toast for visibility toggle
    const toggleVisibility = async (id: string, currentStatus?: boolean) => {
        try {
            const isHidden = currentStatus === false;
            await updateDoc(doc(db, "resources", id), { visible: isHidden });
            toast.success(isHidden ? "Resource is now visible to students" : "Resource hidden from students");
        } catch (err) {
            console.error("Error toggling visibility:", err);
            toast.error("Failed to update visibility");
        }
    };

    // — improvement #1: custom modal for trash
    const deleteResource = (id: string) => {
        setConfirmModal({
            open: true,
            title: "Move to Trash",
            message: "This resource will be hidden from students and moved to trash. You can restore it later.",
            confirmLabel: "Move to Trash",
            confirmVariant: "warning",
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, open: false }));
                try {
                    await updateDoc(doc(db, "resources", id), { isDeleted: true, deletedAt: serverTimestamp() });
                    toast.success("Resource moved to trash");
                } catch (err) {
                    console.error("Error moving resource to trash:", err);
                    toast.error("Failed to move resource to trash");
                }
            },
        });
    };

    const restoreResource = async (id: string) => {
        try {
            await updateDoc(doc(db, "resources", id), { isDeleted: false });
            toast.success("Resource restored");
        } catch (err) {
            console.error("Error restoring resource:", err);
            toast.error("Failed to restore resource");
        }
    };

    // — improvement #1: custom modal for hard delete
    const hardDeleteResource = (id: string, downloadURL?: string) => {
        setConfirmModal({
            open: true,
            title: "Permanently Delete",
            message: "This will permanently delete this resource from the database AND storage.\n\nThis action CANNOT be undone.",
            confirmLabel: "Delete Forever",
            confirmVariant: "danger",
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, open: false }));
                try {
                    const idToken = user ? await user.getIdToken(true) : "";
                    if (!idToken) {
                        toast.error("Security error: Could not retrieve fresh token. Please refresh.");
                        return;
                    }
                    const response = await fetch("/api/upload", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id, url: downloadURL, clientPayload: idToken }),
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || "Failed to permanently delete resource");
                    toast.success("Resource permanently deleted");
                } catch (err: unknown) {
                    console.error("Error permanently deleting resource:", err);
                    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
                    toast.error(`Delete failed: ${errorMessage}`);
                }
            },
        });
    };

    const moveUp = async (index: number) => {
        if (index === 0 || sortBy !== "manual") return;
        const current = sortedResources[index];
        const prev = sortedResources[index - 1];
        const currentOrder = current.orderSequence ?? index;
        const prevOrder = prev.orderSequence ?? (index - 1);
        try {
            await updateDoc(doc(db, "resources", current.id), { orderSequence: prevOrder });
            await updateDoc(doc(db, "resources", prev.id), { orderSequence: currentOrder });
        } catch (err) {
            console.error("Failed to move item up", err);
        }
    };

    const moveDown = async (index: number) => {
        if (index === sortedResources.length - 1 || sortBy !== "manual") return;
        const current = sortedResources[index];
        const next = sortedResources[index + 1];
        const currentOrder = current.orderSequence ?? index;
        const nextOrder = next.orderSequence ?? (index + 1);
        try {
            await updateDoc(doc(db, "resources", current.id), { orderSequence: nextOrder });
            await updateDoc(doc(db, "resources", next.id), { orderSequence: currentOrder });
        } catch (err) {
            console.error("Failed to move item down", err);
        }
    };

    if (loading) return <div className="text-center text-sm text-muted-foreground">Loading resources...</div>;

    return (
        <div className="space-y-4">
            {/* Confirm Modal */}
            <ConfirmModal
                open={confirmModal.open}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                confirmVariant={confirmModal.confirmVariant}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
            />

            {/* Controls Row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                    onClick={() => setViewTrash(!viewTrash)}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${viewTrash ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"}`}
                >
                    <Archive className="h-4 w-4" />
                    {viewTrash ? "View Active Resources" : "View Trash"}
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500 font-medium whitespace-nowrap">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                        disabled={viewTrash}
                    >
                        <option value="newest">Newest First (Default)</option>
                        <option value="oldest">Oldest First</option>
                        <option value="title">Title (A-Z)</option>
                        <option value="subject">Subject</option>
                        <option value="manual">Custom Order</option>
                    </select>
                </div>
            </div>

            {/* Filter Bar — improvement #2 */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/30">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by title or subject..."
                        className="w-full rounded-lg border-0 bg-white py-2 pl-10 pr-8 text-sm shadow-sm ring-1 ring-inset ring-zinc-200 focus:ring-2 focus:ring-blue-500 dark:bg-zinc-950 dark:ring-zinc-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
                <select
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                >
                    <option value="All">All Branches</option>
                    {["CSE", "IT", "ECE", "ME", "EE", "CE"].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                >
                    <option value="All">All Types</option>
                    {["Question Paper", "Notes", "Routine", "Others"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {/* Results count */}
            <p className="text-xs text-muted-foreground">
                {sortedResources.length} resource{sortedResources.length !== 1 ? "s" : ""}{" "}
                {(searchQuery || filterBranch !== "All" || filterType !== "All") && "(filtered)"}
            </p>

            {/* Resource List */}
            <div className="space-y-3">
                {sortedResources.map((resource, index) => (
                    <div key={resource.id} className="flex flex-col gap-4 rounded-lg border border-zinc-100 bg-zinc-50 p-4 transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            {/* Order Controls */}
                            {sortBy === "manual" && (
                                <div className="flex flex-col items-center gap-1 opacity-50 transition-opacity hover:opacity-100 sm:mr-2">
                                    <button onClick={() => moveUp(index)} disabled={index === 0} className="rounded bg-zinc-200 p-0.5 text-zinc-600 hover:bg-zinc-300 disabled:opacity-30 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700" title="Move Up">
                                        <ArrowUp className="h-3 w-3" />
                                    </button>
                                    <button onClick={() => moveDown(index)} disabled={index === sortedResources.length - 1} className="rounded bg-zinc-200 p-0.5 text-zinc-600 hover:bg-zinc-300 disabled:opacity-30 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700" title="Move Down">
                                        <ArrowDown className="h-3 w-3" />
                                    </button>
                                </div>
                            )}

                            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-medium">{resource.title}</p>
                                    {/* Status badge — improvement #3 */}
                                    {!viewTrash && (
                                        resource.visible === false ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                                                <EyeOff className="h-2.5 w-2.5" /> Hidden
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                                                <Eye className="h-2.5 w-2.5" /> Live
                                            </span>
                                        )
                                    )}
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                    {/* Colored branch chips — improvement #4 */}
                                    {(resource.branches || (resource.branch ? [resource.branch] : [])).map(b => (
                                        <span key={b} className={`rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${BRANCH_COLORS[b] || "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"}`}>
                                            {b}
                                        </span>
                                    ))}
                                    <span className="rounded bg-zinc-200 px-1.5 py-0.5 dark:bg-zinc-800">{resource.semester}</span>
                                    <span>· {resource.subject}</span>
                                    <span>· {resource.type || "Unknown"}</span>
                                </div>
                                {/* Trash date — improvement #8 */}
                                {viewTrash && resource.deletedAt && (
                                    <p className="mt-1 text-[11px] text-red-400 dark:text-red-500">
                                        Trashed {getRelativeTime(resource.deletedAt.toDate())}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button onClick={() => onEdit(resource)} className="rounded p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10" title="Edit Resource">
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <a href={resource.downloadURL} target="_blank" rel="noopener noreferrer" className="rounded p-2 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" title="View/Download">
                                <ExternalLink className="h-4 w-4" />
                            </a>

                            {!viewTrash && (
                                <button
                                    onClick={() => toggleVisibility(resource.id, resource.visible)}
                                    className={`rounded p-2 text-xs font-bold transition-colors ${resource.visible === false ? "bg-zinc-200 text-zinc-500" : "bg-green-100 text-green-600"}`}
                                    title={resource.visible === false ? "Show Resource" : "Hide Resource"}
                                >
                                    {resource.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            )}

                            {viewTrash ? (
                                <>
                                    <button onClick={() => restoreResource(resource.id)} className="rounded p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10" title="Restore Resource">
                                        <RotateCcw className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => hardDeleteResource(resource.id, resource.downloadURL)} className="rounded p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40" title="Permanently Delete">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => deleteResource(resource.id)} className="rounded p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10" title="Move to Trash">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {sortedResources.length === 0 && (
                    <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 text-center dark:border-zinc-800">
                        <p className="text-sm text-muted-foreground">
                            {viewTrash ? "Trash is empty." : (searchQuery || filterBranch !== "All" || filterType !== "All") ? "No resources match your filters." : "No resources uploaded yet."}
                        </p>
                        {(searchQuery || filterBranch !== "All" || filterType !== "All") && (
                            <button
                                onClick={() => { setSearchQuery(""); setFilterBranch("All"); setFilterType("All"); }}
                                className="mt-2 text-xs text-blue-500 hover:underline"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminResourcesPage() {
    const [editingResource, setEditingResource] = useState<ResourceType | null>(null);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Resources</h1>
                <p className="text-sm text-muted-foreground">Upload, manage, and audit study materials.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <UploadForm editingResource={editingResource} onClearEdit={() => setEditingResource(null)} />
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
                    <h3 className="mb-4 text-lg font-semibold">Manage Resources</h3>
                    <ResourceList onEdit={(res) => setEditingResource(res)} />
                </div>
            </div>
        </div>
    );
}
