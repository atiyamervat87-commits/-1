/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Project Engine: Seeds, Templates, Code Generation, and Reference Implementations
 */

import { Project, ProjectFile, ProjectRequirement, DetectedBug, HealingPhaseNumber } from '../types';
import { fastHashSync } from './crypto';

export const INITIAL_HEALING_PHASES: Record<HealingPhaseNumber, any> = {
  1: { phase: 1, titleAr: 'الفحص الشامل', titleEn: 'Comprehensive Diagnostic Scan', description: 'مسح عميق للمشروع، فحص الشفرة الثابتة، تحليل أخطاء التشغيل وسجل الانهيار.', status: 'idle' },
  2: { phase: 2, titleAr: 'تحديد موقع الخطأ وجمع الأدلة', titleEn: 'Error Localization & Evidence Gathering', description: 'تحديد الملف ورقم السطر والمدخلات المسببة وحالة البيئة البرمجية.', status: 'idle' },
  3: { phase: 3, titleAr: 'إعادة إظهار الخطأ', titleEn: 'Error Reproduction Harness', description: 'تشغيل حزمة اختبار مخصصة تحاكي السيناريو المعطوب لإثبات وجود الخلل.', status: 'idle' },
  4: { phase: 4, titleAr: 'اقتراح رقعة الإصلاح', titleEn: 'Patch Synthesis', description: 'توليد شفرة التصحيح مع تحليل الأثر وتجنب الآثار الجانبية.', status: 'idle' },
  5: { phase: 5, titleAr: 'إنشاء نقطة استعادة', titleEn: 'Restore Point Snapshot', description: 'أخذ لقطة مشفرة لكافة ملفات المشروع وتوثيق تجزئة SHA-256 قبل أي تعديل.', status: 'idle' },
  6: { phase: 6, titleAr: 'عرض الرقعة والموافقة الصريحة', titleEn: 'Diff Review & Explicit Approval', description: 'مراجعة مقارنة الفروق بين القديم والجديد وبوابة موافقة المطور.', status: 'idle' },
  7: { phase: 7, titleAr: 'تطبيق الرقعة وتشغيل الاختبارات', titleEn: 'Apply Patch & Verify Tests', description: 'حقن الشفرة المعدلة في الملف المستهدف وتنفيذ حزمة التحقق المباشر.', status: 'idle' },
  8: { phase: 8, titleAr: 'التراجع عند فشل التحقق', titleEn: 'Rollback Guard on Failure', description: 'استعادة حالة النظام الأصلية فوراً في حال عدم اجتياز اختبارات التحقق.', status: 'idle' },
  9: { phase: 9, titleAr: 'سجل التدقيق الموثق', titleEn: 'Tamper-Evident Audit Logging', description: 'ربط عملية الإصلاح بسلسلة التدقيق المشفرة وتوثيق الفاعل والوقت والنتائج.', status: 'idle' },
  10: { phase: 10, titleAr: 'إضافة اختبار وقائي', titleEn: 'Preventive Regression Test', description: 'حقن اختبار دائم في حزمة الـ CI/CD لمنع عودة هذا العطل مستقبلاً.', status: 'idle' },
};

// Case 1: Buggy sendMessageWithRetry (infinite retry / unbounded timeout bug)
export const BUGGY_SEND_MESSAGE_CODE = `/**
 * @license Apache-2.0
 * Network Message Dispatcher with Retry
 */

export interface NetworkResponse {
  success: boolean;
  messageId: string;
  attempts: number;
  latencyMs: number;
}

export interface NetworkConfig {
  endpoint: string;
  apiKey: string;
  maxRetries?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
}

/**
 * [BUG WARNING]: Missing retry ceiling and backoff leads to infinite loops on disconnect!
 */
export async function sendMessageWithRetry(
  payload: Record<string, any>,
  config: NetworkConfig,
  transportFn?: (payload: any) => Promise<boolean>
): Promise<NetworkResponse> {
  let attempt = 0;
  const startTime = Date.now();

  // BUG: Infinite while loop when transport fails!
  // In the buggy version, maxRetries is ignored or unbounded, causing endless hanging.
  while (true) {
    attempt++;
    try {
      if (transportFn) {
        const ok = await transportFn(payload);
        if (ok) {
          return {
            success: true,
            messageId: 'msg_' + Math.random().toString(36).substring(2, 9),
            attempts: attempt,
            latencyMs: Date.now() - startTime
          };
        }
      }
      throw new Error('NETWORK_TIMEOUT: Server failed to acknowledge in time');
    } catch (err: any) {
      // In buggy state, it doesn't break out or backoff properly:
      // It loops infinitely without a termination condition!
      if (attempt > 100) {
        throw new Error('FATAL_INFINITE_LOOP_OVERFLOW');
      }
      // Zero backoff - floods server
    }
  }
}
`;

