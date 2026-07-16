import React, { useEffect, useRef } from 'react';

const NODES = [
  { id: 0,  x: 50, y: 50, r: 9,   type: 'core' },
  { id: 1,  x: 50, y: 29, r: 6,   type: 'primary' },
  { id: 2,  x: 68, y: 39, r: 6,   type: 'primary' },
  { id: 3,  x: 65, y: 63, r: 6,   type: 'primary' },
  { id: 4,  x: 35, y: 65, r: 6,   type: 'primary' },
  { id: 5,  x: 29, y: 40, r: 6,   type: 'primary' },
  { id: 6,  x: 50, y: 20, r: 4.5, type: 'secondary' },
  { id: 7,  x: 66, y: 24, r: 4.5, type: 'secondary' },
  { id: 8,  x: 80, y: 38, r: 4.5, type: 'secondary' },
  { id: 9,  x: 82, y: 56, r: 4.5, type: 'secondary' },
  { id: 10, x: 70, y: 75, r: 4.5, type: 'secondary' },
  { id: 11, x: 50, y: 83, r: 4.5, type: 'secondary' },
  { id: 12, x: 30, y: 76, r: 4.5, type: 'secondary' },
  { id: 13, x: 18, y: 60, r: 4.5, type: 'secondary' },
  { id: 14, x: 16, y: 40, r: 4.5, type: 'secondary' },
  { id: 15, x: 28, y: 24, r: 4.5, type: 'secondary' },
  { id: 16, x: 85, y: 16, r: 3,   type: 'outer' },
  { id: 17, x: 95, y: 50, r: 3,   type: 'outer' },
  { id: 18, x: 75, y: 90, r: 3,   type: 'outer' },
  { id: 19, x: 20, y: 90, r: 3,   type: 'outer' },
  { id: 20, x: 5,  y: 55, r: 3,   type: 'outer' },
  { id: 21, x: 10, y: 20, r: 3,   type: 'outer' },
  { id: 22, x: 50, y: 8,  r: 3,   type: 'outer' },
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
  [0,1,6,22,7,16], [0,2,9,17,8], [0,3,10,18,11],
  [0,4,12,19,13,20], [0,5,15,21,14], [1,2,8,9,3], [4,3,10,11,12],
];

const COLORS = {
  core:      { fill: '#5EF5C0', glow: 'rgba(94,245,192,' },
  primary:   { fill: '#9FAEFF', glow: 'rgba(159,174,255,' },
  secondary: { fill: '#5EF5C0', glow: 'rgba(94,245,192,' },
  outer:     { fill: '#F5C76B', glow: 'rgba(245,199,107,' },
};

