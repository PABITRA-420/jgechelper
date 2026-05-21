"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import MaintenanceScreen from "./MaintenanceScreen";
import { usePathname } from "next/navigation";
import { AlertTriangle } from "lucide-react";

interface MaintenanceWrapperProps {
    children: React.ReactNode;
}

export default function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
    const { role, user, loading: authLoading } = useAuth();
    const pathname = usePathname();
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [contactEmail, setContactEmail] = useState("admin@jgec.ac.in");
    const [estimatedEndTime, setEstimatedEndTime] = useState<string | null>(null);
    const [maintenanceStartedAt, setMaintenanceStartedAt] = useState<number | null>(null);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [arrivalTime, setArrivalTime] = useState<number | null>(null);

    useEffect(() => {
        const docRef = doc(db, "settings", "general");

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setMaintenanceMode(data.maintenance_mode ?? data.maintenanceMode ?? false);
                setContactEmail(data.contactEmail || "admin@jgec.ac.in");
                setEstimatedEndTime(data.estimated_end_time || data.maintenanceEndTime || null);

                const startedAtRaw = data.maintenance_started_at || data.maintenanceStartedAt;
                if (startedAtRaw) {
                    // Check if it's a Timestamp with toMillis method
                    if (typeof startedAtRaw.toMillis === 'function') {
                        setMaintenanceStartedAt(startedAtRaw.toMillis());
                    } else if (startedAtRaw.seconds) {
                        setMaintenanceStartedAt(startedAtRaw.seconds * 1000);
                    } else {
                        setMaintenanceStartedAt(null);
                    }
                } else {
                    setMaintenanceStartedAt(null);
                }
            }
            setSettingsLoading(false);
        }, (error) => {
            console.error("Error fetching maintenance settings: ", error);
            setSettingsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            // sessionStorage clears when the tab/browser is closed.
            // This means anyone who opens a fresh tab/window during maintenance
            // gets a brand-new timestamp → detected as a new arrival → blocked.
            // Users already on the page keep their timestamp for the lifetime of
            // that tab, so they can freely navigate (resources, notices, etc.)
            // without being interrupted.
            const storedTime = sessionStorage.getItem("arrival_time");
            if (!storedTime) {
                const now = Date.now();
                sessionStorage.setItem("arrival_time", now.toString());
                setTimeout(() => setArrivalTime(now), 0);
            } else {
                setTimeout(() => setArrivalTime(parseInt(storedTime, 10)), 0);
            }
        }
    }, []);

    // 1. Initial Load: Show a loading state instead of returning null to unblock FCP / SSR.
    if (settingsLoading || arrivalTime === null) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    // 2. Auth Loading: If maintenance is ON, we must wait for auth to finish loading 
    //    so we don't accidentally show the maintenance screen to an admin before Firebase 
    //    confirms their role.
    if (maintenanceMode && authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    // 3. Admin Bypass: Admins pass through regardless of maintenance mode
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").split(",").map(e => e.trim()).filter(Boolean);
    const isSuperAdmin = user?.email ? adminEmails.includes(user.email) : false;
    if (role === "admin" || isSuperAdmin) {
        return (
            <>
                {/* Professional Sticky Banner to notify Admin they are bypassing maintenance */}
                {maintenanceMode && (
                    <div className="sticky top-0 z-[100] w-full bg-red-600 px-4 py-2 shadow-md">
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-white">
                            <AlertTriangle className="h-4 w-4" />
                            <span>
                                Maintenance Mode is currently active! You are bypassing this as an administrator.
                            </span>
                        </div>
                    </div>
                )}
                {children}
            </>
        );
    }

    // 4. Login Exception: If maintenance is on, we still need to allow unauthenticated 
    //    users (who might be admins) to access the login page to authenticate and bypass.
    if (maintenanceMode && pathname === "/login") {
        return <>{children}</>;
    }

    // 5. Existing Users vs New Users Logic (General Users)
    const isNewVisitor = maintenanceStartedAt ? arrivalTime > maintenanceStartedAt : false;


    if (maintenanceMode) {
        if (isNewVisitor) {
            // New visitors see the maintenance screen
            return <MaintenanceScreen contactEmail={contactEmail} estimatedEndTime={estimatedEndTime} />;
        } else {
            // Existing visitors get the yellow warning banner but can continue their session
            return (
                <>
                    <div className="sticky top-0 z-[100] w-full bg-amber-500 px-4 py-2 shadow-sm text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm font-medium text-amber-950">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span>
                                Scheduled Maintenance is currently active. New visitors are restricted, but you may finish your current session.
                            </span>
                        </div>
                    </div>
                    {children}
                </>
            );
        }
    }

    // 6. Maintenance is OFF
    return <>{children}</>;
}
