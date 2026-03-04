"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Shield, AlertCircle, Camera } from "lucide-react";

export default function SettingsPage() {
    const { user, role } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");

    if (!user) {
        return (
            <main className="min-h-screen bg-background pb-20">
                <Navbar />
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <AlertCircle className="h-10 w-10 text-muted-foreground" />
                        <h2 className="text-xl font-semibold">Please sign in to view settings</h2>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background pb-20">
            <Navbar />

            {/* Header Area */}
            <div className="bg-zinc-50 pt-32 pb-12 dark:bg-zinc-900/50 border-b border-border">
                <div className="container px-4 md:px-6">
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Account Settings</h1>
                    <p className="mt-2 text-muted-foreground">Manage your profile and preferences.</p>
                </div>
            </div>

            <div className="container mt-8 max-w-5xl px-4 md:px-6">
                <div className="grid gap-8 md:grid-cols-[250px_1fr]">

                    {/* Sidebar Nav */}
                    <nav className="flex flex-col gap-2">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${activeTab === "profile"
                                ? "bg-foreground text-background"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`}
                        >
                            <User className="h-4 w-4" />
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab("notifications")}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${activeTab === "notifications"
                                ? "bg-foreground text-background"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`}
                        >
                            <AlertCircle className="h-4 w-4" />
                            Notifications
                        </button>
                    </nav>

                    {/* Content Area */}
                    <div className="space-y-6">
                        {activeTab === "profile" && (
                            <div className="glass overflow-hidden rounded-2xl p-6 dark:bg-zinc-900/50">
                                <h2 className="text-xl font-semibold mb-6">Personal Information</h2>

                                <div className="mb-8 flex items-center gap-6">
                                    <div className="relative">
                                        {user.photoURL ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={user.photoURL} alt="Avatar" className="h-24 w-24 rounded-full border-4 border-background shadow-md object-cover" />
                                        ) : (
                                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                                                <User className="h-10 w-10" />
                                            </div>
                                        )}
                                        <button className="absolute bottom-0 right-0 rounded-full border-2 border-background bg-blue-500 p-2 text-white shadow-sm hover:bg-blue-600 transition-colors">
                                            <Camera className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">{user.displayName || "JGEC Student"}</h3>
                                        <span className="inline-flex items-center gap-1.5 mt-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                                            <Shield className="h-3 w-3" />
                                            {(role || "student").toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                        <div className="flex items-center gap-3 rounded-lg border border-input bg-background/50 px-3 py-2.5">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{user.displayName || "Not provided"}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                        <div className="flex items-center gap-3 rounded-lg border border-input bg-background/50 px-3 py-2.5">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{user.email || "Not provided"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div className="glass rounded-2xl p-6 dark:bg-zinc-900/50">
                                <h2 className="text-xl font-semibold mb-2">Notification Preferences</h2>
                                <p className="text-sm text-muted-foreground mb-6">Manage how you receive alerts and updates.</p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-4">
                                        <div>
                                            <p className="font-medium">Email Alerts</p>
                                            <p className="text-xs text-muted-foreground mt-1">Receive emails about urgent notices</p>
                                        </div>
                                        <div className="flex h-5 w-9 cursor-pointer items-center rounded-full bg-blue-500 p-0.5">
                                            <div className="h-4 w-4 translate-x-4 rounded-full bg-white shadow-sm transition-transform" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-4">
                                        <div>
                                            <p className="font-medium">App Announcements</p>
                                            <p className="text-xs text-muted-foreground mt-1">In-app popups and new features</p>
                                        </div>
                                        <div className="flex h-5 w-9 cursor-pointer items-center rounded-full bg-blue-500 p-0.5">
                                            <div className="h-4 w-4 translate-x-4 rounded-full bg-white shadow-sm transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
