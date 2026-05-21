"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Admin panel error:", error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center p-4">
            <div className="w-full max-w-sm text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                    <AlertCircle className="h-7 w-7 text-red-500" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                    Dashboard Error
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Something went wrong loading this section. Your data is safe.
                </p>
                {error.digest && (
                    <p className="mt-1 text-xs text-muted-foreground/60">
                        Ref: {error.digest}
                    </p>
                )}
                <button
                    onClick={reset}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    <RotateCcw className="h-4 w-4" />
                    Retry
                </button>
            </div>
        </div>
    );
}
