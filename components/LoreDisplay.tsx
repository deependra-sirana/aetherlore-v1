"use client";

import React, { useState } from "react";
import { NarrativeResponse } from "@/lib/types";
import {
  BookOpen,
  Compass,
  MessageSquare,
  Shield,
  Copy,
  Check,
  Download,
  Code2,
  Sparkles,
  Flame,
  AlertTriangle,
  Zap,
} from "lucide-react";

interface LoreDisplayProps {
  lore: NarrativeResponse | null;
  isLoading: boolean;
}

export const LoreDisplay: React.FC<LoreDisplayProps> = ({ lore, isLoading }) => {
  const [activeTab, setActiveTab] = useState<"story" | "quests" | "dialogue" | "stats" | "json">("story");
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full bg-surface-100/80 border border-cyan-500/20 rounded-2xl p-8 backdrop-blur-md flex flex-col items-center justify-center min-h-[520px] text-center">
        <div className="relative mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 animate-spin flex items-center justify-center p-[2px]">
            <div className="h-full w-full bg-surface-100 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
        </div>
        <h3 className="text-lg font-bold text-white font-mono mb-2">
          SYNTHESIZING SECURE LORE MATRIX...
        </h3>
        <p className="text-xs text-gray-400 max-w-md font-mono">
          [1] Sanitizing input &gt; [2] Applying XML boundary delimiters &gt; [3] Shielding against prompt overrides &gt; [4] Invoking secure AI generation engine.
        </p>
      </div>
    );
  }

  if (!lore) {
    return (
      <div className="w-full bg-surface-100/60 border border-gray-800/80 border-dashed rounded-2xl p-8 backdrop-blur-md flex flex-col items-center justify-center min-h-[520px] text-center">
        <div className="h-14 w-14 rounded-2xl bg-surface-200 border border-gray-700 flex items-center justify-center mb-4 text-gray-500">
          <BookOpen className="w-7 h-7 text-cyan-400/60" />
        </div>
        <h3 className="text-base font-bold text-gray-300 font-mono mb-1">
          AWAITING CHARACTER TELEMETRY
        </h3>
        <p className="text-xs text-gray-400 max-w-sm">
          Select or configure character parameters on the left and dispatch the generation command to synthesize an immersive, tamper-proof narrative.
        </p>
      </div>
    );
  }

  const handleCopyMarkdown = () => {
    const md = `# ${lore.title}
**Character:** ${lore.characterName} | **Archetype:** ${lore.archetype} | **Genre:** ${lore.genre}

## Executive Summary
${lore.summary}

## Chronicle
${lore.mainStory}

## Quest Hooks
${lore.questHooks.map((q) => `- **${q.title}** [Danger: ${q.dangerLevel}]: ${q.description}`).join("\n")}

## Dialogue Encounters
${lore.sampleDialogue.map((d) => `> "${d.line}" — *${d.speaker}* (${d.context})`).join("\n\n")}

## Character Attributes
- **Primary Stat:** ${lore.statProfile.primaryStat}
- **Signature Ability:** ${lore.statProfile.signatureAbility}
- **Faction:** ${lore.statProfile.factionAllegiance}
- **Alignment:** ${lore.statProfile.moralAlignment}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const filename = `${lore.characterName.toLowerCase().replace(/\s+/g, "_")}_lore.md`;
    const element = document.createElement("a");
    const file = new Blob(
      [
        `# ${lore.title}\n\n` +
        `**Character:** ${lore.characterName}\n` +
        `**Archetype:** ${lore.archetype}\n` +
        `**Genre:** ${lore.genre}\n\n` +
        `## Executive Summary\n${lore.summary}\n\n` +
        `## Chronicle\n${lore.mainStory}\n\n` +
        `## Quest Hooks\n` +
        lore.questHooks.map((q) => `### ${q.title} (${q.dangerLevel})\n${q.description}`).join("\n\n") +
        `\n\n## Dialogue\n` +
        lore.sampleDialogue.map((d) => `> "${d.line}"\n> — *${d.speaker} (${d.context})*`).join("\n\n")
      ],
      { type: "text/markdown" }
    );
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const dangerBadge = (level: string) => {
    switch (level) {
      case "Mythic":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">Mythic</span>;
      case "Lethal":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">Lethal</span>;
      case "High":
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">High</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">Moderate</span>;
    }
  };

  return (
    <div className="w-full bg-surface-100/90 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col shadow-2xl">
      {/* Header Banner */}
      <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-surface-50 via-surface-100 to-surface-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
              {lore.genre.replace(/_/g, " ")}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">
              {lore.archetype.replace(/_/g, " ")}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
            {lore.title}
          </h2>
          <p className="text-xs text-gray-400 mt-1 italic">
            "{lore.summary}"
          </p>
        </div>

        {/* Quick Action Export Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-200 hover:bg-surface-300 text-gray-200 border border-gray-700 transition-colors"
            title="Copy as Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? "Copied!" : "Copy MD"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors"
            title="Download Markdown Document"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-800 bg-surface-50/70 px-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("story")}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "story"
              ? "border-cyan-400 text-cyan-400 bg-cyan-500/5"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Chronicle & Lore
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("quests")}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "quests"
              ? "border-cyan-400 text-cyan-400 bg-cyan-500/5"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Compass className="w-4 h-4" />
          Quest Hooks ({lore.questHooks.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dialogue")}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "dialogue"
              ? "border-cyan-400 text-cyan-400 bg-cyan-500/5"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Dialogue Encounters ({lore.sampleDialogue.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "stats"
              ? "border-cyan-400 text-cyan-400 bg-cyan-500/5"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Shield className="w-4 h-4" />
          Stat Matrix
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("json")}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "json"
              ? "border-cyan-400 text-cyan-400 bg-cyan-500/5"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Code2 className="w-4 h-4" />
          Raw JSON
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        {/* Tab 1: Story */}
        {activeTab === "story" && (
          <div className="space-y-4 text-sm text-gray-300 leading-relaxed font-sans">
            {lore.mainStory.split("\n\n").map((paragraph, idx) => (
              <p key={idx} className="first-letter:text-2xl first-letter:font-bold first-letter:text-cyan-400 first-letter:font-mono">
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {/* Tab 2: Quests */}
        {activeTab === "quests" && (
          <div className="space-y-3">
            {lore.questHooks.map((quest, idx) => (
              <div
                key={idx}
                className="bg-surface-200/40 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-bold text-white text-sm font-mono flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    {quest.title}
                  </h4>
                  {dangerBadge(quest.dangerLevel)}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {quest.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Dialogue */}
        {activeTab === "dialogue" && (
          <div className="space-y-4">
            {lore.sampleDialogue.map((dialogue, idx) => (
              <div
                key={idx}
                className="bg-surface-200/40 border-l-4 border-l-cyan-400 border-y border-r border-gray-800 rounded-r-xl p-4"
              >
                <p className="text-sm font-medium text-cyan-200 italic mb-2">
                  "{dialogue.line}"
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                  <span className="text-gray-300 font-semibold">— {dialogue.speaker}</span>
                  <span className="text-[11px] text-gray-500">Trigger: {dialogue.context}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Stat Matrix */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-200/40 border border-gray-800 rounded-xl p-4">
              <div className="text-[11px] font-mono text-gray-400 uppercase">Primary Stat</div>
              <div className="text-base font-bold text-cyan-300 font-mono mt-1">
                {lore.statProfile.primaryStat}
              </div>
            </div>

            <div className="bg-surface-200/40 border border-gray-800 rounded-xl p-4">
              <div className="text-[11px] font-mono text-gray-400 uppercase">Signature Ability</div>
              <div className="text-base font-bold text-purple-300 font-mono mt-1">
                {lore.statProfile.signatureAbility}
              </div>
            </div>

            <div className="bg-surface-200/40 border border-gray-800 rounded-xl p-4">
              <div className="text-[11px] font-mono text-gray-400 uppercase">Faction Allegiance</div>
              <div className="text-base font-bold text-emerald-300 font-mono mt-1">
                {lore.statProfile.factionAllegiance}
              </div>
            </div>

            <div className="bg-surface-200/40 border border-gray-800 rounded-xl p-4">
              <div className="text-[11px] font-mono text-gray-400 uppercase">Moral Alignment</div>
              <div className="text-base font-bold text-amber-300 font-mono mt-1">
                {lore.statProfile.moralAlignment}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Raw JSON */}
        {activeTab === "json" && (
          <pre className="p-4 bg-black/60 border border-gray-800 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto max-h-96">
            {JSON.stringify(lore, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
