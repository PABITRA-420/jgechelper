"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        maintenanceEndTime: "",
        contactEmail: "admin@jgec.ac.in",
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, "settings", "general");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings({
                        ...settings,
                        ...docSnap.data(),
                    });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast.error("Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await setDoc(doc(db, "settings", "general"), settings, { merge: true });
            toast.success("Settings saved successfully.");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Configure system preferences.</p>
            </div>

            <div className="max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {loading ? (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="h-4 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
                            <div className="h-10 w-full animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="mt-2 space-y-1">
                                <div className="h-4 w-32 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
                                <div className="h-3 w-48 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
                            </div>
                            <div className="h-6 w-10 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                        </div>
                        <div className="h-10 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">General Interface</h3>
                            <div className="space-y-2">
                                <label htmlFor="contactEmail" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-100">
                                    Platform Contact Email
                                </label>
                                <input
                                    id="contactEmail"
                                    type="email"
                                    value={settings.contactEmail}
                                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:focus-visible:ring-zinc-300"
                                />
                                <p className="text-sm text-muted-foreground">
                                    The main email address users can contact for support.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-red-500">Danger Zone</h3>
                            <div className="flex flex-row items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                                <div className="space-y-0.5">
                                    <label className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-red-600 dark:text-red-400">
                                        Maintenance Mode
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                        Disable regular access to the platform for updates.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={settings.maintenanceMode}
                                    onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-zinc-300 dark:focus-visible:ring-offset-zinc-950 ${settings.maintenanceMode ? "bg-red-500" : "bg-zinc-200 dark:bg-zinc-800"
                                        }`}
                                >
                                    <span
                                        data-state={settings.maintenanceMode ? "checked" : "unchecked"}
                                        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${settings.maintenanceMode ? "translate-x-5" : "translate-x-0"
                                            }`}
                                    />
                                </button>
                            </div>
                            {settings.maintenanceMode && (
                                <div className="mt-4 space-y-2">
                                    <label htmlFor="maintenanceEndTime" className="text-sm font-medium leading-none text-red-600 dark:text-red-400">
                                        Estimated End Time
                                    </label>
                                    <input
                                        id="maintenanceEndTime"
                                        type="datetime-local"
                                        value={settings.maintenanceEndTime}
                                        onChange={(e) => setSettings({ ...settings, maintenanceEndTime: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-red-500/20 bg-transparent px-3 py-2 text-sm text-red-600 dark:text-red-400 placeholder:text-red-600/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <p className="text-xs text-red-500/80">
                                        This will be shown on the maintenance screen countdown. Optional.
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
