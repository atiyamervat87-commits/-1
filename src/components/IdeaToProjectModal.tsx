/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Idea to Project Generator Modal
 */

import React, { useState } from 'react';
import { X, Sparkles, Wand2, Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';

interface IdeaToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (idea: string, category: string, complexity: 'simple' | 'medium' | 'advanced') => void;
}

const PRESET_IDEAS = [
  {
    title: 'بوابة مدفوعات واشتراكات سحابية متعددة العملات',
    category: 'fintech',
    complexity: 'advanced' as const,
    desc: 'محرك آمن لمعالجة بطاقات الدفع وتجديد الاشتراكات الدورية مع حماية من العمليات المكررة.'
  },
  {
    title: 'نظام إدارة مهام وفرق عمل ذكي مع إشعارات فورية',
    category: 'productivity',
    complexity: 'medium' as const,
    desc: 'لوحات كانبان ومتابعة سير المهام وجداول زمنية للأعضاء مع مراقبة مؤشرات الإنجاز.'
  },
  {
    title: 'محرك تحليل مقاييس السيرفرات والتنبيهات الاستباقية',
    category: 'devops',
    complexity: 'advanced' as const,
    desc: 'تجميع بيانات الذاكرة والمعالج واكتشاف الأنماط الشاذة قبل حدوث انهيار في النظام.'
  },
  {
    title: 'منصة حجز وإدارة فنادق متكاملة',
    category: 'travel',
    complexity: 'medium' as const,
    desc: 'إدارة الغرف والمواسم وتأكيد الحجوزات وإصدار الفواتير التلقائية مع معالجة التضارب.'
  }
];

export const IdeaToProjectModal: React.FC<IdeaToProjectModalProps> = ({
  isOpen,
  onClose,
  onGenerate
}) => {
  const [ideaText, setIdeaText] = useState('');
  const [category, setCategory] = useState('fintech');
  const [complexity, setComplexity] = useState<'simple' | 'medium' | 'advanced'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaText.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      onGenerate(ideaText, category, complexity);
      setIsGenerating(false);
      onClose();
    }, 400);
  };

  const handleSelectPreset = (preset: typeof PRESET_IDEAS[0]) => {
    setIdeaText(preset.title);
    setCategory(preset.category);
    setComplexity(preset.complexity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">تحويل فكرة البرنامج إلى معمارية وملفات حقيقية</h3>
              <p className="text-xs text-slate-400">محرك عبقرينو لتوليد المتطلبات ومعايير القبول والشفرات البرمجية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">

          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              أفكار سريعة جاهزة للتجربة:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_IDEAS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-lg border text-right transition ${
                    ideaText === preset.title
                      ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-white text-xs">{preset.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Idea Input */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-200 block">فكرة البرنامج أو متطلباتك بالتفصيل:</label>
            <textarea
              rows={3}
              placeholder="اكتب فكرة التطبيق المطلوب... مثلاً: تطبيق لإدارة عيادة طبية مع تنظيم المواعيد والملفات المرضية وإرسال رسائل تذكير تلقائية..."
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs leading-relaxed"
              required
            />
          </div>

          {/* Category & Complexity Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="font-bold text-slate-300 block mb-1">مجال التطبيق (Category):</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="fintech">أنظمة مالية ومدفوعات (Fintech)</option>
                <option value="productivity">إدارة أعمال وإنتاجية (Productivity)</option>
                <option value="devops">مراقبة بنية تحتية وخوادم (DevOps)</option>
                <option value="healthcare">رعاية صحية وطبية (Healthcare)</option>
                <option value="ecommerce">تجارة إلكترونية ودفع (E-commerce)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">مستوى التعقيد (Complexity):</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'simple', label: 'مبسط' },
                  { id: 'medium', label: 'متوسط' },
                  { id: 'advanced', label: 'متقدم' }
                ].map(c => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setComplexity(c.id as any)}
                    className={`py-1.5 rounded text-center transition ${
                      complexity === c.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              سيقوم المحرك بإنشاء الهيكل والمتطلبات والشفرات وملفات الحزمة فوراً.
            </span>

            <button
              type="submit"
              disabled={isGenerating || !ideaText.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>جاري التوليد والبناء...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>توليد البرنامج الآن</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
