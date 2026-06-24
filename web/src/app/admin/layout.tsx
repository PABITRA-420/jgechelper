"use client";
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/static-components */

import Link from "next/link";
import { LayoutDashboard, Upload, FileText, Users, Settings, LogOut, Menu, X, ChevronRight, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const NAV_ITEMS = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/resources", label: "Resources", icon: Upload },
    { href: "/admin/notices", label: "Notices", icon: FileText },
    { href: "/admin/notifications", label: "Announcements", icon: Bell },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

function isNavActive(pathname: string, href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname?.startsWith(href + "/");
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, role, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user || role !== 'admin') {
                router.push('/');
            }
        }
    }, [user, role, loading, router]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    // Prevent scroll when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [sidebarOpen]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground animate-pulse">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    if (!user || role !== 'admin') return null;

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-zinc-200/80 px-6 dark:border-zinc-800/80">
                <Link href="/" className="text-xl font-bold tracking-tight">
                    JGEC<span className="text-blue-600">Admin</span>
                </Link>
            </div>

            {/* Admin Info */}
            <div className="mx-4 mt-4 mb-2 flex items-center gap-3 rounded-xl bg-zinc-100/80 p-3 dark:bg-zinc-800/50">
                {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt="Admin" className="h-9 w-9 rounded-full border-2 border-white shadow-sm dark:border-zinc-700" />
                ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
                        {(user.displayName || user.email || "A").charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.displayName || "Admin"}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = isNavActive(pathname, item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${active
                                ? "bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-500/10 dark:text-blue-400"
                                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/70"
                                }`}
                        >
                            {active && (
                                <motion.div
                                    layoutId="admin-nav-pill"
                                    className="absolute inset-0 rounded-xl bg-blue-50 dark:bg-blue-500/10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                    style={{ zIndex: -1 }}
                                />
                            )}
                            <Icon className={`h-5 w-5 transition-transform duration-200 ${active ? "" : "group-hover:scale-110"}`} />
                            {item.label}
                            {active && (
                                <ChevronRight className="ml-auto h-4 w-4 opacity-40" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Sign Out */}
            <div className="border-t border-zinc-200/80 p-4 dark:border-zinc-800/80">
                <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
            {/* ─── Desktop Sidebar (lg+) ─── */}
            <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-zinc-200/80 bg-white/80 backdrop-blur-xl lg:flex dark:border-zinc-800/80 dark:bg-zinc-900/80">
                <SidebarContent />
            </aside>

            {/* ─── Mobile Sidebar Overlay ─── */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-sm lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        {/* Slide-over sidebar */}
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                            className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-zinc-200/80 bg-white shadow-2xl lg:hidden dark:border-zinc-800/80 dark:bg-zinc-900"
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="absolute right-3 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ─── Main Content ─── */}
            <main className="flex-1 lg:ml-64">
                {/* Mobile Top Bar */}
                <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-zinc-200/80 bg-white/80 px-4 py-3 backdrop-blur-xl lg:hidden dark:border-zinc-800/80 dark:bg-zinc-900/80">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-lg p-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        aria-label="Open sidebar"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-bold tracking-tight">
                        JGEC<span className="text-blue-600">Admin</span>
                    </span>

                    {/* Current page indicator */}
                    <div className="ml-auto flex items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            {NAV_ITEMS.find(n => isNavActive(pathname, n.href))?.label || "Dashboard"}
                        </span>
                    </div>
                </div>

                {/* Page content */}
                <div className="p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
