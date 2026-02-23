"use client";

import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { signInWithGoogle, signInWithEmail, resetPassword, user, role } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resetSuccess, setResetSuccess] = useState(false);

    // Redirect if logged in
    useEffect(() => {
        if (user && role) {
            if (role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/resources');
            }
        }
    }, [user, role, router]);

    const handleGoogleLogin = async () => {
        setError(null);
        try {
            await signInWithGoogle();
        } catch (error: any) {
            console.error("Login failed", error);
            if (error.code === 'auth/popup-closed-by-user') {
                setError("Sign in popup was closed before completion.");
            } else if (error.code === 'auth/unauthorized-domain') {
                setError("Domain not authorized in Firebase Console.");
            } else {
                setError("Google Sign In failed. Please try again.");
            }
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await signInWithEmail(email, password);
        } catch (err) {
            console.error(err);
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email first.");
            return;
        }
        setLoading(true);
        setError(null);
        setResetSuccess(false);
        try {
            await resetPassword(email);
            setResetSuccess(true);
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/user-not-found') {
                setError("No account found with this email.");
            } else {
                setError("Failed to send reset email.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-background to-background dark:from-zinc-900/20"></div>
            <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-[100px]"></div>

            <div className="glass w-full max-w-md rounded-2xl p-8 shadow-2xl">
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {isResetMode ? "Reset Password" : "Welcome Back"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isResetMode ? "Enter your email to receive a reset link" : "Sign in to access your dashboard"}
                    </p>
                </div>

                {isResetMode ? (
                    <form className="space-y-4" onSubmit={handleResetPassword}>
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="name@example.com"
                                className="w-full rounded-lg border border-input bg-background/50 px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}
                        {resetSuccess && <p className="text-sm text-green-500">Password reset email sent! Please check your inbox.</p>}

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-foreground py-2.5 text-center text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setIsResetMode(false); setError(null); setResetSuccess(false); }}
                            className="w-full text-center text-sm text-muted-foreground hover:text-foreground mt-4"
                        >
                            Back to Sign In
                        </button>
                    </form>
                ) : (
                    <>
                        <form className="space-y-4" onSubmit={handleEmailLogin}>
                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="name@example.com"
                                    className="w-full rounded-lg border border-input bg-background/50 px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                        Password
                                    </label>
                                    <button type="button" onClick={() => { setIsResetMode(true); setError(null); }} className="text-xs font-medium text-blue-500 hover:text-blue-600 hover:underline">
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        placeholder="••••••••"
                                        className="w-full rounded-lg border border-input bg-background/50 px-4 py-2 pr-10 text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && <p className="text-sm text-red-500">{error}</p>}

                            <button
                                type="submit"
                                className="w-full rounded-lg bg-foreground py-2.5 text-center text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>

                        <div className="my-6 flex items-center">
                            <div className="h-px flex-1 bg-border/50"></div>
                            <span className="px-4 text-xs text-muted-foreground">OR</span>
                            <div className="h-px flex-1 bg-border/50"></div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-input bg-background/50 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Sign in with Google
                        </button>
                    </>
                )}

                <p className="mt-8 text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-medium text-foreground hover:underline">
                        Create account
                    </Link>
                </p>
            </div>
        </main>
    );
}
