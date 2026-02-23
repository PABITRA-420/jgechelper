"use client";

import { useEffect, useState } from "react";
import { Wrench, Mail, Clock } from "lucide-react";

interface MaintenanceScreenProps {
    contactEmail?: string;
    estimatedEndTime?: string | null; // e.g., "2024-12-31T23:59:00"
}

export default function MaintenanceScreen({ contactEmail = "admin@jgec.ac.in", estimatedEndTime }: MaintenanceScreenProps) {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (!estimatedEndTime) return;

        const calculateTimeLeft = () => {
            const difference = +new Date(estimatedEndTime) - +new Date();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft(null);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [estimatedEndTime]);

    return (
        <div className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 text-zinc-50 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-blue-500/20 blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-zinc-900/50 border border-zinc-800 shadow-2xl backdrop-blur-xl">
                    <Wrench className="h-12 w-12 text-primary animate-pulse" />
                </div>

                <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-7xl">
                    We'll be right back.
                </h1>

                <p className="mb-12 text-lg text-zinc-400 sm:text-xl max-w-xl mx-auto">
                    JGECHelper is currently undergoing scheduled maintenance to improve your experience. We apologize for the inconvenience.
                </p>

                {isClient && estimatedEndTime && timeLeft && (
                    <div className="mb-12 flex items-center justify-center gap-4 sm:gap-6">
                        <div className="flex flex-col items-center p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl backdrop-blur-sm min-w-[80px]">
                            <span className="text-3xl font-bold text-white tabular-nums">{timeLeft.days.toString().padStart(2, '0')}</span>
                            <span className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Days</span>
                        </div>
                        <span className="text-2xl font-bold text-zinc-600 animate-pulse">:</span>
                        <div className="flex flex-col items-center p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl backdrop-blur-sm min-w-[80px]">
                            <span className="text-3xl font-bold text-white tabular-nums">{timeLeft.hours.toString().padStart(2, '0')}</span>
                            <span className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Hours</span>
                        </div>
                        <span className="text-2xl font-bold text-zinc-600 animate-pulse">:</span>
                        <div className="flex flex-col items-center p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl backdrop-blur-sm min-w-[80px]">
                            <span className="text-3xl font-bold text-white tabular-nums">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                            <span className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Mins</span>
                        </div>
                        <span className="text-2xl font-bold text-zinc-600 animate-pulse">:</span>
                        <div className="flex flex-col items-center p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl backdrop-blur-sm min-w-[80px]">
                            <span className="text-3xl font-bold text-primary tabular-nums">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                            <span className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Secs</span>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                    <a
                        href={`mailto:${contactEmail}`}
                        className="flex items-center justify-center gap-2 rounded-full bg-white/10 px-8 py-3.5 text-sm font-medium text-white transition-all hover:bg-white/20 hover:scale-105 active:scale-95 border border-white/5"
                    >
                        <Mail className="h-4 w-4" />
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}

