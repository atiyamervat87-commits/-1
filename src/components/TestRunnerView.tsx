/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Automated Test Runner View (22 Mandatory Suites)
 */

import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Clock, Terminal, Filter, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { TestCase } from '../types';

interface TestRunnerViewProps {
  testCases: TestCase[];
  onRunTest: (testId: string) => Promise<void>;
  onRunAllTests: () => Promise<void>;
  isRunningAll: boolean;
  runningTestId: string | null;
}

export const TestRunnerView: React.FC<TestRunnerViewProps> = ({
  testCases,
  onRunTest,
  onRunAllTests,
  isRunningAll,
  runningTestId
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  const passedCount = testCases.filter(t => t.status === 'passed').length;
  const failedCount = testCases.filter(t => t.status === 'failed').length;
  const totalCount = testCases.length;
  const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  const filteredTests = selectedCategory === 'all'
    ? testCases
    : testCases.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-6">

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">إجمالي الاختبارات الإلزامية</span>
          <div className="text-2xl font-black text-white mt-1 font-mono">{totalCount}</div>
          <span className="text-[11px] text-amber-400">معايير قبول متكاملة</span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4">
          <span className="text-xs text-emerald-400">الاختبارات الناجحة</span>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{passedCount}</div>
          <span className="text-[11px] text-slate-400">{passRate}% نسبة النجاح</span>
        </div>

        <div className="bg-slate-900 border border-rose-500/30 rounded-xl p-4">
          <span className="text-xs text-rose-400">الاختبارات الفاشلة</span>
          <div className="text-2xl font-black text-rose-400 mt-1 font-mono">{failedCount}</div>
          <span className="text-[11px] text-slate-400">{failedCount > 0 ? 'تتطلب تدخلاً ذاتياً' : 'خالية من الإخفاقات'}</span>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-amber-300">إجراء الاختبار الشامل</span>
          <button
            onClick={onRunAllTests}
            disabled={isRunningAll}
            className="mt-2 w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            {isRunningAll ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>جاري التنفيذ...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>تشغيل الـ 22 اختباراً</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Tabs & Test List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">حزمة الاختبارات الآلية المعتمدة</h3>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-1 text-xs">
            {[
              { id: 'all', label: 'الكل (22)' },
              { id: 'core', label: 'النواة والواجهة' },
              { id: 'self_healing', label: 'الإصلاح الذاتي' },
              { id: 'reliability', label: 'المتانة (Case 1 & 2)' },
              { id: 'security', label: 'الأمان وعزل المسارات' },
              { id: 'export', label: 'التصدير' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md transition ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-950/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tests Table / List */}
        <div className="space-y-2">
          {filteredTests.map((test) => {
            const isRunning = runningTestId === test.id || (isRunningAll && test.status === 'running');
            const isExpanded = expandedTestId === test.id;

            return (
              <div
                key={test.id}
                className={`rounded-lg border transition ${
                  test.status === 'passed'
                    ? 'border-emerald-500/20 bg-emerald-950/10'
                    : test.status === 'failed'
                    ? 'border-rose-500/30 bg-rose-950/20'
                    : 'border-slate-800 bg-slate-950/40'
                }`}
              >
                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                  {/* Test Info */}
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold shrink-0 mt-0.5">
                      #{test.num}
                    </span>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{test.nameAr}</span>
                        <span className="text-[11px] font-mono text-slate-400">({test.nameEn})</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{test.description}</p>
                    </div>
                  </div>

                  {/* Status, Duration & Run Button */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {test.durationMs !== undefined && (
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {test.durationMs}ms
                      </span>
                    )}

                    {/* Status Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                      test.status === 'passed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : test.status === 'failed'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : isRunning
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {test.status === 'passed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {test.status === 'failed' && <XCircle className="w-3.5 h-3.5" />}
                      {isRunning && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
                      <span>
                        {isRunning
                          ? 'جاري الفحص...'
                          : test.status === 'passed'
                          ? 'ناجح'
                          : test.status === 'failed'
                          ? 'فاشل'
                          : 'جاهز'}
                      </span>
                    </span>

                    {/* Run Single Button */}
                    <button
                      onClick={() => onRunTest(test.id)}
                      disabled={isRunningAll || isRunning}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition disabled:opacity-40"
                      title="تشغيل هذا الاختبار منفرداً"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>

                    {/* Expand Output Toggle */}
                    {test.output && (
                      <button
                        onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="عرض مخرجات الاختبار"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Console Output */}
                {isExpanded && test.output && (
                  <div className="border-t border-slate-800/80 p-3 bg-slate-950 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed flex items-start gap-2">
                    <Terminal className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="overflow-x-auto w-full">{test.output}</div>
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
