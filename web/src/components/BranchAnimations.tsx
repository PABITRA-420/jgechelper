"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/* ── Rotating Gear (ME) ─────────────────────────────────────── */
function GearSVG({
    r = 28,
    teeth = 10,
    color = "#f59e0b",
    speed = 8,
    dir = 1,
}: {
    r?: number;
    teeth?: number;
    color?: string;
    speed?: number;
    dir?: number;
}) {
    const cx = r + 12,
        cy = r + 12,
        outer = r,
        inner = r * 0.72,
        hub = r * 0.28;
    const pts: string[] = [];
    for (let i = 0; i < teeth * 2; i++) {
        const ang = (i / (teeth * 2)) * Math.PI * 2;
        const rad = i % 2 === 0 ? outer : inner;
        pts.push(`${cx + Math.cos(ang) * rad},${cy + Math.sin(ang) * rad}`);
    }
    return (
        <motion.svg
            width={cx * 2}
            height={cy * 2}
            viewBox={`0 0 ${cx * 2} ${cy * 2}`}
            style={{ overflow: "visible" }}
        >
            <motion.g
                animate={{ rotate: 360 * dir }}
                transition={{ repeat: Infinity, duration: speed, ease: "linear" }}
                style={{ originX: "50%", originY: "50%" }}
            >
                <polygon
                    points={pts.join(" ")}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                <circle cx={cx} cy={cy} r={hub} fill="none" stroke={color} strokeWidth="2" />
                <circle cx={cx} cy={cy} r={hub * 0.4} fill={color} opacity={0.35} />
                {/* Spokes */}
                {[0, 60, 120].map((deg) => (
                    <line
                        key={deg}
                        x1={cx}
                        y1={cy}
                        x2={cx + Math.cos((deg * Math.PI) / 180) * inner}
                        y2={cy + Math.sin((deg * Math.PI) / 180) * inner}
                        stroke={color}
                        strokeWidth="1"
                        opacity={0.25}
                    />
                ))}
            </motion.g>
        </motion.svg>
    );
}

/* ── Typing Code Screen (CSE/IT) ──────────────────────────────── */
const CODE_LINES = [
    { txt: "const solve = (n) => {", color: "#60a5fa" },
    { txt: "  if (n <= 1) return n;", color: "#a78bfa" },
    { txt: "  return solve(n-1)+solve(n-2);", color: "#34d399" },
    { txt: "};", color: "#60a5fa" },
    { txt: "// Output: 55", color: "#6b7280" },
];

function CodeScreen({ color = "#22d3ee" }: { color?: string }) {
    const [lines, setLines] = useState<number>(0);
    useEffect(() => {
        const t = setInterval(
            () => setLines((p) => (p + 1) % (CODE_LINES.length + 1)),
            700,
        );
        return () => clearInterval(t);
    }, []);
    return (
        <svg width="120" height="88" viewBox="0 0 120 88">
            {/* Monitor shell */}
            <rect
                x="2"
                y="2"
                width="116"
                height="70"
                rx="6"
                fill="#0f172a"
                stroke={color}
                strokeWidth="1.5"
            />
            {/* Top bar with dots */}
            <circle cx="10" cy="8" r="2" fill="#ef4444" opacity={0.7} />
            <circle cx="17" cy="8" r="2" fill="#facc15" opacity={0.7} />
            <circle cx="24" cy="8" r="2" fill="#22c55e" opacity={0.7} />
            <line x1="2" y1="13" x2="118" y2="13" stroke={color} strokeWidth="0.5" opacity={0.2} />

            {/* Stand */}
            <rect x="46" y="72" width="28" height="5" fill="#1e293b" />
            <rect x="36" y="77" width="48" height="4" rx="2" fill="#1e293b" />

            {/* Scanline */}
            <motion.rect
                x="2"
                y="14"
                width="116"
                height="3"
                fill={color}
                opacity={0.04}
                animate={{ y: [14, 68, 14] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
            />

            {/* Code lines */}
            {CODE_LINES.slice(0, lines).map((l, i) => (
                <text
                    key={i}
                    x="8"
                    y={24 + i * 10}
                    fontFamily="monospace"
                    fontSize="7"
                    fill={l.color}
                    opacity={0.9}
                >
                    {l.txt}
                </text>
            ))}

            {/* Cursor blink */}
            <motion.rect
                x={8}
                y={24 + lines * 10 - 7}
                width="4"
                height="8"
                fill={color}
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.55 }}
            />
        </svg>
    );
}

