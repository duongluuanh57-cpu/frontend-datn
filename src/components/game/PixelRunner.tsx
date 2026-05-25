'use client';

import { useEffect, useRef } from 'react';
import './pixel-runner.css';

interface Part {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
}

interface Star {
  x: number; y: number; size: number; speed: number;
}

export function PixelRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const animRef = useRef(0);
  const starsRef = useRef<Star[]>([]);
  const partsRef = useRef<Part[]>([]);
  const charRef = useRef<HTMLImageElement | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const posRef = useRef({ x: 0.3, y: 0 });
  const flipRef = useRef(false);
  const onGroundRef = useRef(true);

  useEffect(() => {
    const img = new Image();
    img.src = '/images/Chikawa.png';
    charRef.current = img;
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.add(key);
      if (key === 'w') {
        onGroundRef.current = false;
        posRef.current.y -= 0.4;
      }
      if (key === 'a' || key === 'd' || key === 'w' || key === 's') {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      starsRef.current = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height - 80) + 10,
        size: Math.random() * 2.5 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    let lastTime = 0;

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.67, 3);
      lastTime = time;
      frameRef.current++;

      const W = canvas!.width;
      const H = canvas!.height;
      const GY = H - 50;

      const keys = keysRef.current;
      const speed = 1;
      const pos = posRef.current;
      let moving = false;

      if (keys.has('a')) { pos.x -= speed * dt / 100; flipRef.current = true; moving = true; }
      if (keys.has('d')) { pos.x += speed * dt / 100; flipRef.current = false; moving = true; }

      const scale = Math.min(W / 800, H / 500);
      const charH = Math.floor(150 * scale);

      pos.x = Math.max(charH / 2 / W, Math.min(1 - charH / 2 / W, pos.x));

      if (!onGroundRef.current) {
        pos.y = Math.min(pos.y + 0.012 * dt, 0);
        if (pos.y >= 0) {
          pos.y = 0;
          onGroundRef.current = true;
        }
      }

      partsRef.current = partsRef.current.filter(p => p.life > 0);
      for (const p of partsRef.current) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vy += 0.08; p.life -= dt;
      }

      ctx!.clearRect(0, 0, W, H);
      ctx!.imageSmoothingEnabled = false;

      const grad = ctx!.createLinearGradient(0, 0, 0, GY);
      grad.addColorStop(0, '#0f0f23'); grad.addColorStop(0.5, '#1a1a3e'); grad.addColorStop(1, '#2d1b4e');
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, W, GY);

      for (const s of starsRef.current) {
        s.x -= s.speed * dt;
        if (s.x < -2) s.x = W + 2;
        ctx!.fillStyle = '#fff';
        ctx!.globalAlpha = 0.4 + Math.sin(frameRef.current * 0.02 + s.x) * 0.3;
        ctx!.fillRect(Math.floor(s.x), Math.floor(s.y), Math.ceil(s.size), Math.ceil(s.size));
      }
      ctx!.globalAlpha = 1;

      ctx!.fillStyle = '#2d1b2e';
      ctx!.fillRect(0, GY, W, 50);
      ctx!.fillStyle = '#4a2d4a';
      ctx!.fillRect(0, GY, W, 3);
      ctx!.fillStyle = '#6bcb77';
      for (let i = 0; i < W; i += 14) {
        const off = Math.sin(i * 0.3 + frameRef.current * 0.02) * 2;
        ctx!.fillRect(Math.floor(i + off), GY - 2, 3, 2);
      }

      const char = charRef.current;
      if (char && char.complete && char.naturalWidth > 0) {
        const charW = Math.floor(charH * (char.naturalWidth / char.naturalHeight));
        const cx = Math.floor(W * pos.x);
        const cy = GY + pos.y * H * 0.3;
        const px = Math.floor(cx - charW / 2);
        const py = Math.floor(cy - charH * 0.8);

        ctx!.save();
        ctx!.imageSmoothingEnabled = true;
        const drawCx = px + charW / 2;
        const drawCy = py + charH / 2;
        ctx!.translate(drawCx, drawCy);
        if (flipRef.current) ctx!.scale(-1, 1);
        ctx!.drawImage(char, -charW / 2, -charH / 2, charW, charH);
        ctx!.restore();
        ctx!.imageSmoothingEnabled = false;

        if (moving && onGroundRef.current && frameRef.current % 4 === 0) {
          partsRef.current.push({
            x: flipRef.current ? px + charW : px, y: cy,
            vx: flipRef.current ? 1 : -1 - Math.random(),
            vy: -Math.random() * 2 - 0.5,
            life: 12, maxLife: 12,
          });
        }
      }

      for (const pp of partsRef.current) {
        ctx!.globalAlpha = pp.life / pp.maxLife;
        ctx!.fillStyle = '#8d6e63';
        ctx!.fillRect(Math.floor(pp.x), Math.floor(pp.y), Math.floor(2 * scale), Math.floor(2 * scale));
      }
      ctx!.globalAlpha = 1;

      ctx!.fillStyle = 'rgba(255,255,255,0.15)';
      ctx!.font = `${Math.floor(11 * scale)}px monospace`;
      ctx!.textAlign = 'center';
      ctx!.fillText('W A S D', W / 2, H - 10);
      ctx!.textAlign = 'left';

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pixel-runner-bg" />;
}
