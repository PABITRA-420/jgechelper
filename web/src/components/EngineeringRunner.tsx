"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Types
interface Obstacle {
    x: number;
    width: number;
    height: number;
    type: "gear" | "resistor" | "capacitor" | "beam" | "code";
    passed: boolean;
    glowPhase: number;
}

interface Particle {
    x: number; y: number; vx: number; vy: number;
    life: number; maxLife: number; color: string; size: number;
}

interface Star {
    x: number; y: number; speed: number; size: number; brightness: number;
}

interface CircuitNode {
    x: number; y: number; pulsePhase: number;
}

interface GameState {
    playerY: number;
    playerVY: number;
    isJumping: boolean;
    obstacles: Obstacle[];
    particles: Particle[];
    speed: number;
    frame: number;
    groundY: number;
    score: number;
    gameOver: boolean;
    started: boolean;
    stars: Star[];
    circuitNodes: CircuitNode[];
    groundOffset: number;
    shakeTimer: number;
}

const PLAYER_W = 24, PLAYER_H = 32;
const NEON_CYAN = "#00f5ff";
const NEON_PURPLE = "#bf5fff";
const NEON_AMBER = "#ffb300";
const NEON_GREEN = "#39ff14";
const NEON_RED = "#ff2255";

// ── Glow helper ──────────────────────────────────────────────
const glow = (ctx: CanvasRenderingContext2D, color: string, blur: number) => {
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
};
const noGlow = (ctx: CanvasRenderingContext2D) => {
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
};

// ── Gear ─────────────────────────────────────────────────────
const drawGear = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.018);
    const teeth = 10;
    ctx.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
        const a = (i / (teeth * 2)) * Math.PI * 2;
        const rad = i % 2 === 0 ? r : r * 1.38;
        ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    glow(ctx, NEON_AMBER, 14);
    ctx.strokeStyle = NEON_AMBER;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,179,0,0.08)";
    ctx.fill();
    // inner hub
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
    ctx.strokeStyle = NEON_AMBER;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // spokes
    for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r * 0.28, Math.sin(a) * r * 0.28);
        ctx.lineTo(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.72);
        ctx.stroke();
    }
    noGlow(ctx);
    ctx.restore();
};

// ── Resistor ─────────────────────────────────────────────────
const drawResistor = (ctx: CanvasRenderingContext2D, bx: number, by: number, w: number, h: number, frame: number) => {
    ctx.save();
    // body box
    const bh = h * 0.45, bby = by + h * 0.28;
    ctx.strokeStyle = NEON_CYAN;
    ctx.lineWidth = 1.5;
    glow(ctx, NEON_CYAN, 10);
    ctx.strokeRect(bx + 2, bby, w - 4, bh);
    ctx.fillStyle = "rgba(0,245,255,0.06)";
    ctx.fillRect(bx + 2, bby, w - 4, bh);
    // colour bands
    const bands = ["#ff4444", "#ffaa00", "#ffff00", NEON_CYAN];
    const bw = (w - 10) / bands.length;
    bands.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(bx + 5 + i * bw, bby + 2, bw - 1, bh - 4);
    });
    // leads
    ctx.strokeStyle = "rgba(0,245,255,0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx + w / 2, by);
    ctx.lineTo(bx + w / 2, bby);
    ctx.moveTo(bx + w / 2, bby + bh);
    ctx.lineTo(bx + w / 2, by + h);
    ctx.stroke();
    noGlow(ctx);
    ctx.restore();
};

