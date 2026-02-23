"use client";

import Link from "next/link";
import { Menu, LogOut, LayoutDashboard, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
    const { user, role, logout } = useAuth();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-4">
            <nav className="glass flex w-full max-w-5xl items-center justify-between rounded-2xl px-6 py-3 shadow-lg">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
                    JGEC<span className="text-gray-500">Helper</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden items-center gap-8 md:flex">
                    <Link href="/resources" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                        Resources
                    </Link>
                    <Link href="/notices" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                        Notices
                    </Link>
                    <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                        About
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            {role === 'admin' && (
                                <Link
                                    href="/admin"
                                    className="hidden items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500 md:flex"
                                    title="Admin Dashboard"
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    Dashboard
                                </Link>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="hidden flex-col items-end md:flex">
                                    <span className="text-xs font-semibold">{user.displayName}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase">{role}</span>
                                </div>
                                {user.photoURL ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={user.photoURL} alt="Profile" className="h-9 w-9 rounded-full border border-zinc-200 dark:border-zinc-800" />
                                ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}

                                <button
                                    onClick={logout}
                                    className="ml-2 rounded-full p-2 text-muted-foreground hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
                                    title="Sign Out"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="hidden rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary md:block"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-transform hover:scale-105 active:scale-95"
                            >
                                Get Started
                            </Link>
                        </>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden">
                        <Menu className="h-6 w-6 text-foreground" />
                    </button>
                </div>
            </nav>
        </header>
    );
}
