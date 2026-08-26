import React from "react";
import { ShieldAlert, ShieldCheck, Lock, Activity, CheckCircle2 } from "lucide-react";

interface SecurityBadgeProps {
  audit?: {
    sanitized: boolean;
    injectionAttemptDetected: boolean;
    injectionConfidence: "NONE" | "LOW" | "HIGH";
    filteredPatterns: string[];
    processingLatencyMs: number;
    provider: string;
  };
}

export const SecurityBadge: React.FC<SecurityBadgeProps> = ({ audit }) => {
  return (
    <div className="w-full bg-surface-100/90 border border-gray-800 rounded-xl p-4 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-200">
            DevSecOps Telemetry & Protection Status
          </h4>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          ALL GATES ENFORCED
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Layer 1: XSS Filter */}
        <div className="bg-surface-200/50 border border-gray-800/80 rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span>XSS Sanitization</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="font-mono text-xs font-semibold text-gray-200 mt-1">
            DOMPurify Stripped
          </span>
        </div>

        {/* Layer 2: Injection Shield */}
        <div className={`border rounded-lg p-2.5 flex flex-col justify-between ${
          audit?.injectionAttemptDetected
            ? "bg-amber-500/10 border-amber-500/30"
            : "bg-surface-200/50 border-gray-800/80"
        }`}>
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span>Prompt Shield</span>
            {audit?.injectionAttemptDetected ? (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            )}
          </div>
          <span className={`font-mono text-xs font-semibold mt-1 ${
            audit?.injectionAttemptDetected ? "text-amber-300" : "text-gray-200"
          }`}>
            {audit?.injectionAttemptDetected ? "Attack Neutralized" : "XML Boundary Enforced"}
          </span>
        </div>

        {/* Layer 3: Rate Limiter */}
        <div className="bg-surface-200/50 border border-gray-800/80 rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span>Sliding Window</span>
            <Activity className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="font-mono text-xs font-semibold text-gray-200 mt-1">
            5 req / 60s per IP
          </span>
        </div>

        {/* Layer 4: Provider & Latency */}
        <div className="bg-surface-200/50 border border-gray-800/80 rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span>Engine Latency</span>
            <span className="text-[10px] text-gray-400">
              {audit ? `${audit.processingLatencyMs}ms` : "Ready"}
            </span>
          </div>
          <span className="font-mono text-[11px] font-medium text-cyan-300 truncate mt-1">
            {audit?.provider || "Zero-Leak Serverless"}
          </span>
        </div>
      </div>

      {audit?.injectionAttemptDetected && audit.filteredPatterns.length > 0 && (
        <div className="mt-3 p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-lg text-xs text-amber-300 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Security Alert Log:</span> Adversarial directives detected and purged:{" "}
            <code className="bg-amber-900/50 px-1 py-0.5 rounded text-amber-200">
              {audit.filteredPatterns.join(", ")}
            </code>
            . Output remained strictly confined to safe game lore.
          </div>
        </div>
      )}
    </div>
  );
};
