/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Iron Memory View - Multi-Disciplinary Knowledge & Semantic Engine
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Cpu,
  ShieldCheck,
  Calculator,
  Bug,
  Trash2,
  Hash,
  Clock,
  BookOpen
} from 'lucide-react';
import { IronMemoryItem, KnowledgeDomainType } from '../types';
import { ironMemoryService } from '../services/ironMemoryService';

export const IronMemoryView: React.FC = () => {
  const [items, setItems] = useState<IronMemoryItem[]>(() => ironMemoryService.getAll());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [conflictAlert, setConflictAlert] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // New item form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDomain, setNewDomain] = useState<KnowledgeDomainType>('law_egyptian');
  const [newCitation, setNewCitation] = useState('');
  const [newArticleRef, setNewArticleRef] = useState('');
  const [newCategory, setNewCategory] = useState<IronMemoryItem['category']>('law');

  useEffect(() => {
    const unsub = ironMemoryService.subscribe((updated) => {
      setItems(updated);
    });
    return unsub;
  }, []);

  const searchResults = ironMemoryService.searchSemantic(
    searchQuery,
    selectedDomain === 'ALL' ? undefined : (selectedDomain as KnowledgeDomainType)
  );

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const domainLabels: Record<KnowledgeDomainType, string> = {
      law_egyptian: 'القانون والتشريعات المصرية',
      computer_science_ai: 'علوم الحاسب والذكاء الاصطناعي',
      cybersecurity: 'الأمن السيبراني الدفاعي',
      mathematics_logic: 'الرياضيات والمنطق والإحصاء',
      physics_chemistry_biology: 'العلوم الطبيعية',
      medicine_health: 'الطب والصحة',
      engineering_systems: 'الهندسة والأنظمة',
      economics_management: 'الاقتصاد والإدارة',
      history_languages: 'التاريخ واللغات',
      education_social: 'التعليم والعلوم الاجتماعية',
      agriculture_environment: 'الزراعة والبيئة',
      professional_applied: 'المعرفة المهنية التطبيقية'
    };

    const res = await ironMemoryService.addMemoryItem({
      category: newCategory,
      domain: newDomain,
      domainLabelAr: domainLabels[newDomain],
      title: newTitle.trim(),
      content: newContent.trim(),
      sourceCitation: newCitation.trim() || 'مرجع موثق مدخل يدوياً',
      legalArticleRef: newArticleRef.trim() || undefined,
      confidenceScore: 0.98,
      isVerifiedFact: true,
      tags: [domainLabels[newDomain], newCategory]
    });

    if (res.conflictWarning) {
      setConflictAlert(res.conflictWarning);
    } else {
      setConflictAlert(null);
    }

    setNewTitle('');
    setNewContent('');
    setNewCitation('');
    setNewArticleRef('');
    setShowAddModal(false);
  };

  const handleExportSnapshot = async () => {
    const res = await ironMemoryService.exportMemorySnapshot();
    const blob = new Blob([res.jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abqaryno_iron_memory_${Date.now()}.abqmemory`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice(`تم تصدير ${res.itemCount} عناصر ذاكرة بنجاح. بصمة التحقق (SHA-256): ${res.checksum.slice(0, 16)}...`);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = await ironMemoryService.importMemorySnapshot(content);
        if (res.success) {
          setExportNotice(`تم استيراد ${res.importedCount} عنصر جديد بنجاح إلى الذاكرة الحديدية.`);
        } else {
          setConflictAlert(`فشل الاستيراد: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">الذاكرة الحديدية الدائمة (ABQARYNO IRON MEMORY)</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {items.length} مرجعاً موثقاً
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              ذاكرة دائمة على القرص لا تُفقد عند إعادة التشغيل. تحفظ نصوص القانون المصري، علوم الحوسبة، الأمن، والرياضيات، وتفصل بصرامة بين الحقائق المثبتة والاستنتاجات.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة معلومة موثقة</span>
            </button>

            <button
              onClick={handleExportSnapshot}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs transition"
              title="تصدير لقطة مشفرة للذاكرة بصيغة .abqmemory"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير الذاكرة</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs transition cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>استيراد</span>
              <input type="file" accept=".json,.abqmemory" onChange={handleImportFile} className="hidden" />
            </label>
          </div>
        </div>

        {/* Notices */}
        {conflictAlert && (
          <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{conflictAlert}</span>
          </div>
        )}

        {exportNotice && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{exportNotice}</span>
          </div>
        )}
      </div>

      {/* Search and Domain Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute top-2.5 right-3" />
            <input
              type="text"
              placeholder="البحث الدلالي في الذاكرة (مثال: مادة 147، العقد، حماية البيانات، تشفير)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-9 pl-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
            />
          </div>

          <span className="text-[11px] font-mono text-slate-400 shrink-0">
            تم العثور على {searchResults.length} نتيجة مطابقة
          </span>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'ALL', label: 'كافة العلوم والذاكرة' },
            { id: 'law_egyptian', label: 'القانون والتشريعات المصرية' },
            { id: 'computer_science_ai', label: 'علوم الحاسب والذكاء الاصطناعي' },
            { id: 'cybersecurity', label: 'الأمن السيبراني الدفاعي' },
            { id: 'mathematics_logic', label: 'الرياضيات والإحصاء' }
          ].map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDomain(d.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                selectedDomain === d.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {searchResults.map(({ item, relevanceScore, matchReason }) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {item.domainLabelAr}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    ثقة: {Math.round(item.confidenceScore * 100)}%
                  </span>
                  <button
                    onClick={() => ironMemoryService.deleteItem(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                    title="حذف هذا العنصر من الذاكرة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-sm text-white">{item.title}</h3>

              {item.legalArticleRef && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono bg-amber-950/20 p-2 rounded border border-amber-500/20">
                  <Scale className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.legalArticleRef}</span>
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="truncate">المصدر: {item.sourceCitation}</span>
                <span className="font-mono text-slate-500 shrink-0">SHA: {item.hash.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">إضافة معلومة موثقة إلى الذاكرة الحديدية</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddItem} className="p-5 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">المجال المعرفي:</label>
                <select
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                >
                  <option value="law_egyptian">القانون والتشريعات المصرية</option>
                  <option value="computer_science_ai">علوم الحاسب والذكاء الاصطناعي</option>
                  <option value="cybersecurity">الأمن السيبراني الدفاعي</option>
                  <option value="mathematics_logic">الرياضيات والمنطق والإحصاء</option>
                  <option value="physics_chemistry_biology">العلوم الطبيعية</option>
                  <option value="medicine_health">الطب والصحة</option>
                  <option value="engineering_systems">الهندسة والأنظمة</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">عنوان المرجع / المفهوم:</label>
                <input
                  type="text"
                  placeholder="مثال: مادة القوة القاهرة في العقود"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              {newDomain === 'law_egyptian' && (
                <div>
                  <label className="block text-slate-300 mb-1">رقم المادة والتشريع الرسمي:</label>
                  <input
                    type="text"
                    placeholder="مثال: مادة 165 - القانون المدني المصري رقم 131 لسنة 1948"
                    value={newArticleRef}
                    onChange={(e) => setNewArticleRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1">المصدر والتوثيق (Citation Source):</label>
                <input
                  type="text"
                  placeholder="الجريدة الرسمية، رقم العدد، تاريخ الإصدار، أو المصدر الأكاديمي..."
                  value={newCitation}
                  onChange={(e) => setNewCitation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">نص المعلومة الموثقة:</label>
                <textarea
                  rows={4}
                  placeholder="أدخل النص الحرفي للمادة أو القاعدة العلمية دون تأليف..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white leading-relaxed"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  حفظ وتوثيق بالذاكرة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
