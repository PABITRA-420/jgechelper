"use client";

import { useState, useEffect } from "react";
import { Send, Trash2, Eye, EyeOff } from "lucide-react";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useRef } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Paperclip, X, FileText } from "lucide-react";

function NoticeForm() {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("General");
    const [desc, setDesc] = useState("");
    const [posting, setPosting] = useState(false);

    // File Upload State
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !desc) return;
        setPosting(true);
        try {
            let attachmentUrl = null;
            let attachmentName = null;

            if (file) {
                // Upload File to Vercel Blob via Next.js API
                const uploadResponse = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                    method: "POST",
                    body: file,
                });

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json();
                    throw new Error(errorData.error || "Failed to upload file");
                }

                const blob = await uploadResponse.json();
                attachmentUrl = blob.url;
                attachmentName = file.name;
            }

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
            setTitle("");
            setDesc("");
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            // alert("Notice posted!");
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to post notice");
        } finally {
            setPosting(false);
        }
    };

    return (
        <form className="space-y-4" onSubmit={handlePost}>
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
                <label className="mb-2 block text-sm font-medium">Description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Notice details..." className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>

            {/* Attachment Field */}
            <div>
                <label className="mb-2 block text-sm font-medium">Attachment (PDF/Image) - Optional</label>
                {!file ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to attach file</span>
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
                            <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                            className="text-muted-foreground hover:text-red-500"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            <button disabled={posting} className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900">
                <Send className="h-4 w-4" />
                {posting ? "Posting..." : "Post Notice"}
            </button>
        </form>
    );
}

function NoticeList() {
    const [notices, setNotices] = useState<any[]>([]);

    useEffect(() => {
        const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const toggleVisibility = async (id: string, currentStatus: boolean) => {
        try {
            // If visible is undefined, assume it is visible (so currentStatus would have been 'undefined' -> treated as falsy or truthy? Let's check logic)
            // Ideally explicit: if currently visible !== false, then it is visible.
            const isVisible = currentStatus !== false;
            await updateDoc(doc(db, "notices", id), { visible: !isVisible });
        } catch (err) {
            console.error(err);
        }
    }

    const deleteNotice = async (id: string) => {
        if (!confirm("Are you sure you want to delete this notice?")) return;
        try {
            await deleteDoc(doc(db, "notices", id));
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="space-y-3">
            {notices.map((notice) => (
                <div key={notice.id} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div>
                        <p className="font-medium">{notice.title}</p>
                        <p className="text-xs text-muted-foreground">{notice.category}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => toggleVisibility(notice.id, notice.visible)}
                            className={`rounded p-2 text-xs font-bold transition-colors ${notice.visible === false ? 'bg-zinc-200 text-zinc-500' : 'bg-green-100 text-green-600'}`}
                            title={notice.visible === false ? "Show Notice" : "Hide Notice"}
                        >
                            {notice.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                            onClick={() => deleteNotice(notice.id)}
                            className="rounded p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                            title="Delete Notice"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ))}
            {notices.length === 0 && <p className="text-sm text-muted-foreground">No notices found.</p>}
        </div>
    )
}

export default function AdminNoticesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Notices</h1>
                <p className="text-muted-foreground">Broadcast announcements to all students.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="mb-4 text-lg font-semibold">Post New Notice</h3>
                    <NoticeForm />
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="mb-4 text-lg font-semibold">Manage Notices</h3>
                    <NoticeList />
                </div>
            </div>
        </div>
    );
}
