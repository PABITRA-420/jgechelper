"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export default function NetworkMonitor() {
    const [isOnline, setIsOnline] = useState(true);
    const [showBackOnline, setShowBackOnline] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            setShowBackOnline(true);
            setTimeout(() => setShowBackOnline(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowBackOnline(false);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!mounted) return null;

    return (
        <>
            {/* Offline Overlay */}
            <div
                className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-md transition-opacity duration-300 ${!isOnline ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
            >
                <div
                    className={`flex flex-col items-center justify-center p-8 bg-background text-foreground rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 max-w-sm w-full mx-4 text-center transform transition-transform duration-300 ${!isOnline ? "scale-100" : "scale-95"
                        }`}
                >
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                        <WifiOff className="w-8 h-8 text-red-600 dark:text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">No Internet Connection</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Please check your network settings and reconnect to continue using the app.
                    </p>
                </div>
            </div>

            {/* Back Online Toast */}
            <div
                className={`fixed top-0 left-0 right-0 z-[10000] flex justify-center transition-transform duration-500 ease-in-out ${showBackOnline ? "translate-y-0" : "-translate-y-full"
                    }`}
            >
                <div className="bg-emerald-500 text-white px-6 py-2 rounded-b-xl shadow-lg flex items-center gap-2 font-medium">
                    <Wifi className="w-4 h-4" />
                    Back Online
                </div>
            </div>
        </>
    );
}
