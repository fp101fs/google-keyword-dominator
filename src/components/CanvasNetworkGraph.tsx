'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import { Share2, Copy, Check, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

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
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const animFrameId = useRef<number | null>(null);

  // Limit to top 50 nodes to guarantee 60fps lightweight rendering without resource hogging
  const topKeywords = useMemo(() => keywords.slice(0, 50), [keywords]);

  // Construct nodes and links
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
      radius: 20,
      color: '#3b82f6', // blue
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
        radius: 14,
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
        radius: Math.max(5, Math.min(10, kw.wordCount * 1.5)),
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

  // Bounded, lightweight force relaxation simulation on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let iteration = 0;
    const maxIterations = 140; // Stop physics after 140 ticks to consume 0% idle CPU

    const nodeMap = new Map<string, Node>();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // 1. Run gentle physics if iteration < maxIterations
      if (iteration < maxIterations) {
        iteration++;
        // Spring forces on edges
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

        // Repulsion between nodes
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

      // 2. Draw Edges
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

      // 3. Draw Nodes
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = node.type === 'seed' ? 2.5 : 1;
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

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const hit = nodes.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    setHoveredNode(hit || null);
  };

  const handleCopy = async (kw: string) => {
    await navigator.clipboard.writeText(kw);
    setCopiedKeyword(kw);
    setTimeout(() => setCopiedKeyword(null), 1500);
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
                60fps Canvas Accelerated
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Hardware-accelerated network graph showing relationships between &quot;<strong>{seed}</strong>&quot;, intent hubs, and leaf long-tails.
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
          onClick={() => hoveredNode?.keywordData && handleCopy(hoveredNode.keywordData.keyword)}
          className="w-full aspect-[16/10] max-h-[480px] cursor-crosshair block"
        />

        {/* Node Hover Card */}
        {hoveredNode && hoveredNode.keywordData && (
          <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-700 backdrop-blur-md rounded-xl p-3 text-white text-xs max-w-xs shadow-2xl space-y-1 animate-fadeIn">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm text-blue-300 truncate">
                {hoveredNode.keywordData.keyword}
              </span>
              <button
                onClick={() => handleCopy(hoveredNode.keywordData!.keyword)}
                className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
              >
                {copiedKeyword === hoveredNode.keywordData.keyword ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-2">
              <span>Score: <strong className="text-white">{hoveredNode.keywordData.relativeScore}%</strong></span>
              <span>&bull;</span>
              <span>AP: <strong className="text-blue-300">{hoveredNode.keywordData.apFormatted}</strong></span>
              <span>&bull;</span>
              <span>Intent: <strong className="text-amber-300 capitalize">{hoveredNode.keywordData.intent}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
