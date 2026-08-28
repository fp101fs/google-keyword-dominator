'use client';

import React, { useState, useMemo } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import { Network, Copy, Check, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface VisualSearchTreeProps {
  seed: string;
  keywords: KeywordItem[];
}

export const VisualSearchTree: React.FC<VisualSearchTreeProps> = ({ seed, keywords }) => {
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<{ label: string; details: string; color: string } | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [activeRayIntent, setActiveRayIntent] = useState<string>('all');

  // Radial groupings (AnswerThePublic style)
  const rayGroups = useMemo(() => {
    const questions = keywords.filter((k) =>
      /^(how|what|why|where|when|who|which|can|is|are)/i.test(k.keyword) ||
      k.sources.some((s) => s.startsWith('question-'))
    );
    const prepositions = keywords.filter((k) =>
      /\b(for|with|without|near|to|in|on|like|under)\b/i.test(k.keyword) ||
      k.sources.some((s) => s.startsWith('prep-'))
    );
    const comparisons = keywords.filter((k) =>
      /\b(vs|best|top|or|versus|alternative|review)\b/i.test(k.keyword)
    );
    const alphabetVariations = keywords.filter((k) =>
      !questions.includes(k) && !prepositions.includes(k) && !comparisons.includes(k)
    );

    return [
      { id: 'questions', name: 'Questions (How/What/Why)', color: '#38bdf8', items: questions.slice(0, 12) },
      { id: 'prepositions', name: 'Prepositions (For/With/Near)', color: '#34d399', items: prepositions.slice(0, 12) },
      { id: 'comparisons', name: 'Comparisons (Best/Vs/Top)', color: '#fbbf24', items: comparisons.slice(0, 12) },
      { id: 'alphabet', name: 'Alphabet Long-Tails', color: '#c084fc', items: alphabetVariations.slice(0, 12) },
    ];
  }, [keywords]);

  // Calculate radial concentric circular layout
  const radialNodes = useMemo(() => {
    const nodes: {
      id: string;
      label: string;
      fullText: string;
      x: number;
      y: number;
      angle: number;
      radius: number;
      color: string;
      groupName: string;
      itemData?: KeywordItem;
    }[] = [];

    const centerX = 400;
    const centerY = 400;
    const innerRadius = 140; // Ring 1: Category branches
    const outerRadius = 280; // Ring 2: Leaf keyword rays

    // Generate total items for 360 degree circle distribution
    let currentItemIndex = 0;
    const totalLeafs = rayGroups.reduce((acc, g) => acc + g.items.length, 0) || 1;

    rayGroups.forEach((group, groupIdx) => {
      if (activeRayIntent !== 'all' && activeRayIntent !== group.id) return;

      // Group Inner Node
      const groupAngle = (groupIdx / rayGroups.length) * 2 * Math.PI - Math.PI / 2;
      const gx = centerX + Math.cos(groupAngle) * innerRadius;
      const gy = centerY + Math.sin(groupAngle) * innerRadius;

      nodes.push({
        id: `group-${group.id}`,
        label: group.name.split(' ')[0],
        fullText: group.name,
        x: gx,
        y: gy,
        angle: groupAngle,
        radius: 16,
        color: group.color,
        groupName: group.name,
      });

      // Group Leaf Nodes radiating outwards
      group.items.forEach((item) => {
        const leafAngle = (currentItemIndex / totalLeafs) * 2 * Math.PI - Math.PI / 2;
        currentItemIndex++;

        const lx = centerX + Math.cos(leafAngle) * outerRadius;
        const ly = centerY + Math.sin(leafAngle) * outerRadius;

        nodes.push({
          id: `leaf-${item.keyword}`,
          label: item.keyword,
          fullText: item.keyword,
          x: lx,
          y: ly,
          angle: leafAngle,
          radius: 6,
          color: group.color,
          groupName: group.name,
          itemData: item,
        });
      });
    });

    return nodes;
  }, [rayGroups, activeRayIntent]);

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
          <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Radial Concentric Mindmap
              <span className="text-xs bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-full">
                360&deg; Sunburst Rays
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Concentric circular search wheel radiating out from &quot;<strong>{seed}</strong>&quot;. Click any ray to copy the term.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-bold">
            <button
              onClick={() => setActiveRayIntent('all')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                activeRayIntent === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All 360&deg;
            </button>
            {rayGroups.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveRayIntent(g.id)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeRayIntent === g.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {g.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
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

      {/* SVG Radial Wheel Canvas */}
      <div className="relative bg-slate-950 rounded-2xl p-4 sm:p-6 overflow-hidden select-none flex items-center justify-center min-h-[500px] border border-slate-800">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease-out',
          }}
          className="w-[700px] h-[700px] relative shrink-0"
        >
          <svg viewBox="0 0 800 800" className="w-full h-full">
            {/* Concentric Guide Rings */}
            <circle cx="400" cy="400" r="140" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="400" cy="400" r="280" fill="none" stroke="#1e293b" strokeWidth="1.5" />

            {/* Connecting Spoke Lines */}
            {radialNodes.map((node) => (
              <line
                key={`spoke-${node.id}`}
                x1="400"
                y1="400"
                x2={node.x}
                y2={node.y}
                stroke={node.color}
                strokeOpacity={node.id.startsWith('group-') ? 0.35 : 0.15}
                strokeWidth={node.id.startsWith('group-') ? 2 : 1}
              />
            ))}

            {/* Center Core Seed Node */}
            <circle cx="400" cy="400" r="44" fill="#2563eb" stroke="#ffffff" strokeWidth="3" />
            <text
              x="400"
              y="396"
              fill="#ffffff"
              fontSize="11"
              fontWeight="900"
              textAnchor="middle"
              className="uppercase tracking-widest"
            >
              SEED
            </text>
            <text
              x="400"
              y="412"
              fill="#ffffff"
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
            >
              {seed.length > 12 ? `${seed.slice(0, 10)}...` : seed}
            </text>

            {/* Radial Nodes */}
            {radialNodes.map((node) => {
              const isGroup = node.id.startsWith('group-');
              const isHovered = hoveredItem?.label === node.fullText;

              // Text angle alignment for outer sunburst rays
              const angleDeg = (node.angle * 180) / Math.PI;
              const isRightSide = Math.cos(node.angle) >= 0;
              const textRotation = isRightSide ? angleDeg : angleDeg + 180;
              const textAnchor = isRightSide ? 'start' : 'end';
              const textOffset = isRightSide ? 12 : -12;

              return (
                <g key={node.id} className="cursor-pointer">
                  {/* Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isGroup ? 16 : isHovered ? 8 : 5}
                    fill={node.color}
                    fillOpacity={isGroup ? 0.9 : 0.8}
                    stroke="#ffffff"
                    strokeWidth={isGroup ? 2 : 1}
                    onMouseEnter={() =>
                      setHoveredItem({
                        label: node.fullText,
                        details: isGroup
                          ? `Cluster Category: ${node.groupName}`
                          : `AP: ${node.itemData?.apFormatted || '1st'} | Score: ${node.itemData?.relativeScore || 80}%`,
                        color: node.color,
                      })
                    }
                    onClick={() => {
                      if (node.itemData) handleCopy(node.itemData.keyword);
                    }}
                  />

                  {/* Node Label Text */}
                  {isGroup ? (
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
                      x={node.x + textOffset}
                      y={node.y + 3}
                      fill={isHovered ? '#ffffff' : '#94a3b8'}
                      fontSize={isHovered ? '11' : '9'}
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      textAnchor={textAnchor}
                      transform={`rotate(${textRotation}, ${node.x}, ${node.y})`}
                      className="transition-all duration-150"
                      onClick={() => node.itemData && handleCopy(node.itemData.keyword)}
                    >
                      {node.label.length > 20 ? `${node.label.slice(0, 18)}..` : node.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hovered Keyword Card */}
        {hoveredItem && (
          <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-700 backdrop-blur-md rounded-xl p-3 text-white text-xs max-w-xs shadow-2xl space-y-1 animate-fadeIn">
            <div className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-sm text-sky-300 truncate">
                {hoveredItem.label}
              </span>
              <button
                onClick={() => handleCopy(hoveredItem.label)}
                className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
              >
                {copiedKeyword === hoveredItem.label ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="text-[11px] text-slate-400">{hoveredItem.details}</div>
          </div>
        )}
      </div>
    </div>
  );
};
