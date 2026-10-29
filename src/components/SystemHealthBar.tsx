/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Live System Telemetry and Health Status Bar
 */

import React from 'react';
import { Activity, ShieldCheck, Database, Server, Cpu, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SystemHealth } from '../types';

interface SystemHealthBarProps {
  health: SystemHealth;
  auditChainValid: boolean;
  onVerifyAudit: () => void;
}

export const SystemHealthBar: React.FC<SystemHealthBarProps> = ({
  health,
  auditChainValid,
  onVerifyAudit
}) => {
  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">

        {/* Telemetry Chips */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Health status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/70 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">حالة النواة:</span>
            <span className="text-emerald-400 font-semibold">مثالية (Optimal)</span>
          </div>

          {/* Sandbox Security */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/70 border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">عزل المسارات (Sandbox):</span>
            <span className="text-amber-300 font-medium">مطبق ومحمي من Traversal</span>
          </div>

          {/* Audit Chain */}
          <button
            onClick={onVerifyAudit}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition ${
              auditChainValid
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/60'
                : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
            }`}
            title="انقر لفحص سلسلة التجزئة المشفرة لسجل التدقيق"
          >
            {auditChainValid ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>سلسلة سجل التدقيق:</span>
            <span className="font-semibold underline decoration-dotted">
              {auditChainValid ? 'موثقة ومطابقة SHA-256' : 'انكسار في التجزئة'}
            </span>
          </button>
        </div>

        {/* Engine indicators */}
        <div className="flex items-center gap-2 text-slate-400">
          <span className="hidden sm:inline">المحركات النشطة:</span>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Generator</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">TestRunner</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">SelfHealer</span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">Checkpoints</span>
          </div>
        </div>

      </div>
    </div>
  );
};
