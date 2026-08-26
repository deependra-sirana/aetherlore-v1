"use client";

import React from "react";
import { ShieldCheck, Sparkles, Terminal, Lock, ExternalLink } from "lucide-react";

interface NavbarProps {
  onOpenAuditModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuditModal }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/80 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-[1px] flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="h-full w-full bg-surface-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white font-mono">
                AETHER<span className="text-cyan-400">LORE</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                App Router v14
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              Secure AI Game Narrative & Lore Synthesis
            </p>
          </div>
        </div>

        {/* Security Status & Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenAuditModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer group"
            title="Inspect Prompt Injection & XSS Defenses"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline">Defenses:</span>
            <span className="font-semibold text-emerald-300">SHIELD ACTIVE</span>
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-200/80 text-gray-300 border border-gray-700 hover:text-white hover:border-gray-600 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Docs & Repo</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>
      </div>
    </header>
  );
};
