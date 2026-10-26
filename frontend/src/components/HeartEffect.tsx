import React, { useEffect, useRef } from 'react';

interface HeartParticle {
    x: number;
    y: number;
    size: number;
    speedY: number;
    swaySpeed: number;
    swayDistance: number;
    swayOffset: number;
    opacity: number;
    baseOpacity: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
}

interface SparkleParticle {
    x: number;
    y: number;
    size: number;
    opacity: number;
    char: string;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
}

const COLORS = ['#ff4d79', '#ff758c', '#ffb3c6', '#ff9eb5', '#ff1a53', '#e91e8c', '#c2185b'];
const SPARKLE_CHARS = ['*', '+', '·', '•', '~', '¤'];
const HEART_PATH_STRING = "M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z";

const HeartEffect: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let animationFrameId: number;
        let isRunning = true;

        // Path2D for GPU-accelerated vector rendering
        let heartPath: Path2D;
        try {
            heartPath = new Path2D(HEART_PATH_STRING);
        } catch {
            return;
        }

        const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
        // Limit particle count: 12 on mobile, 22 on desktop for buttery 60 FPS
        const PARTICLE_COUNT = isMobile ? 12 : 22;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        // Cap DPR to 1.5 to prevent memory pressure on mobile 3x/4x screens
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        const handleResize = () => {
            if (!canvas) return;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        };

        window.addEventListener('resize', handleResize, { passive: true });

        // Initialize particle pool (zero garbage collection)
        const createParticle = (spawnRandomY = false): HeartParticle => {
            const size = Math.random() * (isMobile ? 14 : 20) + 10;
            return {
                x: Math.random() * width,
                y: spawnRandomY ? Math.random() * height : height + size + Math.random() * 40,
                size,
                speedY: Math.random() * 0.9 + (isMobile ? 0.6 : 0.8),
                swaySpeed: Math.random() * 0.02 + 0.01,
                swayDistance: Math.random() * 25 + 15,
                swayOffset: Math.random() * Math.PI * 2,
                opacity: 0,
                baseOpacity: Math.random() * 0.4 + 0.25,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                rotation: (Math.random() - 0.5) * 0.4,
                rotationSpeed: (Math.random() - 0.5) * 0.008,
            };
        };

        const hearts: HeartParticle[] = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            hearts.push(createParticle(true));
        }

        // Sparkle system for desktop only (pointer: fine)
        const sparkles: SparkleParticle[] = [];
        const isTouchOnly = window.matchMedia('(pointer: coarse)').matches;

        const handleMouseMove = (e: MouseEvent) => {
            if (isTouchOnly || sparkles.length > 20 || Math.random() > 0.4) return;
            sparkles.push({
                x: e.clientX,
                y: e.clientY,
                size: Math.random() * 10 + 9,
                opacity: 1,
                char: SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)],
                vx: (Math.random() - 0.5) * 1.2,
                vy: -Math.random() * 1.5 - 0.5,
                life: 0,
                maxLife: 28,
            });
        };

        if (!isTouchOnly) {
            window.addEventListener('mousemove', handleMouseMove, { passive: true });
        }

        // Render loop with requestAnimationFrame
        let lastTime = performance.now();

        const render = (now: number) => {
            if (!isRunning) return;

            // Pause animation when tab is not active to save battery and GPU
            if (document.hidden) {
                lastTime = now;
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            const dt = Math.min((now - lastTime) / 16.667, 2.5); // Normalized frame delta
            lastTime = now;

            ctx.clearRect(0, 0, width, height);

            // 1. Draw and update hearts
            for (let i = 0; i < hearts.length; i++) {
                const p = hearts[i];
                p.y -= p.speedY * dt;
                p.swayOffset += p.swaySpeed * dt;
                const currentX = p.x + Math.sin(p.swayOffset) * p.swayDistance;
                p.rotation += p.rotationSpeed * dt;

                // Smooth fade in near bottom, fade out near top
                if (p.y > height - 60) {
                    p.opacity = Math.min(p.baseOpacity, ((height - p.y) / 60) * p.baseOpacity);
                } else if (p.y < 80) {
                    p.opacity = Math.max(0, (p.y / 80) * p.baseOpacity);
                } else {
                    p.opacity = p.baseOpacity;
                }

                if (p.y < -p.size) {
                    // Recycle particle in-place
                    p.y = height + p.size + Math.random() * 20;
                    p.x = Math.random() * width;
                    p.color = COLORS[Math.floor(Math.random() * COLORS.length)];
                    p.speedY = Math.random() * 0.9 + (isMobile ? 0.6 : 0.8);
                    p.opacity = 0;
                }

                ctx.save();
                ctx.translate(currentX, p.y);
                ctx.rotate(p.rotation);
                const scale = p.size / 32;
                ctx.scale(scale, scale);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fill(heartPath);
                ctx.restore();
            }

            // 2. Draw and update desktop sparkles
            if (sparkles.length > 0) {
                ctx.font = '12px Balsamiq Sans, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                for (let i = sparkles.length - 1; i >= 0; i--) {
                    const s = sparkles[i];
                    s.life += dt;
                    s.x += s.vx * dt;
                    s.y += s.vy * dt;
                    s.opacity = Math.max(0, 1 - s.life / s.maxLife);

                    if (s.life >= s.maxLife) {
                        sparkles.splice(i, 1);
                        continue;
                    }

                    ctx.save();
                    ctx.fillStyle = '#ff4d79';
                    ctx.globalAlpha = s.opacity;
                    ctx.font = `${s.size}px sans-serif`;
                    ctx.fillText(s.char, s.x, s.y);
                    ctx.restore();
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            isRunning = false;
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            if (!isTouchOnly) {
                window.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1,
            }}
        />
    );
};

export default React.memo(HeartEffect);
