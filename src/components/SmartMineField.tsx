import React, { useEffect, useRef } from 'react';

export const SmartMineField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Geological ore particles
    const particleCount = 42;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.3 + 0.1,
    }));

    let time = 0;

    const render = () => {
      time += 0.005;
      ctx.clearRect(0, 0, width, height);

      // Deep dark mineral gradient background (#0B100B)
      const bgGradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.3,
        100,
        width * 0.5,
        height * 0.5,
        Math.max(width, height)
      );
      bgGradient.addColorStop(0, '#182016');
      bgGradient.addColorStop(0.45, '#111811');
      bgGradient.addColorStop(1, '#0B100B');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // 1. Subtle GIS Coordinate Grid
      const gridSize = 140;
      ctx.strokeStyle = 'rgba(169, 181, 141, 0.035)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = (width % gridSize) / 2; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = (height % gridSize) / 2; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // GIS Grid intersection crosshairs
      ctx.strokeStyle = 'rgba(197, 199, 174, 0.08)';
      const crossSize = 4;
      for (let x = (width % gridSize) / 2; x < width; x += gridSize * 2) {
        for (let y = (height % gridSize) / 2; y < height; y += gridSize * 2) {
          ctx.beginPath();
          ctx.moveTo(x - crossSize, y);
          ctx.lineTo(x + crossSize, y);
          ctx.moveTo(x, y - crossSize);
          ctx.lineTo(x, y + crossSize);
          ctx.stroke();
        }
      }

      // 2. Faint Geological Elevation Contour Lines
      ctx.lineWidth = 1;
      const contourNum = 7;
      const centerX = width * 0.5;
      const centerY = height * 0.42;

      for (let i = 1; i <= contourNum; i++) {
        ctx.beginPath();
        const baseRadius = i * 110;
        const points = 60;
        ctx.strokeStyle = `rgba(169, 181, 141, ${0.045 - i * 0.005})`;

        for (let p = 0; p <= points; p++) {
          const angle = (p / points) * Math.PI * 2;
          // Organic topographical distortion simulating manganese ore strata
          const distortion =
            Math.sin(angle * 4 + time + i * 0.5) * 14 +
            Math.cos(angle * 2 - time * 0.8) * 22;
          const r = baseRadius + distortion;
          const px = centerX + Math.cos(angle) * r * 1.4; // Slightly elliptical
          const py = centerY + Math.sin(angle) * r;

          if (p === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      // 3. Floating Ore Particles & Strata Nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(197, 199, 174, ${p.alpha})`;
        ctx.fill();

        // Connect nearby points in micro-mesh
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(169, 181, 141, ${0.03 * (1 - dist / 110)})`;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-90"
    />
  );
};

