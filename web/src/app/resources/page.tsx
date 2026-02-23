"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ResourceCard } from "@/components/ResourceCard";
import { Search, ChevronRight, ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Define Resource Interface matching the new structure
interface Resource {
    id: string;
    title: string;
    subject: string;
    semester: string;
    type: "Question Paper" | "Notes" | "Syllabus";
    branch: string;
    date: string;
    downloadURL?: string;
    createdAt: any;
    visible?: boolean;
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
    const [view, setView] = useState<"branches" | "semesters" | "resources">("branches");
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
    const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch resources only when we reach the list view
    useEffect(() => {
        if (view === "resources" && selectedBranch && selectedSemester) {
            fetchResources();
        }
    }, [view, selectedBranch, selectedSemester]);

    async function fetchResources() {
        setLoading(true);
        try {
            const resourcesRef = collection(db, "resources");
            // Basic query, optimize indexes later if needed
            // We can filter client-side for now since dataset is small, or use compound queries
            const q = query(
                resourcesRef,
                where("branch", "==", selectedBranch),
                where("semester", "==", selectedSemester),
                // where("visible", "!=", false), // Firestore requires index for complex inequality queries.
                // It's safer to filter client-side for this specific use case unless data is massive.
                orderBy("createdAt", "desc")
            );

            const snapshot = await getDocs(q);

            const fetchedResources = (snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().createdAt?.toDate().toLocaleDateString() || "Unknown Date"
                })) as Resource[])
                .filter((res) => res.visible !== false); // Default true

            setResources(fetchedResources);
        } catch (error) {
            console.error("Error fetching resources:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleBack = () => {
        if (view === "resources") setView("semesters");
        else if (view === "semesters") {
            setSelectedBranch(null);
            setView("branches");
        }
    };

    const handleBranchSelect = (branchId: string) => {
        setSelectedBranch(branchId);
        setView("semesters");
    };

    const handleSemesterSelect = (semester: string) => {
        setSelectedSemester(semester);
        setView("resources");
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
                            <div className="relative max-w-xl">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search resources..."
                                    className="w-full rounded-xl border-0 bg-white py-3 pl-10 pr-4 shadow-sm ring-1 ring-inset ring-zinc-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:bg-black dark:ring-zinc-800"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
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
                                    .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.subject.toLowerCase().includes(searchQuery.toLowerCase()))
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
            </div>
        </main>
    );
}
