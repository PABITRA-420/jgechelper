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
    const { role, loading: authLoading } = useAuth();
    const pathname = usePathname();
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [contactEmail, setContactEmail] = useState("admin@jgec.ac.in");
    const [estimatedEndTime, setEstimatedEndTime] = useState<string | null>(null);
    const [settingsLoading, setSettingsLoading] = useState(true);

    useEffect(() => {
        const docRef = doc(db, "settings", "general");

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setMaintenanceMode(data.maintenanceMode || false);
                setContactEmail(data.contactEmail || "admin@jgec.ac.in");
                setEstimatedEndTime(data.maintenanceEndTime || null);
            }
            setSettingsLoading(false);
        }, (error) => {
            console.error("Error fetching maintenance settings: ", error);
            setSettingsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 1. Initial Load: Prevent flashing content before settings are loaded
    if (settingsLoading) return null;

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
    if (role === "admin") {
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

    // 5. General Users: Show maintenance screen if active
    if (maintenanceMode) {
        return <MaintenanceScreen contactEmail={contactEmail} estimatedEndTime={estimatedEndTime} />;
    }

    // 6. Maintenance is OFF
    return <>{children}</>;
}