/* ── Circuit Board (ECE) ─────────────────────────────────────── */
function CircuitBoard({ color = "#a78bfa" }: { color?: string }) {
    const nodes = [
        { x: 20, y: 20 },
        { x: 60, y: 20 },
        { x: 100, y: 20 },
        { x: 20, y: 55 },
        { x: 60, y: 55 },
        { x: 100, y: 55 },
    ];
    const paths = [
        "M20,20 L60,20 L60,55",
        "M60,20 L100,20 L100,55",
        "M20,55 L60,55",
        "M60,55 L100,55",
        "M20,20 L20,55",
    ];
    return (
        <svg width="120" height="75" viewBox="0 0 120 75">
            {paths.map((d, i) => (
                <motion.path
                    key={i}
                    d={d}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    opacity={0.4}
                    strokeDasharray="4 2"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{
                        repeat: Infinity,
                        duration: 2 + i * 0.3,
                        ease: "linear",
                    }}
                />
            ))}

            {/* Data pulse traveling along first path */}
            <motion.circle
                r="2.5"
                fill={color}
                opacity={0.9}
                animate={{
                    cx: [20, 60, 60],
                    cy: [20, 20, 55],
                }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            />

            {nodes.map((n, i) => (
                <g key={i}>
                    <circle
                        cx={n.x}
                        cy={n.y}
                        r="4"
                        fill="#0f172a"
                        stroke={color}
                        strokeWidth="1.5"
                    />
                    <motion.circle
                        cx={n.x}
                        cy={n.y}
                        r="6"
                        fill="none"
                        stroke={color}
                        strokeWidth="1"
                        animate={{ r: [4, 8, 4], opacity: [0.8, 0, 0.8] }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                    />
                </g>
            ))}

            {/* Chip */}
            <rect
                x="50"
                y="42"
                width="20"
                height="15"
                rx="2"
                fill="#1e293b"
                stroke={color}
                strokeWidth="1"
            />
            <text
                x="55"
                y="53"
                fontFamily="monospace"
                fontSize="6"
                fill={color}
                opacity={0.8}
            >
                IC
            </text>
            {/* Chip pins */}
            {[52, 56, 60, 64].map((px) => (
                <line key={px} x1={px} y1="42" x2={px} y2="39" stroke={color} strokeWidth="1" opacity={0.3} />
            ))}
        </svg>
    );
}

/* ── Structural Beam (CE) ────────────────────────────────────── */
function StructuralBeam({ color = "#fb923c" }: { color?: string }) {
    return (
        <svg width="100" height="80" viewBox="0 0 100 80">
            {/* Truss bridge */}
            <line x1="5" y1="55" x2="95" y2="55" stroke={color} strokeWidth="2.5" />
            <line
                x1="5"
                y1="25"
                x2="95"
                y2="25"
                stroke={color}
                strokeWidth="1.5"
                opacity={0.6}
            />
            {[15, 35, 55, 75].map((x, i) => (
                <g key={i}>
                    <line
                        x1={x}
                        y1="25"
                        x2={x}
                        y2="55"
                        stroke={color}
                        strokeWidth="1.5"
                        opacity={0.5}
                    />
                    <line
                        x1={x}
                        y1="25"
                        x2={x + 20}
                        y2="55"
                        stroke={color}
                        strokeWidth="1"
                        opacity={0.3}
                    />
                </g>
            ))}

            {/* Animated load arrows */}
            {[25, 50, 75].map((x, i) => (
                <g key={i}>
                    <motion.circle
                        cx={x}
                        cy="20"
                        r="3"
                        fill={color}
                        animate={{ cy: [18, 24, 18] }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            delay: i * 0.4,
                            ease: "easeInOut",
                        }}
                    />
                    <motion.line
                        x1={x}
                        y1="12"
                        x2={x}
                        y2="20"
                        stroke={color}
                        strokeWidth="1"
                        opacity={0.4}
                        animate={{ y1: [10, 16, 10], y2: [18, 24, 18] }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            delay: i * 0.4,
                            ease: "easeInOut",
                        }}
                    />
                </g>
            ))}

            {/* Ground hatching */}
            <line
                x1="0"
                y1="60"
                x2="100"
                y2="60"
                stroke={color}
                strokeWidth="1"
                opacity={0.3}
            />
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x) => (
                <line
                    key={x}
                    x1={x}
                    y1="60"
                    x2={x - 5}
                    y2="67"
                    stroke={color}
                    strokeWidth="1"
                    opacity={0.2}
                />
            ))}

            {/* Support triangles */}
            <polygon points="5,55 15,55 10,62" fill={color} opacity={0.15} />
            <polygon points="85,55 95,55 90,62" fill={color} opacity={0.15} />
        </svg>
    );
}

