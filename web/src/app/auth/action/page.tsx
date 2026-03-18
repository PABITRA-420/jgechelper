"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

function AuthActionContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your request...");
    const [newPassword, setNewPassword] = useState("");
    const [isResetting, setIsResetting] = useState(false);
    const [emailForReset, setEmailForReset] = useState("");

    useEffect(() => {
        if (!mode || !oobCode) {
            setTimeout(() => {
                setStatus("error");
                setMessage("Invalid or missing action code.");
            }, 0);
            return;
        }

        const handleAction = async () => {
            try {
                if (mode === "verifyEmail") {
                    await applyActionCode(auth, oobCode);
                    setStatus("success");
                    setMessage("Your email has been successfully verified! You can now sign in.");
                } else if (mode === "resetPassword") {
                    // Verify the code first
                    const email = await verifyPasswordResetCode(auth, oobCode);
                    setEmailForReset(email);
                    setStatus("success");
                    setMessage("Please enter your new password below.");
                } else {
                    setStatus("error");
                    setMessage("Unknown action mode.");
                }
            } catch (error: unknown) {
                console.error("Action failed:", error);
                setStatus("error");
                const err = error as { code?: string; message?: string };

                // Friendly error messages based on Firebase codes
                if (err.code === "auth/invalid-action-code") {
                    setMessage("The action code is invalid. This can happen if the code is malformed, expired, or has already been used.");
                } else if (err.code === "auth/expired-action-code") {
                    setMessage("The action code has expired. Please request a new one.");
                } else {
                    setMessage(err.message || "An error occurred while processing your request.");
                }
            }
        };

        handleAction();
    }, [mode, oobCode]);

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 10) {
            setStatus("error");
            setMessage("Password must be at least 10 characters long.");
            return;
        }

        setIsResetting(true);
        setStatus("loading");

        try {
            await confirmPasswordReset(auth, oobCode!, newPassword);
            setIsResetting(false);
            setStatus("success");
            setMessage("Your password has been successfully reset! You can now sign in with your new password.");
            // Change mode effectively to prevent form showing again
            router.replace("/auth/action?mode=resetComplete", { scroll: false });
        } catch (error: unknown) {
            console.error(error);
            setIsResetting(false);
            setStatus("error");
            const err = error as { message?: string };
            setMessage(err.message || "Failed to reset password.");
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-zinc-100 via-background to-background dark:from-zinc-900/20"></div>

            <div className="glass w-full max-w-md rounded-2xl p-8 shadow-2xl text-center">
                <div className="mb-6 flex justify-center">
                    {status === "loading" && (
                        <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    )}
                    {status === "success" && (
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                    )}
                    {status === "error" && (
                        <XCircle className="h-16 w-16 text-red-500" />
                    )}
                </div>

                <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
                    {mode === "verifyEmail" && status === "success" && "Email Verified!"}
                    {mode === "resetPassword" && status === "success" && "Reset Password"}
                    {mode === "resetComplete" && "Password Reset!"}
                    {status === "error" && "Action Failed"}
                    {status === "loading" && "Please wait..."}
                </h1>

                <p className="mb-8 text-sm text-muted-foreground">
                    {message}
                </p>

                {mode === "resetPassword" && status === "success" && (
                    <form onSubmit={handlePasswordReset} className="mb-8 text-left space-y-4">
                        <div>
                            <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-foreground">
                                New Password for {emailForReset}
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-input bg-background/50 px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isResetting}
                            className="w-full rounded-lg bg-foreground py-2.5 text-center text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                        >
                            {isResetting ? "Resetting..." : "Set New Password"}
                        </button>
                    </form>
                )}

                {(status === "error" || (status === "success" && mode !== "resetPassword")) && (
                    <Link
                        href="/login"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-sm font-medium text-background transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go to Sign In
                    </Link>
                )}
            </div>
        </main>
    );
}

export default function AuthActionPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        }>
            <AuthActionContent />
        </Suspense>
    );
}
