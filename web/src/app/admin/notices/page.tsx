"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Trash2, Eye, EyeOff, Edit2, X, FileText, UploadCloud, RotateCcw, Archive, Search } from "lucide-react";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ConfirmModal";

const DESC_MAX_LENGTH = 500;

type EditNoticeType = {
    id: string;
    title: string;
    category: string;
    description: string;
    visible?: boolean;
    isDeleted?: boolean;
    attachmentUrl?: string | null;
    attachmentName?: string | null;
};

// ─── Notice Form ─────────────────────────────────────────────────────────────
function NoticeForm({ editingNotice, onClearEdit }: { editingNotice: EditNoticeType | null, onClearEdit: () => void }) {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("General");
    const [desc, setDesc] = useState("");
    const [posting, setPosting] = useState(false);
    const [sendNotification, setSendNotification] = useState(true);

    // File Upload State
    const [file, setFile] = useState<File | null>(null);
    const [existingAttachment, setExistingAttachment] = useState<{ url: string | null, name: string | null }>({ url: null, name: null });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        if (editingNotice) {
            setTitle(editingNotice.title);
            setCategory(editingNotice.category);
            setDesc(editingNotice.description);
            setExistingAttachment({ url: editingNotice.attachmentUrl || null, name: editingNotice.attachmentName || null });
            setFile(null);
        } else {
            setTitle("");
            setCategory("General");
            setDesc("");
            setExistingAttachment({ url: null, name: null });
            setFile(null);
        }
    }, [editingNotice]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setExistingAttachment({ url: null, name: null }); // Clear existing if new is selected
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setExistingAttachment({ url: null, name: null });
        }
    };

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !desc) return;
        setPosting(true);
        try {
            let attachmentUrl = existingAttachment.url;
            let attachmentName = existingAttachment.name;

            if (file) {
                // Upload File to Vercel Blob via Next.js API
                const uploadResponse = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                    method: "POST",
                    body: file,
                    headers: {
                        'x-upload-secret': process.env.NEXT_PUBLIC_UPLOAD_SECRET || '',
                    },
                });

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json();
                    throw new Error(errorData.error || "Failed to upload file");
                }

                const blob = await uploadResponse.json();
                attachmentUrl = blob.url;
                attachmentName = file.name;
            }

            if (editingNotice) {
                // Update existing notice
                await updateDoc(doc(db, "notices", editingNotice.id), {
                    title,
                    category,
                    description: desc,
                    priority: category === 'Urgent' ? 'High' : 'Normal',
                    attachmentUrl: attachmentUrl,
                    attachmentName: attachmentName,
                    // DO NOT update createdAt so new tag logic remains accurate
                });
                toast.success("Notice updated successfully!");
                onClearEdit();
            } else {
                // Create new notice
                await addDoc(collection(db, "notices"), {
                    title,
                    category,
                    description: desc,
                    createdAt: serverTimestamp(),
                    priority: category === 'Urgent' ? 'High' : 'Normal',
                    visible: true,
                    attachmentUrl: attachmentUrl, // Optional PDF
                    attachmentName: attachmentName
                });

                // Push Notification
                if (sendNotification) {
                    try {
                        const idToken = user ? await user.getIdToken(true) : '';
                        if (idToken) {
                            await fetch("/api/notifications/send", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${idToken}`
                                },
                                body: JSON.stringify({
                                    title: `${category} Notice: ${title}`,
                                    body: desc.substring(0, 150) + (desc.length > 150 ? "..." : ""),
                                    topic: "global",
                                    link: "/notices",
                                })
                            });
                        }
                    } catch (err) {
                        console.error("FCM notice notification dispatch failed:", err);
                    }
                }

                setTitle("");
                setDesc("");
                setCategory("General");
                setFile(null);
                setExistingAttachment({ url: null, name: null });
                if (fileInputRef.current) fileInputRef.current.value = "";
                toast.success("Notice posted successfully!");
            }
        } catch (err) {
            console.error("Upload failed", err);
            toast.error("Failed to save notice. Please try again.");
        } finally {
            setPosting(false);
        }
    };

    const descCharCount = desc.length;
    const isOverLimit = descCharCount > DESC_MAX_LENGTH;

    return (
        <form className="space-y-4" onSubmit={handlePost}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{editingNotice ? "Edit Notice" : "Post New Notice"}</h3>
                {editingNotice && (
                    <button type="button" onClick={onClearEdit} className="text-sm text-muted-foreground hover:text-foreground">
                        Cancel Edit
                    </button>
                )}
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium">Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="Notice Title" className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-lg border border-input bg-background dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option className="bg-white text-black dark:bg-zinc-900 dark:text-white">General</option>
                    <option className="bg-white text-black dark:bg-zinc-900 dark:text-white">Urgent</option>
                    <option className="bg-white text-black dark:bg-zinc-900 dark:text-white">Holiday</option>
                    <option className="bg-white text-black dark:bg-zinc-900 dark:text-white">Exam</option>
                </select>
            </div>
            <div>
                <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium">Description</label>
                    <span className={`text-xs font-medium ${isOverLimit ? "text-red-500" : descCharCount > DESC_MAX_LENGTH * 0.8 ? "text-amber-500" : "text-muted-foreground"}`}>
                        {descCharCount}/{DESC_MAX_LENGTH}
                    </span>
                </div>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Notice details..." className={`w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isOverLimit ? "border-red-500 focus:ring-red-500/20" : "border-input"}`} />
                {isOverLimit && (
                    <p className="mt-1 text-xs text-red-500">Description exceeds {DESC_MAX_LENGTH} characters. Please shorten it.</p>
                )}
            </div>

            {/* Attachment Field */}
            <div>
                <label className="mb-2 block text-sm font-medium">Attachment (PDF/Image) - Optional</label>
                {!file && !existingAttachment.url ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-all duration-200 ease-in-out ${dragActive
                            ? "border-blue-500 bg-blue-50/80 scale-[1.01] shadow-sm dark:border-blue-500 dark:bg-blue-500/10"
                            : "border-zinc-300 bg-zinc-50/50 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/80"
                            }`}
                    >
                        <div className="rounded-full bg-zinc-100 p-2 shadow-sm dark:bg-zinc-800/80">
                            <UploadCloud className={`h-5 w-5 ${dragActive ? "text-blue-500" : "text-zinc-500 dark:text-zinc-400"}`} />
                        </div>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Click to attach file</span>
                        <span className="text-xs text-muted-foreground">or drag and drop</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium truncate max-w-[200px]">{file ? file.name : existingAttachment.name}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setFile(null); setExistingAttachment({ url: null, name: null }); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                            className="text-muted-foreground hover:text-red-500"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {!editingNotice && (
                <div className="flex items-center gap-2 mt-2 select-none">
                    <input
                        id="sendNoticeNotification"
                        type="checkbox"
                        checked={sendNotification}
                        onChange={(e) => setSendNotification(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500/20 dark:text-white"
                    />
                    <label htmlFor="sendNoticeNotification" className="text-xs font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer">
                        Send push notification alert to all students
                    </label>
                </div>
            )}

            <button disabled={posting || isOverLimit} className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto dark:bg-zinc-100 dark:text-zinc-900">
                <Send className="h-4 w-4" />
                {posting ? (editingNotice ? "Updating..." : "Posting...") : (editingNotice ? "Update Notice" : "Post Notice")}
            </button>
        </form>
    );
}

// ─── Notice List ─────────────────────────────────────────────────────────────
function NoticeList({ onEdit }: { onEdit: (notice: EditNoticeType) => void }) {
    const { user } = useAuth();
    const [notices, setNotices] = useState<EditNoticeType[]>([]);
    const [viewTrash, setViewTrash] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");

    // Confirm modal state
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        title: string;
        message: string;
        confirmLabel: string;
        confirmVariant: "danger" | "warning";
        onConfirm: () => void;
    }>({ open: false, title: "", message: "", confirmLabel: "", confirmVariant: "danger", onConfirm: () => {} });

    const closeModal = () => setConfirmModal(prev => ({ ...prev, open: false }));

    useEffect(() => {
        const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EditNoticeType)));
        });
        return () => unsubscribe();
    }, []);

    const filteredNotices = notices
        .filter(n => viewTrash ? n.isDeleted === true : n.isDeleted !== true)
        .filter(n => {
            if (filterCategory !== "All" && n.category !== filterCategory) return false;
            if (searchQuery) return (n.title || "").toLowerCase().includes(searchQuery.toLowerCase());
            return true;
        });

    const toggleVisibility = async (id: string, currentStatus?: boolean) => {
        try {
            const isVisible = currentStatus !== false;
            await updateDoc(doc(db, "notices", id), { visible: !isVisible });
            toast.success(isVisible ? "Notice hidden" : "Notice visible");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update visibility.");
        }
    }

    // Soft-delete: move to trash (with modal)
    const trashNotice = (id: string) => {
        setConfirmModal({
            open: true,
            title: "Move to Trash",
            message: "This notice will be moved to trash. You can restore it later from the trash view.",
            confirmLabel: "Move to Trash",
            confirmVariant: "warning",
            onConfirm: async () => {
                closeModal();
                try {
                    await updateDoc(doc(db, "notices", id), { isDeleted: true });
                    toast.success("Notice moved to trash.");
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to move notice to trash.");
                }
            },
        });
    }

    // Restore from trash
    const restoreNotice = async (id: string) => {
        try {
            await updateDoc(doc(db, "notices", id), { isDeleted: false });
            toast.success("Notice restored successfully.");
        } catch (err) {
            console.error(err);
            toast.error("Failed to restore notice.");
        }
    }

    // Permanent delete (only from trash, with modal) — also cleans up storage
    const permanentDeleteNotice = (id: string, attachmentUrl?: string | null) => {
        setConfirmModal({
            open: true,
            title: "Permanently Delete",
            message: "This will permanently delete this notice and its attachment from storage. This action cannot be undone.",
            confirmLabel: "Delete Forever",
            confirmVariant: "danger",
            onConfirm: async () => {
                closeModal();
                try {
                    // Delete attachment from Vercel Blob storage if it exists
                    if (attachmentUrl) {
                        try {
                            const idToken = user ? await user.getIdToken(true) : "";
                            if (!idToken) {
                                toast.error("Security error: Could not retrieve fresh token. Please refresh.");
                                return;
                            }
                            await fetch("/api/upload", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ url: attachmentUrl, clientPayload: idToken }),
                            });
                        } catch {
                            // Non-critical: continue with doc deletion even if blob delete fails
                            console.error("Failed to delete attachment blob, continuing with doc deletion.");
                        }
                    }
                    await deleteDoc(doc(db, "notices", id));
                    toast.success("Notice permanently deleted.");
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to permanently delete notice.");
                }
            },
        });
    }

    return (
        <div className="space-y-3">
            <ConfirmModal
                open={confirmModal.open}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                confirmVariant={confirmModal.confirmVariant}
                onConfirm={confirmModal.onConfirm}
                onCancel={closeModal}
            />

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Manage Notices</h3>
                <button
                    onClick={() => setViewTrash(!viewTrash)}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${viewTrash ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
                >
                    <Archive className="h-4 w-4" />
                    {viewTrash ? 'View Active' : 'View Trash'}
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text" placeholder="Search notices..."
                        className="w-full rounded-lg border-0 bg-zinc-50 py-2 pl-10 pr-8 text-sm ring-1 ring-inset ring-zinc-200 focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800/50 dark:ring-zinc-700"
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400">
                    <option value="All">All Categories</option>
                    {["General", "Urgent", "Holiday", "Exam"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <p className="text-xs text-muted-foreground">
                {filteredNotices.length} notice{filteredNotices.length !== 1 ? 's' : ''}
                {(searchQuery || filterCategory !== 'All') && ' (filtered)'}
            </p>

            {filteredNotices.map((notice) => (
                <div key={notice.id} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div>
                        <p className="font-medium">{notice.title}</p>
                        <p className="text-xs text-muted-foreground">{notice.category}</p>
                    </div>
                    <div className="flex gap-2">
                        {viewTrash ? (
                            /* Trash view: Restore + Permanent Delete */
                            <>
                                <button
                                    onClick={() => restoreNotice(notice.id)}
                                    className="rounded p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10"
                                    title="Restore Notice"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => permanentDeleteNotice(notice.id, notice.attachmentUrl)}
                                    className="rounded p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                                    title="Permanently Delete (Cannot be undone)"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </>
                        ) : (
                            /* Active view: Edit + Visibility + Trash */
                            <>
                                <button
                                    onClick={() => onEdit(notice)}
                                    className="rounded p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                                    title="Edit Notice"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => toggleVisibility(notice.id, notice.visible)}
                                    className={`rounded p-2 text-xs font-bold transition-colors ${notice.visible === false ? 'bg-zinc-200 text-zinc-500' : 'bg-green-100 text-green-600'}`}
                                    title={notice.visible === false ? "Show Notice" : "Hide Notice"}
                                >
                                    {notice.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                                <button
                                    onClick={() => trashNotice(notice.id)}
                                    className="rounded p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                                    title="Move to Trash"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}

            {filteredNotices.length === 0 && (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 text-center dark:border-zinc-800">
                    <p className="text-sm text-muted-foreground">{viewTrash ? "Trash is empty." : "No notices found."}</p>
                </div>
            )}
        </div>
    )
}

// ─── Admin Page ──────────────────────────────────────────────────────────────
export default function AdminNoticesPage() {
    const [editingNotice, setEditingNotice] = useState<EditNoticeType | null>(null);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notices</h1>
                <p className="text-sm text-muted-foreground">Broadcast announcements to all students.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <NoticeForm editingNotice={editingNotice} onClearEdit={() => setEditingNotice(null)} />
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <NoticeList onEdit={(notice) => setEditingNotice(notice)} />
                </div>
            </div>
        </div>
    );
}
