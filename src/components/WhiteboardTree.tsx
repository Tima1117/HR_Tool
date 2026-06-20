import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Team } from '../types';

const NODE_W = 180;
const NODE_H = 76;
const H_GAP = 40;
const V_GAP = 88;

function subtreeWidth(teamId: string, teams: Record<string, Team>): number {
  const team = teams[teamId];
  if (!team || team.subTeamIds.length === 0) return NODE_W;
  const childSum = team.subTeamIds.reduce(
    (s, id) => s + subtreeWidth(id, teams),
    0
  );
  return Math.max(NODE_W, childSum + H_GAP * (team.subTeamIds.length - 1));
}

function buildLayout(
  rootId: string,
  teams: Record<string, Team>
): Record<string, { x: number; y: number }> {
  const pos: Record<string, { x: number; y: number }> = {};

  function place(id: string, x: number, y: number) {
    const team = teams[id];
    if (!team) return;
    pos[id] = { x, y };
    if (!team.subTeamIds.length) return;
    const widths = team.subTeamIds.map(c => subtreeWidth(c, teams));
    const total = widths.reduce((s, w) => s + w, 0) + H_GAP * (widths.length - 1);
    let cx = x + NODE_W / 2 - total / 2;
    team.subTeamIds.forEach((cid, i) => {
      place(cid, cx, y + NODE_H + V_GAP);
      cx += widths[i] + H_GAP;
    });
  }

  place(rootId, 0, 0);
  return pos;
}

interface WhiteboardTreeProps {
  rootTeamId: string;
  selectedTeamId: string | null;
  onSelectTeam: (teamId: string) => void;
}

export default function WhiteboardTree({
  rootTeamId,
  selectedTeamId,
  onSelectTeam,
}: WhiteboardTreeProps) {
  const { teams, employees, currentUser } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const positions = useMemo(() => buildLayout(rootTeamId, teams), [rootTeamId, teams]);

  // Center tree on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const xs = Object.values(positions).map(p => p.x);
    const ys = Object.values(positions).map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs) + NODE_W;
    const minY = Math.min(...ys);
    const treeW = maxX - minX;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    setPan({
      x: cw / 2 - (minX + treeW / 2) - (selectedTeamId ? 190 : 0),
      y: ch * 0.12 - minY,
    });
  }, [rootTeamId]);

  const fitView = useCallback(() => {
    if (!containerRef.current) return;
    const xs = Object.values(positions).map(p => p.x);
    const ys = Object.values(positions).map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs) + NODE_W;
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys) + NODE_H;
    const treeW = maxX - minX;
    const treeH = maxY - minY;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const padding = 80;
    const z = Math.min(
      (cw - padding * 2) / treeW,
      (ch - padding * 2) / treeH,
      1.2
    );
    setZoom(z);
    setPan({
      x: cw / 2 - (minX + treeW / 2) * z,
      y: ch / 2 - (minY + treeH / 2) * z,
    });
  }, [positions]);

  // Pan handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.tree-node')) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
    e.currentTarget.setAttribute('data-dragging', 'true');
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPan({
      x: panStart.current.x + (e.clientX - dragStart.current.x),
      y: panStart.current.y + (e.clientY - dragStart.current.y),
    });
  };
  const onMouseUp = (e: React.MouseEvent) => {
    isDragging.current = false;
    e.currentTarget.removeAttribute('data-dragging');
  };

  // Touch pan
  const lastTouch = useRef({ x: 0, y: 0 });
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  // Zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setZoom(z => {
      const nz = Math.min(Math.max(z * delta, 0.25), 2.5);
      setPan(p => ({
        x: mx - (mx - p.x) * (nz / z),
        y: my - (my - p.y) * (nz / z),
      }));
      return nz;
    });
  };

  // Build SVG connections
  const lines: { x1: number; y1: number; x2: number; y2: number; id: string }[] = [];
  Object.entries(positions).forEach(([pid, ppos]) => {
    const team = teams[pid];
    if (!team) return;
    team.subTeamIds.forEach(cid => {
      const cpos = positions[cid];
      if (!cpos) return;
      lines.push({
        id: `${pid}-${cid}`,
        x1: ppos.x + NODE_W / 2,
        y1: ppos.y + NODE_H,
        x2: cpos.x + NODE_W / 2,
        y2: cpos.y,
      });
    });
  });

  // Compute canvas bounds for SVG
  const allX = Object.values(positions).map(p => p.x);
  const allY = Object.values(positions).map(p => p.y);
  const canvasW = (Math.max(...allX) + NODE_W + 200);
  const canvasH = (Math.max(...allY) + NODE_H + 200);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-slate-50 select-none"
      style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onWheel={onWheel}
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x % (24 * zoom)}px ${pan.y % (24 * zoom)}px`,
        }}
      />

      {/* Canvas */}
      <div
        style={{
          position: 'absolute',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: canvasW,
          height: canvasH,
        }}
      >
        {/* SVG lines */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: canvasW, height: canvasH, overflow: 'visible', pointerEvents: 'none' }}
        >
          {lines.map(l => (
            <path
              key={l.id}
              d={`M ${l.x1} ${l.y1} C ${l.x1} ${(l.y1 + l.y2) / 2}, ${l.x2} ${(l.y1 + l.y2) / 2}, ${l.x2} ${l.y2}`}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth={2}
            />
          ))}
        </svg>

        {/* Team nodes */}
        {Object.entries(positions).map(([teamId, pos]) => {
          const team = teams[teamId];
          if (!team) return null;
          const head = employees[team.headId];
          const isSelected = teamId === selectedTeamId;
          const artCount = Object.keys(team.artifacts).length;

          return (
            <div
              key={teamId}
              className="tree-node absolute"
              style={{ left: pos.x, top: pos.y, width: NODE_W }}
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectTeam(teamId)}
                className={`w-full rounded-xl border-2 bg-white text-left transition-all shadow-sm ${
                  isSelected
                    ? 'border-blue-500 shadow-blue-100 shadow-md'
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-card-hover'
                }`}
                style={{ padding: '10px 12px' }}
              >
                <div className={`flex items-center gap-2 mb-1`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    <Users className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  </div>
                  <span className={`text-xs font-semibold truncate ${isSelected ? 'text-blue-800' : 'text-slate-700'}`}>
                    {team.name}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pl-8 leading-snug truncate">
                  {currentUser?.showNames ? head?.name : head?.code ?? '—'}
                </div>
                <div className="text-[10px] text-slate-400 pl-8 truncate">
                  {head?.position ?? ''}
                </div>
              </motion.button>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-1.5 z-10">
        <button
          onClick={() => setZoom(z => Math.min(z * 1.2, 2.5))}
          className="w-9 h-9 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z * 0.8, 0.25))}
          className="w-9 h-9 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={fitView}
          className="w-9 h-9 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600"
          title="По размеру"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-5 left-5 text-xs text-slate-400 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-slate-200">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
