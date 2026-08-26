"use client";

import React from "react";
import { X, ShieldCheck, Lock, Terminal, Cpu, CheckCircle } from "lucide-react";

interface SecurityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityAuditModal: React.FC<SecurityAuditModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-surface-100 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-800 bg-surface-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-mono">
                Architecture & Security Gateways
              </h3>
              <p className="text-xs text-gray-400">
                Defense-in-depth specifications enforced across Next.js 14 App Router
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto font-sans text-sm text-gray-300">
          {/* Defense 1: Prompt Injection Shielding */}
          <div className="bg-surface-200/50 border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold font-mono text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4" /> 1. Prompt Injection Shielding & Delimiter Boundary
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Untrusted user inputs are enveloped inside cryptographic nonces and immutable XML tags (e.g. <code className="bg-black/50 px-1 py-0.5 rounded text-cyan-300">&lt;untrusted_character_data_nonce&gt;</code>). The system prompt establishes absolute instruction precedence and mandates strict JSON response parsing, preventing persona hijacking (DAN/Sudo) and instruction bypass.
            </p>
          </div>

          {/* Defense 2: Input Sanitization & XSS */}
          <div className="bg-surface-200/50 border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-semibold font-mono text-xs uppercase tracking-wider">
              <Terminal className="w-4 h-4" /> 2. Isomorphic DOMPurify & Zod Input Scrubbing
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              All strings undergo dual-tier sanitization: HTML tags, scripts (<code className="bg-black/50 px-1 py-0.5 rounded text-purple-300">&lt;script&gt;</code>, <code className="bg-black/50 px-1 py-0.5 rounded text-purple-300">onerror=</code>), javascript pseudo-protocols, and control characters are stripped. Schema bounds (min/max lengths, regex whitelists) are strictly validated via Zod.
            </p>
          </div>

          {/* Defense 3: Rate Limiting & Zero Leakage */}
          <div className="bg-surface-200/50 border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold font-mono text-xs uppercase tracking-wider">
              <Cpu className="w-4 h-4" /> 3. IP Sliding-Window Limiter & Secret Isolation
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              API routes strictly restrict rate to 5 requests per 60s per client IP with standard <code className="bg-black/50 px-1 py-0.5 rounded text-emerald-300">X-RateLimit-*</code> headers and memory garbage collection. Secret keys (<code className="bg-black/50 px-1 py-0.5 rounded text-emerald-300">GEMINI_API_KEY</code>, <code className="bg-black/50 px-1 py-0.5 rounded text-emerald-300">OPENAI_API_KEY</code>) are server-only and NEVER prefixed with <code className="bg-black/50 px-1 py-0.5 rounded text-emerald-300">NEXT_PUBLIC_</code>.
            </p>
          </div>

          {/* Security Headers Summary */}
          <div className="border border-gray-800 rounded-xl p-4 bg-black/40">
            <h4 className="text-xs font-semibold uppercase font-mono text-gray-200 mb-2">
              Next.js Hardened HTTP Headers
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-gray-400">
              <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400" /> Content-Security-Policy (Strict)</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400" /> X-Frame-Options: DENY</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400" /> X-Content-Type-Options: nosniff</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400" /> Strict-Transport-Security (HSTS)</div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-800 bg-surface-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-surface-200 hover:bg-surface-300 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Telemetry View
          </button>
        </div>
      </div>
    </div>
  );
};
