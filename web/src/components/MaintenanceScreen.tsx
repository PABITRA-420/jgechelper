"use client";

import { useEffect, useState } from "react";
import { Mail, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const EngineeringRunner = dynamic(() => import("./EngineeringRunner"), { ssr: false });
const BranchAnimations = dynamic(() => import("./BranchAnimations"), { ssr: false });

interface MaintenanceScreenProps {
    contactEmail?: string;
    estimatedEndTime?: string | null;
}

const BRANCH_ICONS = [
    { label: "CSE", color: "#22d3ee", path: "M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3M7 8l3 3-3 3m5 0h3" },
    { label: "ECE", color: "#a78bfa", path: "M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 7h10v10H7z" },
    { label: "ME",  color: "#f59e0b", path: "M10.325 4.317a1.724 1.724 0 013.35 0l.344.985a1.724 1.724 0 002.573.95l.827-.56a1.724 1.724 0 012.37 2.37l-.56.827a1.724 1.724 0 00.95 2.573l.985.344a1.724 1.724 0 010 3.35l-.985.344a1.724 1.724 0 00-.95 2.573l.56.827a1.724 1.724 0 01-2.37 2.37l-.827-.56a1.724 1.724 0 00-2.573.95l-.344.985a1.724 1.724 0 01-3.35 0l-.344-.985a1.724 1.724 0 00-2.573-.95l-.827.56a1.724 1.724 0 01-2.37-2.37l.56-.827a1.724 1.724 0 00-.95-2.573l-.985-.344a1.724 1.724 0 010-3.35l.985-.344a1.724 1.724 0 00.95-2.573l-.56-.827a1.724 1.724 0 012.37-2.37l.827.56a1.724 1.724 0 002.573-.95z M12 15a3 3 0 100-6 3 3 0 000 6z" },
    { label: "CE",  color: "#fb923c", path: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-16 0H3m5-10h.01M12 11h.01M9 15h.01M12 15h.01M9 7h.01M12 7h.01" },
    { label: "EE",  color: "#facc15", path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
    { label: "IT",  color: "#34d399", path: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" },
];

/* ── Staggered fade-in wrapper ─────────────────────────────── */
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

/* ── Orbiting logo ──────────────────────────────────────────── */
function AnimatedLogo() {
    return (
        <FadeUp delay={0}>
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex items-center justify-center mb-6 mx-auto">
                <motion.div className="absolute inset-0 rounded-full border border-blue-500/30"
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }} />
                <motion.div className="absolute inset-[-6px] rounded-full border border-purple-500/20"
                    animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 12, ease: "linear" }} />
                <motion.div className="absolute inset-[-13px] rounded-full border border-cyan-500/10 border-dashed"
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 18, ease: "linear" }} />
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center shadow-2xl shadow-blue-500/20">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="url(#wGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <defs>
                            <linearGradient id="wGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#60a5fa" />
                                <stop offset="100%" stopColor="#a78bfa" />
                            </linearGradient>
                        </defs>
                        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                    </svg>
                </div>
            </div>
        </FadeUp>
    );
}

