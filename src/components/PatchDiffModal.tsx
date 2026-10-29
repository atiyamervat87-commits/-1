/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Patch Diff Review & Explicit Approval Gate Modal
 */

import React from 'react';
import { X, Check, Ban, ShieldCheck, GitCommit, FileCode, AlertTriangle } from 'lucide-react';
import { ProposedPatch } from '../types';

interface PatchDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  patch: ProposedPatch | null;
  onApprove: () => void;
  onReject: () => void;
}

export const PatchDiffModal: React.FC<PatchDiffModalProps> = ({
  isOpen,
  onClose,
  patch,
  onApprove,
  onReject
}) => {
  if (!isOpen || !patch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <GitCommit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                بوابة المراجعة الصريحة لرقعة الإصلاح الذاتي
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {patch.id}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                المسار المستهدف: <span className="font-mono text-slate-300">{patch.filePath}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patch Explanation & Impact */}
        <div className="p-4 bg-amber-950/20 border-b border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-amber-300">تحليل الأثر الهندسي للشفرة:</span>
            <p className="text-slate-300 leading-relaxed">{patch.explanation}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30">
              +{patch.diffSummary.addedLines} أسطر مضافة
            </span>
            <span className="text-rose-400 font-mono font-bold bg-rose-950/60 px-2.5 py-1 rounded border border-rose-500/30">
              -{patch.diffSummary.removedLines} أسطر محذوفة
            </span>
          </div>
        </div>

        {/* Code Diff Display */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Original Buggy Code */}
            <div className="border border-rose-500/30 rounded-xl overflow-hidden bg-slate-950">
              <div className="bg-rose-950/40 px-3 py-2 border-b border-rose-500/30 flex items-center justify-between text-xs text-rose-300 font-semibold">
                <span>الشفرة الأصلية (المعطوبة)</span>
                <span className="font-mono text-[10px]">SHA: {patch.fileHashBeforePatch.slice(0, 8)}...</span>
              </div>
              <pre className="p-3 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-80 leading-relaxed">
                {patch.originalCode}
              </pre>
            </div>

            {/* Proposed Patched Code */}
            <div className="border border-emerald-500/30 rounded-xl overflow-hidden bg-slate-950">
              <div className="bg-emerald-950/40 px-3 py-2 border-b border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300 font-semibold">
                <span>الشفرة المقترحة (المعالجة بواسطة عبقرينو)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                  ثقة: {Math.round(patch.confidenceScore * 100)}%
                </span>
              </div>
              <pre className="p-3 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-80 leading-relaxed bg-emerald-950/10">
                {patch.patchedCode}
              </pre>
            </div>

          </div>

          {/* Preventive Test Injection Notice */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
            <span className="font-semibold text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              سيتم تثبيت اختبار وقائي دائم لمنع تكرار العطل:
            </span>
            <pre className="p-2 rounded bg-slate-900 font-mono text-[10px] text-slate-400 overflow-x-auto">
              {patch.preventiveTestCode}
            </pre>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>لن يتم تعديل أي ملف إلا بعد صدور موافقتك الصريحة بالضغط أدناه.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onReject}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-xs font-bold transition"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>رفض الرقعة وإلغاء التعديل</span>
            </button>

            <button
              onClick={onApprove}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>موافقة وتطبيق الرقعة والتحقق</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