/* ── Lightning Bolt + Waveform (EE) ─────────────────────────── */
function ElectricalWave({ color = "#facc15" }: { color?: string }) {
    const wave = Array.from({ length: 20 }, (_, i) => {
        const x = i * 6;
        const y = 35 + Math.sin(i * 0.8) * 15;
        return `${i === 0 ? "M" : "L"}${x},${y}`;
    }).join(" ");
    return (
        <svg width="120" height="70" viewBox="0 0 120 70">
            {/* Waveform */}
            <motion.path
                d={wave}
                fill="none"
                stroke={color}
                strokeWidth="2"
                opacity={0.5}
                animate={{ strokeDashoffset: [0, -30] }}
                strokeDasharray="6 2"
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
            {/* Bolt */}
            <motion.path
                d="M60,5 L48,35 L58,35 L45,65 L72,28 L62,28 Z"
                fill={color}
                opacity={0.9}
                animate={{ opacity: [0.9, 0.4, 0.9], scale: [1, 1.08, 1] }}
                style={{ originX: "58px", originY: "35px" }}
                transition={{ repeat: Infinity, duration: 1.2 }}
            />
            {/* Spark particles around bolt */}
            {[
                { cx: 44, cy: 40 },
                { cx: 73, cy: 26 },
                { cx: 50, cy: 12 },
            ].map((s, i) => (
                <motion.circle
                    key={i}
                    cx={s.cx}
                    cy={s.cy}
                    r="1.5"
                    fill={color}
                    animate={{ opacity: [0, 1, 0], r: [1, 2.5, 1] }}
                    transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        delay: i * 0.3,
                    }}
                />
            ))}
        </svg>
    );
}

/* ── Network Nodes (IT) ──────────────────────────────────────── */
function NetworkNodes({ color = "#34d399" }: { color?: string }) {
    const nodes = [
        { x: 60, y: 10 },
        { x: 20, y: 45 },
        { x: 100, y: 45 },
        { x: 40, y: 70 },
        { x: 80, y: 70 },
    ];
    const edges: [number, number][] = [
        [0, 1],
        [0, 2],
        [1, 3],
        [2, 4],
        [1, 4],
        [3, 4],
    ];
    return (
        <svg width="120" height="80" viewBox="0 0 120 80">
            {edges.map(([a, b], i) => (
                <g key={`edge-${i}`}>
                    <motion.line
                        x1={nodes[a].x}
                        y1={nodes[a].y}
                        x2={nodes[b].x}
                        y2={nodes[b].y}
                        stroke={color}
                        strokeWidth="1.5"
                        opacity={0.3}
                        strokeDasharray="4 2"
                        animate={{ strokeDashoffset: [0, -12] }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.5 + i * 0.2,
                            ease: "linear",
                        }}
                    />
                    {/* Packet dot traveling along edge */}
                    <motion.circle
                        r="2"
                        fill={color}
                        opacity={0.8}
                        animate={{
                            cx: [nodes[a].x, nodes[b].x],
                            cy: [nodes[a].y, nodes[b].y],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 2 + i * 0.4,
                            delay: i * 0.6,
                            ease: "linear",
                        }}
                    />
                </g>
            ))}
            {nodes.map((n, i) => (
                <g key={i}>
                    <motion.circle
                        cx={n.x}
                        cy={n.y}
                        r="7"
                        fill="#0f172a"
                        stroke={color}
                        strokeWidth="1.5"
                        animate={{ scale: [1, 1.15, 1] }}
                        style={{ originX: `${n.x}px`, originY: `${n.y}px` }}
                        transition={{
                            repeat: Infinity,
                            duration: 2,
                            delay: i * 0.35,
                        }}
                    />
                    <circle cx={n.x} cy={n.y} r="3" fill={color} opacity={0.7} />
                </g>
            ))}
        </svg>
    );
}