// ── Capacitor ─────────────────────────────────────────────────
const drawCapacitor = (ctx: CanvasRenderingContext2D, bx: number, by: number, w: number, h: number, frame: number) => {
    ctx.save();
    const mid = bx + w / 2;
    const plateSep = 5;
    const plateW = w * 0.7;
    const cy = by + h / 2;
    glow(ctx, NEON_PURPLE, 14);
    ctx.strokeStyle = NEON_PURPLE;
    ctx.lineWidth = 3;
    // plates
    ctx.beginPath();
    ctx.moveTo(mid - plateW / 2, cy - plateSep);
    ctx.lineTo(mid + plateW / 2, cy - plateSep);
    ctx.moveTo(mid - plateW / 2, cy + plateSep);
    ctx.lineTo(mid + plateW / 2, cy + plateSep);
    ctx.stroke();
    // leads
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(191,95,255,0.7)";
    ctx.beginPath();
    ctx.moveTo(mid, by);
    ctx.lineTo(mid, cy - plateSep);
    ctx.moveTo(mid, cy + plateSep);
    ctx.lineTo(mid, by + h);
    ctx.stroke();
    // arc discharge animation
    const anim = Math.sin(frame * 0.2) * 0.5 + 0.5;
    ctx.globalAlpha = anim * 0.7;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(mid, cy, plateW * 0.35, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    noGlow(ctx);
    ctx.restore();
};

// ── I-Beam ────────────────────────────────────────────────────
const drawBeam = (ctx: CanvasRenderingContext2D, bx: number, by: number, w: number, h: number) => {
    ctx.save();
    ctx.fillStyle = "#2a3a4a";
    ctx.fillRect(bx, by, w, h);
    // I-beam shape cutouts
    const flange = h * 0.25;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(bx + w * 0.25, by + flange, w * 0.5, h - flange * 2);
    // edge highlights
    ctx.strokeStyle = "#4a90b8";
    ctx.lineWidth = 1;
    glow(ctx, "#4a90b8", 6);
    ctx.strokeRect(bx + 0.5, by + 0.5, w - 1, h - 1);
    // rivets
    [[0.2, 0.2], [0.8, 0.2], [0.2, 0.8], [0.8, 0.8]].forEach(([rx, ry]) => {
        ctx.beginPath();
        ctx.arc(bx + w * rx, by + h * ry, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#4a90b8";
        ctx.fill();
    });
    noGlow(ctx);
    ctx.restore();
};

// ── Code Block ────────────────────────────────────────────────
const drawCode = (ctx: CanvasRenderingContext2D, bx: number, by: number, w: number, h: number, frame: number) => {
    ctx.save();
    // background terminal
    ctx.fillStyle = "rgba(16,185,129,0.1)";
    ctx.strokeStyle = NEON_GREEN;
    ctx.lineWidth = 1.5;
    glow(ctx, NEON_GREEN, 12);
    ctx.strokeRect(bx, by, w, h);
    ctx.fillRect(bx, by, w, h);
    // scanline
    const scanY = by + (frame * 1.5 % h);
    ctx.fillStyle = "rgba(57,255,20,0.15)";
    ctx.fillRect(bx, scanY, w, 2);
    // text lines
    ctx.font = "bold 7px monospace";
    ctx.fillStyle = NEON_GREEN;
    noGlow(ctx);
    glow(ctx, NEON_GREEN, 6);
    const lines = ["fn()", "{}", "</>", "0x1F", "=>"];
    lines.slice(0, Math.min(3, Math.floor(h / 12))).forEach((l, i) => {
        ctx.fillText(l, bx + 3, by + 10 + i * 11);
    });
    noGlow(ctx);
    ctx.restore();
};

const drawObstacle = (ctx: CanvasRenderingContext2D, obs: Obstacle, frame: number, groundY: number) => {
    const bx = obs.x, by = groundY - obs.height;
    obs.glowPhase = (obs.glowPhase ?? 0) + 0.06;
    ctx.save();
    switch (obs.type) {
        case "gear": drawGear(ctx, bx + obs.width / 2, by + obs.height / 2, obs.height / 2 - 2, frame); break;
        case "resistor": drawResistor(ctx, bx, by, obs.width, obs.height, frame); break;
        case "capacitor": drawCapacitor(ctx, bx, by, obs.width, obs.height, frame); break;
        case "beam": drawBeam(ctx, bx, by, obs.width, obs.height); break;
        case "code": drawCode(ctx, bx, by, obs.width, obs.height, frame); break;
    }
    ctx.restore();
};

// ── Player ────────────────────────────────────────────────────
const drawPlayer = (ctx: CanvasRenderingContext2D, y: number, frame: number, jumping: boolean, shakeTimer: number) => {
    const px = 50 + (shakeTimer > 0 ? Math.sin(shakeTimer * 1.5) * 1.5 : 0);
    ctx.save();
    ctx.translate(px, y);

    const bodyGlow = jumping ? 18 : 8;
    glow(ctx, NEON_CYAN, bodyGlow);

    // legs
    ctx.fillStyle = "#1a3a6a";
    if (jumping) {
        ctx.fillRect(4, 24, 6, 7);
        ctx.fillRect(14, 24, 6, 7);
    } else {
        const legOff = Math.sin(frame * 0.32) * 3;
        ctx.fillRect(4, 24, 6, 8 + legOff);
        ctx.fillRect(14, 24, 6, 8 - legOff);
    }

    // body
    const bodyGrad = ctx.createLinearGradient(4, 10, 20, 24);
    bodyGrad.addColorStop(0, "#1d4ed8");
    bodyGrad.addColorStop(1, "#1e3a8a");
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(4, 10, 16, 14);
    // body outline
    ctx.strokeStyle = NEON_CYAN;
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 10, 16, 14);
    // chest badge
    ctx.fillStyle = NEON_CYAN;
    ctx.fillRect(9, 14, 6, 4);

    // head
    noGlow(ctx);
    glow(ctx, "#fbbf24", 8);
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(12, 6, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1;
    ctx.stroke();
    // face
    noGlow(ctx);
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(9, 4, 2, 2);
    ctx.fillRect(13, 4, 2, 2);
    ctx.fillRect(10, 8, 4, 1);

    // graduation cap
    glow(ctx, "#7dd3fc", 6);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(4, -2, 16, 3);
    ctx.fillRect(8, -6, 8, 4);
    // tassel
    ctx.strokeStyle = NEON_AMBER;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(16, -4);
    ctx.lineTo(18, 2);
    ctx.stroke();

    noGlow(ctx);
    ctx.restore();
};

// ── Background layers ─────────────────────────────────────────
const drawBackground = (ctx: CanvasRenderingContext2D, W: number, H: number, game: GameState) => {
    // Sky
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#020817");
    grad.addColorStop(0.6, "#0a0f24");
    grad.addColorStop(1, "#0d1b2a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stars (parallax)
    game.stars.forEach(s => {
        const alpha = 0.4 + 0.5 * Math.abs(Math.sin(game.frame * 0.01 + s.brightness));
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
        s.x -= s.speed;
        if (s.x < 0) { s.x = W + 2; s.y = Math.random() * H * 0.55; }
    });

    // Distant city silhouette
    ctx.fillStyle = "rgba(15,25,50,0.9)";
    const buildings = [0.05, 0.10, 0.17, 0.25, 0.32, 0.42, 0.50, 0.58, 0.65, 0.73, 0.81, 0.90, 0.96];
    const bHeights = [55, 40, 65, 45, 70, 35, 60, 50, 75, 42, 58, 38, 50];
    buildings.forEach((bx, i) => {
        const bw = W * 0.055;
        ctx.fillRect(bx * W - (game.frame * 0.25) % W, game.groundY - bHeights[i], bw, bHeights[i]);
    });

    // Horizon glow
    const horizGrad = ctx.createLinearGradient(0, game.groundY - 30, 0, game.groundY + 5);
    horizGrad.addColorStop(0, "rgba(0,245,255,0.00)");
    horizGrad.addColorStop(0.6, "rgba(0,245,255,0.06)");
    horizGrad.addColorStop(1, "rgba(0,245,255,0.14)");
    ctx.fillStyle = horizGrad;
    ctx.fillRect(0, game.groundY - 30, W, 35);
};

const drawGround = (ctx: CanvasRenderingContext2D, W: number, H: number, game: GameState) => {
    const gY = game.groundY;

    // Ground base
    const gGrad = ctx.createLinearGradient(0, gY, 0, H);
    gGrad.addColorStop(0, "#0d2137");
    gGrad.addColorStop(1, "#060e1a");
    ctx.fillStyle = gGrad;
    ctx.fillRect(0, gY, W, H - gY);

    // Glowing ground line
    glow(ctx, NEON_CYAN, 10);
    ctx.strokeStyle = "rgba(0,245,255,0.8)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, gY);
    ctx.lineTo(W, gY);
    ctx.stroke();
    noGlow(ctx);

    // Moving circuit lines on ground
    ctx.strokeStyle = "rgba(0,245,255,0.18)";
    ctx.lineWidth = 1;
    const step = 40;
    const offset = -(game.frame * game.speed) % step;
    for (let gx = offset; gx < W; gx += step) {
        ctx.beginPath();
        ctx.moveTo(gx, gY + 1);
        ctx.lineTo(gx, H);
        ctx.stroke();
    }

    // Circuit nodes on ground
    game.circuitNodes.forEach(n => {
        n.x -= game.speed * 0.6;
        if (n.x < -10) { n.x = W + Math.random() * 80; n.y = gY + 4 + Math.random() * 10; }
        n.pulsePhase += 0.07;
        const alpha = 0.25 + 0.35 * Math.abs(Math.sin(n.pulsePhase));
        ctx.fillStyle = `rgba(0,245,255,${alpha})`;
        ctx.fillRect(n.x - 1.5, n.y - 1.5, 3, 3);
    });
};

// ── Score ribbon ──────────────────────────────────────────────
const drawHUD = (ctx: CanvasRenderingContext2D, score: number, speed: number, W: number) => {
    // score pill
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    roundRect(ctx, W - 110, 8, 100, 22, 6);
    ctx.fill();
    glow(ctx, NEON_CYAN, 6);
    ctx.strokeStyle = "rgba(0,245,255,0.5)";
    ctx.lineWidth = 1;
    roundRect(ctx, W - 110, 8, 100, 22, 6);
    ctx.stroke();
    noGlow(ctx);
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(`SCORE  `, W - 102, 23);
    glow(ctx, NEON_AMBER, 8);
    ctx.fillStyle = NEON_AMBER;
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillText(`${score}`, W - 35, 24);
    noGlow(ctx);
    // speed bar
    const barW = 60;
    const barX = W - 110;
    const barY = 34;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(barX, barY, barW, 5);
    const fill = Math.min(((speed - 3.5) / 6), 1) * barW;
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    barGrad.addColorStop(0, NEON_GREEN);
    barGrad.addColorStop(1, NEON_RED);
    ctx.fillStyle = barGrad;
    ctx.fillRect(barX, barY, fill, 5);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = "7px monospace";
    ctx.fillText("SPD", barX + barW + 4, barY + 5);
    ctx.restore();
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
}

// ── Main Component ────────────────────────────────────────────
export default function EngineeringRunner() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<GameState | null>(null);
    const animFrameRef = useRef<number>(0);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [started, setStarted] = useState(false);

    const makeStars = (W: number, H: number): Star[] =>
        Array.from({ length: 40 }, () => ({
            x: Math.random() * W, y: Math.random() * H * 0.55,
            speed: 0.1 + Math.random() * 0.35,
            size: Math.random() < 0.3 ? 2 : 1,
            brightness: Math.random() * Math.PI * 2,
        }));

    const makeCircuitNodes = (W: number, groundY: number): CircuitNode[] =>
        Array.from({ length: 18 }, () => ({
            x: Math.random() * W,
            y: groundY + 4 + Math.random() * 10,
            pulsePhase: Math.random() * Math.PI * 2,
        }));

    const initGame = useCallback((canvas: HTMLCanvasElement): GameState => {
        const groundY = canvas.height - 40;
        return {
            playerY: groundY - PLAYER_H, playerVY: 0, isJumping: false,
            obstacles: [], particles: [], speed: 3.5, frame: 0,
            groundY, score: 0, gameOver: false, started: true,
            stars: makeStars(canvas.width, canvas.height),
            circuitNodes: makeCircuitNodes(canvas.width, groundY),
            groundOffset: 0, shakeTimer: 0,
        };
    }, []);

    const gameLoop = useCallback(() => {
        const canvas = canvasRef.current;
        const game = gameRef.current;
        if (!canvas || !game || game.gameOver) return;

        const ctx = canvas.getContext("2d")!;
        const W = canvas.width, H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        drawBackground(ctx, W, H, game);

        // Physics
        game.playerVY += 0.65;
        game.playerY += game.playerVY;
        if (game.playerY >= game.groundY - PLAYER_H) {
            if (game.playerY > game.groundY - PLAYER_H + 1) {
                // landing dust
                for (let p = 0; p < 4; p++) {
                    game.particles.push({
                        x: 55 + Math.random() * 10 - 5, y: game.groundY,
                        vx: (Math.random() - 0.5) * 2, vy: -(Math.random() * 1.5),
                        life: 15, maxLife: 15, color: "rgba(0,245,255,0.5)", size: 2,
                    });
                }
            }
            game.playerY = game.groundY - PLAYER_H;
            game.playerVY = 0;
            game.isJumping = false;
        }

        // Obstacles
        game.frame++;
        const spawnInterval = Math.max(48, 105 - game.score * 0.8);
        if (game.frame % Math.floor(spawnInterval) === 0) {
            const types: Obstacle["type"][] = ["gear", "resistor", "capacitor", "beam", "code"];
            const type = types[Math.floor(Math.random() * types.length)];
            const h = 22 + Math.random() * 26;
            game.obstacles.push({
                x: W + 10, width: 22 + Math.random() * 16,
                height: h, type, passed: false, glowPhase: 0,
            });
        }

        game.obstacles = game.obstacles.filter(o => o.x > -60);
        for (const obs of game.obstacles) {
            obs.x -= game.speed;
            drawObstacle(ctx, obs, game.frame, game.groundY);

            if (!obs.passed && obs.x + obs.width < 50) {
                obs.passed = true;
                game.score++;
                setScore(game.score);
                if (game.score % 5 === 0) game.speed += 0.3;
                for (let p = 0; p < 12; p++) {
                    const colors = [NEON_CYAN, NEON_PURPLE, NEON_AMBER, NEON_GREEN, "#ffffff"];
                    game.particles.push({
                        x: 62, y: game.playerY + 10,
                        vx: (Math.random() - 0.5) * 4, vy: -(Math.random() * 4 + 1),
                        life: 35, maxLife: 35,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        size: 1 + Math.random() * 2,
                    });
                }
            }

            // Collision
            const px = 50, pw = PLAYER_W - 4;
            const obsTop = game.groundY - obs.height;
            if (px + pw > obs.x + 5 && px + 4 < obs.x + obs.width - 5 &&
                game.playerY + PLAYER_H > obsTop + 5) {
                // death burst
                for (let p = 0; p < 20; p++) {
                    game.particles.push({
                        x: px + 12, y: game.playerY + 16,
                        vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
                        life: 45, maxLife: 45, color: NEON_RED, size: 2 + Math.random() * 2,
                    });
                }
                game.gameOver = true;
                setGameOver(true);
                setHighScore(prev => Math.max(prev, game.score));
                // draw final frame with burst
                game.particles.forEach(p => {
                    ctx.globalAlpha = p.life / p.maxLife;
                    glow(ctx, p.color, 8);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(p.x, p.y, p.size, p.size);
                });
                noGlow(ctx);
                ctx.globalAlpha = 1;
                return;
            }
        }

        // Particles
        game.particles = game.particles.filter(p => p.life > 0);
        for (const p of game.particles) {
            p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life--;
            ctx.globalAlpha = p.life / p.maxLife;
            glow(ctx, p.color, 6);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
        noGlow(ctx);
        ctx.globalAlpha = 1;

        drawGround(ctx, W, H, game);
        if (game.shakeTimer > 0) game.shakeTimer--;
        drawPlayer(ctx, game.playerY, game.frame, game.isJumping, game.shakeTimer);
        drawHUD(ctx, game.score, game.speed, W);

        animFrameRef.current = requestAnimationFrame(gameLoop);
    }, []);

    const handleJump = useCallback(() => {
        const game = gameRef.current;
        if (!game) return;
        if (game.gameOver) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            gameRef.current = initGame(canvas);
            setGameOver(false);
            setScore(0);
            setStarted(true);
            animFrameRef.current = requestAnimationFrame(gameLoop);
            return;
        }
        if (!game.started) {
            game.started = true;
            setStarted(true);
            animFrameRef.current = requestAnimationFrame(gameLoop);
            return;
        }
        if (!game.isJumping) {
            game.playerVY = -12;
            game.isJumping = true;
        }
    }, [gameLoop, initGame]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            canvas.width = Math.min(rect.width, 620);
            canvas.height = 210;
            if (gameRef.current) {
                gameRef.current.groundY = canvas.height - 40;
                gameRef.current.stars = makeStars(canvas.width, canvas.height);
            }
        };

        resizeCanvas();
        const g = initGame(canvas);
        g.started = false;
        gameRef.current = g;
        setStarted(false);

        // Draw idle frame
        const ctx = canvas.getContext("2d")!;
        drawBackground(ctx, canvas.width, canvas.height, g);
        drawGround(ctx, canvas.width, canvas.height, g);
        drawPlayer(ctx, canvas.height - 40 - PLAYER_H, 0, false, 0);

        const handleKey = (e: KeyboardEvent) => {
            if (e.code === "Space" || e.code === "ArrowUp") {
                e.preventDefault();
                handleJump();
            }
        };
        window.addEventListener("keydown", handleKey);
        window.addEventListener("resize", resizeCanvas);

        return () => {
            window.removeEventListener("keydown", handleKey);
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animFrameRef.current);
        };
    }, [handleJump, initGame]);

    return (
        <div className="w-full max-w-[620px] mx-auto select-none">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
                        style={{ color: NEON_CYAN, textShadow: `0 0 8px ${NEON_CYAN}` }}>
                        ⚡ ENG.RUNNER
                    </span>
                    <span className="text-[9px] text-slate-600 font-mono">v2.0</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 font-mono">
                        HI&nbsp;
                        <span className="font-bold" style={{ color: NEON_AMBER, textShadow: `0 0 6px ${NEON_AMBER}` }}>
                            {highScore}
                        </span>
                    </span>
                </div>
            </div>

            {/* Game canvas */}
            <div
                className="relative rounded-xl overflow-hidden cursor-pointer"
                style={{
                    border: `1px solid rgba(0,245,255,0.25)`,
                    boxShadow: `0 0 30px rgba(0,245,255,0.08), 0 0 60px rgba(0,0,0,0.6), inset 0 0 30px rgba(0,0,0,0.3)`,
                }}
                onClick={handleJump}
                onTouchStart={(e) => { e.preventDefault(); handleJump(); }}
            >
                <canvas
                    ref={canvasRef}
                    className="w-full block"
                    style={{ imageRendering: "pixelated" }}
                />

                {/* Game Over overlay */}
                {gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center"
                        style={{ background: "rgba(2,8,23,0.75)", backdropFilter: "blur(4px)" }}>
                        <p className="text-2xl font-black tracking-widest mb-1 font-mono"
                            style={{ color: NEON_RED, textShadow: `0 0 20px ${NEON_RED}` }}>
                            GAME OVER
                        </p>
                        <p className="text-slate-400 text-xs font-mono mb-4">
                            SCORE &nbsp;
                            <span className="font-bold text-sm" style={{ color: NEON_AMBER }}>
                                {score}
                            </span>
                        </p>
                        <div className="flex items-center gap-1 px-4 py-1.5 rounded-full font-mono text-[11px] animate-pulse"
                            style={{ border: `1px solid rgba(0,245,255,0.4)`, color: NEON_CYAN }}>
                            ↩ RETRY
                        </div>
                    </div>
                )}

                {/* Start overlay */}
                {!started && !gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                        style={{ background: "rgba(2,8,23,0.5)", backdropFilter: "blur(2px)" }}>
                        <p className="font-mono text-xs tracking-widest animate-pulse"
                            style={{ color: NEON_CYAN, textShadow: `0 0 10px ${NEON_CYAN}` }}>
                            PRESS SPACE OR TAP TO START
                        </p>
                        <p className="font-mono text-[9px] text-slate-600">
                            JUMP OVER ENGINEERING OBSTACLES
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-1.5 px-1">
                <span className="text-[9px] text-slate-700 font-mono">SPACE / TAP to jump</span>
                {started && !gameOver && (
                    <span className="text-[9px] font-mono" style={{ color: NEON_CYAN }}>
                        SCORE {score}
                    </span>
                )}
            </div>
        </div>
    );
}