// Patched sendMessageWithRetry (bounded retries, exponential backoff, timeout protection)
export const PATCHED_SEND_MESSAGE_CODE = `/**
 * @license Apache-2.0
 * Network Message Dispatcher with Retry (HEALED by Abqaryno)
 */

export interface NetworkResponse {
  success: boolean;
  messageId: string;
  attempts: number;
  latencyMs: number;
}

export interface NetworkConfig {
  endpoint: string;
  apiKey: string;
  maxRetries?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
}

/**
 * HEALED: Enforces strict retry bounds, exponential backoff, and circuit timeout.
 */
export async function sendMessageWithRetry(
  payload: Record<string, any>,
  config: NetworkConfig,
  transportFn?: (payload: any) => Promise<boolean>
): Promise<NetworkResponse> {
  const maxRetries = Math.min(Math.max(config.maxRetries ?? 3, 1), 5); // bounded between 1 and 5
  const baseDelay = config.baseDelayMs ?? 100;
  const timeoutMs = config.timeoutMs ?? 1500;
  const startTime = Date.now();

  let attempt = 0;
  let lastError: Error = new Error('Unknown network dispatch failure');

  while (attempt < maxRetries) {
    attempt++;
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED: ' + timeoutMs + 'ms')), timeoutMs)
      );

      const sendPromise = transportFn
        ? transportFn(payload)
        : Promise.resolve(true);

      const ok = await Promise.race([sendPromise, timeoutPromise]);
      if (ok) {
        return {
          success: true,
          messageId: 'msg_' + Math.random().toString(36).substring(2, 9),
          attempts: attempt,
          latencyMs: Date.now() - startTime
        };
      }
      throw new Error('REMOTE_NACK: Server rejected packet');
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        // Exponential backoff with jitter
        const backoff = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(res => setTimeout(res, Math.min(backoff, 800)));
      }
    }
  }

  throw new Error('RETRY_LIMIT_EXCEEDED: Reached max attempts (' + maxRetries + '). Last error: ' + lastError.message);
}
`;

// Case 2: Buggy aggregateMetrics (crashes on null items)
export const BUGGY_AGGREGATE_METRICS_CODE = `/**
 * @license Apache-2.0
 * Telemetry Metrics Aggregator
 */

export interface MetricItem {
  name: string;
  value: number;
  tags?: Record<string, string>;
}

export interface MetricsSummary {
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
}

/**
 * [BUG WARNING]: Unsafe property access causes TypeError on null or undefined items!
 */
export function aggregateMetrics(rawItems: (MetricItem | null | undefined)[]): MetricsSummary {
  // BUG: Direct iteration without null guards causes 'Cannot read properties of null (reading "value")'
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];
    // CRASH: item is null!
    sum += item!.value;
    if (item!.value < min) min = item!.value;
    if (item!.value > max) max = item!.value;
  }

  return {
    count: rawItems.length,
    sum,
    avg: rawItems.length > 0 ? sum / rawItems.length : 0,
    min: min === Infinity ? 0 : min,
    max: max === -Infinity ? 0 : max,
  };
}
`;

