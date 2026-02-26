"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Shield, ShieldAlert, User as UserIcon, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type CustomUser = {
    id: string;
    displayName: string;
    email: string;
    photoURL: string;
    role: "admin" | "user";
    status?: "active" | "banned";
    createdAt: any;
};

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<CustomUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "status">("newest");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const snapshot = await getDocs(collection(db, "users"));
                const usersData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as CustomUser[];
                setUsers(usersData);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const toggleStatus = async (userId: string, currentStatus: CustomUser["status"]) => {
        if (!currentUser) return;
        setUpdating(userId);
        try {
            const newStatus = currentStatus === "banned" ? "active" : "banned";
            await updateDoc(doc(db, "users", userId), { status: newStatus });
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
            );
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">Manage student and faculty accounts.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500 font-medium">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name">Name (A-Z)</option>
                        <option value="status">Status</option>
                    </select>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                            <tr>
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Contact</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium">Status / Role</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                                                <div className="h-4 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" /></td>
                                        <td className="px-6 py-4"><div className="h-6 w-16 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" /></td>
                                        <td className="px-6 py-4 text-right"><div className="ml-auto h-8 w-20 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" /></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No users found.</td>
                                </tr>
                            ) : (
                                [...users].sort((a, b) => {
                                    if (sortBy === "name") {
                                        const nameA = a.displayName || a.email.split('@')[0];
                                        const nameB = b.displayName || b.email.split('@')[0];
                                        return nameA.localeCompare(nameB);
                                    }
                                    if (sortBy === "status") return (a.role + a.status).localeCompare(b.role + b.status);

                                    const timeA = a.createdAt?.seconds || 0;
                                    const timeB = b.createdAt?.seconds || 0;
                                    return sortBy === "newest" ? timeB - timeA : timeA - timeB;
                                }).map((user) => (
                                    <tr key={user.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.photoURL ? (
                                                    <img src={user.photoURL} alt={user.displayName} className="h-10 w-10 rounded-full border border-zinc-200 object-cover dark:border-zinc-700" />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                                                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <span className="font-medium">{user.displayName || user.email.split('@')[0]}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                                            {user.createdAt ? (
                                                new Date(user.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })
                                            ) : (
                                                "Unknown date"
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {user.role === "admin" ? (
                                                    <span className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-600 w-fit dark:text-red-400">
                                                        <ShieldAlert className="mr-1 h-3 w-3" /> Admin
                                                    </span>
                                                ) : user.status === "banned" ? (
                                                    <span className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-600 w-fit dark:text-red-400">
                                                        <ShieldAlert className="mr-1 h-3 w-3" /> Banned
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 w-fit dark:text-green-400">
                                                        <Shield className="mr-1 h-3 w-3" /> Active
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.role !== "admin" && (
                                                <button
                                                    disabled={updating === user.id}
                                                    onClick={() => toggleStatus(user.id, user.status)}
                                                    className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-zinc-300 ${user.status === "banned"
                                                        ? "border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                                                        : "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                                                        }`}
                                                >
                                                    {updating === user.id ? "Updating..." : user.status === "banned" ? "Unban User" : "Ban User"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
