'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import { GitFork, ChevronRight, ChevronDown, Copy, Check, Folder, FileText, CornerDownRight } from 'lucide-react';
import { INTENT_DEFINITIONS } from '@/lib/intent';

interface HierarchicalClusterTreeProps {
  seed: string;
  keywords: KeywordItem[];
}

interface TreeNode {
  name: string;
  type: 'intent' | 'subgroup' | 'leaf';
  count: number;
  badgeClass?: string;
  keywordData?: KeywordItem;
  children?: TreeNode[];
}

function buildTreeData(keywords: KeywordItem[]): TreeNode[] {
  const intents: Record<string, KeywordItem[]> = {
    informational: [],
    commercial: [],
    transactional: [],
    navigational: [],
  };

  keywords.forEach((k) => {
    const intentKey = k.intent || 'informational';
    if (!intents[intentKey]) intents[intentKey] = [];
    intents[intentKey].push(k);
  });

  const rootNodes: TreeNode[] = [];

  (Object.keys(intents) as (keyof typeof INTENT_DEFINITIONS)[]).forEach((intentKey) => {
    const list = intents[intentKey];
    if (list.length === 0) return;

    const subGroupsMap = new Map<string, KeywordItem[]>();

    list.forEach((item) => {
      let sub = 'General Long-Tail';
      const kw = item.keyword.toLowerCase();

      if (/^(how|what|why|where|when|who|can)/i.test(kw)) {
        const match = kw.match(/^(how to|how|what is|what|why|where|when|who|can)/i);
        sub = match ? match[0].toUpperCase() : 'QUESTIONS';
      } else if (/\b(best|top|recommended)\b/i.test(kw)) {
        sub = 'BEST & TOP RANKED';
      } else if (/\b(vs|or|versus|alternative)\b/i.test(kw)) {
        sub = 'VS & COMPARISONS';
      } else if (/\b(for|with|without|near|in|to)\b/i.test(kw)) {
        const match = kw.match(/\b(for|with|without|near me|near|in|to)\b/i);
        sub = match ? match[0].toUpperCase() : 'PREPOSITIONS';
      } else if (/\b(buy|price|cheap|cost|deals|discount|order)\b/i.test(kw)) {
        sub = 'PURCHASE & PRICING';
      }

      if (!subGroupsMap.has(sub)) {
        subGroupsMap.set(sub, []);
      }
      subGroupsMap.get(sub)!.push(item);
    });

    const subgroupNodes: TreeNode[] = [];
    subGroupsMap.forEach((subItems, subName) => {
      subgroupNodes.push({
        name: subName,
        type: 'subgroup',
        count: subItems.length,
        children: subItems
          .sort((a, b) => b.relativeScore - a.relativeScore)
          .map((k) => ({
            name: k.keyword,
            type: 'leaf',
            count: 1,
            keywordData: k,
          })),
      });
    });

    const def = INTENT_DEFINITIONS[intentKey];
    rootNodes.push({
      name: def?.label || intentKey,
      type: 'intent',
      count: list.length,
      badgeClass: def?.badgeClass,
      children: subgroupNodes.sort((a, b) => b.count - a.count),
    });
  });

  return rootNodes;
}

export const HierarchicalClusterTree: React.FC<HierarchicalClusterTreeProps> = ({ seed, keywords }) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'intent-informational': true,
    'intent-commercial': true,
    'intent-transactional': true,
  });
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  const treeData = useMemo(() => buildTreeData(keywords), [keywords]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const expandAll = useCallback(() => {
    const all: Record<string, boolean> = {};
    treeData.forEach((intentNode) => {
      all[`intent-${intentNode.name.toLowerCase()}`] = true;
      intentNode.children?.forEach((subgroup) => {
        all[`sub-${intentNode.name}-${subgroup.name}`] = true;
      });
    });
    setExpandedNodes(all);
  }, [treeData]);

  const collapseAll = () => {
    setExpandedNodes({});
  };

  const handleCopy = async (kw: string) => {
    await navigator.clipboard.writeText(kw);
    setCopiedKeyword(kw);
    setTimeout(() => setCopiedKeyword(null), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Keyword &rarr; Cluster Hierarchy Tree
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Parent &bull; Child Structure
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              3-tier hierarchical outline: <strong className="text-slate-700">Seed ({seed})</strong> &rarr; <strong className="text-slate-700">Intent Tier</strong> &rarr; <strong className="text-slate-700">Modifier Stem</strong> &rarr; <strong className="text-slate-700">Long-Tail Queries</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Hierarchical Tree Container */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-6 space-y-3 font-sans">
        {/* Root Seed Node */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              S
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Root Seed Term</span>
              <span className="text-base font-extrabold text-slate-900">{seed}</span>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            {keywords.length} total nodes
          </span>
        </div>

        {/* Tier 1: Intents */}
        <div className="space-y-3 pt-1">
          {treeData.map((intentNode) => {
            const intentId = `intent-${intentNode.name.toLowerCase()}`;
            const isIntentOpen = !!expandedNodes[intentId];

            return (
              <div key={intentNode.name} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
                {/* Intent Bar */}
                <div
                  onClick={() => toggleNode(intentId)}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5">
                    {isIntentOpen ? (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                    <Folder className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold text-slate-800">{intentNode.name} Intent</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${intentNode.badgeClass}`}>
                      {intentNode.count} keywords
                    </span>
                  </div>
                </div>

                {/* Tier 2: Subgroups */}
                {isIntentOpen && (
                  <div className="p-3 pt-0 space-y-2.5 border-t border-slate-100 bg-slate-50/40">
                    {intentNode.children?.map((subgroup) => {
                      const subgroupId = `sub-${intentNode.name}-${subgroup.name}`;
                      const isSubOpen = !!expandedNodes[subgroupId];

                      return (
                        <div key={subgroup.name} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                          {/* Subgroup Header */}
                          <div
                            onClick={() => toggleNode(subgroupId)}
                            className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer select-none text-xs font-bold text-slate-700"
                          >
                            <div className="flex items-center gap-2">
                              {isSubOpen ? (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                              <span>{subgroup.name}</span>
                            </div>
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
                              {subgroup.count}
                            </span>
                          </div>

                          {/* Tier 3: Leaf Keywords */}
                          {isSubOpen && (
                            <div className="p-2 pt-0 space-y-1.5 border-t border-slate-100 bg-white">
                              {subgroup.children?.map((leaf) => {
                                const kw = leaf.keywordData!;
                                return (
                                  <div
                                    key={leaf.name}
                                    onClick={() => handleCopy(kw.keyword)}
                                    className="flex items-center justify-between p-2 rounded-md hover:bg-blue-50/60 border border-transparent hover:border-blue-100 text-xs font-medium text-slate-800 transition-all cursor-pointer group"
                                  >
                                    <div className="flex items-center gap-2 truncate mr-2">
                                      <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                                      <span className="truncate">{kw.keyword}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                        AP: {kw.apFormatted}
                                      </span>
                                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                        {kw.relativeScore}
                                      </span>
                                      {copiedKeyword === kw.keyword ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
