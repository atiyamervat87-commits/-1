/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Delivery Package & ZIP Export Service using JSZip
 */

import JSZip from 'jszip';
import { Project, TestCase } from '../types';
import { auditLogger } from './auditLogger';

export class ZipExporterService {
  /**
   * Generates a complete project ZIP archive and triggers client-side download
   */
  public static async exportProjectPackage(
    project: Project,
    testResults?: TestCase[]
  ): Promise<{
    blob: Blob;
    fileName: string;
    fileCount: number;
    downloadUrl: string;
    archiveSizeBytes: number;
  }> {
    const zip = new JSZip();

    // 1. Add all project files
    let fileCount = 0;
    for (const file of project.files) {
      // Exclude secrets or forbidden paths
      if (file.path.includes('.env') || file.path.includes('node_modules')) continue;
      zip.file(file.path, file.content);
      fileCount++;
    }

    // 2. Add Run & Test Instructions
    const runInstructions = `# دليل تشغيل واختبار مشروع: ${project.name}
تاريخ الإصدار: ${new Date(project.updatedAt).toISOString()}
نواة التشغيل: عبقرينو ABQARYNO SELF-HEALING ULTIMATE V3

## 1. التثبيت والتشغيل المحلي
\`\`\`bash
# 1. تثبيت الحزم
npm install

# 2. تشغيل المشروع في وضع التطوير
npm run dev

# 3. تشغيل حزمة الاختبارات الآلية
npm test
\`\`\`

## 2. النشر السحابي (Production Deployment)
\`\`\`bash
# بناء نسخة الإنتاج
npm run build

# تشغيل خادم الإنتاج
npm run preview
# أو عبر منصات Cloud Run / Vercel / Render
\`\`\`

## 3. محرك الإصلاح الذاتي المدمج
هذا المشروع مدعوم بنواة عبقرينو للإصلاح الذاتي، والتي تضمن:
- رصد وتطويق انقطاعات الشبكة والحلقات اللانهائية في sendMessageWithRetry
- حماية العمليات الإحصائية من قيم null و NaN في aggregateMetrics
- سجل تدقيق مشفر SHA-256 لمنع التلاعب وتوثيق كافة العمليات
`;
    zip.file('DOCS/RUN_INSTRUCTIONS.md', runInstructions);
    fileCount++;

    // 3. Add Comprehensive Test Report
    let testReportContent = `# تقرير الاختبارات الآلية الشاملة - ABQARYNO TEST REPORT
المشروع: ${project.name}
الحالة العامة: ${project.status === 'healed' || project.status === 'healthy' ? 'ناجح 100% (Passed)' : 'قيد الفحص والتشخيص'}
التاريخ: ${new Date().toLocaleString('ar-SA')}

## ملخص نتائج الاختبارات الإلزامية الـ 22:
`;

    if (testResults && testResults.length > 0) {
      const passedCount = testResults.filter(t => t.status === 'passed').length;
      const failedCount = testResults.filter(t => t.status === 'failed').length;
      testReportContent += `\n- إجمالي الاختبارات: ${testResults.length}\n- الناجحة: ${passedCount}\n- الفاشلة: ${failedCount}\n- نسبة النجاح: ${Math.round((passedCount / testResults.length) * 100)}%\n\n`;

      testReportContent += `| # | اسم الاختبار | التصنيف | الحالة | الزمن (مللي ثانية) |\n|---|---|---|---|---|\n`;
      for (const t of testResults) {
        testReportContent += `| ${t.num} | ${t.nameAr} | ${t.category} | ${t.status === 'passed' ? '✅ ناجح' : '❌ فاشل'} | ${t.durationMs || 0}ms |\n`;
      }
    } else {
      testReportContent += `\nتم إدراج معايير القبول الـ 22 وهي جاهزة للتشغيل عند الطلب.\n`;
    }

    zip.file('DOCS/TEST_REPORT.md', testReportContent);
    fileCount++;

    // 4. Add Audit Trail Dump
    const auditEntries = auditLogger.getEntries();
    zip.file('DOCS/AUDIT_TRAIL.json', JSON.stringify(auditEntries, null, 2));
    fileCount++;

    // 5. Generate zip binary
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    const fileName = `abqaryno_${project.id}_${Date.now()}.zip`;
    const downloadUrl = URL.createObjectURL(blob);

    await auditLogger.log({
      action: 'تصدير حزمة المشروع ZIP وتجهيز التسليم',
      actionType: 'EXPORT',
      actor: 'Delivery Exporter',
      details: `تم تجميع أرشيف ${fileName} بعدد ${fileCount} ملفات وحجم ${Math.round(blob.size / 1024)} كيلوبايت. تم إنشاء رابط التنزيل المباشر.`
    });

    return {
      blob,
      fileName,
      fileCount,
      downloadUrl,
      archiveSizeBytes: blob.size
    };
  }

  /**
   * Triggers an automatic download in the user's browser
   */
  public static triggerBrowserDownload(downloadUrl: string, fileName: string) {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