/* ── Branch config ────────────────────────────────────────────── */
export const BRANCHES = [
    {
        label: "ME",
        color: "#f59e0b",
        Component: () => <GearSVG color="#f59e0b" r={28} speed={8} dir={1} />,
    },
    {
        label: "ME2",
        color: "#f59e0b",
        Component: () => <GearSVG color="#f59e0b" r={18} teeth={6} speed={5} dir={-1} />,
    },
    {
        label: "CSE",
        color: "#22d3ee",
        Component: () => <CodeScreen color="#22d3ee" />,
    },
    {
        label: "IT",
        color: "#34d399",
        Component: () => <NetworkNodes color="#34d399" />,
    },
    {
        label: "ECE",
        color: "#a78bfa",
        Component: () => <CircuitBoard color="#a78bfa" />,
    },
    {
        label: "CE",
        color: "#fb923c",
        Component: () => <StructuralBeam color="#fb923c" />,
    },
    {
        label: "EE",
        color: "#facc15",
        Component: () => <ElectricalWave color="#facc15" />,
    },
];

/* ── Floating panel that drifts around the screen ────────────── */
interface FloatingCardProps {
    x: number;
    y: number;
    delay: number;
    driftX: number;
    driftY: number;
    children: React.ReactNode;
    color: string;
}

function FloatingCard({
    x,
    y,
    delay,
    driftX,
    driftY,
    children,
    color,
}: FloatingCardProps) {
    return (
        <motion.div
            className="absolute pointer-events-none select-none"
            style={{ left: `${x}%`, top: `${y}%`, willChange: "transform, opacity" }}
            initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
            animate={{
                opacity: [0, 0.22, 0.22, 0],
                x: [0, driftX, driftX * 1.5],
                y: [0, driftY, driftY * 1.5],
                scale: [0.85, 1, 0.95],
                rotate: [-2, 1, -1],
            }}
            transition={{
                duration: 16,
                delay,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut",
            }}
        >
            <div
                className="rounded-2xl border p-3 backdrop-blur-sm relative"
                style={{
                    borderColor: `${color}25`,
                    background: `${color}08`,
                    boxShadow: `0 0 24px ${color}12, 0 0 60px ${color}06`,
                }}
            >
                {/* Glow halo */}
                <div
                    className="absolute -inset-3 rounded-3xl pointer-events-none"
                    style={{
                        background: `radial-gradient(ellipse at center, ${color}08 0%, transparent 70%)`,
                    }}
                />
                <div className="relative">{children}</div>
            </div>
        </motion.div>
    );
}

/* ── Master export: renders all floating branch animations ─────── */
export default function BranchAnimations() {
    const placements = [
        { bi: 0, x: 3, y: 10, dx: 15, dy: 20, delay: 0 },
        { bi: 1, x: 78, y: 5, dx: -10, dy: 25, delay: 3 },
        { bi: 2, x: 5, y: 55, dx: 20, dy: -15, delay: 1.5 },
        { bi: 3, x: 75, y: 60, dx: -15, dy: -20, delay: 5 },
        { bi: 4, x: 40, y: 3, dx: 5, dy: 30, delay: 7 },
        { bi: 5, x: 2, y: 30, dx: 25, dy: 10, delay: 2 },
        { bi: 6, x: 72, y: 30, dx: -20, dy: 15, delay: 9 },
    ];

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {placements.map(({ bi, x, y, dx, dy, delay }) => {
                const branch = BRANCHES[bi % BRANCHES.length];
                const { Component } = branch;
                return (
                    <FloatingCard
                        key={bi}
                        x={x}
                        y={y}
                        driftX={dx}
                        driftY={dy}
                        delay={delay}
                        color={branch.color}
                    >
                        <Component />
                    </FloatingCard>
                );
            })}
        </div>
    );
}
