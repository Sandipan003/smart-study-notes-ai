import React, { useEffect, useRef } from 'react';

// --- Neural Network Data ---
const NODES = [
  { id: 0,  x: 50,  y: 50,  r: 9,  type: 'core' },
  // Inner ring
  { id: 1,  x: 50,  y: 29,  r: 6,  type: 'primary' },
  { id: 2,  x: 68,  y: 39,  r: 6,  type: 'primary' },
  { id: 3,  x: 65,  y: 63,  r: 6,  type: 'primary' },
  { id: 4,  x: 35,  y: 65,  r: 6,  type: 'primary' },
  { id: 5,  x: 29,  y: 40,  r: 6,  type: 'primary' },
  { id: 6,  x: 50,  y: 20,  r: 4.5, type: 'secondary' },
  { id: 7,  x: 66,  y: 24,  r: 4.5, type: 'secondary' },
  { id: 8,  x: 80,  y: 38,  r: 4.5, type: 'secondary' },
  { id: 9,  x: 82,  y: 56,  r: 4.5, type: 'secondary' },
  { id: 10, x: 70,  y: 75,  r: 4.5, type: 'secondary' },
  { id: 11, x: 50,  y: 83,  r: 4.5, type: 'secondary' },
  { id: 12, x: 30,  y: 76,  r: 4.5, type: 'secondary' },
  { id: 13, x: 18,  y: 60,  r: 4.5, type: 'secondary' },
  { id: 14, x: 16,  y: 40,  r: 4.5, type: 'secondary' },
  { id: 15, x: 28,  y: 24,  r: 4.5, type: 'secondary' },
  // Outer sparse
  { id: 16, x: 85,  y: 16,  r: 3,  type: 'outer' },
  { id: 17, x: 95,  y: 50,  r: 3,  type: 'outer' },
  { id: 18, x: 75,  y: 90,  r: 3,  type: 'outer' },
  { id: 19, x: 20,  y: 90,  r: 3,  type: 'outer' },
  { id: 20, x: 5,   y: 55,  r: 3,  type: 'outer' },
  { id: 21, x: 10,  y: 20,  r: 3,  type: 'outer' },
  { id: 22, x: 50,  y: 8,   r: 3,  type: 'outer' },
];

const CONNECTIONS = [
  [0,1],[0,2],[0,3],[0,4],[0,5],
  [1,2],[2,3],[3,4],[4,5],[5,1],
  [1,6],[1,7],[2,7],[2,8],[2,9],[3,9],[3,10],[3,11],[4,11],[4,12],[4,13],[5,13],[5,14],[5,15],[1,15],
  [6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,6],
  [7,16],[8,16],[8,17],[9,17],[10,18],[11,18],[12,19],[13,19],[13,20],[14,20],[14,21],[15,21],[6,22],[7,22],
  [0,8],[0,11],[0,14],
];

const SIGNAL_PATHS = [
  [0,1,6,22,7,16],
  [0,2,9,17,8],
  [0,3,10,18,11],
  [0,4,12,19,13,20],
  [0,5,15,21,14],
  [1,2,8,9,3],
  [4,3,10,11,12],
];

const COLORS = {
  core:      { fill: '#5EF5C0', glow: 'rgba(94,245,192,0.5)' },
  primary:   { fill: '#9FAEFF', glow: 'rgba(159,174,255,0.4)' },
  secondary: { fill: '#5EF5C0', glow: 'rgba(94,245,192,0.3)' },
  outer:     { fill: '#F5C76B', glow: 'rgba(245,199,107,0.3)' },
};

