"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { ResourceCard } from "@/components/ResourceCard";
import { Search, ChevronRight, ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

// Define Resource Interface matching the new structure
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
    "5th Semester", "6th Semester", "7th Semester", "8th Semester"
];

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

    // Derive state from URL for flawless browser back button support
    const view = (searchParams.get("view") as "branches" | "semesters" | "resources") || "branches";
    const selectedBranch = searchParams.get("branch");
    const selectedSemester = searchParams.get("semester");

    const [selectedType, setSelectedType] = useState<string>("All");

    const { user, role, loading: authLoading } = useAuth();
    
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Protect Route: Redirect if not verified
    useEffect(() => {
        if (!authLoading && (!user || !role)) {
            router.push("/login");
        }
    }, [user, role, authLoading, router]);

    useEffect(() => {
        let unsubscribe: () => void;

        if (view === "resources" && selectedBranch && selectedSemester && role) {
            setLoading(true);
            const resourcesRef = collection(db, "resources");
            const q = query(resourcesRef);

            unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedResources = (snapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        date: doc.data().createdAt?.toDate().toLocaleDateString() || "Unknown Date"
                    })) as Resource[])
                    .filter(res => res.semester === selectedSemester)
                    .filter(res => {
                        if (res.branches && Array.isArray(res.branches)) {
                            return res.branches.includes(selectedBranch!);
                        }
                        return res.branch === selectedBranch;
                    })
                    .filter((res) => res.visible !== false) // Default true
                    .sort((a, b) => {
                        const orderA = a.orderSequence ?? Number.MAX_SAFE_INTEGER;
                        const orderB = b.orderSequence ?? Number.MAX_SAFE_INTEGER;
                        if (orderA !== orderB) return orderA - orderB;
                        const timeA = a.createdAt?.toMillis() || 0;
                        const timeB = b.createdAt?.toMillis() || 0;
                        return timeB - timeA;
                    });

                setResources(fetchedResources);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching resources:", error);
                setLoading(false);
            });
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [view, selectedBranch, selectedSemester, role]);

    const handleBack = () => {
        router.back();
    };

    const handleBranchSelect = (branchId: string) => {
        router.push(`?view=semesters&branch=${branchId}`);
    };

    const handleSemesterSelect = (semester: string) => {
        router.push(`?view=resources&branch=${selectedBranch}&semester=${semester}`);
    };

    return (
        <main className="min-h-screen bg-background pb-20">
            <Navbar />

            {/* Header */}
            <div className="bg-zinc-50 pt-32 pb-12 dark:bg-zinc-900/50">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col gap-4">
                        {/* Breadcrumbs / Back Navigation */}
                        {view !== "branches" && (
                            <button
                                onClick={handleBack}
                                className="flex w-fit items-center gap-2 rounded-lg py-1 pr-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to {view === "resources" ? "Semesters" : "Branches"}
                            </button>
                        )}

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                                {view === "branches" && "Select Department"}
                                {view === "semesters" && `${selectedBranch} Department`}
                                {view === "resources" && `Resources`}
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                {view === "branches" && "Choose your engineering branch to proceed."}
                                {view === "semesters" && "Select your current semester."}
                                {view === "resources" && `Showing materials for ${selectedBranch} - ${selectedSemester}`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mt-8 max-w-5xl px-4 md:px-6">

                {authLoading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="glass h-[180px] rounded-2xl bg-zinc-200/50 dark:bg-zinc-800/50"></div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* STEP 1: BRANCH SELECTION */}
                {view === "branches" && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {BRANCHES.map((branch) => (
                            <button
                                key={branch.id}
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
                            </button>
                        ))}
                    </div>
                )}

                {/* STEP 2: SEMESTER SELECTION */}
                {view === "semesters" && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {SEMESTERS.map((sem, index) => (
                            <button
                                key={sem}
                                onClick={() => handleSemesterSelect(sem)}
                                className="glass group relative flex flex-col items-start justify-between gap-4 rounded-xl p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg dark:bg-zinc-900/50"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                                    <span className="font-bold">{index + 1}</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">{sem}</h3>
                                    <p className="text-xs text-muted-foreground">Click to view files</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* STEP 3: RESOURCES LIST */}
                {view === "resources" && (
                    <div className="space-y-6">
                        {resources.length > 0 && (
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {["All", "Question Paper", "Notes", "Routine", "Others"].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setSelectedType(t)}
                                            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedType === t
                                                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative w-full sm:max-w-xs">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search resources..."
                                        className="w-full rounded-xl border-0 bg-white py-2.5 pl-10 pr-4 shadow-sm ring-1 ring-inset ring-zinc-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:bg-black dark:ring-zinc-800"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-48 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"></div>
                                ))}
                            </div>
                        ) : resources.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {resources
                                    .filter(r => selectedType === "All" || r.type === selectedType)
                                    .filter(r => (r.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || (r.subject || "").toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((resource) => (
                                        <ResourceCard key={resource.id} resource={resource} />
                                    ))}
                            </div>
                        ) : (
                            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
                                <BookOpen className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                                <p className="text-lg font-medium text-foreground">No resources found</p>
                                <p className="text-sm text-muted-foreground">
                                    No content uploaded for {selectedBranch} {selectedSemester} yet.
                                </p>
                            </div>
                        )}
                    </div>
                )}
                    </>
                )}
            </div>
        </main>
    );
}
