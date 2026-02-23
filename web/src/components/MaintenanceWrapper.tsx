"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import MaintenanceScreen from "./MaintenanceScreen";

interface MaintenanceWrapperProps {
    children: React.ReactNode;
}

export default function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
    const { role } = useAuth();
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [contactEmail, setContactEmail] = useState("admin@jgec.ac.in");
    const [estimatedEndTime, setEstimatedEndTime] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const docRef = doc(db, "settings", "general");

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setMaintenanceMode(data.maintenanceMode || false);
                setContactEmail(data.contactEmail || "admin@jgec.ac.in");
                setEstimatedEndTime(data.maintenanceEndTime || null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching maintenance settings: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // While checking for maintenance mode initially, don't flash content or maintenance screen
    if (loading) return null;

    // Admin passes through regardless of maintenance mode
    if (role === "admin") {
        return <>{children}</>;
    }

    if (maintenanceMode) {
        return <MaintenanceScreen contactEmail={contactEmail} estimatedEndTime={estimatedEndTime} />;
    }

    return <>{children}</>;
}
