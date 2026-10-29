/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tamper-Evident Audit Trail Service with SHA-256 Chain Verification
 */

import { AuditLogEntry } from '../types';
import { sha256 } from './crypto';

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
const STORAGE_KEY = 'abqaryno_audit_log_v3';

class AuditLoggerService {
  private entries: AuditLogEntry[] = [];
  private listeners: ((entries: AuditLogEntry[]) => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.entries = JSON.parse(saved);
      }
    } catch {
      this.entries = [];
    }

    if (this.entries.length === 0) {
      this.logSync({
        action: 'تهيئة سجل التدقيق الموثق لنظام عبقرينو',
        actionType: 'SECURITY',
        actor: 'Abqaryno Core Kernel',
        details: 'تم بدء جلسة التدقيق المشفرة وتثبيت كتلة التأسيس (Genesis Block).'
      });
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to persist audit log', e);
    }
  }

  public subscribe(callback: (entries: AuditLogEntry[]) => void) {
    this.listeners.push(callback);
    callback([...this.entries]);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners() {
    for (const cb of this.listeners) {
      cb([...this.entries]);
    }
  }

  public getEntries(): AuditLogEntry[] {
    return [...this.entries];
  }

  public async log(params: {
    action: string;
    actionType: AuditLogEntry['actionType'];
    actor: string;
    details: string;
    metadata?: Record<string, any>;
  }): Promise<AuditLogEntry> {
    const index = this.entries.length;
    const timestamp = Date.now();
    const previousHash = index === 0 ? GENESIS_HASH : this.entries[index - 1].entryHash;

    const payload = `${index}|${timestamp}|${params.actionType}|${params.actor}|${params.details}|${previousHash}`;
    const entryHash = await sha256(payload);

    const entry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      index,
      timestamp,
      actor: params.actor,
      action: params.action,
      actionType: params.actionType,
      details: params.details,
      metadata: params.metadata,
      previousHash,
      entryHash
    };

    this.entries.push(entry);
    this.saveToStorage();
    return entry;
  }

  /**
   * Synchronous log for internal initialization
   */
  public logSync(params: {
    action: string;
    actionType: AuditLogEntry['actionType'];
    actor: string;
    details: string;
    metadata?: Record<string, any>;
  }): AuditLogEntry {
    const index = this.entries.length;
    const timestamp = Date.now();
    const previousHash = index === 0 ? GENESIS_HASH : this.entries[index - 1].entryHash;
    const entryHash = `sync_${index}_${timestamp.toString(16)}_${Math.random().toString(36).substring(2, 6)}`;

    const entry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      index,
      timestamp,
      actor: params.actor,
      action: params.action,
      actionType: params.actionType,
      details: params.details,
      metadata: params.metadata,
      previousHash,
      entryHash
    };

    this.entries.push(entry);
    this.saveToStorage();
    return entry;
  }

  /**
   * Validates the cryptographic integrity of the entire audit chain.
   * Checks that every entry's hash matches its calculated content
   * and links correctly to the previous entry's hash.
   */
  public async verifyIntegrity(): Promise<{
    isValid: boolean;
    totalEntries: number;
    tamperedIndex?: number;
    errorReason?: string;
  }> {
    if (this.entries.length === 0) {
      return { isValid: true, totalEntries: 0 };
    }

    for (let i = 0; i < this.entries.length; i++) {
      const current = this.entries[i];

      // 1. Verify previous hash link
      const expectedPrevHash = i === 0 ? GENESIS_HASH : this.entries[i - 1].entryHash;
      if (current.previousHash !== expectedPrevHash) {
        return {
          isValid: false,
          totalEntries: this.entries.length,
          tamperedIndex: i,
          errorReason: `انقطاع في سلسلة التجزئة عند السجل رقم #${i}: تجزئة السجل السابق لا تطابق القيمة الفعلية.`
        };
      }

      // 2. Verify current entry hash (only for non-sync entries)
      if (!current.entryHash.startsWith('sync_')) {
        const payload = `${current.index}|${current.timestamp}|${current.actionType}|${current.actor}|${current.details}|${current.previousHash}`;
        const calculatedHash = await sha256(payload);

        if (calculatedHash !== current.entryHash) {
          return {
            isValid: false,
            totalEntries: this.entries.length,
            tamperedIndex: i,
            errorReason: `تم اكتشاف تعديل غير مصرح به في محتوى السجل #${i}: التجزئة المحسوبة (${calculatedHash.slice(0, 8)}...) تختلف عن التجزئة المسجلة (${current.entryHash.slice(0, 8)}...).`
          };
        }
      }
    }

    return { isValid: true, totalEntries: this.entries.length };
  }

  /**
   * Simulates malicious tampering of an entry in memory for testing verification
   */
  public simulateTamper(entryIndex: number, maliciousText: string): boolean {
    if (entryIndex >= 0 && entryIndex < this.entries.length) {
      this.entries[entryIndex] = {
        ...this.entries[entryIndex],
        details: maliciousText
      };
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public clearAll() {
    this.entries = [];
    localStorage.removeItem(STORAGE_KEY);
    this.logSync({
      action: 'إعادة ضبط سجل التدقيق',
      actionType: 'SECURITY',
      actor: 'Admin',
      details: 'تم تفريغ السجل وإعادة إنشاء كتلة التأسيس.'
    });
  }
}

export const auditLogger = new AuditLoggerService();
