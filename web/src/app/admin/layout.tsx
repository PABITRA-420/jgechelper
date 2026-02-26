"use client";

import Link from "next/link";
import { LayoutDashboard, Upload, FileText, Users, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, role, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user || role !== 'admin') {
                router.push('/');
            }
        }
    }, [user, role, loading, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!user || role !== 'admin') return null;

    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
                    <Link href="/" className="text-xl font-bold tracking-tight">
                        JGEC<span className="text-blue-600">Admin</span>
                    </Link>
                </div>

                <nav className="space-y-1 p-4">
                    <Link
                        href="/admin"
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${pathname === "/admin"
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            }`}
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/resources"
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${pathname === "/admin/resources" || pathname?.startsWith("/admin/resources/")
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            }`}
                    >
                        <Upload className="h-5 w-5" />
                        Resources
                    </Link>
                    <Link
                        href="/admin/notices"
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${pathname === "/admin/notices" || pathname?.startsWith("/admin/notices/")
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            }`}
                    >
                        <FileText className="h-5 w-5" />
                        Notices
                    </Link>
                    <Link
                        href="/admin/users"
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${pathname === "/admin/users" || pathname?.startsWith("/admin/users/")
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            }`}
                    >
                        <Users className="h-5 w-5" />
                        Users
                    </Link>
                    <Link
                        href="/admin/settings"
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${pathname === "/admin/settings" || pathname?.startsWith("/admin/settings/")
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            }`}
                    >
                        <Settings className="h-5 w-5" />
                        Settings
                    </Link>
                </nav>

                <div className="absolute bottom-4 left-0 right-0 p-4">
                    <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
