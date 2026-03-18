"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { NoticeCard } from "@/components/NoticeCard";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BellOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Notice {
    id: number; // Keeping number to match interface, but real DB uses string. Handled in map.
    title: string;
    date: string;
    category: "General" | "Exam" | "Holiday" | "Urgent";
    description: string;
    priority?: "High" | "Normal";
    createdAt?: number;
    attachmentUrl?: string;
    attachmentName?: string;
}

export default function NoticesPage() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    // Protect Route
    useEffect(() => {
        if (!authLoading && (!user || !role)) {
            router.push("/login");
        }
    }, [user, role, authLoading, router]);

    useEffect(() => {
        async function fetchNotices() {
            try {
                const noticesRef = collection(db, "notices");
                // Filter where visible is not false (handle legacy docs without field as visible)
                // Firestore doesn't support "not equal" elegantly in simple queries, usually better to default true.
                // For simplicity: We will filter to only show ones where visible != false 
                // But Firestore query is cleaner if we just sort. Let's filter client side for legacy safety or complex sort logic.

                // Better approach: Query all, filter client side unless list is huge.
                const q = query(noticesRef, orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);

                const fetchedNotices = snapshot.docs
                    .map(doc => ({ ...doc.data(), id: doc.id }))
                    .filter((n: Record<string, unknown>) => n.visible !== false) // Default true if undefined
                    .map((data: Record<string, unknown>) => {
                        const createdAt = data.createdAt as { toDate: () => Date, toMillis: () => number } | undefined;
                        return {
                            id: data.id,
                            ...data,
                            date: createdAt?.toDate().toLocaleDateString() || "Unknown Date",
                            createdAt: createdAt?.toMillis() || 0,
                            category: data.category || "General",
                        }
                    }) as unknown as Notice[];

                setNotices(fetchedNotices);
            } catch (error) {
                console.error("Error fetching notices:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchNotices();
    }, []);

    return (
        <main className="min-h-screen bg-background pb-20">
            <Navbar />

            {/* Header */}
            <div className="bg-zinc-50 pt-32 pb-12 dark:bg-zinc-900/50">
                <div className="container px-4 md:px-6">
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Notice Board</h1>
                    <p className="mt-2 text-muted-foreground">Stay updated with the latest official announcements.</p>
                </div>
            </div>

            <div className="container mt-8 max-w-4xl px-4 md:px-6">
                <div className="flex flex-col gap-4">
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"></div>
                            ))}
                        </div>
                    ) : notices.length > 0 ? (
                        notices.map((notice) => (
                            <NoticeCard key={notice.id} notice={notice} />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                                <BellOff className="h-8 w-8 text-zinc-400 dark:text-zinc-600" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No notices yet</h3>
                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">We haven&apos;t published any official announcements yet. Check back later!</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