/* ── Branch badges ──────────────────────────────────────────── */
function BranchBadges() {
    return (
        <FadeUp delay={0.4} className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {BRANCH_ICONS.map((b, i) => (
                <motion.div
                    key={b.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.07, type: "spring", stiffness: 260, damping: 20 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-zinc-900/60 backdrop-blur-sm text-xs font-semibold cursor-default"
                    style={{ color: b.color, borderColor: `${b.color}30` }}
                >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={b.path} />
                    </svg>
                    {b.label}
                </motion.div>
            ))}
        </FadeUp>
    );
}

/* ── Scanning progress bar ──────────────────────────────────── */
function ScanBar() {
    return (
        <div className="w-full max-w-sm mx-auto h-[3px] rounded-full bg-zinc-800/80 overflow-hidden mb-8">
            <motion.div
                className="h-full w-1/3 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400"
                animate={{ x: ["−100%", "400%"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
        </div>
    );
}

/* ── Countdown unit ─────────────────────────────────────────── */
function TimeUnit({ value, label, highlight = false }: { value: number; label: string; highlight?: boolean }) {
    return (
        <motion.div
            className="flex flex-col items-center justify-center w-[62px] h-[74px] sm:w-[78px] sm:h-[90px] bg-gradient-to-b from-zinc-800/80 to-zinc-900/90 border border-zinc-700/40 rounded-xl backdrop-blur-md"
            whileHover={{ scale: 1.05 }}
        >
            <motion.span
                key={value}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className={`text-2xl sm:text-4xl font-bold tabular-nums tracking-tighter ${highlight ? "text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" : "text-zinc-100"}`}
            >
                {value.toString().padStart(2, "0")}
            </motion.span>
            <span className="text-[9px] sm:text-[11px] text-zinc-500 uppercase tracking-widest mt-1 font-semibold">{label}</span>
        </motion.div>
    );
}

/* ── Main ───────────────────────────────────────────────────── */
export default function MaintenanceScreen({ contactEmail = "admin@jgec.ac.in", estimatedEndTime }: MaintenanceScreenProps) {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [showGame, setShowGame] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    useEffect(() => {
        if (!estimatedEndTime) return;
        const calc = () => {
            const diff = +new Date(estimatedEndTime) - Date.now();
            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / 86400000),
                    hours: Math.floor((diff / 3600000) % 24),
                    minutes: Math.floor((diff / 60000) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
            } else setTimeLeft(null);
        };
        calc();
        const t = setInterval(calc, 1000);
        return () => clearInterval(t);
    }, [estimatedEndTime]);

    return (
        <div className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-start bg-zinc-950 text-zinc-50 overflow-y-auto overflow-x-hidden">

            {/* Background glows */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.div className="absolute -left-[20%] -top-[20%] h-[55%] w-[55%] rounded-full bg-blue-600/12 blur-[130px]"
                    animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} />
                <motion.div className="absolute -bottom-[20%] -right-[20%] h-[55%] w-[55%] rounded-full bg-purple-600/12 blur-[130px]"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
                    transition={{ repeat: Infinity, duration: 9, ease: "easeInOut", delay: 4 }} />
                <motion.div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[35%] w-[55%] rounded-full bg-cyan-500/7 blur-[110px]"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 11, ease: "easeInOut", delay: 2 }} />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
            </div>

            {/* Branch-specific floating animations */}
            <BranchAnimations />

            {/* Content */}
            <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center px-4 py-12 sm:py-16">

                <AnimatedLogo />

                <FadeUp delay={0.15}>
                    <h1 className="mb-3 text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-zinc-400 leading-tight">
                        Under Maintenance
                    </h1>
                </FadeUp>

                <FadeUp delay={0.25}>
                    <p className="mb-6 text-base sm:text-lg text-zinc-400 max-w-lg mx-auto leading-relaxed">
                        We&apos;re upgrading <span className="font-semibold text-white">JGECHelper</span> with new features for every branch. Back online shortly!
                    </p>
                </FadeUp>

                <BranchBadges />
                <ScanBar />

                {/* Countdown */}
                {isClient && estimatedEndTime && (
                    <FadeUp delay={0.5} className="mb-10 w-full">
                        <div className="flex items-center justify-center gap-2 mb-4 text-[11px] font-semibold text-blue-400 uppercase tracking-[0.18em]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Estimated Time Remaining</span>
                        </div>
                        <AnimatePresence mode="wait">
                            {timeLeft ? (
                                <motion.div key="countdown" className="flex items-center justify-center gap-2 sm:gap-3"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <TimeUnit value={timeLeft.days} label="Days" />
                                    <span className="text-2xl sm:text-3xl font-light text-zinc-700 animate-pulse">:</span>
                                    <TimeUnit value={timeLeft.hours} label="Hours" />
                                    <span className="text-2xl sm:text-3xl font-light text-zinc-700 animate-pulse">:</span>
                                    <TimeUnit value={timeLeft.minutes} label="Mins" />
                                    <span className="text-2xl sm:text-3xl font-light text-zinc-700 animate-pulse">:</span>
                                    <TimeUnit value={timeLeft.seconds} label="Secs" highlight />
                                </motion.div>
                            ) : (
                                <motion.div key="done"
                                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm"
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                    <AlertTriangle className="w-4 h-4 animate-pulse" />
                                    <span className="font-medium">Maintenance completing momentarily!</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </FadeUp>
                )}

                {/* Game section */}
                <FadeUp delay={0.65} className="w-full mb-10">
                    <AnimatePresence mode="wait">
                        {!showGame ? (
                            <motion.button
                                key="cta"
                                onClick={() => setShowGame(true)}
                                className="group mx-auto flex items-center gap-3 rounded-2xl border border-zinc-700/50 bg-zinc-900/60 px-6 py-4 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-blue-500/40 hover:text-white"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(59,130,246,0.15)" }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="text-xl">🎮</span>
                                <span>Bored? Play <span className="text-blue-400 font-semibold">Engineering Runner</span> while you wait!</span>
                                <motion.svg className="w-4 h-4 text-zinc-600 group-hover:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                    animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                    <path d="M5 12h14m-7-7 7 7-7 7" />
                                </motion.svg>
                            </motion.button>
                        ) : (
                            <motion.div key="game" className="space-y-3"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <EngineeringRunner />
                                <button onClick={() => setShowGame(false)}
                                    className="mx-auto flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                                    ✕ Hide Game
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </FadeUp>

                {/* Footer actions */}
                <FadeUp delay={0.8} className="w-full pt-6 border-t border-zinc-800/50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-zinc-500">
                            Need help?{" "}
                            <span className="text-blue-400 font-semibold select-all">{contactEmail}</span>
                        </p>
                        <div className="flex items-center gap-3">
                            <motion.button
                                onClick={() => window.location.reload()}
                                className="group flex items-center gap-2 rounded-full bg-zinc-800/80 px-5 py-2.5 text-sm font-medium text-zinc-300 border border-zinc-700/50 backdrop-blur-sm hover:text-white hover:bg-zinc-700 active:scale-95 transition-all"
                                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            >
                                <RefreshCw className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" />
                                Refresh
                            </motion.button>
                            <motion.a
                                href={`mailto:${contactEmail}`}
                                className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white border border-blue-400/20 hover:bg-blue-500 transition-all"
                                whileHover={{ scale: 1.04, boxShadow: "0 0 20px rgba(37,99,235,0.4)" }}
                                whileTap={{ scale: 0.96 }}
                            >
                                <Mail className="h-3.5 w-3.5" />
                                Contact
                            </motion.a>
                        </div>
                    </div>
                    <p className="mt-6 text-[10px] text-zinc-700 text-center">JGEC Helper • Engineering Excellence</p>
                </FadeUp>
            </div>
        </div>
    );
}
