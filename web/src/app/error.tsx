"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Something went wrong
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    An unexpected error occurred. This could be due to a network issue or a temporary problem.
                </p>
                {error.digest && (
                    <p className="mt-2 text-xs text-muted-foreground/60">
                        Error ID: {error.digest}
                    </p>
                )}
                <div className="mt-8 flex items-center justify-center gap-3">
                    <button
                        onClick={reset}
                        className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                    >
                        <Home className="h-4 w-4" />
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
