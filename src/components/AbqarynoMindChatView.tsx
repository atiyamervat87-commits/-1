/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AbqarynoMindChat - Interactive Room with Source Attribution & Context Tracking
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Cpu,
  Clock,
  Trash2,
  Download,
  CheckCircle2,
  HelpCircle,
  Code2,
  Scale
} from 'lucide-react';
import { ChatMessage } from '../types';
import { lmInferenceService } from '../services/lmInferenceService';

const CHAT_STORAGE_KEY = 'abqaryno_chat_history_v4';

export const AbqarynoMindChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'msg_init',
        sender: 'abqaryno_mind',
        text: 'مرحباً بك! أنا **عقل عبقرينو (ABQARYNO MIND V4)**. أمتلك ذاكرة حديدية دائمة، وأفرّق بوضوح تام بين الحقائق المثبتة في المراجع (مثل مواد القانون المصري الموثقة)، والاستنتاجات المنطقية، ومخرجات أدوات البرمجة والحوسبة. تفضل بطرح سؤالك أو تجربة الاختبارات السريعة أدناه.',
        timestamp: Date.now(),
        sourceType: 'iron_memory',
        sourceDetails: 'نواة عبقرينو الترحيبية',
        confidence: 1.0,
        tokensUsed: 42,
        latencyMs: 12
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {}
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isGenerating) return;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now()
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsGenerating(true);

    try {
      const mindReply = await lmInferenceService.generateResponse(text, newHistory);
      setMessages([...newHistory, mindReply]);
    } catch (e: any) {
      const errorReply: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'abqaryno_mind',
        text: `تعذر إكمال التوليد: ${e.message || 'خطأ غير متوقع'}`,
        timestamp: Date.now(),
        sourceType: 'lm_inference',
        confidence: 0
      };
      setMessages([...newHistory, errorReply]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearChat = () => {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    setMessages([
      {
        id: `msg_${Date.now()}`,
        sender: 'abqaryno_mind',
        text: 'تم بدء محادثة جديدة وتفريغ سياق الجلسة السابقة بالكامل لضمان استقلال المحادثات.',
        timestamp: Date.now(),
        sourceType: 'tool_execution',
        sourceDetails: 'تفريغ السياق (Session Reset)'
      }
    ]);
  };

  const handleExportChat = () => {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abqaryno_chat_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">

      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-base">غرفة محادثة عقل عبقرينو (AbqarynoMindChat)</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                1B Engine Connected
              </span>
            </div>
            <p className="text-xs text-slate-400">
              استدلال متعدد العلوم موثق بالذاكرة الحديدية ومصادر التشريع والحوسبة
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleExportChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition"
            title="تصدير سجل المحادثة بتنسيق JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير الحوار</span>
          </button>
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-rose-950/40 text-xs text-slate-400 hover:text-rose-300 transition"
            title="بدء جلسة جديدة وتفريغ السياق"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>جلسة جديدة</span>
          </button>
        </div>
      </div>

      {/* Quick Scientific / Legal Test Presets */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 space-y-2">
        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          اختبارات المعايرة السريعة لعقل عبقرينو:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
          {[
            { label: 'القانون المدني المصري (مادة 147)', query: 'ما هو نص مادة العقد شريعة المتعاقدين في القانون المدني المصري رقم 131 لسنة 1948؟', icon: Scale },
            { label: 'قانون حماية البيانات رقم 151', query: 'ما هي ضوابط معالجة البيانات الشخصية في قانون 151 لسنة 2020 المصري؟', icon: Scale },
            { label: 'حساب ذاكرة نموذج 1B', query: 'احسب حجم الذاكرة المطلوبة لنموذج بمليار معامل بدقة FP32 و FP16 وتكميم Q4', icon: Cpu },
            { label: 'سؤال قانوني غير موثق', query: 'ما هي عقوبة مخالفات البناء رقم 9999 لسنة 2099؟ (اختبار التصريح بعدم اليقين)', icon: HelpCircle },
            { label: 'خبرة إصلاح الحلقات اللانهائية', query: 'ما هي خبرة عبقرينو الموثقة في علاج حلقة while(true) في sendMessageWithRetry؟', icon: Code2 },
            { label: 'متابعة السياق والحوار', query: 'بناءً على ما ناقشناه للتو، لخص لي النقاط الأساسية؟', icon: BookOpen }
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(preset.query)}
              disabled={isGenerating}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-200 text-right transition truncate disabled:opacity-50"
              title={preset.query}
            >
              <div className="font-bold truncate">{preset.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[420px] max-h-[560px] overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-xs leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-amber-500/15 text-slate-100 border border-amber-500/30 rounded-br-none'
                  : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
              }`}
            >
              {/* Message Header with Attribution Tag */}
              <div className="flex items-center justify-between gap-3 pb-1 border-b border-slate-800/60 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold">
                  {msg.sender === 'user' ? (
                    <>
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>المستخدم</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 text-amber-400" />
                      <span>عقل عبقرينو V4</span>
                    </>
                  )}
                </div>

                {msg.sourceType && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                      msg.sourceType === 'iron_memory'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : msg.sourceType === 'tool_execution'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {msg.sourceType === 'iron_memory' && '✓ مرجع موثق (الذاكرة الحديدية)'}
                    {msg.sourceType === 'tool_execution' && '⚙ أداة حسابية موثقة'}
                    {msg.sourceType === 'lm_inference' && '🧠 استدلال لغوي'}
                  </span>
                )}
              </div>

              {/* Message Content */}
              <div className="whitespace-pre-wrap leading-relaxed font-sans">{msg.text}</div>

              {/* Telemetry Footer */}
              {msg.sender === 'abqaryno_mind' && (msg.tokensUsed !== undefined || msg.latencyMs !== undefined) && (
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                  {msg.sourceDetails && <span className="truncate">{msg.sourceDetails}</span>}
                  <div className="flex items-center gap-2 shrink-0">
                    {msg.latencyMs && <span>{msg.latencyMs}ms</span>}
                    {msg.tokensUsed && <span>{msg.tokensUsed} tokens</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800 w-fit">
            <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>عقل عبقرينو يبحث في الذاكرة الحديدية وينفذ الاستدلال السببي...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          placeholder="اكتب استفسارك، أو مسألة برمجية، أو استفساراً في القانون المصري أو العلوم..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isGenerating}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
        />
        <button
          type="submit"
          disabled={isGenerating || !inputText.trim()}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>إرسال</span>
        </button>
      </form>

    </div>
  );
};
