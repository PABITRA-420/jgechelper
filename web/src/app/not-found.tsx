"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Home, BookOpen, Megaphone, Info, Search, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Redirect to resources or notices based on keyword search
    const query = encodeURIComponent(searchQuery.trim());
    if (searchQuery.toLowerCase().includes("notice") || searchQuery.toLowerCase().includes("exam") || searchQuery.toLowerCase().includes("schedule")) {
      router.push(`/notices?search=${query}`);
    } else {
      router.push(`/resources?search=${query}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  } as const;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-4 py-16 text-white">
      {/* Premium Ambient Cosmic Lighting */}
      <motion.div
        animate={{
          scale: [1, 1.1, 0.95, 1],
          opacity: [0.3, 0.5, 0.4, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 h-[30vw] w-[30vw] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 0.95, 1],
          opacity: [0.3, 0.5, 0.4, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-1/4 right-1/4 h-[30vw] w-[30vw] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none"
      />

      {/* Grid Pattern overlay for tech/engineering look */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-2xl text-center"
      >
        {/* Animated Tech Radar / Lost Coordinates Icon */}
        <motion.div 
          variants={itemVariants} 
          className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center"
        >
          {/* Outer rotating dashboard ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-zinc-700/60"
          />
          {/* Inner pulsating scanning ring */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute h-[80%] w-[80%] rounded-full border border-blue-500/20 bg-blue-500/5"
          />
          {/* High-tech central core */}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 shadow-2xl">
            <HelpCircle className="h-12 w-12 text-blue-400 animate-pulse" />
          </div>

          {/* Coordinates overlay text */}
          <span className="absolute -bottom-2 font-mono text-[10px] text-zinc-500 tracking-widest select-none">
            ERR_COORD_404_NOT_FOUND
          </span>
        </motion.div>

        {/* 404 Headline */}
        <motion.h1 
          variants={itemVariants}
          className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text font-heading text-8xl font-black tracking-tighter text-transparent select-none"
        >
          404
        </motion.h1>

        {/* Dynamic Title */}
        <motion.h2 
          variants={itemVariants}
          className="mt-4 font-heading text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl"
        >
          You&apos;ve drifted off course
        </motion.h2>

        {/* Descriptive Text */}
        <motion.p 
          variants={itemVariants}
          className="mx-auto mt-4 max-w-md text-sm text-zinc-400 leading-relaxed"
        >
          The page you are looking for doesn&apos;t exist, was renamed, or has slipped into another dimension. Let&apos;s get you back on track.
        </motion.p>

        {/* Premium search bar to quickly locate resources */}
        <motion.div variants={itemVariants} className="mx-auto mt-8 max-w-md">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
            <div className="relative flex items-center bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden pl-4 pr-2">
              <Search className="h-4 w-4 text-zinc-500 shrink-0" />
              <input
                type="text"
                placeholder="Search notes, schedules, question papers..."
                className="w-full bg-transparent border-0 py-3 pl-3 pr-4 text-sm text-white focus:outline-none focus:ring-0 placeholder:text-zinc-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-zinc-800 text-xs font-semibold hover:bg-zinc-700 text-zinc-200 py-1.5 px-3 rounded-lg transition duration-200 border border-zinc-700/50"
              >
                Search
              </button>
            </div>
          </form>
        </motion.div>

        {/* Quick Premium Destination Links */}
        <motion.div variants={itemVariants} className="mt-12">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-lg mx-auto">
            <Link
              href="/resources"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-blue-500/50 hover:bg-zinc-900 transition-all duration-300 group"
            >
              <BookOpen className="h-5 w-5 text-blue-400 mb-2 group-hover:scale-110 transition duration-200" />
              <span className="text-xs font-semibold text-zinc-200">Resources</span>
            </Link>
            
            <Link
              href="/notices"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-purple-500/50 hover:bg-zinc-900 transition-all duration-300 group"
            >
              <Megaphone className="h-5 w-5 text-purple-400 mb-2 group-hover:scale-110 transition duration-200" />
              <span className="text-xs font-semibold text-zinc-200">Notice Board</span>
            </Link>

            <Link
              href="/about"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all duration-300 group"
            >
              <Info className="h-5 w-5 text-emerald-400 mb-2 group-hover:scale-110 transition duration-200" />
              <span className="text-xs font-semibold text-zinc-200">About Helper</span>
            </Link>

            <Link
              href="/"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/50 hover:bg-zinc-900 transition-all duration-300 group"
            >
              <Home className="h-5 w-5 text-amber-400 mb-2 group-hover:scale-110 transition duration-200" />
              <span className="text-xs font-semibold text-zinc-200">Home Page</span>
            </Link>
          </div>
        </motion.div>

        {/* Action Button: Back to Safety */}
        <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </motion.div>
      </motion.div>
    </main>
  );
}
