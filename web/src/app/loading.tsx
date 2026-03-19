import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background/50 backdrop-blur-sm z-[9999]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    Loading Application...
                </p>
            </div>
        </div>
    );
}
