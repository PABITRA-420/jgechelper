"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Shield, AlertCircle, Loader2 } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requestNotificationPermission, getFCMToken } from "@/lib/notification-service";
import { toast } from "sonner";

export default function SettingsPage() {
    const { user, role, userBranch } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [pushEnabled, setPushEnabled] = useState(false);
    const [loadingPush, setLoadingPush] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchPushPref = async () => {
            try {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setPushEnabled(userSnap.data().pushEnabled === true);
                }
            } catch (err) {
                console.error("Error loading push preference:", err);
            } finally {
                setLoadingPush(false);
            }
        };
        fetchPushPref();
    }, [user]);

    const handlePushToggle = async () => {
        if (!user) return;
        setLoadingPush(true);
        try {
            const nextState = !pushEnabled;
            const idToken = await user.getIdToken(true);

            if (nextState) {
                const permission = await requestNotificationPermission();
                if (permission !== "granted") {
                    toast.error("Notification permission denied. Please allow notifications in browser settings.");
                    setLoadingPush(false);
                    return;
                }

                const token = await getFCMToken();
                if (!token) {
                    toast.error("Failed to register push token. Try reloading the page.");
                    setLoadingPush(false);
                    return;
                }

                const res = await fetch("/api/notifications/subscribe", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${idToken}`
                    },
                    body: JSON.stringify({ token, branch: userBranch }),
                });

                if (!res.ok) throw new Error("Subscription request failed");

                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, { pushEnabled: true });
                setPushEnabled(true);
                toast.success("Web push notifications enabled!");
            } else {
                const token = await getFCMToken();
                if (token) {
                    await fetch("/api/notifications/unsubscribe", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${idToken}`
                        },
                        body: JSON.stringify({ token }),
                    });
                }

                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, { pushEnabled: false });
                setPushEnabled(false);
                toast.success("Push notifications disabled.");
            }
        } catch (err) {
            console.error("Error toggling push notifications:", err);
            toast.error("Failed to update notification settings.");
        } finally {
            setLoadingPush(false);
        }
    };

    if (!user || !role) {
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
                <div className="container px-4 md:px-6 max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Account Settings</h1>
                    <p className="mt-2 text-muted-foreground">Manage your profile and preferences.</p>
                </div>
            </div>

            <div className="container mt-8 max-w-5xl px-4 md:px-6 mx-auto">
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
                                            <p className="font-medium">Web Push Notifications</p>
                                            <p className="text-xs text-muted-foreground mt-1">Get real-time updates when new notices or study materials are uploaded</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {loadingPush ? (
                                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                            ) : (
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={pushEnabled}
                                                    onClick={handlePushToggle}
                                                    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-zinc-300 dark:focus-visible:ring-offset-zinc-950 ${pushEnabled ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"}`}
                                                >
                                                    <span
                                                        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${pushEnabled ? "translate-x-5" : "translate-x-0"}`}
                                                    />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-4 opacity-75">
                                        <div>
                                            <p className="font-medium text-muted-foreground">Email Alerts</p>
                                            <p className="text-xs text-muted-foreground mt-1">Receive emails about urgent notices</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Coming Soon</span>
                                            <div className="flex h-5 w-9 cursor-not-allowed items-center rounded-full bg-zinc-300 dark:bg-zinc-700 p-0.5 opacity-50">
                                                <div className="h-4 w-4 translate-x-0 rounded-full bg-white shadow-sm" />
                                            </div>
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
