/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Restore Points & Snapshot Management View
 */

import React, { useState } from 'react';
import { History, ShieldAlert, CheckCircle2, RotateCcw, Plus, Clock, Hash, FileCode } from 'lucide-react';
import { RestorePoint } from '../types';

interface RestorePointsViewProps {
  restorePoints: RestorePoint[];
  onCreateSnapshot: (name: string, reason: string) => Promise<void>;
  onRestoreSnapshot: (point: RestorePoint) => Promise<void>;
  isRestoring: boolean;
}

export const RestorePointsView: React.FC<RestorePointsViewProps> = ({
  restorePoints,
  onCreateSnapshot,
  onRestoreSnapshot,
  isRestoring
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [snapshotReason, setSnapshotReason] = useState('');

  const handleCreate = async () => {
    if (!snapshotName.trim()) return;
    await onCreateSnapshot(snapshotName, snapshotReason || 'حفظ يدوي بواسطة المستخدم');
    setSnapshotName('');
    setSnapshotReason('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">

      {/* Header and Manual Snapshot Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            إدارة نقاط الاستعادة واللقطات المشفرة (Restore Points)
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            توثق كل نقطة لقطة كاملة وتجزئة SHA-256 لكافة ملفات المشروع. عند التراجع، يتم التحقق الرياضي من مطابقة المحتوى 100%.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء نقطة استعادة يدوية</span>
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 w-full max-w-md space-y-4 shadow-2xl">
            <h4 className="font-bold text-white text-sm">إنشاء نقطة استعادة جديدة</h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اسم النقطة</label>
                <input
                  type="text"
                  placeholder="مثال: قبل تعديل إعدادات الشبكة"
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">سبب الحفظ</label>
                <input
                  type="text"
                  placeholder="مثال: إجراء فحص أمني"
                  value={snapshotReason}
                  onChange={(e) => setSnapshotReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800 text-xs">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreate}
                disabled={!snapshotName.trim()}
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold disabled:opacity-50"
              >
                حفظ النقطة المشفرة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Points Timeline */}
      <div className="space-y-3">
        {restorePoints.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 text-xs space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-600" />
            <p>لا توجد نقاط استعادة حتى الآن.</p>
            <p className="text-[11px] text-slate-500">
              يتم إنشاء نقطة استعادة تلقائياً في المرحلة الخامسة من الإصلاح الذاتي، أو يمكنك إنشاء واحدة يدوياً.
            </p>
          </div>
        ) : (
          restorePoints.map((point) => (
            <div
              key={point.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{point.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                    {point.id}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  السبب: <span className="text-slate-300">{point.reason}</span>
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(point.createdAt).toLocaleString('ar-SA')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3 text-amber-400" />
                    تجزئة الحالة: {point.snapshotHash.slice(0, 16)}...
                  </span>
                  <span className="flex items-center gap-1">
                    <FileCode className="w-3 h-3 text-slate-400" />
                    {point.files.length} ملفات محصنة
                  </span>
                </div>
              </div>

              {/* Restore Action */}
              <button
                onClick={() => onRestoreSnapshot(point)}
                disabled={isRestoring}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition active:scale-95 disabled:opacity-50 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isRestoring ? 'جاري الاستعادة...' : 'استعادة هذه النقطة'}</span>
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
