/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Email Notifications & Periodic Reporting Settings View
 */

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Server,
  Eye,
  RefreshCw,
  Bell,
  Sparkles,
  Inbox
} from 'lucide-react';
import { EmailNotificationSettings, EmailDispatchLog, Project, SystemHealth } from '../types';
import { notificationService } from '../services/notificationService';

interface NotificationSettingsViewProps {
  project: Project;
  health: SystemHealth;
}

export const NotificationSettingsView: React.FC<NotificationSettingsViewProps> = ({
  project,
  health
}) => {
  const [settings, setSettings] = useState<EmailNotificationSettings>(() => notificationService.getSettings());
  const [outbox, setOutbox] = useState<EmailDispatchLog[]>(() => notificationService.getOutbox());
  const [newRecipient, setNewRecipient] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [lastDispatchSuccess, setLastDispatchSuccess] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'healing' | 'digest'>('healing');
  const [selectedMailToView, setSelectedMailToView] = useState<EmailDispatchLog | null>(null);

  useEffect(() => {
    const unsub = notificationService.subscribeOutbox((newOutbox) => {
      setOutbox(newOutbox);
    });
    return unsub;
  }, []);

  const handleToggleEnabled = (val: boolean) => {
    const updated = { ...settings, enabled: val };
    setSettings(updated);
    notificationService.saveSettings(updated);
  };

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newRecipient.trim();
    if (!email || !email.includes('@')) return;
    if (settings.recipients.includes(email)) return;

    const updated: EmailNotificationSettings = {
      ...settings,
      recipients: [...settings.recipients, email]
    };
    setSettings(updated);
    notificationService.saveSettings(updated);
    setNewRecipient('');
  };

  const handleRemoveRecipient = (email: string) => {
    const updated: EmailNotificationSettings = {
      ...settings,
      recipients: settings.recipients.filter(r => r !== email)
    };
    setSettings(updated);
    notificationService.saveSettings(updated);
  };

  const handleTriggerChange = (key: keyof EmailNotificationSettings['triggers']) => {
    const updated: EmailNotificationSettings = {
      ...settings,
      triggers: {
        ...settings.triggers,
        [key]: !settings.triggers[key]
      }
    };
    setSettings(updated);
    notificationService.saveSettings(updated);
  };

  const handleSendTestDispatch = async () => {
    if (settings.recipients.length === 0) return;
    setIsSendingTest(true);
    setLastDispatchSuccess(null);

    try {
      const recipient = settings.recipients[0];
      const template = previewMode === 'healing'
        ? notificationService.generateHealingReportTemplate(project, recipient, 'تم إتمام الاختبار البريدي التجريبي بنجاح عبر خدمة التنبيهات الذكية.')
        : notificationService.generateHealthDigestTemplate(health, project, recipient);

      const log = await notificationService.sendNotificationEmail({
        recipient,
        subject: template.subject,
        bodyHtml: template.bodyHtml,
        bodyText: template.bodyText,
        triggerReason: 'طلب إرسال تقرير تجريبي يدوي من واجهة الإعدادات'
      });

      setLastDispatchSuccess(`تم إرسال التقرير التجريبي بنجاح إلى ${recipient} خلال ${log.deliveryTimeMs} مللي ثانية.`);
    } finally {
      setIsSendingTest(false);
    }
  };

  // Generate live preview HTML
  const primaryRecipient = settings.recipients[0] || 'user@example.com';
  const previewTemplate = previewMode === 'healing'
    ? notificationService.generateHealingReportTemplate(project, primaryRecipient, 'تقرير تفصيلي لنجاح معالجة كافة ثغرات المشروع وتثبيت الاختبارات الوقائية.')
    : notificationService.generateHealthDigestTemplate(health, project, primaryRecipient);

  return (
    <div className="space-y-6">

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                الخدمة البريدية التجريبية وتقارير الحالة المؤتمتة
              </span>
            </div>
            <h2 className="text-lg font-black text-white">
              إدارة إعدادات التنبيهات وإرسال تقارير الإصلاح وصحة النظام
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              تقوم هذه الخدمة بإرسال رسائل بريدية مهيكلة بتصميم أنيق فور اكتمال دورات الإصلاح الذاتي بنجاح أو عند رصد أي طوارئ في سلامة النظام وسجل التدقيق.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Master Toggle */}
            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs w-full sm:w-auto justify-between">
              <span className="text-slate-300 font-semibold">تفعيل الخدمة البريدية:</span>
              <button
                onClick={() => handleToggleEnabled(!settings.enabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.enabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                    settings.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Test Send Button */}
            <button
              onClick={handleSendTestDispatch}
              disabled={isSendingTest || !settings.enabled || settings.recipients.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition active:scale-95 disabled:opacity-50 shrink-0"
            >
              <Send className={`w-4 h-4 ${isSendingTest ? 'animate-spin' : ''}`} />
              <span>{isSendingTest ? 'جاري الإرسال التجريبي...' : 'إرسال تقرير تجريبي فوري'}</span>
            </button>
          </div>

        </div>

        {/* Success Alert */}
        {lastDispatchSuccess && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{lastDispatchSuccess}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column (5 Cols): Settings & Recipients & Triggers */}
        <div className="lg:col-span-5 space-y-5">

          {/* Recipients Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                عناوين المستلمين ({settings.recipients.length})
              </span>
              <span className="text-[11px] text-slate-500">استقبال التقارير والتنبيهات</span>
            </div>

            {/* Add recipient form */}
            <form onSubmit={handleAddRecipient} className="flex gap-2">
              <input
                type="email"
                placeholder="أدخل بريد إلكتروني جديد..."
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!newRecipient.includes('@')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-40 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Recipients list */}
            <div className="space-y-2">
              {settings.recipients.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-mono text-slate-200 truncate">{email}</span>
                  </div>

                  <button
                    onClick={() => handleRemoveRecipient(email)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                    title="حذف هذا العنوان"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger Conditions Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                شروط الإرسال التلقائي (Triggers)
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {[
                {
                  id: 'onSelfHealingSuccess' as const,
                  title: 'اكتمال دورة الإصلاح الذاتي بنجاح',
                  desc: 'إرسال تقرير تفصيلي فور تطبيق الرقعة واجتياز اختبارات التحقق الـ 10.'
                },
                {
                  id: 'onTestFailure' as const,
                  title: 'تنبيه عاجل عند فشل أي اختبار أو رصد خطأ',
                  desc: 'إشعار فوري عند حدوث انهيار في إحدى حزم الاختبارات أو ظهور حلقة تكرار.'
                },
                {
                  id: 'onTamperDetected' as const,
                  title: 'تنبيه أمني عند رصد تلاعب في سجل التدقيق',
                  desc: 'إخطار فوري عند انكسار سلسلة تجزئة SHA-256 لسجل العمليات.'
                },
                {
                  id: 'onDailyDigest' as const,
                  title: 'تقرير دوري مجدول بمؤشرات صحة النظام',
                  desc: 'إرسال ملخص لحمل المعالج، الذاكرة، وعدد العمليات المنجزة.'
                }
              ].map(trig => (
                <label
                  key={trig.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition"
                >
                  <input
                    type="checkbox"
                    checked={settings.triggers[trig.id]}
                    onChange={() => handleTriggerChange(trig.id)}
                    className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200 block">{trig.title}</span>
                    <span className="text-[11px] text-slate-400 leading-relaxed block">{trig.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* SMTP Relay Specs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-400" />
              مواصفات ترحيل البريد (Relay Config)
            </span>
            <div className="space-y-1.5 font-mono text-[11px] text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between">
                <span>Relay Host:</span>
                <span className="text-amber-300">{settings.smtpConfig.host}</span>
              </div>
              <div className="flex justify-between">
                <span>Port / Security:</span>
                <span className="text-emerald-400">{settings.smtpConfig.port} (TLS Encrypted)</span>
              </div>
              <div className="flex justify-between">
                <span>Sender Identity:</span>
                <span className="text-slate-300">{settings.smtpConfig.senderEmail}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (7 Cols): Live Email Template Preview & Outbox History */}
        <div className="lg:col-span-7 space-y-5">

          {/* Template Live Preview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">معاينة القالب البريدي الفعلي (Live Template Preview)</h3>
              </div>

              {/* Template Switcher */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setPreviewMode('healing')}
                  className={`px-2.5 py-1 rounded transition text-[11px] ${
                    previewMode === 'healing'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  تقرير الإصلاح الذاتي
                </button>
                <button
                  onClick={() => setPreviewMode('digest')}
                  className={`px-2.5 py-1 rounded transition text-[11px] ${
                    previewMode === 'digest'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  تقرير صحة النظام
                </button>
              </div>
            </div>

            {/* Email Subject Line */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs flex items-center gap-2 text-slate-300">
              <span className="font-bold text-amber-400 shrink-0">عنوان الرسالة (Subject):</span>
              <span className="font-mono text-slate-200 truncate">{previewTemplate.subject}</span>
            </div>

            {/* Rendered HTML Preview Box */}
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 p-2 max-h-[380px] overflow-y-auto">
              <div
                className="scale-95 origin-top"
                dangerouslySetInnerHTML={{ __html: previewTemplate.bodyHtml }}
              />
            </div>
          </div>

          {/* Sent Outbox History */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">سجل الرسائل المرسلة (Outbox / Sent Dispatches)</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">{outbox.length} رسائل موثقة</span>
            </div>

            {outbox.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-lg border border-slate-800">
                لم يتم إرسال أي رسائل بريدية حتى الآن. انقر على «إرسال تقرير تجريبي فوري» لتجربة الإرسال.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {outbox.map((mail) => (
                  <div
                    key={mail.id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                          ✓ تم التسليم
                        </span>
                        <span className="font-bold text-slate-200 truncate">{mail.subject}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>إلى: {mail.recipient}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-500">{new Date(mail.timestamp).toLocaleTimeString('ar-SA')}</span>
                        <span>•</span>
                        <span className="font-mono text-amber-400/80">{mail.deliveryTimeMs}ms</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedMailToView(mail)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] shrink-0"
                    >
                      عرض الرسالة
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* View Email Content Modal */}
      {selectedMailToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
              <span className="font-bold text-white truncate max-w-md">{selectedMailToView.subject}</span>
              <button
                onClick={() => setSelectedMailToView(null)}
                className="text-slate-400 hover:text-white px-2 py-1"
              >
                إغلاق
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-slate-950">
              <div dangerouslySetInnerHTML={{ __html: selectedMailToView.bodyHtml }} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
