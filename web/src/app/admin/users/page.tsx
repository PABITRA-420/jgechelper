"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Shield, ShieldAlert, User as UserIcon, Search, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type CustomUser = {
    id: string;
    displayName: string;
    email: string;
    photoURL: string;
    role: "admin" | "user";
    status?: "active" | "banned";
    createdAt: { seconds: number; nanoseconds: number } | null;
    branch?: string;
};

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<CustomUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "status">("newest");
    const [searchQuery, setSearchQuery] = useState("");

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
        const action = currentStatus === "banned" ? "Unban" : "Ban";
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        setUpdating(userId);
        try {
            const newStatus = currentStatus === "banned" ? "active" : "banned";
            await updateDoc(doc(db, "users", userId), { status: newStatus });
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
            );
            toast.success(`User successfully ${newStatus === 'banned' ? 'banned' : 'unbanned'}.`);
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update user status.");
        } finally {
            setUpdating(null);
        }
    };

    const toggleRole = async (userId: string, currentRole: CustomUser["role"]) => {
        if (!currentUser) return;
        const action = currentRole === "admin" ? "Demote to User" : "Promote to Admin";
        if (!window.confirm(`Are you sure you want to ${action}?`)) return;

        setUpdating(userId);
        try {
            const newRole = currentRole === "admin" ? "user" : "admin";
            await updateDoc(doc(db, "users", userId), { role: newRole });
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
            );
            toast.success(`User role updated to ${newRole}.`);
        } catch (error) {
            console.error("Error updating role:", error);
            toast.error("Failed to update user role.");
        } finally {
            setUpdating(null);
        }
    };

    const deleteUserRecord = async (userId: string) => {
        if (!currentUser) return;
        if (!window.confirm("WARNING: Are you sure you want to completely DELETE this user from the database? This action cannot be undone.")) return;

        setUpdating(userId);
        try {
            await deleteDoc(doc(db, "users", userId));
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            toast.success("User successfully deleted from database.");
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user.");
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        const nameMatch = (user.displayName || "").toLowerCase().includes(query);
        const emailMatch = (user.email || "").toLowerCase().includes(query);
        return nameMatch || emailMatch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">Manage student and faculty accounts.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        <span className="text-sm text-zinc-500 font-medium whitespace-nowrap">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "name" | "status")}
                            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 w-full sm:w-auto"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="name">Name (A-Z)</option>
                            <option value="status">Status</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                            <tr>
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Branch</th>
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
                                        <td className="px-6 py-4"><div className="h-4 w-12 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" /></td>
                                        <td className="px-6 py-4"><div className="h-6 w-16 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" /></td>
                                        <td className="px-6 py-4 text-right"><div className="ml-auto h-8 w-20 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" /></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        {users.length === 0 ? "No users found." : "No users match your search."}
                                    </td>
                                </tr>
                            ) : (
                                [...filteredUsers].sort((a, b) => {
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
                                    <tr key={user.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.photoURL ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={user.photoURL} alt={user.displayName || "User profile"} className="h-10 w-10 rounded-full border border-zinc-200 object-cover dark:border-zinc-700" />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                                                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.displayName || user.email.split('@')[0]}</span>
                                                    <span className="text-xs text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">ID: {user.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.branch ? (
                                                <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                                                    {user.branch}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-zinc-400 italic">Not set</span>
                                            )}
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
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                {user.role !== "admin" ? (
                                                    <button
                                                        disabled={updating === user.id}
                                                        onClick={() => toggleRole(user.id, user.role)}
                                                        className="inline-flex items-center justify-center rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700 dark:focus-visible:ring-zinc-300"
                                                    >
                                                        Promote
                                                    </button>
                                                ) : (
                                                    <button
                                                        disabled={updating === user.id || currentUser?.uid === user.id}
                                                        onClick={() => toggleRole(user.id, user.role)}
                                                        title={currentUser?.uid === user.id ? "Cannot demote yourself" : ""}
                                                        className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-300"
                                                    >
                                                        Demote
                                                    </button>
                                                )}

                                                {user.role !== "admin" && (
                                                    <button
                                                        disabled={updating === user.id}
                                                        onClick={() => toggleStatus(user.id, user.status)}
                                                        className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-zinc-300 ${user.status === "banned"
                                                            ? "border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                                                            : "bg-red-600/10 text-red-600 hover:bg-red-600/20 dark:bg-red-600/10 dark:text-red-400 dark:hover:bg-red-600/20"
                                                            }`}
                                                    >
                                                        {updating === user.id ? "..." : user.status === "banned" ? "Unban" : "Ban"}
                                                    </button>
                                                )}

                                                <button
                                                    disabled={updating === user.id || currentUser?.uid === user.id}
                                                    onClick={() => deleteUserRecord(user.id)}
                                                    title={currentUser?.uid === user.id ? "Cannot delete yourself" : "Delete Document"}
                                                    className="inline-flex items-center justify-center rounded-md p-1.5 text-zinc-500 hover:bg-red-100 hover:text-red-600 transition-colors disabled:pointer-events-none disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-red-900/40 dark:hover:text-red-400"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
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
