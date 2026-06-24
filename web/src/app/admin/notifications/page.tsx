"use client";

import { useState, useEffect } from "react";
import { Send, Bell, Loader2, Users, Calendar, ArrowUpRight, History, Trash2 } from "lucide-react";
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { getRelativeTime } from "@/lib/utils";

type Announcement = {
    id: string;
    title: string;
    body: string;
    topic?: string;
    topics?: string[];
    link?: string;
    sentByName: string;
    sentAt?: { toDate: () => Date };
};

const BRANCHES = ["CSE", "IT", "ECE", "EE", "ME", "CE"];

export default function AdminNotificationsPage() {
    const { user } = useAuth();
    
    // Form state
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [targetType, setTargetType] = useState<"global" | "branch">("global");
    const [selectedBranch, setSelectedBranch] = useState("CSE");
    const [link, setLink] = useState("");
    const [sending, setSending] = useState(false);

    // History state
    const [history, setHistory] = useState<Announcement[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Fetch sent announcements history
    useEffect(() => {
        const q = query(
            collection(db, "announcements"),
            orderBy("sentAt", "desc"),
            limit(15)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setHistory(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Announcement)));
            setLoadingHistory(false);
        }, (err) => {
            console.error("Error fetching announcements:", err);
            setLoadingHistory(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement log?")) return;
        try {
            await deleteDoc(doc(db, "announcements", id));
            toast.success("Announcement log deleted.");
        } catch (err) {
            console.error("Failed to delete announcement log:", err);
            toast.error("Failed to delete log.");
        }
    };

    const handleClearHistory = async () => {
        if (!confirm("Are you sure you want to clear the entire broadcast history? This will delete all logged announcements from Firestore.")) return;
        try {
            const deletePromises = history.map(ann => deleteDoc(doc(db, "announcements", ann.id)));
            await Promise.all(deletePromises);
            toast.success("Broadcast history cleared.");
        } catch (err) {
            console.error("Failed to clear broadcast history:", err);
            toast.error("Failed to clear history.");
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !body.trim()) {
            toast.error("Title and body are required");
            return;
        }

        if (!user) {
            toast.error("You must be logged in as an admin");
            return;
        }

        setSending(true);
        try {
            const idToken = await user.getIdToken(true);
            const topic = targetType === "global" ? "global" : `branch_${selectedBranch}`;

            const response = await fetch("/api/notifications/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    title,
                    body,
                    topic,
                    link: link.trim() || null,
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to dispatch notification");
            }

            toast.success("Push notification dispatched successfully!");
            // Reset form
            setTitle("");
            setBody("");
            setLink("");
        } catch (err: unknown) {
            console.error("Error sending push notification:", err);
            toast.error((err as Error).message || "Failed to send notification.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Push Announcements</h1>
                <p className="text-sm text-muted-foreground">Broadcast customize notification alerts directly to students&apos; devices.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                {/* Send Announcement Form */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
                        <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <Bell className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-semibold">Compose Broadcast</h2>
                    </div>

                    <form onSubmit={handleSend} className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Target Audience</label>
                                <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-50 p-1 dark:bg-zinc-950">
                                    <button
                                        type="button"
                                        onClick={() => setTargetType("global")}
                                        className={`rounded-lg py-2 text-xs font-semibold transition-all ${targetType === "global" ? "bg-white text-foreground shadow-sm dark:bg-zinc-800" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        All Students
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTargetType("branch")}
                                        className={`rounded-lg py-2 text-xs font-semibold transition-all ${targetType === "branch" ? "bg-white text-foreground shadow-sm dark:bg-zinc-800" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        Specific Branch
                                    </button>
                                </div>
                            </div>

                            {targetType === "branch" && (
                                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                    <label className="mb-2 block text-sm font-medium">Select Branch</label>
                                    <select
                                        value={selectedBranch}
                                        onChange={(e) => setSelectedBranch(e.target.value)}
                                        className="w-full rounded-lg border border-input bg-background dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        {BRANCHES.map(b => (
                                            <option key={b} value={b} className="bg-white text-black dark:bg-zinc-900 dark:text-white">{b}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">Notification Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. CSE 4th Semester Results Published"
                                className="w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                maxLength={80}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">Message Body</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={4}
                                placeholder="Write description or announcement body here..."
                                className="w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                maxLength={240}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">Target URL / Redirect Link (Optional)</label>
                            <input
                                type="text"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="e.g. /resources?view=resources&branch=CSE or https://..."
                                className="w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <p className="mt-1.5 text-xs text-muted-foreground">Clicking the notification will open this specific path or page.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100 sm:w-auto sm:px-6"
                        >
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            {sending ? "Sending Announcement..." : "Send Announcement"}
                        </button>
                    </form>
                </div>

                {/* Sent History Log */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-zinc-100 p-2 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                <History className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-semibold">Broadcast History</h2>
                        </div>
                        {history.length > 0 && (
                            <button
                                onClick={handleClearHistory}
                                className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                        {loadingHistory ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="animate-pulse flex flex-col gap-2 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950/50">
                                    <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                                    <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                                    <div className="h-3 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                                </div>
                            ))
                        ) : history.length === 0 ? (
                            <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed text-center">
                                <p className="text-sm text-muted-foreground">No announcement logs found.</p>
                            </div>
                        ) : (
                            history.map((ann) => (
                                <div key={ann.id} className="relative flex flex-col gap-1.5 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 transition-all hover:bg-zinc-100 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/40">
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className="font-semibold text-sm line-clamp-1">{ann.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                                {ann.topic === "global" ? "Global" : ann.topic?.replace("branch_", "") || "Custom"}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(ann.id)}
                                                className="text-muted-foreground hover:text-red-500 rounded p-1 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
                                                title="Delete announcement"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{ann.body}</p>
                                    
                                    {ann.link && (
                                        <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:underline dark:text-blue-400">
                                            <span>Redirects to: {ann.link}</span>
                                            <ArrowUpRight className="h-3 w-3" />
                                        </div>
                                    )}

                                    <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-2 text-[10px] text-muted-foreground dark:border-zinc-800">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            Sent by {ann.sentByName}
                                        </span>
                                        <span suppressHydrationWarning className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {ann.sentAt ? getRelativeTime(ann.sentAt.toDate()) : "Just now"}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