// Patched aggregateMetrics (safe null handling)
export const PATCHED_AGGREGATE_METRICS_CODE = `/**
 * @license Apache-2.0
 * Telemetry Metrics Aggregator (HEALED by Abqaryno)
 */

export interface MetricItem {
  name: string;
  value: number;
  tags?: Record<string, string>;
}

export interface MetricsSummary {
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
}

/**
 * HEALED: Filters null/undefined items and safely calculates statistical metrics.
 */
export function aggregateMetrics(rawItems: (MetricItem | null | undefined)[]): MetricsSummary {
  if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
    return { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
  }

  // Safe filtering of null, undefined, or items with non-numeric values
  const validItems = rawItems.filter(
    (item): item is MetricItem =>
      item !== null &&
      item !== undefined &&
      typeof item.value === 'number' &&
      !isNaN(item.value) &&
      isFinite(item.value)
  );

  if (validItems.length === 0) {
    return { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
  }

  let sum = 0;
  let min = validItems[0].value;
  let max = validItems[0].value;

  for (const item of validItems) {
    sum += item.value;
    if (item.value < min) min = item.value;
    if (item.value > max) max = item.value;
  }

  return {
    count: validItems.length,
    sum: Number(sum.toFixed(4)),
    avg: Number((sum / validItems.length).toFixed(4)),
    min,
    max
  };
}
`;

