/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Delivery Package & ZIP Export View
 */

import React, { useState } from 'react';
import { Download, Package, CheckCircle2, FileText, FileCode, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { Project, TestCase } from '../types';
import { ZipExporterService } from '../services/zipExporter';

interface ExportViewProps {
  project: Project;
  testResults: TestCase[];
}

export const ExportView: React.FC<ExportViewProps> = ({
  project,
  testResults
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<{
    downloadUrl: string;
    fileName: string;
    fileCount: number;
    archiveSizeBytes: number;
  } | null>(null);

  const handleExportNow = async () => {
    setIsExporting(true);
    try {
      const res = await ZipExporterService.exportProjectPackage(project, testResults);
      setDownloadInfo(res);
      // Auto trigger download
      ZipExporterService.triggerBrowserDownload(res.downloadUrl, res.fileName);
    } catch (e) {
      console.error('Failed to export zip', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Hero Delivery Package Card */}
      <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                حزمة التسليم والتشغيل المتكاملة (Production Delivery Package)
              </span>
            </div>
            <h2 className="text-lg font-black text-white">
              تصدير حزمة ZIP رسمية وقابلة للتشغيل المباشر
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              تشتمل الحزمة على جميع ملفات المصدر، ملفات الإعداد والاعتماديات، وثائق التشغيل والاختبار، تقرير نتائج الاختبارات الآلية الـ 22، وسجل التدقيق المشفر الموثق.
            </p>
          </div>

          <button
            onClick={handleExportNow}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition active:scale-95 disabled:opacity-50 shrink-0"
          >
            <Download className={`w-5 h-5 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'جاري إنشاء الأرشيف...' : 'تنزيل أرشيف ZIP الآن'}</span>
          </button>
        </div>

        {/* Download Success Info */}
        {downloadInfo && (
          <div className="mt-4 p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block text-sm">تم إنشاء حزمة ZIP بنجاح وجاهزة للتنزيل!</span>
                <span className="text-[11px] text-emerald-400/80 font-mono">
                  الملف: {downloadInfo.fileName} ({Math.round(downloadInfo.archiveSizeBytes / 1024)} KB) — عدد الملفات: {downloadInfo.fileCount}
                </span>
              </div>
            </div>

            <a
              href={downloadInfo.downloadUrl}
              download={downloadInfo.fileName}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <span>إعادة التحميل</span>
              <Download className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Package Contents Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <FileCode className="w-4 h-4 text-amber-400" />
            ملفات الشفرة البرمجية المضمنة في الأرشيف
          </h4>
          <div className="space-y-1.5 text-xs font-mono">
            {project.files.map(f => (
              <div key={f.path} className="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-slate-800/80">
                <span className="text-slate-300">{f.path}</span>
                <span className="text-slate-500 text-[10px]">{Math.round(f.size / 1024 * 10) / 10} KB</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            الوثائق والتقارير المرفقة في الأرشيف
          </h4>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200 block font-mono">DOCS/RUN_INSTRUCTIONS.md</span>
              <p className="text-[11px] text-slate-400">تعليمات التثبيت، التشغيل المحلي، وبناء نسخة الإنتاج السحابية.</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200 block font-mono">DOCS/TEST_REPORT.md</span>
              <p className="text-[11px] text-slate-400">التقرير الشامل لكافة نتائج الاختبارات الإلزامية الـ 22 وأزمنة التنفيذ.</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200 block font-mono">DOCS/AUDIT_TRAIL.json</span>
              <p className="text-[11px] text-slate-400">سجل الأحداث الكامل المشفر بتجزئة SHA-256 المتسلسلة لضمان الشفافية.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
