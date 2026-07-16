import React, { useEffect, useRef } from 'react';

const NODES = [
  // Core cluster
  { id: 0, x: 50, y: 50, r: 10, type: 'core' },
  { id: 1, x: 50, y: 30, r: 7, type: 'primary' },
  { id: 2, x: 72, y: 44, r: 6, type: 'primary' },
  { id: 3, x: 65, y: 67, r: 6, type: 'primary' },
  { id: 4, x: 34, y: 65, r: 6, type: 'primary' },
  { id: 5, x: 28, y: 40, r: 6, type: 'primary' },
  // Secondary cluster
  { id: 6, x: 50, y: 14, r: 4, type: 'secondary' },
  { id: 7, x: 70, y: 22, r: 4, type: 'secondary' },
  { id: 8, x: 85, y: 40, r: 4, type: 'secondary' },
  { id: 9, x: 82, y: 60, r: 4, type: 'secondary' },
  { id: 10, x: 68, y: 80, r: 4, type: 'secondary' },
  { id: 11, x: 48, y: 87, r: 4, type: 'secondary' },
  { id: 12, x: 30, y: 78, r: 4, type: 'secondary' },
  { id: 13, x: 16, y: 62, r: 4, type: 'secondary' },
  { id: 14, x: 13, y: 42, r: 4, type: 'secondary' },
  { id: 15, x: 28, y: 24, r: 4, type: 'secondary' },
  { id: 16, x: 44, y: 15, r: 4, type: 'secondary' },
  // Outer
  { id: 17, x: 88, y: 20, r: 3, type: 'outer' },
  { id: 18, x: 93, y: 50, r: 3, type: 'outer' },
  { id: 19, x: 75, y: 90, r: 3, type: 'outer' },
  { id: 20, x: 22, y: 90, r: 3, type: 'outer' },
  { id: 21, x: 7, y: 60, r: 3, type: 'outer' },
  { id: 22, x: 8, y: 28, r: 3, type: 'outer' },
  { id: 23, x: 33, y: 7, r: 3, type: 'outer' },
  { id: 24, x: 62, y: 7, r: 3, type: 'outer' },
];

const CONNECTIONS = [
  // Core to primary
  [0,1],[0,2],[0,3],[0,4],[0,5],
  // Primary ring
  [1,2],[2,3],[3,4],[4,5],[5,1],
  // Primary to secondary (outer ring)
  [1,6],[1,7],[2,7],[2,8],[2,9],[3,9],[3,10],[3,11],[4,11],[4,12],[4,13],[5,13],[5,14],[5,15],[1,16],[1,15],
  // Secondary ring connections
  [6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,6],
  // Outer
  [7,17],[8,17],[8,18],[9,18],[10,19],[11,19],[12,20],[13,20],[13,21],[14,21],[14,22],[15,22],[15,23],[16,23],[6,24],[7,24],[1,6],
  // Cross-links
  [0,8],[0,11],[0,14],[1,9],[2,13],[3,6],[4,17],[5,10],
];

const NODE_COLORS = {
  core: '#62F6C5',
  primary: '#9FAEFF',
  secondary: '#62F6C5',
  outer: '#F5C76B',
};

const PULSE_PATHS = [
  [0,1,6,24,7,17],
  [0,2,9,18,8],
  [0,3,10,19,11],
  [0,4,12,20,13,21],
  [0,5,15,22,14],
];

export default function KnowledgeCore3D({ className = "w-full h-[400px]" }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let dpr = window.devicePixelRatio || 1;
    let W, H;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Floating offsets per node
    const offsets = NODES.map((_, i) => ({
      ox: (Math.random() - 0.5) * 2 * Math.PI,
      oy: (Math.random() - 0.5) * 2 * Math.PI,
      speed: 0.5 + Math.random() * 0.5,
      amp: 0.3 + Math.random() * 0.7,
    }));

    const getPos = (node, t) => {
      const off = offsets[node.id];
      return {
        x: (node.x / 100) * W + Math.sin(t * off.speed + off.ox) * off.amp,
        y: (node.y / 100) * H + Math.cos(t * off.speed + off.oy) * off.amp,
      };
    };

    // Pulses traveling along connections
    const pulses = PULSE_PATHS.flatMap((path, pi) =>
      path.slice(0, -1).map((_, si) => ({
        path, segIdx: si, t: (pi / PULSE_PATHS.length) + (si / path.length),
        color: pi % 2 === 0 ? '#62F6C5' : '#9FAEFF',
        speed: 0.25 + Math.random() * 0.15,
      }))
    );

    let rafId;
    const draw = (timestamp) => {
      const t = timestamp / 1000;
      ctx.clearRect(0, 0, W, H);

      // -- Background radial glow
      const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * 0.55);
      grd.addColorStop(0, 'rgba(98,246,197,0.08)');
      grd.addColorStop(0.5, 'rgba(159,174,255,0.04)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // -- Draw connections
      CONNECTIONS.forEach(([a, b]) => {
        const pa = getPos(NODES[a], t);
        const pb = getPos(NODES[b], t);
        const typeA = NODES[a].type, typeB = NODES[b].type;

        const alpha = (typeA === 'core' || typeB === 'core') ? 0.5
          : (typeA === 'primary' || typeB === 'primary') ? 0.3 : 0.18;

        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = `rgba(159,174,255,${alpha})`;
        ctx.lineWidth = typeA === 'core' || typeB === 'core' ? 1.5 : 1;
        ctx.stroke();
      });

      // -- Draw pulses
      pulses.forEach(pulse => {
        pulse.t += pulse.speed * (1 / 60);
        if (pulse.t > pulse.path.length - 1) pulse.t = 0;

        const segIdx = Math.floor(pulse.t);
        if (segIdx >= pulse.path.length - 1) return;
        const frac = pulse.t - segIdx;
        const nodeA = NODES[pulse.path[segIdx]];
        const nodeB = NODES[pulse.path[segIdx + 1]];
        const pa = getPos(nodeA, t);
        const pb = getPos(nodeB, t);

        const px = pa.x + (pb.x - pa.x) * frac;
        const py = pa.y + (pb.y - pa.y) * frac;

        const pg = ctx.createRadialGradient(px, py, 0, px, py, 6);
        pg.addColorStop(0, pulse.color);
        pg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();
      });

      // -- Draw nodes
      NODES.forEach(node => {
        const { x, y } = getPos(node, t);
        const color = NODE_COLORS[node.type];
        const r = node.r * (W / 350); // Scale radius with container

        // Outer glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
        glow.addColorStop(0, color + '66');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core node
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        const ng = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
        ng.addColorStop(0, '#fff');
        ng.addColorStop(0.4, color);
        ng.addColorStop(1, color + 'AA');
        ctx.fillStyle = ng;
        ctx.fill();

        // Pulse ring on core
        if (node.type === 'core') {
          const pulseFactor = 0.5 + 0.5 * Math.sin(t * 2.5);
          ctx.beginPath();
          ctx.arc(x, y, r + 4 + pulseFactor * 6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(98,246,197,${0.3 * pulseFactor})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className={`relative ${className}`} style={{ minHeight: 300 }}>
      {/* Ambient background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-brand-primary/8 blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-brand-periwinkle/10 blur-[50px]" />
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />

      {/* Label overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-background-surface/60 backdrop-blur-md border border-border-strong pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
        <span className="text-xs font-medium text-text-secondary tracking-wider uppercase">Neural Knowledge Network</span>
      </div>
    </div>
  );
}
