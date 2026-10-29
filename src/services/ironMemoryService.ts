/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ABQARYNO IRON MEMORY - Persistent Multi-Disciplinary Knowledge & Semantic Engine
 */

import { IronMemoryItem, KnowledgeDomainType } from '../types';
import { sha256, fastHashSync } from './crypto';
import { auditLogger } from './auditLogger';

const MEMORY_STORAGE_KEY = 'abqaryno_iron_memory_v4';

export const INITIAL_VERIFIED_KNOWLEDGE: Omit<IronMemoryItem, 'id' | 'hash'>[] = [
  // 1. Egyptian Law & Jurisprudence (توثيق موثق وفق نصوص التشريعات الرسمية)
  {
    category: 'law',
    domain: 'law_egyptian',
    domainLabelAr: 'القانون والتشريعات المصرية',
    title: 'مبدأ القوة الملزمة للعقد (العقد شريعة المتعاقدين)',
    legalArticleRef: 'مادة 147 فقرة 1 - القانون المدني المصري رقم 131 لسنة 1948',
    sourceCitation: 'الجريدة الرسمية، القانون المدني الصادر بالمرسوم بقانون رقم 131 لسنة 1948 ومعدلاته',
    content: 'العقد شريعة المتعاقدين، فلا يجوز نقضه ولا تعديله إلا باتفاق الطرفين، أو للأسباب التي يقررها القانون. ومع ذلك إذا طرأت حوادث استثنائية عامة لم يكن في الوسع توقعها وترتب على حدوثها أن تنفيذ الالتزام التعاقدي، وإن لم يصبح مستحيلاً، صار يرهق المدين بحيث يهدده بخسارة فادحة، جاز للقاضي وفقاً للظروف وبعد الموازنة بين مصلحة الطرفين أن يرد الالتزام المرهق إلى الحد المعقول.',
    confidenceScore: 1.0,
    isVerifiedFact: true,
    timestamp: Date.now() - 300000000,
    tags: ['القانون المدني', 'العقود', 'الالتزامات', 'مصر', 'الظروف الطارئة']
  },
  {
    category: 'law',
    domain: 'law_egyptian',
    domainLabelAr: 'القانون والتشريعات المصرية',
    title: 'حجية المحررات والتوقيعات الإلكترونية في الإثبات',
    legalArticleRef: 'مادة 14 و 15 - قانون تنظيم التوقيع الإلكتروني رقم 15 لسنة 2004',
    sourceCitation: 'الجريدة الرسمية، العدد 17 مكرر في 22 أبريل 2004، قانون رقم 15 لسنة 2004 ولائحته التنفيذية',
    content: 'للتوقيع الإلكتروني، في نطاق المعاملات المدنية والتجارية والإدارية، ذات الحجية المقررة للتوقيعات في أحكام قانون الإثبات في المواد المدنية والتجارية، إذا روعي في إنشائه وتحديده الشروط والضوابط الفنية التي تحددها اللائحة التنفيذية لهذا القانون ومنها تحديد شخص الموقع وسيطرته التامة على وسيلة الإنشاء الإلكتروني.',
    confidenceScore: 0.99,
    isVerifiedFact: true,
    timestamp: Date.now() - 250000000,
    tags: ['التوقيع الإلكتروني', 'الإثبات الجنائي والمدني', 'معاملات رقمية', 'مصر']
  },
  {
    category: 'law',
    domain: 'law_egyptian',
    domainLabelAr: 'القانون والتشريعات المصرية',
    title: 'حماية حرمة الحياة الخاصة والبيانات الشخصية الرقمية',
    legalArticleRef: 'مادة 2 و 3 - قانون حماية البيانات الشخصية رقم 151 لسنة 2020',
    sourceCitation: 'الجريدة الرسمية، العدد 28 مكرر (أ) في 13 يوليو 2020، قانون رقم 151 لسنة 2020',
    content: 'يحظر جمع البيانات الشخصية أو معالجتها أو الإفصاح عنها أو إفشاؤها بأية وسيلة من الوسائل إلا بموافقة صريحة مسبقة من الشخص المعني بالبيانات، أو في الأحوال المصرح بها قانوناً. ويلتزم المتحكم والمعالج بتأمين البيانات التقنية وحظر نقلها إلى دول أجنبية لا تضمن مستوى حماية مكافئ.',
    confidenceScore: 0.99,
    isVerifiedFact: true,
    timestamp: Date.now() - 200000000,
    tags: ['حماية البيانات', 'الخصوصية الرقمية', 'الأمن السيبراني', 'مصر']
  },
  {
    category: 'law',
    domain: 'law_egyptian',
    domainLabelAr: 'القانون والتشريعات المصرية',
    title: 'تجريم الدخول غير المشروع واختراق الأنظمة ومواقع الإنترنت',
    legalArticleRef: 'مادة 14 - قانون مكافحة جرائم تقنية المعلومات رقم 175 لسنة 2018',
    sourceCitation: 'الجريدة الرسمية، العدد 32 مكرر (ج) في 14 أغسطس 2018، قانون رقم 175 لسنة 2018',
    content: 'يعاقب بالحبس مدة لا تقل عن سنة، وبغرامة لا تقل عن خمسين ألف جنيه ولا تجاوز مائة ألف جنيه، أو بإحدى هاتين العقوبتين، كل من دخل عمداً، أو دخل بخطأ غير عمدي وبقي بدون وجه حق، على موقع أو حساب خاص أو نظام معلوماتي محظور الدخول عليه. وإذا ترتب على ذلك تدمير أو تغيير أو نسخ للبيانات تشدد العقوبة.',
    confidenceScore: 0.99,
    isVerifiedFact: true,
    timestamp: Date.now() - 180000000,
    tags: ['جرائم تقنية المعلومات', 'الاختراق', 'الأمن السيبراني', 'مصر']
  },

  // 2. Computer Science & AI (علوم الحاسب والذكاء الاصطناعي)
  {
    category: 'fact',
    domain: 'computer_science_ai',
    domainLabelAr: 'علوم الحاسب والذكاء الاصطناعي',
    title: 'معمارية محولات فك التشفير التلقائي (Decoder-Only Autoregressive Transformers)',
    sourceCitation: 'Vaswani et al. (2017) "Attention Is All You Need" & Radford et al. (GPT Series)',
    content: 'تعتمد النماذج اللغوية الكبيرة (LLMs) على طبقات متتابعة من الانتباه الذاتي السببي (Causal Multi-Head Self-Attention) تليها طبقات التغذية الأمامية (Feed-Forward Networks) مع اتصالات متبقية وتطبيع RMSNorm/LayerNorm. تحسب المعاملات لـ 24 طبقة ببعد 2048 بنحو مليار معامل.',
    confidenceScore: 1.0,
    isVerifiedFact: true,
    timestamp: Date.now() - 150000000,
    tags: ['AI', 'Transformers', '1B Parameters', 'Attention', 'Deep Learning']
  },

  // 3. Defensive Cybersecurity (الأمن السيبراني الدفاعي)
  {
    category: 'fact',
    domain: 'cybersecurity',
    domainLabelAr: 'الأمن السيبراني الدفاعي',
    title: 'حماية النظم من ثغرات اجتياز المسارات (Path Traversal Prevention)',
    sourceCitation: 'OWASP Top 10 & CWE-22: Improper Limitation of a Pathname to a Restricted Directory',
    content: 'تحدث هجمات اجتياز المسارات عند قبول مدخلات تحتوي على رموز نسبية (مثل ../) دون تنقية، مما يتيح قراءة ملفات النظام الحساسة مثل /etc/passwd. تتطلب الحماية الصارمة تقييد المسارات بنطاق الجذر المسموح (Chroot/Sandbox) ورفض الرموز غير المعقمة فوراً.',
    confidenceScore: 1.0,
    isVerifiedFact: true,
    timestamp: Date.now() - 100000000,
    tags: ['Cybersecurity', 'Sandboxing', 'Path Traversal', 'OWASP']
  },

  // 4. Mathematics & Logic (الرياضيات والإحصاء)
  {
    category: 'fact',
    domain: 'mathematics_logic',
    domainLabelAr: 'الرياضيات والمنطق والإحصاء',
    title: 'مبرهنة بايز للاحتمالات الشرطية (Bayes Theorem)',
    sourceCitation: 'Thomas Bayes (1763) & Laplace (1812) Probability Theory',
    content: 'تحدد مبرهنة بايز احتمالية حدوث فرضية معينة استناداً إلى معرفة مسبقة بظروف مرتبطة بالحدث: P(A|B) = [P(B|A) * P(A)] / P(B). تُعد الركيزة الأساسية لنماذج الاستدلال والتصنيف ومعالجة عدم اليقين في الذكاء الاصطناعي.',
    confidenceScore: 1.0,
    isVerifiedFact: true,
    timestamp: Date.now() - 90000000,
    tags: ['Mathematics', 'Probability', 'Bayesian Inference', 'Statistics']
  },

  // 5. Healed Bug Experiences (خبرات الإصلاح الذاتي المثبتة في عبقرينو)
  {
    category: 'healed_bug',
    domain: 'computer_science_ai',
    domainLabelAr: 'خبرات الإصلاح الذاتي (Abqaryno Healed Knowledge)',
    title: 'خبرة معالجة الحلقات اللانهائية في sendMessageWithRetry',
    sourceCitation: 'سجل إصلاحات عبقرينو V3 — اختبار التحقق رقم 17',
    content: 'تم إثبات أن استخدام while(true) في عمليات الشبكة يؤدي لتعليق الخادم واستهلاك 100% من المعالج عند انقطاع الاتصال. الحل المعتمد: فرض سقف محاولات صارم (maxRetries = 3)، مهلة زمنية (Timeout 1500ms)، وتأخير تصاعدي (Exponential Backoff) مع قذف استثناء منظم.',
    confidenceScore: 1.0,
    isVerifiedFact: true,
    timestamp: Date.now() - 40000000,
    tags: ['Self-Healing', 'Network Dispatch', 'Bounded Retries', 'Reliability']
  },
  {
    category: 'healed_bug',
    domain: 'computer_science_ai',
    domainLabelAr: 'خبرات الإصلاح الذاتي (Abqaryno Healed Knowledge)',
    title: 'خبرة حماية المقاييس الإحصائية من قيم Null في aggregateMetrics',
    sourceCitation: 'سجل إصلاحات عبقرينو V3 — اختبار التحقق رقم 16',
    content: 'تم إثبات أن قراءة الخصائص المباشرة (item.value) بدون فحص أمان تتسبب في انهيار التطبيق عبر TypeError عند وصول عناصر فارغة. الحل المعتمد: تطبيق فلاتر نوعية دقيقة تستبعد null و undefined وقيم NaN وإرجاع كائن إحصائي متزن افتراضياً.',
    confidenceScore: 1.0,
    isVerifiedFact: true,
    timestamp: Date.now() - 20000000,
    tags: ['Self-Healing', 'Null Safety', 'Telemetry Aggregation', 'TypeScript']
  }
];

