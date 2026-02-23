import { Navbar } from "@/components/Navbar";
import { Shield, BookOpen, User, Info, Scale, Lock } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background pb-20">
            <Navbar />

            {/* Header */}
            <div className="bg-zinc-50 pt-32 pb-12 dark:bg-zinc-900/50">
                <div className="container px-4 md:px-6 max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">About JGEC Helper</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        JGEC Helper is a dedicated academic resource platform built by students, for students. Our mission is to streamline the learning experience for the Jalpaiguri Government Engineering College community by providing easy access to Previous Year Questions (PYQs), study materials, and timely campus notices. Founded by Sarkar, we aim to bridge the gap between engineering challenges and efficient solutions.
                    </p>
                </div>
            </div>

            <div className="container mt-12 max-w-4xl px-4 md:px-6 mx-auto space-y-16">

                {/* Privacy Policy */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                            <Shield className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Privacy Policy</h2>
                    </div>
                    <p className="text-muted-foreground mb-6">At JGEC Helper, we prioritize your privacy.</p>

                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        <div className="glass rounded-xl p-6 dark:bg-zinc-900/50">
                            <User className="mb-3 h-5 w-5 text-indigo-500" />
                            <h3 className="font-semibold mb-2">Data Collection</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">We only collect essential information, such as your email and name, to verify your student status and manage your profile.</p>
                        </div>
                        <div className="glass rounded-xl p-6 dark:bg-zinc-900/50">
                            <Lock className="mb-3 h-5 w-5 text-indigo-500" />
                            <h3 className="font-semibold mb-2">Data Security</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">We use Firebase’s secure authentication and encryption protocols to ensure your data is protected.</p>
                        </div>
                        <div className="glass rounded-xl p-6 dark:bg-zinc-900/50">
                            <Info className="mb-3 h-5 w-5 text-indigo-500" />
                            <h3 className="font-semibold mb-2">Third-Party Services</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">We do not sell or share your personal information with third parties. Usage data may be analyzed via Vercel for performance optimization.</p>
                        </div>
                    </div>
                </section>

                <hr className="border-zinc-200 dark:border-zinc-800" />

                {/* Copyright & Intellectual Property */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="rounded-lg bg-orange-500/10 p-2 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Copyright & Intellectual Property</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-4 items-start">
                            <div className="mt-1 h-2 w-2 rounded-full bg-orange-500 shrink-0"></div>
                            <div>
                                <h3 className="font-semibold text-foreground">Content Ownership</h3>
                                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">All original site design, code, and organized content are property of Sarkar.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="mt-1 h-2 w-2 rounded-full bg-orange-500 shrink-0"></div>
                            <div>
                                <h3 className="font-semibold text-foreground">Academic Resources</h3>
                                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">PYQs and educational materials remain the property of their respective creators or the University. These are provided for personal, non-commercial educational use only.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="mt-1 h-2 w-2 rounded-full bg-orange-500 shrink-0"></div>
                            <div>
                                <h3 className="font-semibold text-foreground">Unauthorized Use</h3>
                                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">Reproduction or redistribution of this platform’s code or database structure without explicit permission is prohibited.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="border-zinc-200 dark:border-zinc-800" />

                {/* Terms of Use */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                            <Scale className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Terms of Use</h2>
                    </div>

                    <ul className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <li className="flex gap-3">
                            <span className="font-bold text-emerald-500">1.</span>
                            <div>
                                <strong className="font-medium text-foreground">Verification:</strong>
                                <span className="text-muted-foreground ml-2 text-sm">Access to certain resources is restricted to verified student accounts to maintain the integrity of our community.</span>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-emerald-500">2.</span>
                            <div>
                                <strong className="font-medium text-foreground">Conduct:</strong>
                                <span className="text-muted-foreground ml-2 text-sm">Users must not attempt to scrape data, bypass security rules, or upload malicious content.</span>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-emerald-500">3.</span>
                            <div>
                                <strong className="font-medium text-foreground">Disclaimer:</strong>
                                <span className="text-muted-foreground ml-2 text-sm">While we strive for accuracy, JGEC Helper is an independent student project and is not officially affiliated with the college administration.</span>
                            </div>
                        </li>
                    </ul>
                </section>

            </div>
        </main>
    );
}
