"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const BRANCHES = ["CSE", "IT", "ECE", "EE", "ME", "CE"];

export function OnboardingWrapper({ children }: { children: React.ReactNode }) {
    const { user, userBranch, loading, setBranch } = useAuth();
    const [submittingBranch, setSubmittingBranch] = useState<string | null>(null);

    // If still evaluating auth state, render nothing to avoid flash
    if (loading) {
        return null;
    }

    // Security Gate: If completely unauthenticated, or they already have a branch, render the app normally
    if (!user || userBranch) {
        return <>{children}</>;
    }

    // Otherwise, DO NOT render {children}, render the impenetrable gatekeeper
    const handleSelectBranch = async (branch: string) => {
        try {
            setSubmittingBranch(branch);
            // Firebase updateDoc is optimistic, but if the network is down it handles gracefully.
            // We await the actual resolution or throw.
            await setBranch(branch);
            toast.success("Branch saved! Welcome to your dashboard.");
        } catch (error) {
            console.error("Failed to select branch:", error);
            toast.error("Network unstable. Please check your connection and try again.");
            setSubmittingBranch(null);
        }
    };

    const firstName = user.displayName ? user.displayName.split(" ")[0] : "Student";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950 p-4">
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.7 }}
                    className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-2xl"
                >
                    {/* Atmospheric Lighting inside the modal */}
                    <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-blue-500/20 blur-[80px] pointer-events-none" />
                    <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-indigo-500/20 blur-[80px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <h2 className="font-heading text-3xl font-bold tracking-tight text-white mb-2">
                            Hi {firstName} 👋
                        </h2>
                        
                        <p className="text-sm font-medium text-zinc-400 mb-1">
                            Welcome to JGEC Helper
                        </p>

                        <p className="text-xl font-medium text-white mb-8">
                            Please select your branch
                        </p>

                        <div className="flex w-full max-w-[200px] flex-col items-center gap-3">
                            {BRANCHES.map((branch, index) => (
                                <motion.button
                                    key={branch}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                                    onClick={() => handleSelectBranch(branch)}
                                    disabled={submittingBranch !== null}
                                    className={`w-full relative overflow-hidden rounded-xl border border-white/5 bg-white/5 py-4 text-xl font-bold tracking-wider text-zinc-100 transition-all hover:border-blue-500/50 hover:bg-white/10 hover:text-blue-400 active:scale-[0.97] disabled:opacity-50`}
                                >
                                    {submittingBranch === branch ? (
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-400" />
                                    ) : (
                                        branch
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
