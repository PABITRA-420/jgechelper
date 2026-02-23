import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-20 text-center">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-100 via-background to-background dark:from-zinc-900/20"></div>
            <div className="absolute top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]"></div>
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-[80px]"></div>

            <div className="container relative z-10 px-4 md:px-6">
                <div className="animate-fade-in-up flex flex-col items-center gap-6">
                    <div className="inline-flex items-center rounded-full border border-black/5 bg-black/5 px-3 py-1 text-sm font-medium text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        v2.0 is now live
                    </div>

                    <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl">
                        Your Academic <br />
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                            Superpower
                        </span>
                    </h1>

                    <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
                        JGECHelper is the ultimate resource hub tailored for JGEC students.
                        Access past papers, class notes, and important notices in one premium interface.
                    </p>

                    <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                        <Link
                            href="/resources"
                            className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-transform hover:scale-105 active:scale-95"
                        >
                            Explore Resources
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        <Link
                            href="/about"
                            className="inline-flex h-12 items-center justify-center rounded-full border border-input bg-background px-8 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary hover:text-secondary-foreground"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
