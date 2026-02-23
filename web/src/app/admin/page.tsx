"use client";

import { FileText, Users, Download, AlertCircle, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getCountFromServer, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminPage() {
    const [stats, setStats] = useState({
        users: "...",
        resources: "...",
        notices: "...",
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loadingActivity, setLoadingActivity] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch Users Count
                const usersSnap = await getCountFromServer(collection(db, "users"));
                // Fetch Resources Count
                const resourcesSnap = await getCountFromServer(collection(db, "resources"));
                // Fetch Notices Count
                const noticesSnap = await getCountFromServer(collection(db, "notices"));

                setStats({
                    users: usersSnap.data().count.toString(),
                    resources: resourcesSnap.data().count.toString(),
                    notices: noticesSnap.data().count.toString(),
                });
            } catch (error) {
                console.error("Error fetching admin stats", error);
                setStats({ users: "Err", resources: "Err", notices: "Err" });
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

        fetchStats();
        fetchRecentActivity();
    }, []);

    // Format relative time (e.g. "2 hrs ago")
    const getRelativeTimeString = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.round(diffMs / 60000);
        const diffHrs = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHrs < 24) return `${diffHrs} hr${diffHrs !== 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Overview of the system status.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total Resources", value: stats.resources, icon: FileText, color: "text-blue-500" },
                    { label: "Total Notices", value: stats.notices, icon: Bell, color: "text-yellow-500" },
                    { label: "Active Users", value: stats.users, icon: Users, color: "text-green-500" },
                    { label: "Pending Issues", value: "0", icon: AlertCircle, color: "text-red-500" },
                ].map((stat, i) => (
                    <div key={i} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <h3 className="text-2xl font-bold">{stat.value}</h3>
                            </div>
                            <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-8">
                {/* Recent Activity Column */}
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
                    <div className="space-y-4">
                        {loadingActivity ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-2 w-2 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"></div>
                                    <div className="flex-1 space-y-1">
                                        <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse"></div>
                                        <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse"></div>
                                    </div>
                                </div>
                            ))
                        ) : recentActivity.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No recent activity detected.</p>
                        ) : (
                            recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-4">
                                    <div className={`h-2 w-2 rounded-full ${activity.type === 'resource' ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            {activity.type === 'resource' ? 'New resource: ' : 'New notice: '}
                                            <span className="font-normal text-muted-foreground">{activity.title}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">{getRelativeTimeString(activity.date)}</p>
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
