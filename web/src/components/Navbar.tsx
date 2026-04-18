"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, LogOut, LayoutDashboard, User, X, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
    const { user, role, loading, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const [hoveredPath, setHoveredPath] = useState(pathname);

    useEffect(() => {
        setHoveredPath(pathname);
    }, [pathname]);

    const navItems = [
        { name: "Resources", path: "/resources" },
        { name: "Notices", path: "/notices" },
        { name: "About", path: "/about" },
    ];

    // Prevent background scrolling when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileMenuOpen]);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-4">
            <motion.nav 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex w-full max-w-5xl items-center justify-between rounded-full border border-black/5 bg-white/60 px-6 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-black/60 dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
            >
                {/* Logo */}
                <Link href="/" className="font-heading text-xl font-bold tracking-tight text-foreground">
                    JGEC<span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">Helper</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden items-center md:flex rounded-full border border-zinc-200/50 bg-white/50 p-1 dark:border-zinc-800/50 dark:bg-zinc-950/50">
                    {navItems.map((item) => {
                        const isActive = item.path === pathname;
                        const isHovered = item.path === hoveredPath;
                        return (
                            <Link 
                                key={item.path} 
                                href={item.path}
                                onMouseEnter={() => setHoveredPath(item.path)}
                                onMouseLeave={() => setHoveredPath(pathname)}
                                className={`relative px-4 py-1.5 text-sm font-medium transition-colors ${isActive || isHovered ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'}`}
                            >
                                {isHovered && (
                                    <motion.div
                                        layoutId="navbar-pill"
                                        className="absolute inset-0 z-0 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{item.name}</span>
                            </Link>
                        )
                    })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {loading ? (
                        <div className="hidden md:flex items-center gap-4 animate-pulse">
                            <div className="h-9 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                            <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                        </div>
                    ) : user && role ? (
                        <div className="flex items-center gap-4">
                            {/* Desktop Profile Dropdown */}
                            <div className="hidden md:flex items-center gap-3 relative group py-2">
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-semibold">{user.displayName}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase">{role}</span>
                                </div>
                                <Link href="/settings" className="transition-transform hover:scale-105 active:scale-95" title="Profile Settings">
                                    {user.photoURL ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={user.photoURL} alt="Profile" className="h-9 w-9 rounded-full border border-zinc-200 dark:border-zinc-800" />
                                    ) : (
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                            <User className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                                        </div>
                                    )}
                                </Link>

                                <button
                                    onClick={logout}
                                    className="ml-2 rounded-full p-2 text-muted-foreground hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
                                    title="Sign Out"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-full hidden w-56 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-background shadow-xl group-hover:flex dark:border-zinc-800 animate-in fade-in slide-in-from-top-2">
                                    <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
                                        <p className="text-sm font-medium truncate">{user.displayName}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email || ""}</p>
                                    </div>
                                    <div className="p-1">
                                        <Link href="/settings" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-secondary">
                                            <User className="h-4 w-4" />
                                            Profile Settings
                                        </Link>
                                        <a href="mailto:admin.jgechelper@gmail.com?subject=Feedback&body=Dear%20Admin%2C%0A%0A" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-secondary">
                                            <Mail className="h-4 w-4" />
                                            Send Feedback
                                        </a>
                                        {role === 'admin' && (
                                            <Link href="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-blue-600 hover:bg-blue-500/10">
                                                <LayoutDashboard className="h-4 w-4" />
                                                Admin Dashboard
                                            </Link>
                                        )}
                                    </div>
                                    <div className="p-1 border-t border-zinc-200 dark:border-zinc-800">
                                        <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-500/10">
                                            <LogOut className="h-4 w-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-4">
                            <Link
                                href="/login"
                                className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-transform hover:scale-105 active:scale-95"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop to close menu when clicking outside */}
                    <div 
                        className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-sm md:hidden animate-in fade-in duration-200" 
                        onClick={() => setIsMobileMenuOpen(false)} 
                    />
                    
                    <div className="absolute top-[88px] left-4 right-4 z-50 flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-background/95 p-6 shadow-2xl backdrop-blur-xl dark:border-zinc-800 md:hidden animate-in slide-in-from-top-4 fade-in duration-200">
                    <Link href="/resources" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground">
                        Resources
                    </Link>
                    <Link href="/notices" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground">
                        Notices
                    </Link>
                    <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground">
                        About
                    </Link>

                    <hr className="my-2 border-zinc-200 dark:border-zinc-800" />

                    {loading ? (
                        <div className="flex flex-col gap-3 animate-pulse">
                            <div className="h-[48px] w-full rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
                            <div className="h-[48px] w-full rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
                        </div>
                    ) : (!user || !role) && (
                        <div className="flex flex-col gap-3">
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center rounded-xl border border-input py-3 font-medium text-foreground hover:bg-secondary">
                                Sign In
                            </Link>
                            <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center rounded-xl bg-foreground py-3 font-medium text-background">
                                Get Started
                            </Link>
                        </div>
                    )}

                    {user && role === 'admin' && (
                        <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-lg font-medium text-blue-600">
                            <LayoutDashboard className="h-5 w-5" />
                            Admin Dashboard
                        </Link>
                    )}

                    {user && role && (
                        <>
                            <a href="mailto:admin.jgechelper@gmail.com?subject=Feedback&body=Dear%20Admin%2C%0A%0A" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-lg font-medium text-foreground w-full text-left">
                                <Mail className="h-5 w-5" />
                                Send Feedback
                            </a>
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    logout();
                                }}
                                className="flex items-center gap-2 text-lg font-medium text-red-500 w-full text-left"
                            >
                                <LogOut className="h-5 w-5" />
                                Sign Out
                            </button>
                        </>
                    )}
                    </div>
                </>
            )}
        </header>
    );
}
