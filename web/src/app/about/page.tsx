"use client";

import { Navbar } from "@/components/Navbar";
import { Shield, BookOpen, User, Info, Scale, Lock, Mail, Heart, Sparkles, GraduationCap, Code, Rocket, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background pb-20 overflow-hidden">
            <Navbar />

            {/* Decorative background elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px]" />
            </div>

            {/* Hero Section */}
            <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-4 relative">
                <div className="container mx-auto max-w-5xl text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 text-sm font-medium mb-8 border border-blue-500/20"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Empowering JGEC Students</span>
                    </motion.div>

                    <motion.h1
                        className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Learn Smarter, <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            Not Harder
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        JGEC Helper is a dedicated academic resource platform built by students, for students. Streamlining your learning experience with PYQs, study materials, and timely updates.
                    </motion.p>
                </div>
            </section>

            <div className="container mx-auto max-w-5xl px-4 md:px-6 space-y-24">

                {/* Mission / Features Grid */}
                <motion.section
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid md:grid-cols-3 gap-6"
                >
                    {[
                        { icon: GraduationCap, title: "Academic Excellence", desc: "Curated PYQs and study materials to boost your grades efficiently.", color: "text-blue-500", bg: "bg-blue-500/10" },
                        { icon: Rocket, title: "Timely Updates", desc: "Never miss an important college notice, event, or deadline again.", color: "text-indigo-500", bg: "bg-indigo-500/10" },
                        { icon: Code, title: "Built for JGEC", desc: "Tailored specifically for Jalpaiguri Govt. Engineering College community.", color: "text-purple-500", bg: "bg-purple-500/10" },
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            variants={fadeIn}
                            className="group relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity duration-300">
                                <feature.icon className="w-32 h-32" />
                            </div>
                            <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.section>

                {/* Policies Section - Modern Tabs/Grid */}
                <motion.section
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="space-y-10"
                >
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold mb-4">Trust & Transparency</h2>
                        <p className="text-muted-foreground text-lg">We value your privacy and aim to maintain a secure, respectful community for all students.</p>
                    </div>

                    <div className="grid md:grid-cols-5 gap-6">
                        {/* Privacy Policy */}
                        <motion.div variants={fadeIn} className="md:col-span-3 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 hover:border-blue-500/30 transition-colors">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold">Privacy Policy</h3>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-foreground font-semibold">
                                        <User className="w-4 h-4 text-indigo-500" />
                                        Data Collection
                                    </div>
                                    <p className="text-sm text-muted-foreground">Only essential info (email/name) is collected to verify student status securely.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-foreground font-semibold">
                                        <Lock className="w-4 h-4 text-indigo-500" />
                                        Data Security
                                    </div>
                                    <p className="text-sm text-muted-foreground">Protected by Firebase’s enterprise-grade authentication and encryption.</p>
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <div className="flex items-center gap-2 text-foreground font-semibold">
                                        <Info className="w-4 h-4 text-indigo-500" />
                                        Third-Party Services
                                    </div>
                                    <p className="text-sm text-muted-foreground">We never sell your data. Usage is analyzed strictly for app performance via Vercel analytics.</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Terms & Copyright */}
                        <motion.div variants={fadeIn} className="md:col-span-2 flex flex-col gap-6">
                            <div className="flex-1 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 hover:border-orange-500/30 transition-colors">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold">Copyright</h3>
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Code and design by Noob. Academic resources (PYQs) belong to creators/University and are for non-commercial educational use.
                                </p>
                            </div>

                            <div className="flex-1 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 hover:border-emerald-500/30 transition-colors">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                        <Scale className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold">Terms of Use</h3>
                                </div>
                                <ul className="space-y-3 text-muted-foreground text-sm">
                                    <li className="flex gap-3 items-start">
                                        <span className="text-emerald-500 font-bold mt-0.5">•</span>
                                        <span className="leading-tight">Respect guidelines; malicious uploads are strictly prohibited.</span>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <span className="text-emerald-500 font-bold mt-0.5">•</span>
                                        <span className="leading-tight">Independent project, not affiliated with JGEC administration.</span>
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Developer & Contact Section */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 text-white p-10 md:p-16 text-center shadow-2xl"
                >
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-blue-500/10"></div>

                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <div className="w-20 h-20 mx-auto bg-white/5 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/10 shadow-inner">
                            <Heart className="w-10 h-10 text-red-500 animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Crafted with Passion</h2>
                            <p className="text-zinc-400 text-lg md:text-xl leading-relaxed">
                                Have suggestions, found a bug, or want to collaborate? <br className="hidden md:block" />
                                We&apos;re always looking to improve the platform.
                            </p>
                        </div>

                        <div className="pt-4">
                            <a
                                href="mailto:admin.jgechelper@gmail.com?subject=Feedback&body=Dear%20Admin%2C%0A%0A"
                                className="group inline-flex items-center justify-center rounded-full bg-white text-black px-8 py-4 text-base font-semibold transition-all duration-300 hover:bg-zinc-200 hover:scale-105 active:scale-95 gap-3 w-full sm:w-auto shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
                            >
                                <Mail className="w-5 h-5" />
                                Get in Touch
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                            </a>
                        </div>
                    </div>
                </motion.section>

                {/* Footer */}
                <footer className="text-center text-sm text-muted-foreground pb-8">
                    <p className="flex items-center justify-center gap-2 mb-3">
                        Designed & Developed by
                        <span className="font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                            Noob Technology
                        </span>
                    </p>
                    <p className="text-xs opacity-70">
                        &copy; {new Date().getFullYear()} JGEC Helper. All rights reserved.
                    </p>
                </footer>

            </div>
        </main>
    );
}
