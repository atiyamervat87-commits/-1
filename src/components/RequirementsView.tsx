/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Requirements and Testable Acceptance Criteria View
 */

import React from 'react';
import { CheckCircle2, XCircle, Clock, ShieldCheck, ListChecks, CheckSquare } from 'lucide-react';
import { ProjectRequirement } from '../types';

interface RequirementsViewProps {
  requirements: ProjectRequirement[];
}

export const RequirementsView: React.FC<RequirementsViewProps> = ({ requirements }) => {
  return (
    <div className="space-y-6">

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-amber-400" />
            المتطلبات الهندسية ومعايير القبول القابلة للاختبار (BDD / Gherkin)
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            يتم تحليل كل فكرة إلى مواصفات وظيفية وأمنية، وتوثيق معايير قبول وفق صياغة (بافتراض / عندما / حينئذٍ) لتمكين الاختبار الآلي المستقل.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded bg-slate-800 text-amber-300 font-mono font-bold">
            {requirements.length} متطلبات رئيسية
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {requirements.map((req) => (
          <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">

            {/* Requirement Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  {req.category}
                </span>
                <h4 className="font-bold text-sm text-white">{req.title}</h4>
              </div>
              <span className="text-xs font-mono text-slate-500">{req.id}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{req.description}</p>

            {/* Acceptance Criteria List */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                معايير القبول القابلة للاختبار (Acceptance Criteria):
              </span>

              <div className="grid grid-cols-1 gap-2.5">
                {req.acceptanceCriteria.map((ac) => (
                  <div
                    key={ac.id}
                    className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                      ac.status === 'passed'
                        ? 'border-emerald-500/30 bg-emerald-950/15'
                        : ac.status === 'failed'
                        ? 'border-rose-500/30 bg-rose-950/20'
                        : 'border-slate-800 bg-slate-950/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100">{ac.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        ac.status === 'passed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : ac.status === 'failed'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {ac.status === 'passed' && <CheckCircle2 className="w-3 h-3" />}
                        {ac.status === 'failed' && <XCircle className="w-3 h-3" />}
                        <span>{ac.status === 'passed' ? 'متحقق بنجاح' : ac.status === 'failed' ? 'غير متحقق (يحتاج إصلاح)' : 'قيد الانتظار'}</span>
                      </span>
                    </div>

                    <div className="font-mono text-[11px] text-slate-300 space-y-0.5 pt-1 border-t border-slate-800/60 leading-relaxed">
                      <div><span className="text-amber-400 font-bold">بافتراض (Given):</span> {ac.given}</div>
                      <div><span className="text-cyan-400 font-bold">عندما (When):</span> {ac.when}</div>
                      <div><span className="text-emerald-400 font-bold">حينئذٍ (Then):</span> {ac.then}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
