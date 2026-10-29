/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tamper-Evident Audit Trail Ledger View
 */

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Search, Link2, Key, RotateCcw, Bug } from 'lucide-react';
import { AuditLogEntry } from '../types';

interface AuditLogViewProps {
  entries: AuditLogEntry[];
  onVerifyIntegrity: () => Promise<void>;
  onSimulateTamper: () => void;
  onClearLogs?: () => void;
  verificationResult: { isValid: boolean; totalEntries: number; errorReason?: string } | null;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  entries,
  onVerifyIntegrity,
  onSimulateTamper,
  onClearLogs,
  verificationResult
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.action.includes(searchTerm) ||
      e.details.includes(searchTerm) ||
      e.actor.includes(searchTerm) ||
      e.entryHash.includes(searchTerm);
    const matchesType = filterType === 'ALL' || e.actionType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-5">

      {/* Top Banner & Verification Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Link2 className="w-5 h-5 text-amber-400" />
              سجل التدقيق المشفر الموثق (SHA-256 Hash Chain)
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              {entries.length} سجلات موثقة
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            كل قيد يحتوي على تجزئة فريدة مرتبطة بالقيد السابق. أي تعديل غير مصرح به يؤدي إلى انكسار السلسلة فوراً واكتشاف التلاعب.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onSimulateTamper}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
            title="اختبار قدرة النظام على رصد التعديل الخبيث في السجل"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>محاكاة تلاعب بالسجل</span>
          </button>

          <button
            onClick={onVerifyIntegrity}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>فحص سلامة سلسلة التجزئة</span>
          </button>
        </div>
      </div>

      {/* Verification Result Alert */}
      {verificationResult && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
          verificationResult.isValid
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/40 border-rose-500/50 text-rose-300 animate-pulse'
        }`}>
          <div className="flex items-center gap-2.5">
            {verificationResult.isValid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="font-bold block">
                {verificationResult.isValid ? 'السجل سليم ومطابق للتجزئة 100%' : 'تنبيه أمني: تم رصد انكسار في سلسلة التجزئة!'}
              </span>
              <span className="text-[11px] opacity-90">
                {verificationResult.isValid
                  ? `تم فحص كافة القيود الـ ${verificationResult.totalEntries} والتأكد من عدم تعرض أي منها لأي تعديل.`
                  : verificationResult.errorReason}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute top-2.5 right-2.5" />
          <input
            type="text"
            placeholder="بحث في السجلات أو التجزئة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md pr-8 pl-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-xs"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'SCAN', 'REPRODUCE', 'PATCH_PROPOSED', 'PATCH_APPLIED', 'CHECKPOINT', 'ROLLBACK', 'SECURITY'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2 py-1 rounded text-[10px] font-mono transition whitespace-nowrap ${
                filterType === t
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">الوقت</th>
                <th className="p-3">الفاعل (Actor)</th>
                <th className="p-3">النوع</th>
                <th className="p-3">الإجراء والتفاصيل</th>
                <th className="p-3">تجزئة السجل (Entry Hash)</th>
                <th className="p-3">السابق (Prev Hash)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredEntries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono text-center text-slate-500 font-bold">
                    #{e.index}
                  </td>
                  <td className="p-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                    {new Date(e.timestamp).toLocaleTimeString('ar-SA')}
                  </td>
                  <td className="p-3 font-semibold text-slate-200 whitespace-nowrap">
                    {e.actor}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                      {e.actionType}
                    </span>
                  </td>
                  <td className="p-3 max-w-md">
                    <div className="font-bold text-slate-100">{e.action}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{e.details}</div>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-emerald-400 whitespace-nowrap">
                    {e.entryHash.slice(0, 12)}...
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {e.previousHash.slice(0, 8)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
