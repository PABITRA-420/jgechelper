"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { NoticeCard } from "@/components/NoticeCard";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BellOff, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const BATCH_SIZE = 10;

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
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

    // Ref for the infinite scroll sentinel
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Protect Route
    useEffect(() => {
        if (!authLoading && (!user || !role)) {
            router.push("/login");
        }
    }, [user, role, authLoading, router]);

    // Real-time listener (onSnapshot) — Feature #1
    useEffect(() => {
        const noticesRef = collection(db, "notices");
        const q = query(noticesRef, orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotices = snapshot.docs
                .map(doc => ({ ...doc.data(), id: doc.id }))
                .filter((n: Record<string, unknown>) => n.visible !== false && n.isDeleted !== true)
                .map((data: Record<string, unknown>) => {
                    const createdAt = data.createdAt as { toDate: () => Date; toMillis: () => number } | undefined;
                    return {
                        id: data.id,
                        ...data,
                        date: createdAt?.toDate().toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        }) || "Unknown Date",
                        createdAt: createdAt?.toMillis() || 0,
                        category: data.category || "General",
                    };
                }) as unknown as Notice[];

            setNotices(fetchedNotices);
            setLoading(false);
        }, (error) => {
            console.error("Error listening to notices:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Filter notices by category + search query
    const filteredNotices = useMemo(() => {
        let result = notices;

        // Category filter
        if (selectedCategory !== "All") {
            result = result.filter((n) => n.category === selectedCategory);
        }

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (n) =>
                    n.title.toLowerCase().includes(q) ||
                    n.description.toLowerCase().includes(q) ||
                    n.category.toLowerCase().includes(q)
            );
        }

        return result;
    }, [notices, searchQuery, selectedCategory]);

    // Visible slice for infinite scroll — Feature #5
    const visibleNotices = useMemo(
        () => filteredNotices.slice(0, visibleCount),
        [filteredNotices, visibleCount]
    );

    const hasMore = visibleCount < filteredNotices.length;

    // Handler functions that reset scroll when filters change
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setVisibleCount(BATCH_SIZE);
    };

    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        setVisibleCount(BATCH_SIZE);
    };

    // IntersectionObserver for infinite scroll — Feature #5
    const loadMore = useCallback(() => {
        setVisibleCount((prev) => prev + BATCH_SIZE);
    }, []);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMore();
                }
            },
            { rootMargin: "200px" }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loadMore]);

    return (
        <main className="min-h-screen bg-background pb-20">
            <Navbar />

            {/* Header */}
            <div className="bg-zinc-50 pt-32 pb-12 dark:bg-zinc-900/50">
                <div className="container px-4 md:px-6 max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Notice Board</h1>
                    <p className="mt-2 text-muted-foreground">Stay updated with the latest official announcements.</p>

                    {/* Search Bar — Feature #4 */}
                    <div className="relative mt-6">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <input
                            id="notice-search"
                            type="text"
                            placeholder="Search notices by title, description, or category..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => handleSearchChange("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                aria-label="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mt-8 max-w-4xl px-4 md:px-6 mx-auto">
                {/* Category Filter Tabs */}
                {!loading && notices.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        {["All", "General", "Exam", "Holiday", "Urgent"].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedCategory === cat
                                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Search results count */}
                {(searchQuery.trim() || selectedCategory !== "All") && !loading && (
                    <p className="mb-4 text-sm text-muted-foreground">
                        {filteredNotices.length} {filteredNotices.length === 1 ? "notice" : "notices"}
                        {searchQuery.trim() && <> for &ldquo;{searchQuery}&rdquo;</>}
                        {selectedCategory !== "All" && <> in {selectedCategory}</>}
                    </p>
                )}

                <div className="flex flex-col gap-4">
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} style={{ animationDelay: `${i * 100}ms` }} className="h-32 w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"></div>
                            ))}
                        </div>
                    ) : visibleNotices.length > 0 ? (
                        <motion.div 
                            variants={{
                                hidden: { opacity: 0 },
                                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                            }}
                            initial="hidden"
                            animate="show"
                            className="flex flex-col gap-4"
                        >
                            <AnimatePresence>
                                {visibleNotices.map((notice) => (
                                    <motion.div
                                        key={notice.id}
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                                        }}
                                    >
                                        <NoticeCard notice={notice} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Infinite scroll sentinel */}
                            {hasMore && (
                                <div ref={sentinelRef} className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    <span className="ml-2 text-sm text-muted-foreground">Loading more notices...</span>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900/50"
                        >
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                                <BellOff className="h-8 w-8 text-zinc-400 dark:text-zinc-600" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">
                                {searchQuery.trim() ? "No matching notices" : "No notices yet"}
                            </h3>
                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                {searchQuery.trim()
                                    ? "Try adjusting your search query."
                                    : "We haven\u0027t published any official announcements yet. Check back later!"}
                            </p>
                            {!searchQuery.trim() && role === "admin" && (
                                <button
                                    onClick={() => router.push('/admin/notices')}
                                    className="mt-6 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                                >
                                    Publish Notice
                                </button>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </main>
    );
}