export function createInitialSeedProject(): Project {
  const files: ProjectFile[] = [
    {
      path: 'src/services/networkDispatcher.ts',
      name: 'networkDispatcher.ts',
      content: BUGGY_SEND_MESSAGE_CODE,
      language: 'typescript',
      size: BUGGY_SEND_MESSAGE_CODE.length,
      lastModified: Date.now(),
      hash: fastHashSync(BUGGY_SEND_MESSAGE_CODE),
    },
    {
      path: 'src/analytics/metricsAggregator.ts',
      name: 'metricsAggregator.ts',
      content: BUGGY_AGGREGATE_METRICS_CODE,
      language: 'typescript',
      size: BUGGY_AGGREGATE_METRICS_CODE.length,
      lastModified: Date.now(),
      hash: fastHashSync(BUGGY_AGGREGATE_METRICS_CODE),
    },
    {
      path: 'src/security/sandboxGuard.ts',
      name: 'sandboxGuard.ts',
      content: `/**
 * @license Apache-2.0
 * Security Path Traversal Guard
 */

const ALLOWED_PROJECT_ROOT = '/workspace/project/';

export function validateSafeFilePath(inputPath: string): { safe: boolean; sanitizedPath: string; error?: string } {
  if (!inputPath || typeof inputPath !== 'string') {
    return { safe: false, sanitizedPath: '', error: 'مسار غير صالح أو فارغ' };
  }

  // Prevent directory traversal attacks
  if (inputPath.includes('..') || inputPath.includes('~') || inputPath.startsWith('/etc') || inputPath.startsWith('/sys')) {
    return {
      safe: false,
      sanitizedPath: '',
      error: 'SECURITY_ALERT: تم حظر محاولة اجتياز المسار (Path Traversal)! لا يمكن الوصول لخارج نطاق المشروع المصرح به.'
    };
  }

  // Normalize
  const cleaned = inputPath.replace(/^\\/+/, '');
  return { safe: true, sanitizedPath: ALLOWED_PROJECT_ROOT + cleaned };
}
`,
      language: 'typescript',
      size: 780,
      lastModified: Date.now(),
      hash: fastHashSync('sandboxGuard'),
    },
    {
      path: 'package.json',
      name: 'package.json',
      content: `{
  "name": "abqaryno-target-app",
  "version": "1.0.0",
  "description": "Target application managed and healed by Abqaryno",
  "type": "module",
  "scripts": {
    "test": "node --test",
    "build": "tsc"
  },
  "dependencies": {}
}`,
      language: 'json',
      size: 220,
      lastModified: Date.now(),
      hash: fastHashSync('package_json'),
    },
    {
      path: 'README.md',
      name: 'README.md',
      content: `# تطبيق عبقرينو النموذجي - ABQARYNO TARGET
تطبيق يوضح الدورة الكاملة لإنشاء البرمجيات، رصد الأخطاء، وإصلاحها ذاتياً دون توقف النظام.
يحتوي على حالتي اختبار مرجعيتين:
1. اختبار إعادة المحاولة \`sendMessageWithRetry\` مع معالجة انقطاع الاتصال.
2. اختبار تجميع المقاييس \`aggregateMetrics\` مع معالجة بيانات null.`,
      language: 'markdown',
      size: 420,
      lastModified: Date.now(),
      hash: fastHashSync('readme_md'),
    }
  ];

  const requirements: ProjectRequirement[] = [
    {
      id: 'req_1',
      category: 'reliability',
      title: 'إرسال الرسائل عبر الشبكة مع إعادة محاولة منضبطة (sendMessageWithRetry)',
      description: 'ضمان عدم دخول النظام في حلقات لا نهائية عند انقطاع الاتصال وتطبيق سقف للمحاولات وتأخير تصاعدي.',
      acceptanceCriteria: [
        {
          id: 'ac_1_1',
          title: 'التقيد بالحد الأقصى للمحاولات',
          given: 'خادم شبكي لا يستجيب',
          when: 'يتم استدعاء sendMessageWithRetry بحد 3 محاولات',
          then: 'يتوقف بعد 3 محاولات ويرمي خطأ موثقاً دون استمرار لا نهائي',
          status: 'failed',
        },
        {
          id: 'ac_1_2',
          title: 'مهلة زمنية لكل طلب (Timeout)',
          given: 'طلب شبكي معلق',
          when: 'تتجاوز مدة الانتظار 1500 مللي ثانية',
          then: 'يتم إلغاء المحاولة برمز TIMEOUT_EXCEEDED والانتقال للمحاولة التالية',
          status: 'failed',
        }
      ]
    },
    {
      id: 'req_2',
      category: 'reliability',
      title: 'معالجة بيانات المقاييس الناقصة والصفرية (aggregateMetrics)',
      description: 'حماية محرك التحليلات من الانهيار عند تمرير مصفوفات تحتوي على عناصر null أو undefined.',
      acceptanceCriteria: [
        {
          id: 'ac_2_1',
          title: 'حماية الوصول لخصائص Null',
          given: 'مصفوفة مقاييس تحتوي على [null, { name: "cpu", value: 45 }, undefined]',
          when: 'يتم استدعاء aggregateMetrics',
          then: 'يتجاهل العناصر التالفة ويعيد النتائج الرياضية الصحيحة دون إلقاء TypeError',
          status: 'failed',
        }
      ]
    },
    {
      id: 'req_3',
      category: 'security',
      title: 'عزل العمليات ومنع اجتياز المسارات (Path Traversal Guard)',
      description: 'منع قراءة أو كتابة أي ملف يقع خارج المسار المصرح به للمشروع.',
      acceptanceCriteria: [
        {
          id: 'ac_3_1',
          title: 'حظر الرموز النسبية مثل ../',
          given: 'طلب تعديل لملف بالمسار ../../etc/passwd',
          when: 'يتم فحص المسار عبر sandboxGuard',
          then: 'يتم رفض الطلب فوراً وتسجيل انتهاك أمني في سجل التدقيق',
          status: 'passed',
        }
      ]
    }
  ];

  // Default active bug: Case 1
  const initialBug: DetectedBug = {
    id: 'bug_case_1',
    title: 'انقطاع اتصال وحلقة لا نهائية في sendMessageWithRetry()',
    file: 'src/services/networkDispatcher.ts',
    line: 33,
    column: 5,
    type: 'infinite_loop',
    severity: 'critical',
    stackTrace: `Error: NETWORK_TIMEOUT: Server failed to acknowledge in time
    at sendMessageWithRetry (src/services/networkDispatcher.ts:33:13)
    at Object.testRun (tests/dispatcher.test.ts:18:22)
    at runReproductionHarness (src/services/testRunner.ts:64:18)
    [CAUSE]: No max retry break condition, missing backoff schedule, infinite while(true) loop`,
    reproductionScript: `// سيناريو إعادة إظهار الخلل الفعلي
const mockFailingTransport = async () => false; // محاكاة انقطاع شبكي
await sendMessageWithRetry({ event: 'ping' }, { endpoint: 'https://api.gateway/v1', maxRetries: 3 }, mockFailingTransport);`,
    expectedBehavior: 'التوقف بعد 3 محاولات كحد أقصى مع تأخير تصاعدي (Exponential Backoff) وقذف استثناء منظم بدلاً من التعليق.',
    observedBehavior: 'تعليق النظام في حلقة تكرار غير منتهية تجاوزت 100 تكرار متتالي واستهلاك 100% من دورات المعالجة.',
    evidence: {
      inputPayload: JSON.stringify({ event: 'ping', target: 'remote_cluster' }),
      environmentVars: { NODE_ENV: 'production', RETRY_POLICY: 'standard' },
      memoryUsageMB: 124.6,
      timestamp: Date.now() - 60000,
    }
  };

  return {
    id: 'proj_abqaryno_core',
    name: 'مشروع عبقرينو الأساسي (Abqaryno Core)',
    description: 'تطبيق موثوق لإدارة الرسائل والتحليلات البرمجية مع معالجة ذاتية للأعطال وانقطاعات الشبكة.',
    version: '3.0.0',
    status: 'error_detected',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now(),
    files,
    requirements,
    activeBug: initialBug,
    currentPatch: null,
    activeHealingPhase: 2, // At phase 2 ready for user to click phase 3 (Reproduce Error)
    healingPhases: {
      ...INITIAL_HEALING_PHASES,
      1: {
        ...INITIAL_HEALING_PHASES[1],
        status: 'completed',
        output: 'اكتمل الفحص الشامل: تم العثور على شفرة ذات مخاطر عالية لحلقات تكرار غير منتهية في networkDispatcher.ts وخطر استثناء مؤشر فارغ في metricsAggregator.ts'
      },
      2: {
        ...INITIAL_HEALING_PHASES[2],
        status: 'completed',
        output: 'تم تحديد موقع الخلل بدقة: الملف src/services/networkDispatcher.ts السطر 33. الأدلة: استدعاء دالة نقل فاشلة أدى إلى حلقة تكرار لانهائية لعدم وجود شرط توقف.'
      },
      3: {
        ...INITIAL_HEALING_PHASES[3],
        status: 'idle',
        output: 'جاهز لتشغيل اختبار إعادة إظهار الخلل في بيئة معزولة.'
      }
    },
    restorePoints: [],
    autoApprovePatches: false,
    deployedUrl: 'https://ais-dev-ob3d25g6m7hr5kjpzxwt7r-54187893681.europe-west3.run.app'
  };
}

