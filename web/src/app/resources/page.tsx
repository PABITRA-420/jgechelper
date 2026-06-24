"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { ResourceCard } from "@/components/ResourceCard";
import { Search, ChevronRight, BookOpen, Loader2, X, Home } from "lucide-react";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Resource {
    id: string;
    title: string;
    subject: string;
    semester: string;
    type: "Question Paper" | "Notes" | "Routine" | "Others";
    branch?: string;
    branches?: string[];
    date: string;
    downloadURL?: string;
    createdAt: { toDate: () => Date; toMillis: () => number };
    visible?: boolean;
    orderSequence?: number;
    isDeleted?: boolean;
}

const BRANCHES = [
    { id: "CSE", name: "Computer Science", icon: "💻" },
    { id: "IT", name: "Information Tech", icon: "🌐" },
    { id: "ECE", name: "Electronics & Comm", icon: "📡" },
    { id: "ME", name: "Mechanical Eng", icon: "⚙️" },
    { id: "EE", name: "Electrical Eng", icon: "⚡" },
    { id: "CE", name: "Civil Engineering", icon: "🏗️" },
];

const SEMESTERS = [
    "1st Semester", "2nd Semester", "3rd Semester", "4th Semester",
    "5th Semester", "6th Semester", "7th Semester", "8th Semester",
];

const TYPE_FILTERS = ["All", "Question Paper", "Notes", "Routine", "Others"];

export default function ResourcesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>}>
            <ResourcesContent />
        </Suspense>
    );
}

function ResourcesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const view = (searchParams.get("view") as "branches" | "semesters" | "resources") || "branches";
    const selectedBranch = searchParams.get("branch");
    const selectedSemester = searchParams.get("semester");

    const [selectedType, setSelectedType] = useState<string>("All");
    const { user, role, loading: authLoading } = useAuth();
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Semester resource counts (for badge on semester cards)
    const [semesterCounts, setSemesterCounts] = useState<Record<string, number>>({});
    const [countsLoading, setCountsLoading] = useState(false);

    // Protect Route
    useEffect(() => {
        if (!authLoading && (!user || !role)) {
            router.push("/login");
        }
    }, [user, role, authLoading, router]);

    // Reset filters when view or branch/semester changes
    useEffect(() => {
        setSelectedType("All");
        setSearchQuery("");
    }, [view, selectedBranch, selectedSemester]);

    // Fetch semester counts when on semesters view (filtered by branch to avoid fetching entire collection)
    useEffect(() => {
        if (view !== "semesters" || !selectedBranch || !role) return;
        setCountsLoading(true);
        const q = query(
            collection(db, "resources"),
            where("branches", "array-contains", selectedBranch)
        );
        const unsub = onSnapshot(q, (snap) => {
            const counts: Record<string, number> = {};
            snap.docs.forEach((doc) => {
                const data = doc.data();
                if (data.isDeleted === true || data.visible === false) return;
                const sem: string = data.semester || "";
                counts[sem] = (counts[sem] || 0) + 1;
            });
            setSemesterCounts(counts);
            setCountsLoading(false);
        });
        return () => unsub();
    }, [view, selectedBranch, role]);

    // Fetch resources when on resources view
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        if (view === "resources" && selectedBranch && selectedSemester && role) {
            setLoading(true);
            const q = query(collection(db, "resources"), where("semester", "==", selectedSemester));
            unsubscribe = onSnapshot(q, (snapshot) => {
                const fetched = (snapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                        date: doc.data().createdAt?.toDate().toLocaleDateString() || "Unknown Date",
                    })) as Resource[])
                    .filter((res) => res.isDeleted !== true)
                    .filter((res) => {
                        if (res.branches && Array.isArray(res.branches)) return res.branches.includes(selectedBranch!);
                        return res.branch === selectedBranch;
                    })
                    .filter((res) => res.visible !== false)
                    .sort((a, b) => {
                        const orderA = a.orderSequence ?? Number.MAX_SAFE_INTEGER;
                        const orderB = b.orderSequence ?? Number.MAX_SAFE_INTEGER;
                        if (orderA !== orderB) return orderA - orderB;
                        return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
                    });
                setResources(fetched);
                setLoading(false);
            }, () => setLoading(false));
        }
        return () => { if (unsubscribe) unsubscribe(); };
    }, [view, selectedBranch, selectedSemester, role]);

    const handleBranchSelect = (branchId: string) => router.push(`?view=semesters&branch=${branchId}`);
    const handleSemesterSelect = (semester: string) => router.push(`?view=resources&branch=${selectedBranch}&semester=${semester}`);

    // Filtered resources
    const typeFilteredResources = resources.filter((r) => selectedType === "All" || r.type === selectedType);
    const filteredResources = typeFilteredResources.filter((r) =>
        (r.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.subject || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Count per type for badges
    const typeCounts = TYPE_FILTERS.reduce<Record<string, number>>((acc, t) => {
        acc[t] = t === "All" ? resources.length : resources.filter((r) => r.type === t).length;
        return acc;
    }, {});

    const branchLabel = BRANCHES.find((b) => b.id === selectedBranch)?.name ?? selectedBranch;

    return (
        <main className="min-h-screen bg-background pb-20">
            <Navbar />

            {/* Header */}
            <div className="bg-zinc-50 pt-32 pb-12 dark:bg-zinc-900/50">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col gap-4">

                        {/* Breadcrumb Trail — improvement #6 */}
                        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
                            <button
                                onClick={() => router.push("?view=branches")}
                                className="flex items-center gap-1 hover:text-foreground transition-colors"
                            >
                                <Home className="h-3.5 w-3.5" />
                                <span>Departments</span>
                            </button>
                            {(view === "semesters" || view === "resources") && (
                                <>
                                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                                    <button
                                        onClick={() => router.push(`?view=semesters&branch=${selectedBranch}`)}
                                        className={`hover:text-foreground transition-colors ${view === "semesters" ? "font-semibold text-foreground" : ""}`}
                                    >
                                        {branchLabel}
                                    </button>
                                </>
                            )}
                            {view === "resources" && (
                                <>
                                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span className="font-semibold text-foreground">{selectedSemester}</span>
                                </>
                            )}
                        </nav>

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                                {view === "branches" && "Select Department"}
                                {view === "semesters" && `${branchLabel}`}
                                {view === "resources" && "Resources"}
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                {view === "branches" && "Choose your engineering branch to proceed."}
                                {view === "semesters" && "Select your current semester to view materials."}
                                {view === "resources" && `${selectedBranch} · ${selectedSemester}`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mt-8 px-4 md:px-6">
                {authLoading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} style={{ animationDelay: `${i * 100}ms` }} className="h-[180px] rounded-2xl bg-zinc-200/50 dark:bg-zinc-800/50" />
                        ))}
                    </div>
                ) : (
                    <AnimatePresence mode="wait">

                        {/* STEP 1: BRANCH SELECTION */}
                        {view === "branches" && (
                            <motion.div
                                key="branches"
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, y: -10 }}
                                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
                                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            >
                                {BRANCHES.map((branch) => (
                                    <motion.button
                                        key={branch.id}
                                        variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        onClick={() => handleBranchSelect(branch.id)}
                                        className="glass group relative flex flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900/50"
                                    >
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-4xl shadow-inner dark:bg-blue-500/20">
                                            {branch.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">{branch.name}</h3>
                                            <p className="text-sm font-medium text-muted-foreground">{branch.id}</p>
                                        </div>
                                        <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}

                        {/* STEP 2: SEMESTER SELECTION */}
                        {view === "semesters" && (
                            <motion.div
                                key="semesters"
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, y: -10 }}
                                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
                                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                            >
                                {SEMESTERS.map((sem, index) => (
                                    <motion.button
                                        key={sem}
                                        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
                                        transition={{ duration: 0.25, ease: "easeOut" }}
                                        onClick={() => handleSemesterSelect(sem)}
                                        className="glass group relative flex flex-col items-start justify-between gap-4 rounded-xl p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg dark:bg-zinc-900/50"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                                            <span className="font-bold">{index + 1}</span>
                                        </div>
                                        <div className="w-full">
                                            <h3 className="font-semibold text-foreground">{sem}</h3>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {countsLoading ? (
                                                    <span className="inline-block h-3 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                                                ) : semesterCounts[sem] ? (
                                                    <span className="font-medium text-indigo-600 dark:text-indigo-400">{semesterCounts[sem]} file{semesterCounts[sem] !== 1 ? "s" : ""} available</span>
                                                ) : (
                                                    <span>No files yet</span>
                                                )}
                                            </p>
                                        </div>
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}

                        {/* STEP 3: RESOURCES LIST */}
                        {view === "resources" && (
                            <motion.div key="resources" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                                {resources.length > 0 && (
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        {/* Type filter tabs with count — improvements #4 #7 */}
                                        <div className="flex flex-wrap gap-2">
                                            {TYPE_FILTERS.map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setSelectedType(t)}
                                                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5 ${selectedType === t
                                                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                                                        }`}
                                                >
                                                    {t}
                                                    {typeCounts[t] > 0 && (
                                                        <span className={`rounded-full px-1.5 py-0 text-xs font-bold ${selectedType === t
                                                            ? "bg-white/20 text-white dark:bg-black/20 dark:text-zinc-900"
                                                            : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                                                            }`}>
                                                            {typeCounts[t]}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Search with clear button — improvement #4 */}
                                        <div className="relative w-full sm:max-w-xs">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder="Search resources..."
                                                className="w-full rounded-xl border-0 bg-white py-2.5 pl-10 pr-9 shadow-sm ring-1 ring-inset ring-zinc-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:bg-black dark:ring-zinc-800"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery("")}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                                                    title="Clear search"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {loading ? (
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} style={{ animationDelay: `${i * 100}ms` }} className="h-48 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                                        ))}
                                    </div>
                                ) : resources.length === 0 ? (
                                    /* No resources uploaded at all */
                                    <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
                                        <BookOpen className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                                        <p className="text-lg font-medium text-foreground">No resources yet</p>
                                        <p className="text-sm text-muted-foreground">No content uploaded for {selectedBranch} {selectedSemester} yet.</p>
                                        {role === "admin" && (
                                            <button
                                                onClick={() => router.push("/admin/resources")}
                                                className="mt-6 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                                            >
                                                Upload Resource
                                            </button>
                                        )}
                                    </div>
                                ) : filteredResources.length === 0 ? (
                                    /* improvement #5 — filter/search yields 0 results */
                                    <div className="flex h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
                                        <Search className="mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                                        <p className="font-medium text-foreground">No results found</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {searchQuery
                                                ? `No ${selectedType === "All" ? "" : selectedType + " "}resources match "${searchQuery}"`
                                                : `No ${selectedType} resources for this semester`}
                                        </p>
                                        <button
                                            onClick={() => { setSearchQuery(""); setSelectedType("All"); }}
                                            className="mt-4 rounded-lg border border-zinc-200 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                                        >
                                            Clear filters
                                        </button>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
                                        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                    >
                                        {filteredResources.map((resource) => (
                                            <motion.div
                                                key={resource.id}
                                                variants={{ hidden: { opacity: 0, y: 18, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                                                transition={{ duration: 0.3, ease: "easeOut" }}
                                            >
                                                <ResourceCard resource={resource} />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </main>
    );
}
