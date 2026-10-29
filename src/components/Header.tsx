/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Header component for ABQARYNO V3
 */

import React from 'react';
import { ShieldCheck, Cpu, Download, Sparkles, ExternalLink, RefreshCw, FolderGit2 } from 'lucide-react';
import { Project } from '../types';

interface HeaderProps {
  currentProject: Project;
  onOpenNewProjectModal: () => void;
  onExportZip: () => void;
  onRefreshHealth: () => void;
  isExporting: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  onOpenNewProjectModal,
  onExportZip,
  onRefreshHealth,
  isExporting,
  activeTab,
  setActiveTab
}) => {
  const devUrl = 'https://ais-dev-ob3d25g6m7hr5kjpzxwt7r-54187893681.europe-west3.run.app';

  return (
    <header className="border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Brand & Identity */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
                <span>ع</span>
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                    عبقرينو <span className="text-amber-400 font-mono text-sm tracking-wider">V3 ULTIMATE</span>
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    إصلاح ذاتي مستقل
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate max-w-xs md:max-w-md">
                  استوديو إنشاء البرمجيات، الاختبارات الآلية، والنشر السحابي
                </p>
              </div>
            </div>

            {/* Mobile Project Badge */}
            <div className="md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <FolderGit2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300 truncate max-w-[120px]">{currentProject.name}</span>
            </div>
          </div>

          {/* Quick Actions & Live Link */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">

            {/* Active Project Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-500">المشروع الحالي:</span>
              <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  currentProject.status === 'healed' || currentProject.status === 'healthy'
                    ? 'bg-emerald-400'
                    : currentProject.status === 'error_detected'
                    ? 'bg-rose-500 animate-pulse'
                    : 'bg-amber-400'
                }`} />
                {currentProject.name}
              </span>
            </div>

            {/* Live Published App Link */}
            <a
              href={devUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 hover:border-emerald-500/60 text-xs font-medium transition shadow-sm"
              title="رابط الإنتاج المنشور والمتاح للهواتف"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>رابط التطبيق المنشور</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* New Project Idea Button */}
            <button
              onClick={onOpenNewProjectModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>إنشاء برنامج جديد</span>
            </button>

            {/* Export Delivery ZIP Button */}
            <button
              onClick={onExportZip}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'جاري التحزيم...' : 'تصدير ZIP'}</span>
            </button>

            {/* Refresh System Health */}
            <button
              onClick={onRefreshHealth}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 text-xs transition"
              title="تحديث حالة النواة"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-800/80 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'mind_chat', label: 'غرفة المحادثة (Mind Chat)', badge: 'V4', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
            { id: 'iron_memory', label: 'الذاكرة الحديدية (Iron Memory)', badge: 'دائمة', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
            { id: 'lm_studio', label: 'استوديو النموذج (1B Model)', badge: '1B', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
            { id: 'self_healing', label: 'محرك الإصلاح الذاتي (10 مراحل)', badge: currentProject.status === 'error_detected' ? 'خلل نشط' : undefined, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
            { id: 'code_files', label: 'هيكل الكود والملفات', count: currentProject.files.length },
            { id: 'test_runner', label: 'الاختبارات الآلية (22 اختبار)', badge: 'إلزامي', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
            { id: 'notifications', label: 'الخدمة البريدية والتنبيهات' },
            { id: 'requirements', label: 'المتطلبات ومعايير القبول' },
            { id: 'checkpoints', label: 'نقاط الاستعادة', count: currentProject.restorePoints.length },
            { id: 'audit_log', label: 'سجل التدقيق المشفر' },
            { id: 'deployment', label: 'النشر وحالة الصحة' },
            { id: 'export_pkg', label: 'حزمة التسليم ZIP' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] border font-bold ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