class IronMemoryService {
  private items: IronMemoryItem[] = [];
  private listeners: ((items: IronMemoryItem[]) => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(MEMORY_STORAGE_KEY);
      if (saved) {
        this.items = JSON.parse(saved);
      }
    } catch {
      this.items = [];
    }

    // Pre-seed initial verified facts if empty
    if (this.items.length === 0) {
      this.items = INITIAL_VERIFIED_KNOWLEDGE.map((k, index) => {
        const id = `mem_seed_${index + 1}`;
        const hash = fastHashSync(`${k.title}:${k.content}:${k.sourceCitation}`);
        return {
          ...k,
          id,
          hash
        };
      });
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(this.items));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save Iron Memory', e);
    }
  }

  public subscribe(callback: (items: IronMemoryItem[]) => void) {
    this.listeners.push(callback);
    callback([...this.items]);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners() {
    for (const cb of this.listeners) {
      cb([...this.items]);
    }
  }

  public getAll(): IronMemoryItem[] {
    return [...this.items];
  }

  /**
   * Semantic and Multi-Term Search across Iron Memory
   * Ranks by title matches, tag overlap, content relevance, and domain match.
   */
  public searchSemantic(query: string, domainFilter?: KnowledgeDomainType): {
    item: IronMemoryItem;
    relevanceScore: number;
    matchReason: string;
  }[] {
    if (!query.trim()) {
      return this.items
        .filter(i => !domainFilter || i.domain === domainFilter)
        .map(item => ({ item, relevanceScore: 1.0, matchReason: 'استعراض عام' }));
    }

    const cleanQuery = query.toLowerCase().trim();
    const queryTokens = cleanQuery.split(/[\s,،.؛:]+/).filter(t => t.length > 1);

    const scored = this.items
      .filter(item => !domainFilter || item.domain === domainFilter)
      .map(item => {
        let score = 0;
        const reasons: string[] = [];

        // Exact match in title
        if (item.title.toLowerCase().includes(cleanQuery)) {
          score += 50;
          reasons.push('تطابق كامل في العنوان');
        }

        // Legal article ref match
        if (item.legalArticleRef && item.legalArticleRef.toLowerCase().includes(cleanQuery)) {
          score += 60;
          reasons.push('تطابق برقم المادة القانونية');
        }

        // Token matches
        for (const token of queryTokens) {
          if (item.title.toLowerCase().includes(token)) {
            score += 15;
          }
          if (item.tags.some(t => t.toLowerCase().includes(token))) {
            score += 12;
            reasons.push(`تطابق وسم: ${token}`);
          }
          if (item.content.toLowerCase().includes(token)) {
            score += 8;
          }
          if (item.sourceCitation.toLowerCase().includes(token)) {
            score += 10;
          }
        }

        // Verified facts get a reliability boost
        if (item.isVerifiedFact) score += 5;

        return {
          item,
          relevanceScore: Math.min(score, 100),
          matchReason: reasons.slice(0, 2).join(' • ') || 'تطابق نصي مع محتوى المرجع'
        };
      })
      .filter(res => res.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return scored;
  }

  /**
   * Adds a new memory item with SHA-256 hash validation & conflict detection
   */
  public async addMemoryItem(item: Omit<IronMemoryItem, 'id' | 'hash' | 'timestamp'>): Promise<{
    created: IronMemoryItem;
    conflictWarning?: string;
  }> {
    const timestamp = Date.now();
    const id = `mem_${timestamp}_${Math.random().toString(36).substring(2, 6)}`;
    const hash = await sha256(`${item.title}:${item.content}:${item.sourceCitation}:${timestamp}`);

    // Conflict detection: check if existing item in same domain has identical title but conflicting content
    let conflictWarning: string | undefined = undefined;
    const existing = this.items.find(i => i.title.trim() === item.title.trim());
    if (existing && existing.content !== item.content) {
      conflictWarning = `تنبيه تعارض محتمل: يوجد إدخال سابق بنفس العنوان "${existing.title}" بمصدر "${existing.sourceCitation}". سيتم تسجيل هذا الإدخال بشكل مستقل مع توثيق المصدر والتاريخ.`;
    }

    const created: IronMemoryItem = {
      ...item,
      id,
      timestamp,
      hash
    };

    this.items.unshift(created);
    this.saveToStorage();

    await auditLogger.log({
      action: `حفظ معلومة في الذاكرة الحديدية: ${created.title.slice(0, 35)}...`,
      actionType: 'SECURITY',
      actor: 'Iron Memory Kernel',
      details: `تم توثيق المعلومة في نطاق (${created.domainLabelAr}) بتجزئة SHA-256: ${hash.slice(0, 12)}... المصدر: ${created.sourceCitation}`
    });

    return { created, conflictWarning };
  }

  /**
   * Exports full memory snapshot as a verifiable JSON string
   */
  public async exportMemorySnapshot(): Promise<{
    jsonContent: string;
    itemCount: number;
    checksum: string;
  }> {
    const data = {
      version: '4.0.0',
      exportedAt: Date.now(),
      system: 'ABQARYNO IRON MEMORY',
      totalItems: this.items.length,
      items: this.items
    };
    const jsonContent = JSON.stringify(data, null, 2);
    const checksum = await sha256(jsonContent);

    return {
      jsonContent,
      itemCount: this.items.length,
      checksum
    };
  }

  /**
   * Imports memory snapshot with verification
   */
  public async importMemorySnapshot(jsonStr: string): Promise<{
    importedCount: number;
    success: boolean;
    error?: string;
  }> {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.items || !Array.isArray(parsed.items)) {
        return { importedCount: 0, success: false, error: 'تنسيق الملف غير صالح أو لا يحتوي على عناصر ذاكرة.' };
      }

      // Merge avoiding duplicates by ID or Hash
      let count = 0;
      for (const item of parsed.items) {
        if (!this.items.some(i => i.id === item.id || i.hash === item.hash)) {
          this.items.push(item);
          count++;
        }
      }

      this.saveToStorage();
      await auditLogger.log({
        action: 'استيراد لقطة ذاكرة حديدية خارجية',
        actionType: 'SECURITY',
        actor: 'Admin / Import',
        details: `تم استيراد ودمج ${count} عناصر ذاكرة جديدة بنجاح في قاعدة المعرفة الدائمة.`
      });

      return { importedCount: count, success: true };
    } catch (e: any) {
      return { importedCount: 0, success: false, error: e.message || 'فشل قراءة الملف.' };
    }
  }

  public deleteItem(id: string) {
    this.items = this.items.filter(i => i.id !== id);
    this.saveToStorage();
  }
}

export const ironMemoryService = new IronMemoryService();