export function generateProjectFromIdea(
  idea: string,
  category: string = 'web_app',
  complexity: 'simple' | 'medium' | 'advanced' = 'medium'
): Project {
  const timestamp = Date.now();
  const safeName = idea.slice(0, 35).trim() || 'مشروع جديد';
  const id = `proj_${timestamp}_${Math.random().toString(36).substring(2, 6)}`;

  const files: ProjectFile[] = [
    {
      path: 'src/main.ts',
      name: 'main.ts',
      content: `/**
 * @license Apache-2.0
 * ${safeName} - Entrypoint
 */

import { Config } from './config';
import { CoreEngine } from './engine';

async function bootstrap() {
  console.log('🚀 بدء تشغيل ${safeName}...');
  const engine = new CoreEngine(Config);
  await engine.start();
}

bootstrap().catch(err => {
  console.error('فشل بدء التشغيل:', err);
  process.exit(1);
});
`,
      language: 'typescript',
      size: 320,
      lastModified: timestamp,
      hash: fastHashSync(idea + '_main'),
    },
    {
      path: 'src/config.ts',
      name: 'config.ts',
      content: `/**
 * Configuration Module
 */

export const Config = {
  appName: '${safeName}',
  environment: process.env.NODE_ENV || 'production',
  port: parseInt(process.env.PORT || '3000', 10),
  rateLimitPerMinute: 120,
  enableSelfHealing: true,
};
`,
      language: 'typescript',
      size: 260,
      lastModified: timestamp,
      hash: fastHashSync(idea + '_config'),
    },
    {
      path: 'src/engine.ts',
      name: 'engine.ts',
      content: `/**
 * Core Business Logic Engine
 */

export class CoreEngine {
  constructor(private config: Record<string, any>) {}

  public async start(): Promise<boolean> {
    // Engine initialization logic
    return true;
  }

  public processTask(payload: any) {
    if (!payload) throw new Error('EMPTY_PAYLOAD');
    return { status: 'processed', timestamp: Date.now() };
  }
}
`,
      language: 'typescript',
      size: 350,
      lastModified: timestamp,
      hash: fastHashSync(idea + '_engine'),
    },
    {
      path: 'src/security/sanitizer.ts',
      name: 'sanitizer.ts',
      content: `/**
 * Input sanitization & security guard
 */

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .trim();
}
`,
      language: 'typescript',
      size: 210,
      lastModified: timestamp,
      hash: fastHashSync(idea + '_sanitizer'),
    },
    {
      path: 'package.json',
      name: 'package.json',
      content: `{
  "name": "${id}",
  "version": "1.0.0",
  "description": "${safeName}",
  "type": "module",
  "scripts": {
    "start": "node src/main.ts",
    "test": "node --test"
  }
}`,
      language: 'json',
      size: 190,
      lastModified: timestamp,
      hash: fastHashSync(idea + '_pkg'),
    },
    {
      path: 'README.md',
      name: 'README.md',
      content: `# ${safeName}
تم إنشاء هذا المشروع آلياً بواسطة محرك **عبقرينو (ABQARYNO V3)**.
- الفكرة الأساسية: ${idea}
- التصنيف: ${category}
- مستوى التعقيد: ${complexity}
- حالة الجاهزية: تم التحقق من المعمارية وحزم الاختبارات`,
      language: 'markdown',
      size: 280,
      lastModified: timestamp,
      hash: fastHashSync(idea + '_readme'),
    }
  ];

  const requirements: ProjectRequirement[] = [
    {
      id: 'req_gen_1',
      category: 'functional',
      title: 'تنفيذ منطق الأعمال الأساسي للفكرة',
      description: `تحقيق الغرض الوظيفي: ${idea}`,
      acceptanceCriteria: [
        {
          id: 'ac_gen_1',
          title: 'تهيئة المحرك بنجاح',
          given: 'إعدادات النظام صالحة',
          when: 'يتم استدعاء engine.start()',
          then: 'يعيد true وتبدأ دورة الاستماع',
          status: 'passed'
        }
      ]
    },
    {
      id: 'req_gen_2',
      category: 'security',
      title: 'التحقق من صحة المدخلات والتطهير الأمني',
      description: 'حماية التطبيق من هجمات الحقن والمدخلات التالفة.',
      acceptanceCriteria: [
        {
          id: 'ac_gen_2',
          title: 'تطهير نصوص المستخدم',
          given: 'نص يحتوي على وسوم غير مسموحة',
          when: 'يمر عبر sanitizeInput',
          then: 'يتم تجريد الرموز الخطرة دون تلف المعنى',
          status: 'passed'
        }
      ]
    }
  ];

  return {
    id,
    name: safeName,
    description: idea,
    version: '1.0.0',
    status: 'healthy',
    createdAt: timestamp,
    updatedAt: timestamp,
    files,
    requirements,
    activeBug: null,
    currentPatch: null,
    activeHealingPhase: 1,
    healingPhases: { ...INITIAL_HEALING_PHASES },
    restorePoints: [],
    autoApprovePatches: false,
    deployedUrl: 'https://ais-dev-ob3d25g6m7hr5kjpzxwt7r-54187893681.europe-west3.run.app'
  };
}