export default function KnowledgeCore3D({ className = "w-full h-[400px]" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, dpr = window.devicePixelRatio || 1;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Per-node gentle float offsets
    const floats = NODES.map(() => ({
      fx: (Math.random() - 0.5) * Math.PI * 2,
      fy: (Math.random() - 0.5) * Math.PI * 2,
      spd: 0.4 + Math.random() * 0.5,
      amp: 1.2 + Math.random() * 1.5,
    }));

    const pos = (node, t) => ({
      x: (node.x / 100) * W + Math.sin(t * floats[node.id].spd + floats[node.id].fx) * floats[node.id].amp,
      y: (node.y / 100) * H + Math.cos(t * floats[node.id].spd + floats[node.id].fy) * floats[node.id].amp,
    });

    // Signals: one per path segment pair
    const signals = SIGNAL_PATHS.flatMap((path, pi) =>
      Array.from({ length: 2 }, (_, si) => ({
        path,
        t: (pi * 1.7 + si * (path.length / 2)) % (path.length - 1),
        speed: 0.3 + Math.random() * 0.2,
        color: pi % 3 === 0 ? '#5EF5C0' : pi % 3 === 1 ? '#9FAEFF' : '#F5C76B',
        size: 3 + Math.random() * 2,
      }))
    );

    let rafId;
    const draw = (ts) => {
      const t = ts / 1000;
      ctx.clearRect(0, 0, W, H);

      // Ambient bg glow
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.6);
      bg.addColorStop(0, 'rgba(94,245,192,0.05)');
      bg.addColorStop(0.45, 'rgba(159,174,255,0.03)');
      bg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // -- Connections
      CONNECTIONS.forEach(([a, b]) => {
        const pa = pos(NODES[a], t);
        const pb = pos(NODES[b], t);
        const isCore = NODES[a].type === 'core' || NODES[b].type === 'core';
        const isPrimary = NODES[a].type === 'primary' || NODES[b].type === 'primary';

        // Gradient line
        const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
        const alpha = isCore ? 0.55 : isPrimary ? 0.3 : 0.16;
        const col = isCore ? `rgba(94,245,192,${alpha})` : isPrimary ? `rgba(159,174,255,${alpha})` : `rgba(94,245,192,${alpha})`;
        grad.addColorStop(0, col);
        grad.addColorStop(0.5, isPrimary ? `rgba(159,174,255,${alpha * 1.5})` : `rgba(94,245,192,${alpha * 1.5})`);
        grad.addColorStop(1, col);

        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = isCore ? 1.5 : 0.8;
        ctx.stroke();
      });

      // -- Moving signals
      signals.forEach(sig => {
        sig.t += sig.speed * (1 / 60);
        if (sig.t >= sig.path.length - 1) sig.t = 0;

        const si = Math.floor(sig.t);
        if (si >= sig.path.length - 1) return;
        const fr = sig.t - si;
        const pa = pos(NODES[sig.path[si]], t);
        const pb = pos(NODES[sig.path[si + 1]], t);
        const px = pa.x + (pb.x - pa.x) * fr;
        const py = pa.y + (pb.y - pa.y) * fr;

        // Signal glow
        const sg = ctx.createRadialGradient(px, py, 0, px, py, sig.size * 3);
        sg.addColorStop(0, sig.color + 'CC');
        sg.addColorStop(0.4, sig.color + '55');
        sg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(px, py, sig.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = sg;
        ctx.fill();

        // Signal dot
        ctx.beginPath();
        ctx.arc(px, py, sig.size, 0, Math.PI * 2);
        ctx.fillStyle = sig.color;
        ctx.fill();
      });

      // -- Nodes
      NODES.forEach(node => {
        const { x, y } = pos(node, t);
        const c = COLORS[node.type];
        const scale = W / 400;
        const r = node.r * Math.max(0.6, Math.min(scale, 1.4));

        // Multi-layer glow
        [r * 5, r * 3, r * 1.6].forEach((gr, gi) => {
          const gop = [0.08, 0.15, 0.25][gi];
          const ng = ctx.createRadialGradient(x, y, 0, x, y, gr);
          ng.addColorStop(0, c.glow.replace(')', `,${gop})`).replace('rgba', 'rgba'));
          ng.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(x, y, gr, 0, Math.PI * 2);
          ctx.fillStyle = c.glow.replace(/[\d.]+\)$/, `${gop})`);
          ctx.fillStyle = ng;
          ctx.fill();
        });

        // Node body
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        const nfill = ctx.createRadialGradient(x - r * 0.25, y - r * 0.35, 0, x, y, r);
        nfill.addColorStop(0, '#ffffff');
        nfill.addColorStop(0.35, c.fill);
        nfill.addColorStop(1, c.fill + '99');
        ctx.fillStyle = nfill;
        ctx.fill();

        // Core pulse rings
        if (node.type === 'core') {
          [1, 2].forEach(ring => {
            const pf = 0.5 + 0.5 * Math.sin(t * 2.2 + ring * Math.PI);
            ctx.beginPath();
            ctx.arc(x, y, r + ring * 6 + pf * 4, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(94,245,192,${0.25 * pf / ring})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          });
        }
      });

      // Floating label dots (decorative HUD)
      const labelData = [
        { label: 'Summary', nx: 50, ny: 29, color: '#9FAEFF' },
        { label: 'Flashcards', nx: 68, ny: 39, color: '#5EF5C0' },
        { label: 'Quiz', nx: 35, ny: 65, color: '#F5C76B' },
      ];
      ctx.font = `${Math.max(9, 11 * (W / 400))}px Inter, sans-serif`;
      ctx.textBaseline = 'middle';
      labelData.forEach(({ label, nx, ny, color }) => {
        const p = pos(NODES.find(n => Math.abs(n.x - nx) < 3 && Math.abs(n.y - ny) < 3) || NODES[1], t);
        const ox = nx < 50 ? -(ctx.measureText(label).width + 20) : 20;
        const lx = p.x + ox;
        const ly = p.y;
        // Line
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(lx + (ox > 0 ? 0 : ctx.measureText(label).width + 16), ly);
        ctx.strokeStyle = color + '40';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        // Label bg
        const tw = ctx.measureText(label).width;
        const bx = ox > 0 ? lx : lx;
        ctx.beginPath();
        ctx.roundRect(bx, ly - 9, tw + 16, 18, 4);
        ctx.fillStyle = 'rgba(12,16,24,0.7)';
        ctx.fill();
        ctx.strokeStyle = color + '30';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.fillText(label, bx + 8, ly);
      });

      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <div className="absolute top-[40%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%] rounded-full bg-brand-primary/6 blur-[70px]" />
        <div className="absolute top-[45%] left-[55%] w-[40%] h-[40%] rounded-full bg-brand-periwinkle/8 blur-[50px]" />
      </div>

      <canvas ref={canvasRef} className="w-full h-full" />

      {/* HUD badge */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-card pointer-events-none">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary" />
        </span>
        <span className="text-xs font-semibold text-text-secondary tracking-widest uppercase">AI Neural Knowledge Network</span>
      </div>
    </div>
  );
}
