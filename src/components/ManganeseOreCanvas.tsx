import React, { useEffect, useRef, useState } from 'react';

interface ManganeseOreCanvasProps {
  isCtaHovered?: boolean;
}

interface Vertex3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
}

interface Face3D {
  indices: number[];
  color: string;
  highlightColor: string;
  normalZ?: number;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  alpha: number;
}

export const ManganeseOreCanvas: React.FC<ManganeseOreCanvasProps> = ({ isCtaHovered = false }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePos = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setHasWebGL(false);
      return;
    }

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const updateSize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // Mouse movement handler for 2-4 degree subtle parallax
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cX = rect.left + rect.width / 2;
      const cY = rect.top + rect.height / 2;
      const relX = (e.clientX - cX) / (rect.width / 2);
      const relY = (e.clientY - cY) / (rect.height / 2);

      mousePos.current.targetX = Math.max(-1, Math.min(1, relX));
      mousePos.current.targetY = Math.max(-1, Math.min(1, relY));
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Check prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Generate Procedural 3D Manganese Ore Mesh (Pyrolusite/Psilomelane crystalline aggregate)
    const baseVertices: Vertex3D[] = [];
    const baseRadius = 145;

    // Golden Ratio Icosahedron base with random geological noise displacement
    const t = (1.0 + Math.sqrt(5.0)) / 2.0;
    const rawIco = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
    ];

    // Seeded random for consistent rock formation
    let seed = 42;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    rawIco.forEach(([x, y, z]) => {
      const len = Math.hypot(x, y, z);
      const nx = (x / len);
      const ny = (y / len);
      const nz = (z / len);
      
      // Geological rock faceting noise
      const noise = 0.75 + random() * 0.45;
      const vx = nx * baseRadius * noise;
      const vy = ny * baseRadius * noise;
      const vz = nz * baseRadius * noise;

      baseVertices.push({ x: vx, y: vy, z: vz, baseX: vx, baseY: vy, baseZ: vz });
    });

    // Add central protruding core nodes for irregular manganese ore texture
    const subNodeCount = 14;
    for (let i = 0; i < subNodeCount; i++) {
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const r = baseRadius * (0.6 + random() * 0.5);
      const vx = r * Math.sin(phi) * Math.cos(theta);
      const vy = r * Math.sin(phi) * Math.sin(theta);
      const vz = r * Math.cos(phi);

      baseVertices.push({ x: vx, y: vy, z: vz, baseX: vx, baseY: vy, baseZ: vz });
    }

    // Connect vertices to create triangular faces
    const faces: Face3D[] = [];
    const faceIndices = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];

    // Additional secondary facets
    for (let i = 0; i < subNodeCount; i++) {
      const centerIdx = 12 + i;
      const neighbor1 = i % 12;
      const neighbor2 = (i + 1) % 12;
      faceIndices.push([centerIdx, neighbor1, neighbor2]);
    }

    // Color tones for Manganese Ore (Dark charcoal, manganese oxide black, muted olive)
    const oreColors = [
      { color: '#141814', highlight: '#C5C7AE' },
      { color: '#1B221B', highlight: '#A9B58D' },
      { color: '#111511', highlight: '#9EA493' },
      { color: '#192019', highlight: '#D9DDCB' },
      { color: '#0F130F', highlight: '#A9B58D' },
    ];

    faceIndices.forEach((f, idx) => {
      const palette = oreColors[idx % oreColors.length];
      faces.push({
        indices: f,
        color: palette.color,
        highlightColor: palette.highlight,
      });
    });

    // 2. Floating Geological Ore Particles
    const particleCount = 50;
    const particles: Particle3D[] = Array.from({ length: particleCount }, () => {
      const rad = Math.random() * 260 + 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      return {
        x: rad * Math.sin(phi) * Math.cos(theta),
        y: rad * Math.sin(phi) * Math.sin(theta),
        z: rad * Math.cos(phi),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.5 + 0.15,
      };
    });

    // 3. Animation State
    let angleX = 0.2;
    let angleY = 0;
    let time = 0;

    const render = () => {
      if (!ctx || width === 0 || height === 0) return;

      time += reducedMotion ? 0.002 : 0.008;

      // Mouse spring interpolation
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

      const parallaxPitch = mousePos.current.y * 0.06; // ~3.5 deg
      const parallaxYaw = mousePos.current.x * 0.06;

      const speedMultiplier = isCtaHovered ? 1.8 : 1.0;
      if (!reducedMotion) {
        angleY += 0.004 * speedMultiplier;
        angleX = 0.15 + Math.sin(time * 0.5) * 0.08 + parallaxPitch;
      }

      const totalYaw = angleY + parallaxYaw;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // PHASE TIMING LOGIC (16s cycle)
      const cycleDuration = 16;
      const currentCycleTime = (time * 2.5) % cycleDuration;
      
      // Phase 1 (0 - 3.5s): Coalescing dust
      // Phase 2 (3.5 - 7.5s): Rock Assembly & Strata
      // Phase 3 (7.5 - 11s): Mineral Vein Reveal & Glint
      // Phase 4 (11 - 14.5s): Telemetry Laser Scan
      // Phase 5 (14.5 - 16s): Dissolve loop
      const scanProgress = currentCycleTime >= 11 && currentCycleTime <= 14.5 
        ? (currentCycleTime - 11) / 3.5 
        : -1;
      const glintIntensity = currentCycleTime >= 7.5 && currentCycleTime <= 11
        ? Math.sin(((currentCycleTime - 7.5) / 3.5) * Math.PI)
        : 0;

      // A. Draw Subtle Geological Strata Lines in Deep Background
      ctx.lineWidth = 1;
      const strataCount = 5;
      for (let i = 0; i < strataCount; i++) {
        ctx.beginPath();
        const strataY = centerY - 140 + i * 70 + Math.sin(time + i) * 6;
        ctx.moveTo(centerX - 350, strataY);
        ctx.bezierCurveTo(
          centerX - 100, strataY - 15,
          centerX + 100, strataY + 15,
          centerX + 350, strataY
        );
        ctx.strokeStyle = `rgba(169, 181, 141, ${0.035 - i * 0.005})`;
        ctx.stroke();
      }

      // B. 3D Rotation Matrix Calculation
      const cosY = Math.cos(totalYaw);
      const sinY = Math.sin(totalYaw);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Transform Vertices
      const transformedVertices = baseVertices.map((v) => {
        // Rotate Y
        let x1 = v.baseX * cosY - v.baseZ * sinY;
        let z1 = v.baseX * sinY + v.baseZ * cosY;
        let y1 = v.baseY;

        // Rotate X
        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;
        let x2 = x1;

        // Scale & Perspective Projection
        const fov = 450;
        const scale = fov / (fov + z2 + 300);
        const projX = centerX + x2 * scale;
        const projY = centerY + y2 * scale;

        return { x: projX, y: projY, z: z2, scale };
      });

      // C. Render 3D Floating Ore Particles
      particles.forEach((p) => {
        if (!reducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;

          if (Math.hypot(p.x, p.y, p.z) > 340) {
            p.x *= -0.8;
            p.y *= -0.8;
            p.z *= -0.8;
          }
        }

        // Transform particle 3D position
        let px1 = p.x * cosY - p.z * sinY;
        let pz1 = p.x * sinY + p.z * cosY;
        let py1 = p.y;
        let py2 = py1 * cosX - pz1 * sinX;
        let pz2 = py1 * sinX + pz1 * cosX;

        const scale = 450 / (450 + pz2 + 300);
        const screenX = centerX + px1 * scale;
        const screenY = centerY + py2 * scale;

        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(197, 199, 174, ${p.alpha * scale})`;
        ctx.fill();
      });

      // D. Sort & Render 3D Polyhedral Rock Faces (Painter's Algorithm for Z-Buffer Depth)
      const renderedFaces = faces.map((face) => {
        const v0 = transformedVertices[face.indices[0]];
        const v1 = transformedVertices[face.indices[1]];
        const v2 = transformedVertices[face.indices[2]];
        const avgZ = (v0.z + v1.z + v2.z) / 3;

        // Normal calculation for light shading
        const ax = v1.x - v0.x;
        const ay = v1.y - v0.y;
        const bx = v2.x - v0.x;
        const by = v2.y - v0.y;
        const normalZ = ax * by - ay * bx;

        return { face, v0, v1, v2, avgZ, normalZ };
      });

      renderedFaces.sort((a, b) => a.avgZ - b.avgZ);

      // Light directional vector (top-right ambient light)
      renderedFaces.forEach(({ face, v0, v1, v2, normalZ }) => {
        // Backface Culling
        if (normalZ <= 0) return;

        ctx.beginPath();
        ctx.moveTo(v0.x, v0.y);
        ctx.lineTo(v1.x, v1.y);
        ctx.lineTo(v2.x, v2.y);
        ctx.closePath();

        // Shading intensity
        const lightFactor = Math.min(1, Math.max(0.15, normalZ / 8000));
        
        // Base fill color with directional shading
        ctx.fillStyle = face.color;
        ctx.fill();

        // Facet stroke outline (rock texture cracks)
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(169, 181, 141, ${0.12 + lightFactor * 0.15})`;
        ctx.stroke();

        // Mineral Glint & Metallic Highlights (Phase 3)
        if (glintIntensity > 0) {
          ctx.fillStyle = `rgba(197, 199, 174, ${glintIntensity * lightFactor * 0.25})`;
          ctx.fill();
        }

        // CTA Hover boost effect
        if (isCtaHovered) {
          ctx.fillStyle = `rgba(169, 181, 141, 0.08)`;
          ctx.fill();
        }
      });

      // E. Mining Telemetry Scan Line & Elevation Ring Overlay (Phase 4)
      if (scanProgress >= 0) {
        const scanY = centerY - 180 + scanProgress * 360;

        // 1. Horizontal Laser Scan Beam
        ctx.beginPath();
        ctx.moveTo(centerX - 240, scanY);
        ctx.lineTo(centerX + 240, scanY);
        ctx.strokeStyle = 'rgba(169, 181, 141, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Laser scan glow aura
        const scanGrad = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 15);
        scanGrad.addColorStop(0, 'rgba(169, 181, 141, 0)');
        scanGrad.addColorStop(0.5, 'rgba(169, 181, 141, 0.12)');
        scanGrad.addColorStop(1, 'rgba(169, 181, 141, 0)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(centerX - 240, scanY - 15, 480, 30);

        // 2. Contour Ring Intersections
        ctx.strokeStyle = 'rgba(197, 199, 174, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(centerX, scanY, 120, 18, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isCtaHovered]);

  if (!hasWebGL) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center relative">
        <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-[#182016] via-[#111811] to-[#0B100B] border border-[#A9B58D]/30 shadow-2xl flex items-center justify-center animate-pulse">
          <div className="w-48 h-48 rounded-full bg-[#182016]/80 border border-[#C5C7AE]/20" />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-[380px] sm:min-h-[460px] relative flex items-center justify-center overflow-hidden pointer-events-none select-none">
      <canvas ref={canvasRef} className="w-full h-full block relative z-10" />
    </div>
  );
};
