'use client';

import { useEffect, useRef } from 'react';

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-={}[]|;:,.<>?/~';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    // Solana gradient colors
    const gradientColors = [
      { pos: 0, color: '153, 69, 255' },    // Solana purple #9945FF
      { pos: 0.5, color: '100, 80, 200' },  // Mid purple
      { pos: 1, color: '20, 241, 149' },    // Solana green #14F195
    ];

    function draw() {
      if (!ctx || !canvas) return;

      // Semi-transparent black for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = characters[Math.floor(Math.random() * characters.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Calculate gradient position based on y position
        const gradientPos = (y / canvas.height);
        let color: string;

        if (gradientPos < 0.5) {
          // Interpolate between purple and mid-purple
          const t = gradientPos * 2;
          const r = Math.floor(153 + (100 - 153) * t);
          const g = Math.floor(69 + (80 - 69) * t);
          const b = Math.floor(255 + (200 - 255) * t);
          color = `rgba(${r}, ${g}, ${b}, 0.8)`;
        } else {
          // Interpolate between mid-purple and green
          const t = (gradientPos - 0.5) * 2;
          const r = Math.floor(100 + (20 - 100) * t);
          const g = Math.floor(80 + (241 - 80) * t);
          const b = Math.floor(200 + (149 - 200) * t);
          color = `rgba(${r}, ${g}, ${b}, 0.8)`;
        }

        ctx.fillStyle = color;
        ctx.fillText(char, x, y);

        // Reset drop to top randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    }

    const interval = setInterval(draw, 35);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-20"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
