"use client";

import { useEffect, useState } from "react";
import { Wrench, Mail, Clock, AlertTriangle, RefreshCw } from "lucide-react";

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
        <div className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 text-zinc-50 overflow-hidden font-sans">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -left-[20%] -top-[20%] h-[60%] w-[60%] animate-pulse rounded-full bg-blue-600/20 blur-[150px] duration-10000" />
                <div className="absolute -bottom-[20%] -right-[20%] h-[60%] w-[60%] animate-pulse rounded-full bg-purple-600/20 blur-[150px] duration-10000 delay-500" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[80%] w-[80%] animate-spin-slow rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-[120px]" style={{ animationDuration: '20s' }} />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-1000">

                {/* Floating Icon */}
                <div className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 shadow-2xl shadow-blue-500/20 backdrop-blur-xl animate-bounce" style={{ animationDuration: '3s' }}>
                    <div className="absolute inset-0 rounded-3xl bg-blue-500/20 animate-ping opacity-75 duration-1000" />
                    <Wrench className="h-14 w-14 text-blue-400 drop-shadow-lg" />
                </div>

                <h1 className="mb-4 text-5xl font-extrabold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-zinc-400 drop-shadow-sm">
                    Under Maintenance
                </h1>

                <p className="mb-10 text-lg text-zinc-300 sm:text-xl max-w-2xl mx-auto leading-relaxed">
                    We are currently polishing the gears and upgrading <span className="font-semibold text-white">JGECHelper</span> to provide you with a smoother, faster experience. We'll be back online shortly.
                </p>

                {isClient && estimatedEndTime && (
                    <div className="mb-12 w-full max-w-xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                        <div className="flex items-center gap-2 mb-4 text-sm font-medium text-blue-400 uppercase tracking-widest">
                            <Clock className="w-4 h-4" />
                            <span>Estimated Time Remaining</span>
                        </div>

                        {timeLeft ? (
                            <div className="flex items-center justify-center gap-3 sm:gap-6">
                                <TimeUnit value={timeLeft.days} label="Days" />
                                <span className="text-3xl font-light text-zinc-600 animate-pulse">:</span>
                                <TimeUnit value={timeLeft.hours} label="Hours" />
                                <span className="text-3xl font-light text-zinc-600 animate-pulse">:</span>
                                <TimeUnit value={timeLeft.minutes} label="Mins" />
                                <span className="text-3xl font-light text-zinc-600 animate-pulse">:</span>
                                <TimeUnit value={timeLeft.seconds} label="Secs" highlight />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-green-500/30 bg-green-500/10 text-green-400">
                                <AlertTriangle className="w-5 h-5 animate-pulse" />
                                <span className="font-medium tracking-wide">Maintenance should be completing momentarily!</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full pt-8 border-t border-zinc-800/50">
                    <div className="flex flex-col items-center sm:items-start text-sm text-zinc-400">
                        <span className="mb-1 text-zinc-500">Need urgent assistance?</span>
                        <div className="flex items-center gap-2">
                            <span>Reach out to us at:</span>
                            <span className="font-semibold text-blue-400 select-all">{contactEmail}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="group relative flex items-center justify-center gap-2 rounded-full bg-zinc-800 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-zinc-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 border border-zinc-700/50"
                        >
                            <RefreshCw className="h-4 w-4 text-zinc-400 group-hover:text-white group-active:rotate-180 transition-all duration-300" />
                            <span>Refresh</span>
                        </button>
                        <a
                            href={`mailto:${contactEmail}`}
                            className="group relative flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95 border border-blue-400/20 overflow-hidden"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                            <Mail className="h-4 w-4 relative z-10" />
                            <span className="relative z-10">Contact Support</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TimeUnit({ value, label, highlight = false }: { value: number; label: string; highlight?: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center w-[72px] h-[84px] sm:w-[88px] sm:h-[100px] bg-gradient-to-b from-zinc-800/80 to-zinc-900/90 border border-zinc-700/50 rounded-2xl backdrop-blur-md shadow-inner">
            <span className={`text-3xl sm:text-5xl font-bold tabular-nums tracking-tighter ${highlight ? 'text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.5)]' : 'text-zinc-100'}`}>
                {value.toString().padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-[0.2em] mt-1 sm:mt-2 font-semibold">
                {label}
            </span>
        </div>
    );
}


