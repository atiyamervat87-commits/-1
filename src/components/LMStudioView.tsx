/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Abqaryno LM Studio - 1B Model Architecture, Memory Calculator & Tokenizer Sandbox
 */

import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Calculator,
  Terminal,
  Activity,
  Server,
  Zap,
  Globe,
  CheckCircle2,
  AlertCircle,
  FileCode
} from 'lucide-react';
import { lmInferenceService } from '../services/lmInferenceService';

export const LMStudioView: React.FC = () => {
  const [config, setConfig] = useState(() => lmInferenceService.getConfig());
  const [tokenizerInput, setTokenizerInput] = useState(
    'العقد شريعة المتعاقدين فلا يجوز نقضه ولا تعديله إلا باتفاق الطرفين. function solve() { return true; }'
  );
  const [endpointStatus, setEndpointStatus] = useState<'idle' | 'testing' | 'connected' | 'unreachable'>('idle');
  const [endpointLatency, setEndpointLatency] = useState<number | null>(null);

  const metrics = lmInferenceService.calculateResourceMetrics(config);
  const tokenizerResult = lmInferenceService.tokenize(tokenizerInput);

  const handleTestEndpoint = async () => {
    setEndpointStatus('testing');
    const start = performance.now();
    try {
      // Test fetch to the specified endpoint with a short timeout
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);
      await fetch(config.customEndpointUrl, { method: 'GET', signal: controller.signal, mode: 'no-cors' });
      clearTimeout(id);
      const latency = Math.round(performance.now() - start);
      setEndpointLatency(latency);
      setEndpointStatus('connected');
    } catch {
      const latency = Math.round(performance.now() - start);
      setEndpointLatency(latency);
      setEndpointStatus('unreachable');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">استوديو النموذج اللغوي (ABQARYNO MIND 1B STUDIO)</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                1,000,000,000 Parameters
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              معمارية Transformer معتمدة على 24 طبقة و 2048 بعد مخفي. يتيح الاستوديو فحص متطلبات الذاكرة بدقة، واختبار Tokenizer العربي المخصص، وتوصيل خادم الأوزان الملياري الخارجي (GPU Endpoint).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-mono text-xs font-bold">
              Autoregressive Decoder-Only
            </span>
          </div>
        </div>
      </div>

      {/* 1B Parameter Architecture & Memory Footprint Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-xs text-slate-400">حجم الأوزان (FP32)</span>
          <div className="text-2xl font-black text-amber-400 font-mono">{metrics.weightsFp32GB} GB</div>
          <span className="text-[11px] text-slate-500">يتطلب تدريبه 24-32 GB VRAM</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-xs text-slate-400">حجم الأوزان (FP16)</span>
          <div className="text-2xl font-black text-white font-mono">{metrics.weightsFp16GB} GB</div>
          <span className="text-[11px] text-slate-500">للاستدلال النصف دقيق (Half Precision)</span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 space-y-1">
          <span className="text-xs text-emerald-400">حجم الأوزان مكممة (Q4_K_M)</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{metrics.weightsQ4GB} GB</div>
          <span className="text-[11px] text-emerald-400/80">ملائمة للتشغيل المحلي المدمج</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-xs text-slate-400">الـ KV Cache للسياق</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">{metrics.kvCacheFullContextMB} MB</div>
          <span className="text-[11px] text-slate-500">لكل 2048 token في الذاكرة</span>
        </div>
      </div>

      {/* Architecture Deep Dive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column (5 Cols): Layer Specifications */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              المواصفات البنيوية لنموذج الـ 1B
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {[
              { label: 'إجمالي المعاملات المستهدف:', val: '1,000,000,000 (1B)' },
              { label: 'عدد طبقات المحول (Layers):', val: `${config.layers} طبقة` },
              { label: 'البعد المخفي (Hidden Dim d_model):', val: `${config.hiddenDim}` },
              { label: 'رؤوس الانتباه (Attention Heads):', val: `${config.attentionHeads}` },
              { label: 'بعد الرأس الفردي (Head Dim d_k):', val: `${metrics.headDim}` },
              { label: 'حجم المفردات (Vocabulary Size):', val: `${config.vocabSize.toLocaleString()}` },
              { label: 'سياق الحوار المستهدف (Context):', val: `${config.contextWindow} tokens` },
              { label: 'بيانات التدريب المثلى (Chinchilla):', val: `${metrics.chinchillaOptimalTokensBillion} مليار رمز` },
              { label: 'طريقة الترميز الموضعي (PE):', val: 'RoPE (Rotary Position Embedding)' }
            ].map((spec, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400 font-sans">{spec.label}</span>
                <span className="text-amber-300 font-bold">{spec.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (7 Cols): Custom GPU Endpoint Connection */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">توصيل خادم الأوزان الملياري الخارجي (GPU Endpoint)</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Ollama / vLLM / HuggingFace
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            عند توافر خادم حوسبة خاص مزود ببطاقة GPU (مثل Ollama أو vLLM)، يمكنك ربطه مباشرة بعقل عبقرينو للاستفادة من كامل أوزان النماذج المليارية (مثل Llama-3.2-1B أو Qwen2.5-1.5B) مع الاحتفاظ بالذاكرة الحديدية وسجل التدقيق.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-sans">نقطة نهاية خدمة الاستدلال (Endpoint URL):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.customEndpointUrl}
                  onChange={(e) => {
                    const updated = { ...config, customEndpointUrl: e.target.value };
                    setConfig(updated);
                    lmInferenceService.updateConfig(updated);
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  placeholder="http://localhost:11434/api/generate أو عنوان الخادم السحابي"
                />
                <button
                  onClick={handleTestEndpoint}
                  disabled={endpointStatus === 'testing'}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition disabled:opacity-50 shrink-0"
                >
                  {endpointStatus === 'testing' ? 'جاري الفحص...' : 'فحص الاتصال'}
                </button>
              </div>
            </div>

            {endpointStatus !== 'idle' && (
              <div className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                endpointStatus === 'connected'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
              }`}>
                <div className="flex items-center gap-2">
                  {endpointStatus === 'connected' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span>
                    {endpointStatus === 'connected'
                      ? `تم الاتصال بنجاح بنقطة نهاية الخادم الملياري (الاستجابة: ${endpointLatency}ms).`
                      : `الخادم الملياري الخارجي غير متصل محلياً (${endpointLatency}ms). يعمل عقل عبقرينو تلقائياً عبر النواة المحلية الذاتية (Local Kernel) المدعومة بالذاكرة الحديدية.`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Live Arabic Tokenizer Sandbox */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">مختبر محلل الرموز العربي ومتعدد اللغات (Tokenizer Sandbox)</h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">عدد الرموز: <strong className="text-amber-300">{tokenizerResult.tokenCount}</strong></span>
            <span className="text-slate-400">عدد الأحرف: <strong className="text-slate-200">{tokenizerResult.charCount}</strong></span>
            <span className="text-slate-400">نسبة الضغط: <strong className="text-emerald-400">{tokenizerResult.compressionRatio}x</strong></span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400 block">نص التجربة والتحليل:</label>
          <textarea
            rows={2}
            value={tokenizerInput}
            onChange={(e) => setTokenizerInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-xs font-mono focus:outline-none focus:border-amber-400 leading-relaxed"
          />
        </div>

        {/* Tokens Breakdown Visualizer */}
        <div className="space-y-2">
          <span className="text-xs text-slate-400 block font-bold">الرموز المفككة (Token IDs & Boundaries):</span>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800/80 min-h-[80px]">
            {tokenizerResult.tokens.map((token, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono flex items-center gap-1.5 hover:border-amber-400 transition"
              >
                <span className="text-amber-200">{token}</span>
                <span className="text-[10px] text-slate-500 font-mono">#{tokenizerResult.tokenIds[i]}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
