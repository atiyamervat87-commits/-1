/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Architecture & Code File Explorer Component
 */

import React, { useState } from 'react';
import { FileCode, Folder, Copy, Check, Hash, ShieldCheck, Edit3, Save } from 'lucide-react';
import { ProjectFile } from '../types';

interface FileTreeExplorerProps {
  files: ProjectFile[];
  onUpdateFileContent?: (filePath: string, newContent: string) => void;
}

export const FileTreeExplorer: React.FC<FileTreeExplorerProps> = ({
  files,
  onUpdateFileContent
}) => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(files[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSelectFile = (file: ProjectFile) => {
    setSelectedFile(file);
    setIsEditing(false);
    setEditedContent(file.content);
  };

  const handleStartEdit = () => {
    if (!selectedFile) return;
    setEditedContent(selectedFile.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!selectedFile || !onUpdateFileContent) return;
    onUpdateFileContent(selectedFile.path, editedContent);
    setIsEditing(false);
  };

  const handleCopy = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">

      {/* Left Sidebar: File Tree */}
      <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-l border-slate-800 bg-slate-950/70 p-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Folder className="w-4 h-4" />
              هيكل ملفات المشروع ({files.length})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">/workspace/project/</span>
          </div>

          <div className="space-y-1">
            {files.map((file) => {
              const isSelected = selectedFile?.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => handleSelectFile(file)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition text-right ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.path}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-sans mr-2">
                    {Math.round(file.size / 1024 * 10) / 10} KB
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Notice */}
        <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>منطقة العزل البرمجي الآمن</span>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-500">
            يتم حظر أي محاولة تعديل خارج مسارات المشروع المحددة وتوثيق التجزئة عند كل عملية.
          </p>
        </div>
      </div>

      {/* Right Area: Code Viewer / Editor */}
      <div className="lg:col-span-8 flex flex-col bg-slate-950">

        {/* File Header Bar */}
        {selectedFile && (
          <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-300">{selectedFile.path}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {selectedFile.language.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {selectedFile.hash.slice(0, 10)}...
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onUpdateFileContent && (
                <>
                  {isEditing ? (
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>حفظ التعديل</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل الشفرة</span>
                    </button>
                  )}
                </>
              )}

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="نسخ المحتوى"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Code Content Area */}
        <div className="flex-1 p-4 font-mono text-xs overflow-auto max-h-[600px] leading-relaxed text-slate-200">
          {selectedFile ? (
            isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-full min-h-[450px] bg-slate-950 font-mono text-xs text-amber-200 p-2 border border-amber-500/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            ) : (
              <pre className="whitespace-pre overflow-x-auto text-left" dir="ltr">
                <code>{selectedFile.content}</code>
              </pre>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              اختر ملفاً من القائمة الجانبية لعرض محتواه
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
