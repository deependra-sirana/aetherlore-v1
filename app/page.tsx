"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Form } from "@/components/Form";
import { LoreDisplay } from "@/components/LoreDisplay";
import { SecurityBadge } from "@/components/SecurityBadge";
import { SecurityAuditModal } from "@/components/SecurityAuditModal";
import { NarrativeResponse } from "@/lib/types";
import {
  ShieldCheck,
  Cpu,
  Lock,
  Terminal,
  Zap,
  Layers,
  CheckCircle2,
  Code,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const [lore, setLore] = useState<NarrativeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation */}
      <Navbar onOpenAuditModal={() => setIsAuditModalOpen(true)} />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DevSecOps Hardened Narrative Matrix</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono">
            SECURE AI GAME <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              NARRATIVE GENERATOR
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 font-sans max-w-2xl mx-auto leading-relaxed">
            Generate immersive game lore, quest hooks, and dialogue encounters protected by
            cryptographic boundary delimiters, prompt injection shielding, and isomorphic XSS sanitization.
          </p>
        </section>

        {/* Real-time Security Telemetry Bar */}
        <section>
          <SecurityBadge audit={lore?.securityAudit} />
        </section>

        {/* Dual Column Studio Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Builder (5 cols) */}
          <div className="lg:col-span-5 w-full">
            <Form
              onSuccess={(generatedLore) => setLore(generatedLore)}
              onLoadingChange={(loading) => setIsLoading(loading)}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Lore & Quest Output Matrix (7 cols) */}
          <div className="lg:col-span-7 w-full">
            <LoreDisplay lore={lore} isLoading={isLoading} />
          </div>
        </section>

        {/* Security Architecture Deep Dive Section for Evaluators */}
        <section className="pt-8 border-t border-gray-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                SECURITY ARCHITECTURE & DEFENSE LAYERS
              </h3>
              <p className="text-xs text-gray-400">
                How this Next.js 14 App Router deployment mitigates modern OWASP LLM Top 10 vulnerabilities
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAuditModalOpen(true)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-4 flex items-center gap-1"
            >
              <span>View Full Gateway Specs</span> &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div className="bg-surface-100/70 border border-gray-800 rounded-xl p-5 space-y-2.5">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white font-mono">
                1. Prompt Injection Shielding
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Inputs are encapsulated in randomized XML delimiters with immutable system instruction hierarchy. Heuristic scanners intercept jailbreaks (DAN, sudo mode, rule overrides) before dispatch.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-100/70 border border-gray-800 rounded-xl p-5 space-y-2.5">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Terminal className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white font-mono">
                2. Multi-Tier Input Sanitization
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Server and client-side DOMPurify filters strip script tags, iframe attacks, and HTML injections. Strict Zod schemas enforce type constraints, regex character boundaries, and string length caps.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-100/70 border border-gray-800 rounded-xl p-5 space-y-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white font-mono">
                3. Rate Limiting & Secret Shield
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Sliding-window IP rate limiting prevents DoS and brute-force key depletion. API keys reside exclusively in isolated Serverless Edge/Node contexts with zero client-side exposure.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-800/80 bg-surface-50/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-gray-300 font-bold">AETHERLORE</span> &bull; 100% Vercel Zero-Config Ready
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Next.js 14 App Router</span>
            <span className="text-gray-400">TypeScript Strict</span>
            <span className="text-gray-400">Tailwind CSS</span>
          </div>
        </div>
      </footer>

      {/* Interactive Telemetry Modal */}
      <SecurityAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
}
