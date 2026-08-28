'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import { Share2, Check, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface CanvasNetworkGraphProps {
  seed: string;
  keywords: KeywordItem[];
}

interface Node {
  id: string;
  label: string;
  type: 'seed' | 'intent' | 'keyword';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  keywordData?: KeywordItem;
}

interface Edge {
  source: string;
  target: string;
  color: string;
}

export const CanvasNetworkGraph: React.FC<CanvasNetworkGraphProps> = ({ seed, keywords }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const animFrameId = useRef<number | null>(null);

  // Limit to top 50 keywords for ultra-smooth 60fps performance without CPU hogging
  const topKeywords = useMemo(() => keywords.slice(0, 50), [keywords]);

  // Construct node-link hierarchy
  const { nodes, edges } = useMemo(() => {
    const nList: Node[] = [];
    const eList: Edge[] = [];

    const centerX = 400;
    const centerY = 250;

    // 1. Root Seed Node
    nList.push({
      id: 'root-seed',
      label: seed,
      type: 'seed',
      x: centerX,
      y: centerY,
      vx: 0,
      vy: 0,
      radius: 22,
      color: '#2563eb', // blue-600
    });

    // 2. Hub Intent Nodes
    const intentColors: Record<string, string> = {
      informational: '#60a5fa', // sky blue
      commercial: '#a78bfa',    // purple
      transactional: '#34d399', // emerald
      navigational: '#fbbf24',  // amber
    };

    const intentsFound = Array.from(new Set(topKeywords.map((k) => k.intent)));
    intentsFound.forEach((intent, i) => {
      const angle = (i / intentsFound.length) * 2 * Math.PI;
      const intentId = `hub-${intent}`;
      const ix = centerX + Math.cos(angle) * 110;
      const iy = centerY + Math.sin(angle) * 110;

      nList.push({
        id: intentId,
        label: intent.toUpperCase(),
        type: 'intent',
        x: ix,
        y: iy,
        vx: 0,
        vy: 0,
        radius: 15,
        color: intentColors[intent] || '#94a3b8',
      });

      eList.push({
        source: 'root-seed',
        target: intentId,
        color: 'rgba(255, 255, 255, 0.3)',
      });
    });

    // 3. Keyword Leaf Nodes
    topKeywords.forEach((kw, i) => {
      const intentHub = `hub-${kw.intent}`;
      const angle = (i / topKeywords.length) * 2 * Math.PI;
      const dist = 180 + (i % 3) * 35;
      const kx = centerX + Math.cos(angle) * dist;
      const ky = centerY + Math.sin(angle) * dist;

      const kwId = `kw-${i}`;
      nList.push({
        id: kwId,
        label: kw.keyword,
        type: 'keyword',
        x: kx,
        y: ky,
        vx: 0,
        vy: 0,
        radius: Math.max(6, Math.min(11, kw.wordCount * 1.6)),
        color: intentColors[kw.intent] || '#94a3b8',
        keywordData: kw,
      });

      eList.push({
        source: intentHub,
        target: kwId,
        color: 'rgba(255, 255, 255, 0.12)',
      });
    });

    return { nodes: nList, edges: eList };
  }, [seed, topKeywords]);

  // Bounded force physics simulation on HTML5 Canvas (halts cleanly at 140 ticks = 0% CPU idle)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let iteration = 0;
    const maxIterations = 140;

    const nodeMap = new Map<string, Node>();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Run gentle physics if active
      if (iteration < maxIterations) {
        iteration++;
        edges.forEach((edge) => {
          const s = nodeMap.get(edge.source);
          const t = nodeMap.get(edge.target);
          if (!s || !t) return;
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = s.type === 'seed' ? 100 : 70;
          const force = (dist - targetDist) * 0.015;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (s.type !== 'seed') {
            s.x += fx;
            s.y += fy;
          }
          if (t.type !== 'seed') {
            t.x -= fx;
            t.y -= fy;
          }
        });

        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 80) {
              const rep = (80 - dist) * 0.02;
              const rx = (dx / dist) * rep;
              const ry = (dy / dist) * rep;
              if (a.type !== 'seed') {
                a.x -= rx;
                a.y -= ry;
              }
              if (b.type !== 'seed') {
                b.x += rx;
                b.y += ry;
              }
            }
          }
        }
      }

      // Draw Edges
      edges.forEach((edge) => {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        if (!s || !t) return;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = edge.color;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw Nodes
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = node.type === 'seed' ? 3 : node.type === 'intent' ? 2 : 1;
        ctx.stroke();

        // Node Label
        if (node.type === 'seed' || node.type === 'intent') {
          ctx.fillStyle = '#ffffff';
          ctx.font = node.type === 'seed' ? 'bold 12px sans-serif' : 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y + node.radius + 13);
        }
      });

      ctx.restore();

      if (iteration < maxIterations) {
        animFrameId.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [nodes, edges, zoom]);

  const getNodeAtPosition = (e: React.MouseEvent<HTMLCanvasElement>): Node | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Adjust for canvas pan and zoom
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const transformedX = (mouseX - centerX) / zoom + centerX;
    const transformedY = (mouseY - centerY) / zoom + centerY;

    return (
      nodes.find((n) => {
        const dx = n.x - transformedX;
        const dy = n.y - transformedY;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius + 8;
      }) || null
    );
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const hit = getNodeAtPosition(e);
    setHoveredNode(hit);
  };

  const handleClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    const hit = getNodeAtPosition(e);
    if (!hit) return;

    let textToCopy = '';
    let notificationText = '';

    if (hit.type === 'seed') {
      textToCopy = seed;
      notificationText = `Copied seed: "${seed}" to clipboard!`;
    } else if (hit.type === 'intent') {
      textToCopy = hit.label;
      notificationText = `Copied intent cluster: "${hit.label}"!`;
    } else if (hit.keywordData) {
      textToCopy = hit.keywordData.keyword;
      notificationText = `Copied keyword: "${hit.keywordData.keyword}"!`;
    }

    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedNotification(notificationText);
      setTimeout(() => setCopiedNotification(null), 2500);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Interactive Node-Link Network Graph
              <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
                60fps Canvas &bull; All Nodes Clickable
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Click <strong>any node</strong> (Root Seed, Intent Hubs, or Keyword Leafs) to instantly copy its text.
            </p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          className="w-full aspect-[16/10] max-h-[480px] cursor-pointer block"
        />

        {/* Global Copy Banner / Notification */}
        {copiedNotification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-fadeIn z-30 border border-emerald-400">
            <Check className="w-4 h-4" />
            <span>{copiedNotification}</span>
          </div>
        )}

        {/* Hover Information Card */}
        {hoveredNode && (
          <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-slate-700 backdrop-blur-md rounded-xl p-3 text-white text-xs max-w-xs shadow-2xl space-y-1 animate-fadeIn pointer-events-none z-20">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm text-blue-300 truncate">
                {hoveredNode.label}
              </span>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-emerald-300 font-mono">
                Click to copy
              </span>
            </div>

            {hoveredNode.type === 'seed' && (
              <div className="text-[11px] text-slate-400">Root Seed Keyword for this research query.</div>
            )}
            {hoveredNode.type === 'intent' && (
              <div className="text-[11px] text-slate-400">Intent Hub cluster connecting related terms.</div>
            )}
            {hoveredNode.keywordData && (
              <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                <span>Score: <strong className="text-white">{hoveredNode.keywordData.relativeScore}%</strong></span>
                <span>&bull;</span>
                <span>AP: <strong className="text-blue-300">{hoveredNode.keywordData.apFormatted}</strong></span>
                <span>&bull;</span>
                <span>Diff: <strong className="text-amber-300">{hoveredNode.keywordData.diff}</strong></span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
