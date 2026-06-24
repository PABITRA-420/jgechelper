"use client";

import { FileText, Users, Bell, Clock, CalendarDays, Activity, Upload, Settings, EyeOff, Trash2, ArrowRight, Shield, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getCountFromServer, query, orderBy, limit, getDocs, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { getRelativeTime } from "@/lib/utils";

export default function AdminPage() {
    const [stats, setStats] = useState({
        users: "...",
        resources: "...",
        notices: "...",
        drafts: "...",
    });
    const [recentActivity, setRecentActivity] = useState<{ id: string, type: string, title: string, date: Date }[]>([]);
    const [loadingActivity, setLoadingActivity] = useState(true);
    const [maintenanceOn, setMaintenanceOn] = useState(false);
    const [trashedCount, setTrashedCount] = useState({ resources: 0, notices: 0 });

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch Users Count
                const usersSnap = await getCountFromServer(collection(db, "users"));
                // Fetch Resources Count
                const resourcesSnap = await getCountFromServer(collection(db, "resources"));
                // Fetch Notices Count
                const noticesSnap = await getCountFromServer(collection(db, "notices"));

                // Fetch hidden/draft items count (resources with visible=false OR notices with visible=false)
                const hiddenResQ = query(collection(db, "resources"), where("visible", "==", false));
                const hiddenResSnap = await getCountFromServer(hiddenResQ);
                const hiddenNotQ = query(collection(db, "notices"), where("visible", "==", false));
                const hiddenNotSnap = await getCountFromServer(hiddenNotQ);
                const totalDrafts = hiddenResSnap.data().count + hiddenNotSnap.data().count;

                // Fetch trashed items
                const trashedResQ = query(collection(db, "resources"), where("isDeleted", "==", true));
                const trashedResSnap = await getCountFromServer(trashedResQ);
                const trashedNotQ = query(collection(db, "notices"), where("isDeleted", "==", true));
                const trashedNotSnap = await getCountFromServer(trashedNotQ);

                setTrashedCount({
                    resources: trashedResSnap.data().count,
                    notices: trashedNotSnap.data().count,
                });

                setStats({
                    users: usersSnap.data().count.toString(),
                    resources: (resourcesSnap.data().count - trashedResSnap.data().count).toString(),
                    notices: (noticesSnap.data().count - trashedNotSnap.data().count).toString(),
                    drafts: totalDrafts.toString(),
                });
            } catch (error) {
                console.error("Error fetching admin stats", error);
                setStats({ users: "Err", resources: "Err", notices: "Err", drafts: "Err" });
            }
        }

        async function fetchRecentActivity() {
            try {
                // Fetch most recent resources
                const qResources = query(collection(db, "resources"), orderBy("createdAt", "desc"), limit(3));
                const resSnap = await getDocs(qResources);
                const recentRes = resSnap.docs.map(doc => ({
                    id: doc.id,
                    type: "resource",
                    title: doc.data().title || "New Resource",
                    date: doc.data().createdAt?.toDate() || new Date(),
                }));

                // Fetch most recent notices
                const qNotices = query(collection(db, "notices"), orderBy("createdAt", "desc"), limit(3));
                const notSnap = await getDocs(qNotices);
                const recentNot = notSnap.docs.map(doc => ({
                    id: doc.id,
                    type: "notice",
                    title: doc.data().title || "New Notice",
                    date: doc.data().createdAt?.toDate() || new Date(),
                }));

                // Combine and sort
                const combined = [...recentRes, ...recentNot]
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .slice(0, 5); // take top 5 entries

                setRecentActivity(combined);
            } catch (error) {
                console.error("Error fetching recent activity:", error);
            } finally {
                setLoadingActivity(false);
            }
        }

        async function fetchMaintenanceStatus() {
            try {
                const settingsDoc = await getDoc(doc(db, "settings", "general"));
                if (settingsDoc.exists()) {
                    setMaintenanceOn(settingsDoc.data().maintenance_mode === true);
                }
            } catch (error) {
                console.error("Error fetching maintenance status:", error);
            }
        }

        fetchStats();
        fetchRecentActivity();
        fetchMaintenanceStatus();
    }, []);

    // Format relative time (e.g. "2 hrs ago") — uses shared utility
    const getRelativeTimeString = (date: Date) => getRelativeTime(date);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    const quickActions = [
        { label: "Upload Resource", desc: "Add study materials", href: "/admin/resources", icon: Upload, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/20", hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700" },
        { label: "Post Notice", desc: "Publish notice documents", href: "/admin/notices", icon: FileText, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/20", hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700" },
        { label: "Send Announcement", desc: "Push notification alert", href: "/admin/notifications", icon: Bell, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/20", hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-700" },
        { label: "Manage Users", desc: "Ban, promote, review", href: "/admin/users", icon: Users, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/20", hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700" },
        { label: "Settings", desc: "Maintenance & config", href: "/admin/settings", icon: Settings, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/20", hoverBorder: "hover:border-purple-300 dark:hover:border-purple-700" },
        { label: "View Platform", desc: "Go to student homepage", href: "/", icon: Activity, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-900/20", hoverBorder: "hover:border-rose-300 dark:hover:border-rose-700" },
    ];

    return (
        <motion.div 
            className="space-y-6 sm:space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 suppressHydrationWarning className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-500 bg-clip-text text-transparent dark:from-white dark:to-zinc-400">
                        {getGreeting()}, Admin
                    </h1>
                    <p suppressHydrationWarning className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                        <CalendarDays className="h-4 w-4" />
                        {currentDate}
                    </p>
                </div>
                {/* Maintenance Status Badge */}
                {maintenanceOn && (
                    <div className="mt-2 sm:mt-0 inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-400 animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-beat"></span>
                        Maintenance Mode ON
                    </div>
                )}
            </motion.div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Resources", value: stats.resources, icon: FileText, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/20" },
                    { label: "Notices", value: stats.notices, icon: Bell, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/20" },
                    { label: "Users", value: stats.users, icon: Users, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/20" },
                    { label: "Hidden / Drafts", value: stats.drafts, icon: EyeOff, color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-200 dark:bg-zinc-800" },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                    <motion.div 
                        key={i} 
                        variants={itemVariants}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:backdrop-blur-xl"
                    >
                        <div className="flex items-center justify-between z-10 relative">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <h3 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</h3>
                            </div>
                            <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full ${stat.bg} transition-transform group-hover:scale-110`}>
                                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                            </div>
                        </div>
                        <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${stat.bg} opacity-50 blur-2xl transition-all duration-500 group-hover:scale-150`}></div>
                    </motion.div>
                )})}
            </div>

            {/* Main Content: 2-column grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column: Recent Activity */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 dark:backdrop-blur-xl">
                    <div className="mb-4 sm:mb-6 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-zinc-500" />
                        <h3 className="text-lg font-semibold">Recent Activity</h3>
                    </div>
                    
                    <div className="relative space-y-4 sm:space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 dark:before:via-zinc-700 before:to-transparent">
                        {loadingActivity ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="relative flex items-start gap-4 sm:gap-6">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0 z-10 shadow-sm"></div>
                                    <div className="flex-1 p-3 sm:p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 animate-pulse h-20 sm:h-24"></div>
                                </div>
                            ))
                        ) : recentActivity.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No recent activity detected.</p>
                        ) : (
                            recentActivity.map((activity, index) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={activity.id} 
                                    className="relative flex items-start gap-4 sm:gap-6 group"
                                >
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-950 ${activity.type === 'resource' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400'} shrink-0 z-10 shadow-sm transition-transform group-hover:scale-110`}>
                                        {activity.type === 'resource' ? <FileText className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 p-3 sm:p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all group-hover:-translate-y-0.5">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-semibold">
                                                {activity.type === 'resource' ? 'Resource uploaded' : 'Notice published'}
                                            </p>
                                            <p className="text-sm text-muted-foreground line-clamp-1" title={activity.title}>
                                                {activity.title}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1 sm:mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                                                <Clock className="w-3 h-3" />
                                                <span>{getRelativeTimeString(activity.date)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Right Column: Quick Actions + System Status */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <motion.div variants={itemVariants} className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 dark:backdrop-blur-xl">
                        <div className="mb-4 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-amber-500" />
                            <h3 className="text-lg font-semibold">Quick Actions</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <Link
                                        key={action.href}
                                        href={action.href}
                                        className={`group flex flex-col gap-2 sm:gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 sm:p-4 transition-all duration-200 hover:bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/60 ${action.hoverBorder}`}
                                    >
                                        <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl ${action.bg} transition-transform group-hover:scale-110`}>
                                            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${action.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold flex items-center gap-1">
                                                {action.label}
                                                <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                                            </p>
                                            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 hidden sm:block">{action.desc}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* System Status */}
                    <motion.div variants={itemVariants} className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 dark:backdrop-blur-xl">
                        <div className="mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-emerald-500" />
                            <h3 className="text-lg font-semibold">System Status</h3>
                        </div>
                        <div className="space-y-3">
                            {/* Platform Status */}
                            <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800/40">
                                <span className="text-sm font-medium text-muted-foreground">Platform Status</span>
                                {maintenanceOn ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                        Maintenance
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                        Online
                                    </span>
                                )}
                            </div>
                            {/* Trashed Items */}
                            <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800/40">
                                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Trash2 className="h-3.5 w-3.5" /> Items in Trash
                                </span>
                                <span className="text-sm font-semibold">
                                    {trashedCount.resources + trashedCount.notices}
                                </span>
                            </div>
                            {/* Hidden Items */}
                            <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800/40">
                                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <EyeOff className="h-3.5 w-3.5" /> Hidden from Students
                                </span>
                                <span className="text-sm font-semibold">{stats.drafts === "..." ? "..." : stats.drafts}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