export default function KnowledgeCore3D({ className = "w-full h-[400px]" }) {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: 0.5, y: 0.5, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, dpr = window.devicePixelRatio || 1;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Mouse / touch interactivity
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX ?? e.touches?.[0]?.clientX;
      const cy = e.clientY ?? e.touches?.[0]?.clientY;
      mouseRef.current = { x: (cx - rect.left) / rect.width, y: (cy - rect.top) / rect.height, active: true };
    };
    const onMouseLeave = () => { mouseRef.current.active = false; };
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onMouseMove, { passive: true });
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('touchend', onMouseLeave);

    // Gentle auto-float per node
    const floats = NODES.map(() => ({
      fx: (Math.random() - 0.5) * Math.PI * 2,
      fy: (Math.random() - 0.5) * Math.PI * 2,
      spd: 0.35 + Math.random() * 0.4,
      amp: 1.0 + Math.random() * 1.4,
    }));

    // Mouse attraction strength per node (outer = more pull)
    const pullStrength = NODES.map(n => ({
      core: 6, primary: 12, secondary: 18, outer: 26
    }[n.type]));

    const pos = (node, t) => {
      const f = floats[node.id];
      const baseX = (node.x / 100) * W + Math.sin(t * f.spd + f.fx) * f.amp;
      const baseY = (node.y / 100) * H + Math.cos(t * f.spd + f.fy) * f.amp;

      if (mouseRef.current.active) {
        const mx = mouseRef.current.x * W;
        const my = mouseRef.current.y * H;
        const dx = mx - baseX;
        const dy = my - baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.min(W, H) * 0.6;
        if (dist < maxDist) {
          const pull = (1 - dist / maxDist) * pullStrength[node.id];
          return { x: baseX + (dx / dist) * pull, y: baseY + (dy / dist) * pull };
        }
      }
      return { x: baseX, y: baseY };
    };

    // Animated signals
    const signals = SIGNAL_PATHS.flatMap((path, pi) =>
      Array.from({ length: 2 }, (_, si) => ({
        path,
        t: (pi * 1.7 + si * (path.length / 2)) % (path.length - 1),
        speed: 0.28 + Math.random() * 0.18,
        color: pi % 3 === 0 ? '#5EF5C0' : pi % 3 === 1 ? '#9FAEFF' : '#F5C76B',
        size: 3 + Math.random() * 2,
      }))
    );

    let rafId;
    const draw = (ts) => {
      const t = ts / 1000;
      ctx.clearRect(0, 0, W, H);

      // Ambient bg glow
      const bg = ctx.createRadialGradient(W * .5, H * .5, 0, W * .5, H * .5, Math.max(W, H) * .6);
      bg.addColorStop(0, 'rgba(94,245,192,0.05)');
      bg.addColorStop(.45,'rgba(159,174,255,0.03)');
      bg.addColorStop(1,  'rgba(0,0,0,0)');
      ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

      // Mouse glow spot
      if (mouseRef.current.active) {
        const mx = mouseRef.current.x * W, my = mouseRef.current.y * H;
        const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 80);
        mg.addColorStop(0, 'rgba(94,245,192,0.07)');
        mg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(mx, my, 80, 0, Math.PI * 2);
        ctx.fillStyle = mg; ctx.fill();
      }

      // Connections
      CONNECTIONS.forEach(([a, b]) => {
        const pa = pos(NODES[a], t), pb = pos(NODES[b], t);
        const isCore = NODES[a].type === 'core' || NODES[b].type === 'core';
        const isPrim = NODES[a].type === 'primary' || NODES[b].type === 'primary';
        const alpha  = isCore ? 0.55 : isPrim ? 0.28 : 0.14;
        const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
        const col  = isPrim ? `rgba(159,174,255,${alpha})` : `rgba(94,245,192,${alpha})`;
        const mid  = isPrim ? `rgba(159,174,255,${alpha*1.6})` : `rgba(94,245,192,${alpha*1.6})`;
        grad.addColorStop(0, col); grad.addColorStop(.5, mid); grad.addColorStop(1, col);
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = grad; ctx.lineWidth = isCore ? 1.5 : 0.8; ctx.stroke();
      });

      // Signals
      signals.forEach(sig => {
        sig.t += sig.speed * (1/60);
        if (sig.t >= sig.path.length - 1) sig.t = 0;
        const si = Math.floor(sig.t), fr = sig.t - si;
        if (si >= sig.path.length - 1) return;
        const pa = pos(NODES[sig.path[si]], t), pb = pos(NODES[sig.path[si+1]], t);
        const px = pa.x + (pb.x - pa.x) * fr, py = pa.y + (pb.y - pa.y) * fr;
        const sg = ctx.createRadialGradient(px, py, 0, px, py, sig.size * 3);
        sg.addColorStop(0, sig.color + 'CC'); sg.addColorStop(.4, sig.color + '55'); sg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(px, py, sig.size*3, 0, Math.PI*2);
        ctx.fillStyle = sg; ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, sig.size, 0, Math.PI*2);
        ctx.fillStyle = sig.color; ctx.fill();
      });

      // Nodes
      NODES.forEach(node => {
        const {x,y} = pos(node, t);
        const c = COLORS[node.type];
        const scl = Math.max(.6, Math.min(W/400, 1.4));
        const r = node.r * scl;

        // Glow layers
        [r*5, r*3, r*1.6].forEach((gr, gi) => {
          const ops = [.06, .13, .22];
          const ng = ctx.createRadialGradient(x,y,0,x,y,gr);
          ng.addColorStop(0, c.glow + ops[gi] + ')');
          ng.addColorStop(1,'rgba(0,0,0,0)');
          ctx.beginPath(); ctx.arc(x,y,gr,0,Math.PI*2);
          ctx.fillStyle = ng; ctx.fill();
        });

        // Body
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
        const nfill = ctx.createRadialGradient(x-r*.25,y-r*.35,0,x,y,r);
        nfill.addColorStop(0,'#fff');
        nfill.addColorStop(.35, c.fill);
        nfill.addColorStop(1, c.fill+'99');
        ctx.fillStyle = nfill; ctx.fill();

        // Core pulse rings
        if (node.type === 'core') {
          [1,2].forEach(ring => {
            const pf = .5 + .5 * Math.sin(t * 2.2 + ring * Math.PI);
            ctx.beginPath(); ctx.arc(x,y,r + ring*6 + pf*4, 0, Math.PI*2);
            ctx.strokeStyle = `rgba(94,245,192,${.25*pf/ring})`; ctx.lineWidth = 1.2; ctx.stroke();
          });
        }
      });

      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('touchend', onMouseLeave);
    };
  }, []);

  return (
    <div className={`relative ${className}`} style={{ cursor: 'crosshair' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <div className="absolute top-[40%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%] rounded-full bg-brand-primary/6 blur-[70px]" />
        <div className="absolute top-[45%] left-[55%] w-[40%] h-[40%] rounded-full bg-brand-periwinkle/8 blur-[50px]" />
      </div>

      <canvas ref={canvasRef} className="w-full h-full" />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-card pointer-events-none">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary" />
        </span>
        <span className="text-xs font-semibold text-text-secondary tracking-widest uppercase">Move cursor to interact</span>
      </div>
    </div>
  );
}
