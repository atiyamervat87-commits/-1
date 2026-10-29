/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 10-Phase Self-Healing Engine Stepper & Interactive Runner
 */

import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  GitCompare,
  ShieldAlert,
  ArrowRight,
  Terminal,
  Bug,
  FastForward,
  Cpu,
  Layers
} from 'lucide-react';
import { Project, HealingPhaseNumber } from '../types';

interface SelfHealingWorkflowProps {
  project: Project;
  onRunPhase: (phaseNum: HealingPhaseNumber) => Promise<void>;
  onRunFullCycle: () => Promise<void>;
  onOpenDiffModal: () => void;
  isRunningPhase: boolean;
  currentRunningPhaseNum: HealingPhaseNumber | null;
  lastReproductionLog: string;
}

export const SelfHealingWorkflow: React.FC<SelfHealingWorkflowProps> = ({
  project,
  onRunPhase,
  onRunFullCycle,
  onOpenDiffModal,
  isRunningPhase,
  currentRunningPhaseNum,
  lastReproductionLog
}) => {
  const activeBug = project.activeBug;
  const phases = Object.values(project.healingPhases);

  return (
    <div className="space-y-6">

      {/* Top Banner: Active Bug Summary or All Healthy */}
      {activeBug ? (
        <div className="rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <Bug className="w-3.5 h-3.5" />
                  خلل نشط مكتشف: {activeBug.severity.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {activeBug.file}:{activeBug.line}
                </span>
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {activeBug.title}
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {activeBug.observedBehavior}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={onRunFullCycle}
                disabled={isRunningPhase}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
              >
                <FastForward className="w-4 h-4" />
                <span>تشغيل دورة الإصلاح كاملة (1-10)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-300 text-sm">النظام سليم ومحصن تماماً</h3>
              <p className="text-xs text-emerald-400/80">
                تم علاج كافة الأعطال بنجاح، وتثبيت حزمة الاختبارات الوقائية في المشروع.
              </p>
            </div>
          </div>
          <button
            onClick={() => onRunPhase(1)}
            disabled={isRunningPhase}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة فحص شامل</span>
          </button>
        </div>
      )}

      {/* The 10 Phases Grid / Timeline */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">مراحل محرك الإصلاح الذاتي العشر (10-Phase Pipeline)</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            الحالة: {isRunningPhase ? `جاري تنفيذ المرحلة #${currentRunningPhaseNum}` : 'في انتظار التوجيه'}
          </span>
        </div>

        <div className="space-y-3">
          {phases.map((p) => {
            const isCurrent = project.activeHealingPhase === p.phase;
            const isRunning = isRunningPhase && currentRunningPhaseNum === p.phase;

            return (
              <div
                key={p.phase}
                className={`rounded-lg border p-4 transition ${
                  isRunning
                    ? 'border-amber-400/60 bg-amber-950/20 ring-1 ring-amber-400/30'
                    : p.status === 'completed'
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : p.status === 'failed'
                    ? 'border-rose-500/40 bg-rose-950/20'
                    : p.status === 'waiting_approval'
                    ? 'border-amber-500/50 bg-amber-950/30 animate-pulse'
                    : 'border-slate-800 bg-slate-950/40'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

                  {/* Phase Title and Number */}
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shrink-0 ${
                      p.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : p.status === 'failed'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : isRunning
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500 animate-spin'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : p.status === 'failed' ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        p.phase
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{p.titleAr}</span>
                        <span className="text-[11px] font-mono text-slate-400">({p.titleEn})</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  {/* Phase Action Controls */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">

                    {/* PHASE 3 SPECIAL BUTTON: Guaranteed execution of Reproduce Error */}
                    {p.phase === 3 && (
                      <button
                        onClick={() => onRunPhase(3)}
                        disabled={isRunningPhase}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                          isRunning
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 cursor-wait'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 active:scale-95'
                        }`}
                        title="تشغيل اختبار محاكاة الخطأ الحقيقي والتأكد من إثباته برمجياً"
                      >
                        {isRunning ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            <span>جاري تشغيل بيئة المحاكاة...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>تشغيل اختبار إعادة إظهار الخطأ</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* PHASE 6 SPECIAL BUTTON: Review Diff & Approve */}
                    {p.phase === 6 && project.currentPatch && (
                      <button
                        onClick={onOpenDiffModal}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition"
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        <span>مراجعة واعتماد الرقعة (Diff)</span>
                      </button>
                    )}

                    {/* Generic Phase Trigger button for other phases */}
                    {p.phase !== 3 && p.phase !== 6 && (
                      <button
                        onClick={() => onRunPhase(p.phase as HealingPhaseNumber)}
                        disabled={isRunningPhase}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition disabled:opacity-40"
                      >
                        {isRunning ? (
                          <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        <span>{p.status === 'completed' ? 'إعادة التنفيذ' : 'تشغيل'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Phase Output Box */}
                {p.output && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 font-mono text-[11px] text-slate-300 bg-slate-950/60 rounded p-2.5 whitespace-pre-wrap flex items-start gap-2">
                    <Terminal className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1 overflow-x-auto">{p.output}</div>
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
