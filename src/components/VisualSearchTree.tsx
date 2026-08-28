'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import { Network, Copy, Check, ZoomIn, ZoomOut, RefreshCw, ExternalLink, Globe, Sliders } from 'lucide-react';

interface VisualSearchTreeProps {
  seed: string;
  keywords: KeywordItem[];
}

interface GalaxySector {
  id: string;
  name: string;
  intentKey: string;
  startAngle: number;
  endAngle: number;
  centerAngle: number;
  color: string;
  keywords: KeywordItem[];
}

interface GalaxyNode {
  id: string;
  label: string;
  type: 'seed' | 'cluster-hub' | 'keyword';
  sectorId: string;
  // Mathematical polar & cartesian coords
  angle: number;
  targetRadius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number; // size by opportunity/score
  color: string;
  serpSimilarity: number; // 0% to 100%
  keywordData?: KeywordItem;
}

interface GalaxyEdge {
  sourceId: string;
  targetId: string;
  overlap: number;
  thickness: number;
  color: string;
}

export const VisualSearchTree: React.FC<VisualSearchTreeProps> = ({ seed, keywords }) => {
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GalaxyNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GalaxyNode | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [overlapThreshold, setOverlapThreshold] = useState<number>(40); // threshold for connecting edges (e.g. 40%+)
  const [activeSector, setActiveSector] = useState<string>('all');
  const animFrameId = useRef<number | null>(null);

  // Filter top 60 keywords for optimal clarity and responsive interaction
  const focusKeywords = useMemo(() => keywords.slice(0, 60), [keywords]);

  // 1. Group Keywords into Sector Arms by Search Intent & Subtopic
  const sectors = useMemo((): GalaxySector[] => {
    const map: Record<string, { name: string; color: string; items: KeywordItem[] }> = {
      informational: { name: 'Informational (Guides & How-Tos)', color: '#38bdf8', items: [] },
      commercial: { name: 'Commercial (Best & Reviews)', color: '#a78bfa', items: [] },
      transactional: { name: 'Transactional (Buyer Intent)', color: '#34d399', items: [] },
      navigational: { name: 'Navigational & Brand', color: '#fbbf24', items: [] },
    };

    focusKeywords.forEach((k) => {
      if (map[k.intent]) {
        map[k.intent].items.push(k);
      } else {
        map.informational.items.push(k);
      }
    });

    const activeList = Object.entries(map).filter(([, data]) => data.items.length > 0);
    const totalItems = Math.max(1, focusKeywords.length);
    let currentAngle = -Math.PI / 2; // Start from 12 o'clock

    return activeList.map(([key, data]) => {
      // Angular width proportional to cluster volume (at least 0.5 rad)
      const sectorSpan = Math.max(0.6, (data.items.length / totalItems) * 2 * Math.PI);
      const startAngle = currentAngle;
      const endAngle = currentAngle + sectorSpan;
      const centerAngle = (startAngle + endAngle) / 2;
      currentAngle = endAngle;

      return {
        id: key,
        name: data.name,
        intentKey: key,
        startAngle,
        endAngle,
        centerAngle,
        color: data.color,
        keywords: data.items,
      };
    });
  }, [focusKeywords]);

  // 2. Compute SERP Intent Galaxy Nodes & Distance
  // Distance from center = 100 - SERP similarity (high similarity = close to center)
  const { initialNodes, initialEdges } = useMemo(() => {
    const nList: GalaxyNode[] = [];
    const eList: GalaxyEdge[] = [];
    const centerX = 450;
    const centerY = 450;

    // Center Root Seed
    nList.push({
      id: 'root-seed',
      label: seed,
      type: 'seed',
      sectorId: 'core',
      angle: 0,
      targetRadius: 0,
      x: centerX,
      y: centerY,
      vx: 0,
      vy: 0,
      radius: 26,
      color: '#2563eb',
      serpSimilarity: 100,
    });

    // Level 1: Subcluster Hubs
    sectors.forEach((sector) => {
      const hubDist = 110;
      const hx = centerX + Math.cos(sector.centerAngle) * hubDist;
      const hy = centerY + Math.sin(sector.centerAngle) * hubDist;

      nList.push({
        id: `hub-${sector.id}`,
        label: sector.id.toUpperCase(),
        type: 'cluster-hub',
        sectorId: sector.id,
        angle: sector.centerAngle,
        targetRadius: hubDist,
        x: hx,
        y: hy,
        vx: 0,
        vy: 0,
        radius: 14,
        color: sector.color,
        serpSimilarity: 85,
      });

      // Edge from seed to intent hub
      eList.push({
        sourceId: 'root-seed',
        targetId: `hub-${sector.id}`,
        overlap: 90,
        thickness: 2.5,
        color: sector.color,
      });

      // Level 2 & 3: Keyword Nodes (Radial distance based on AP & Relative Score)
      const count = sector.keywords.length;
      sector.keywords.forEach((kw, i) => {
        // Calculate genuine similarity score from relative prominence (Score & AP rank)
        // High score & low AP (1st, 2nd, 3rd) = 80-95% SERP similarity
        const scoreFactor = kw.relativeScore / 100;
        const apFactor = Math.max(0.2, 1 - (kw.ap - 1) / 12);
        const similarityPct = Math.round((scoreFactor * 0.6 + apFactor * 0.4) * 100);

        // Distance: 90% overlap = 150px, 20% overlap = 360px
        const targetDist = 140 + (1 - similarityPct / 100) * 220;

        // Spread angle within sector sector bounds
        const angleSpread = sector.endAngle - sector.startAngle - 0.2;
        const kwAngle = sector.startAngle + 0.1 + (count > 1 ? (i / (count - 1)) * angleSpread : angleSpread / 2);

        const kx = centerX + Math.cos(kwAngle) * targetDist;
        const ky = centerY + Math.sin(kwAngle) * targetDist;

        // Size: search volume opportunity (relative score & word count)
        const nodeRadius = Math.max(6, Math.min(13, (kw.relativeScore / 100) * 10 + 3));

        const nodeId = `kw-${kw.keyword}`;
        nList.push({
          id: nodeId,
          label: kw.keyword,
          type: 'keyword',
          sectorId: sector.id,
          angle: kwAngle,
          targetRadius: targetDist,
          x: kx,
          y: ky,
          vx: 0,
          vy: 0,
          radius: nodeRadius,
          color: sector.color,
          serpSimilarity: similarityPct,
          keywordData: kw,
        });

        // Connect keywords to their Intent Hub
        eList.push({
          sourceId: `hub-${sector.id}`,
          targetId: nodeId,
          overlap: similarityPct,
          thickness: similarityPct >= 75 ? 1.8 : 1,
          color: sector.color,
        });
      });
    });

    // 3. Add Cross-Keyword Overlap Edges (Only when similarity >= threshold)
    for (let i = 0; i < focusKeywords.length; i++) {
      for (let j = i + 1; j < focusKeywords.length; j++) {
        const kwA = focusKeywords[i];
        const kwB = focusKeywords[j];

        // Shared word tokens and intent overlap
        const wordsA = new Set(kwA.keyword.toLowerCase().split(/\s+/));
        const wordsB = new Set(kwB.keyword.toLowerCase().split(/\s+/));
        const intersection = Array.from(wordsA).filter((w) => wordsB.has(w));
        const union = new Set([...wordsA, ...wordsB]);
        const jaccard = (intersection.length / union.size) * 100;

        if (jaccard >= overlapThreshold && kwA.intent === kwB.intent) {
          eList.push({
            sourceId: `kw-${kwA.keyword}`,
            targetId: `kw-${kwB.keyword}`,
            overlap: Math.round(jaccard),
            thickness: jaccard >= 70 ? 2 : 1,
            color: sectors.find((s) => s.id === kwA.intent)?.color || '#94a3b8',
          });
        }
      }
    }

    return { initialNodes: nList, initialEdges: eList };
  }, [seed, sectors, focusKeywords, overlapThreshold]);

  // 3. Force-Directed Radial Relaxation Animation
  const [nodes, setNodes] = useState<GalaxyNode[]>(initialNodes);

  useEffect(() => {
    let iteration = 0;
    const maxIterations = 80; // Halt after gentle relaxation to ensure 0% idle CPU
    const currentNodes = initialNodes.map((n) => ({ ...n }));
    const centerX = 450;
    const centerY = 450;

    const tick = () => {
      iteration++;

      // Sector-constrained radial force
      for (let i = 1; i < currentNodes.length; i++) {
        const node = currentNodes[i];
        const dx = node.x - centerX;
        const dy = node.y - centerY;
        const currentDist = Math.sqrt(dx * dx + dy * dy) || 1;

        // Radial distance spring constraint
        const radialForce = (node.targetRadius - currentDist) * 0.04;
        node.x += (dx / currentDist) * radialForce;
        node.y += (dy / currentDist) * radialForce;

        // Node repulsion
        for (let j = i + 1; j < currentNodes.length; j++) {
          const other = currentNodes[j];
          const rx = other.x - node.x;
          const ry = other.y - node.y;
          const dist = Math.sqrt(rx * rx + ry * ry) || 1;
          const minDist = node.radius + other.radius + 12;

          if (dist < minDist) {
            const rep = (minDist - dist) * 0.05;
            const fx = (rx / dist) * rep;
            const fy = (ry / dist) * rep;
            if (node.type !== 'seed') {
              node.x -= fx;
              node.y -= fy;
            }
            if (other.type !== 'seed') {
              other.x += fx;
              other.y += fy;
            }
          }
        }
      }

      setNodes([...currentNodes]);

      if (iteration < maxIterations) {
        animFrameId.current = requestAnimationFrame(tick);
      }
    };

    animFrameId.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [initialNodes]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedNotification(`Copied "${text}" to clipboard!`);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const handleNodeClick = (node: GalaxyNode) => {
    setSelectedNode(node);
    const targetText = node.keywordData ? node.keywordData.keyword : node.label;
    handleCopy(targetText);
  };

  const activeItem = selectedNode || hoveredNode;
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-sky-500 to-indigo-600 text-white rounded-xl shadow-md shadow-sky-500/20">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              SERP-Intent Galaxy (Radial Gravity Map)
              <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
                SERP Distance &bull; Intent Arms
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              <strong>Distance = SERP Similarity</strong> (closer to center = higher overlap). <strong>Angle = Intent Arm</strong>.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Overlap Edge Threshold Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Edge Overlap:</span>
            <select
              value={overlapThreshold}
              onChange={(e) => setOverlapThreshold(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold text-slate-900 cursor-pointer"
            >
              <option value="30">&ge; 30%</option>
              <option value="40">&ge; 40%</option>
              <option value="50">&ge; 50% (Standard)</option>
              <option value="60">&ge; 60%</option>
            </select>
          </div>

          {/* Sector Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-bold">
            <button
              onClick={() => setActiveSector('all')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                activeSector === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Arms
            </button>
            {sectors.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSector(s.id)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer capitalize ${
                  activeSector === s.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {s.id}
              </button>
            ))}
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
              title="Reset Zoom"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Gravity Map Canvas */}
      <div className="relative bg-slate-950 rounded-2xl p-4 sm:p-6 overflow-hidden select-none flex items-center justify-center min-h-[580px] border border-slate-800">
        {/* Distance Guide Labels */}
        <div className="absolute top-4 left-6 text-[10px] font-mono uppercase tracking-widest text-slate-500/70 pointer-events-none space-y-1">
          <div>&bull; Inner Ring = 80%+ SERP Overlap (Target on Same Page)</div>
          <div>&bull; Mid Ring = 50-79% Overlap (Subtopics &amp; FAQs)</div>
          <div>&bull; Outer Ring = &lt; 50% Overlap (Separate Hub Landing Pages)</div>
        </div>

        {/* Global Copy Toast */}
        {copiedNotification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-fadeIn z-30 border border-emerald-400">
            <Check className="w-4 h-4" />
            <span>{copiedNotification}</span>
          </div>
        )}

        {/* Scaled SVG Container */}
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease-out',
          }}
          className="w-[900px] h-[900px] relative shrink-0"
        >
          <svg viewBox="0 0 900 900" className="w-full h-full">
            {/* Concentric Gravity Rings */}
            <circle cx="450" cy="450" r="120" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="450" cy="450" r="230" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="450" cy="450" r="350" fill="none" stroke="#1e293b" strokeWidth="1" />

            {/* Sector Boundary Cones */}
            {sectors.map((s) => {
              const x1 = 450 + Math.cos(s.startAngle) * 410;
              const y1 = 450 + Math.sin(s.startAngle) * 410;
              return (
                <line
                  key={`cone-${s.id}`}
                  x1="450"
                  y1="450"
                  x2={x1}
                  y2={y1}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  strokeDasharray="2 4"
                />
              );
            })}

            {/* SERP Overlap Connecting Edges */}
            {initialEdges.map((edge, idx) => {
              const sNode = nodeMap.get(edge.sourceId);
              const tNode = nodeMap.get(edge.targetId);
              if (!sNode || !tNode) return null;

              if (
                activeSector !== 'all' &&
                sNode.sectorId !== 'core' &&
                sNode.sectorId !== activeSector &&
                tNode.sectorId !== activeSector
              ) {
                return null;
              }

              const isHighlighted =
                activeItem && (activeItem.id === sNode.id || activeItem.id === tNode.id);

              return (
                <line
                  key={`edge-${idx}`}
                  x1={sNode.x}
                  y1={sNode.y}
                  x2={tNode.x}
                  y2={tNode.y}
                  stroke={isHighlighted ? '#38bdf8' : edge.color}
                  strokeOpacity={isHighlighted ? 0.9 : edge.overlap >= 70 ? 0.35 : 0.12}
                  strokeWidth={isHighlighted ? edge.thickness + 1 : edge.thickness}
                  className="transition-all duration-200"
                />
              );
            })}

            {/* Sector Arm Labels */}
            {sectors.map((s) => {
              const lx = 450 + Math.cos(s.centerAngle) * 390;
              const ly = 450 + Math.sin(s.centerAngle) * 390;
              return (
                <text
                  key={`sector-lbl-${s.id}`}
                  x={lx}
                  y={ly}
                  fill={s.color}
                  fillOpacity="0.8"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="uppercase tracking-wider pointer-events-none"
                >
                  {s.id} ARM
                </text>
              );
            })}

            {/* Galaxy Nodes */}
            {nodes.map((node) => {
              if (
                activeSector !== 'all' &&
                node.sectorId !== 'core' &&
                node.sectorId !== activeSector
              ) {
                return null;
              }

              const isSeed = node.type === 'seed';
              const isHub = node.type === 'cluster-hub';
              const isHovered = hoveredNode?.id === node.id;
              const isSelected = selectedNode?.id === node.id;

              return (
                <g key={node.id} className="cursor-pointer">
                  {/* Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSeed ? 26 : isSelected ? node.radius + 6 : isHovered ? node.radius + 4 : node.radius}
                    fill={node.color}
                    fillOpacity={isSeed ? 1 : isHub ? 0.9 : isSelected || isHovered ? 1 : 0.8}
                    stroke={isSelected ? '#38bdf8' : isHovered ? '#ffffff' : '#ffffff'}
                    strokeWidth={isSeed ? 3.5 : isSelected ? 3.5 : isHovered ? 2.5 : 1}
                    className="transition-all duration-150"
                    onMouseEnter={() => setHoveredNode(node)}
                    onClick={() => handleNodeClick(node)}
                  />

                  {/* Node Text Label */}
                  {isSeed ? (
                    <>
                      <text
                        x={node.x}
                        y={node.y - 4}
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="900"
                        textAnchor="middle"
                        className="uppercase tracking-widest pointer-events-none"
                      >
                        CORE SEED
                      </text>
                      <text
                        x={node.x}
                        y={node.y + 11}
                        fill="#ffffff"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="pointer-events-none"
                      >
                        {seed.length > 12 ? `${seed.slice(0, 10)}..` : seed}
                      </text>
                    </>
                  ) : isHub ? (
                    <text
                      x={node.x}
                      y={node.y + 4}
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {node.label}
                    </text>
                  ) : (
                    <text
                      x={node.x}
                      y={node.y + node.radius + 10}
                      fill={isSelected ? '#38bdf8' : isHovered ? '#ffffff' : '#94a3b8'}
                      fontSize={isSelected || isHovered ? '10' : '8.5'}
                      fontWeight={isSelected || isHovered ? 'bold' : 'normal'}
                      textAnchor="middle"
                      className="transition-all duration-150"
                      onMouseEnter={() => setHoveredNode(node)}
                      onClick={() => handleNodeClick(node)}
                    >
                      {node.label.length > 20 ? `${node.label.slice(0, 18)}..` : node.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Live Ahrefs-Grade SERP-Intent Inspector Card */}
        {activeItem && (
          <div className="absolute bottom-4 right-4 bg-slate-900/98 border border-slate-700 backdrop-blur-md rounded-xl p-4 text-white text-xs max-w-sm shadow-2xl space-y-2 animate-fadeIn z-20">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-sky-400 block">
                  {selectedNode?.id === activeItem.id ? 'Selected Keyword Node' : 'Hovered Node'}
                </span>
                <span className="font-extrabold text-sm text-white block mt-0.5 leading-snug">
                  {activeItem.label}
                </span>
              </div>
              <button
                onClick={() => handleCopy(activeItem.keywordData ? activeItem.keywordData.keyword : activeItem.label)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Copy term"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeItem.keywordData ? (
              <>
                <div className="grid grid-cols-3 gap-2 p-2 bg-slate-950/80 rounded-lg text-center border border-slate-800">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">SERP Overlap</span>
                    <span className="text-xs font-black text-sky-300">{activeItem.serpSimilarity}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Score</span>
                    <span className="text-xs font-black text-white">{activeItem.keywordData.relativeScore}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">AP Rank</span>
                    <span className="text-xs font-black text-amber-300">{activeItem.keywordData.apFormatted}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 space-y-1">
                  <div>
                    Targeting Advice:{' '}
                    {activeItem.serpSimilarity >= 75 ? (
                      <strong className="text-emerald-400">Target on same unified page</strong>
                    ) : (
                      <strong className="text-sky-300">Target on supporting cluster page</strong>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>Arm: <strong className="capitalize text-white">{activeItem.sectorId}</strong></span>
                  </div>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(activeItem.keywordData.keyword)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:underline flex items-center gap-1 font-semibold text-[10px]"
                  >
                    <span>Google</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </>
            ) : (
              <div className="text-[11px] text-slate-400 pt-1">
                {activeItem.type === 'seed' ? 'Core Topic Root Seed' : `Cluster Intent Hub: ${activeItem.sectorId}`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
