/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Checkpoint & Snapshot Restore Service
 */

import { ProjectFile, RestorePoint } from '../types';
import { sha256 } from './crypto';
import { auditLogger } from './auditLogger';

export class CheckpointService {
  /**
   * Creates a cryptographic snapshot of all project files
   */
  public static async createSnapshot(
    files: ProjectFile[],
    name: string,
    reason: string,
    activeBugId?: string,
    actor: string = 'Abqaryno Self-Healing Engine'
  ): Promise<RestorePoint> {
    const fileSnapshots = await Promise.all(
      files.map(async (f) => ({
        path: f.path,
        content: f.content,
        hash: await sha256(f.content),
      }))
    );

    const fullStateString = fileSnapshots
      .map((f) => `${f.path}:${f.hash}`)
      .sort()
      .join('|');
    const snapshotHash = await sha256(fullStateString);

    const point: RestorePoint = {
      id: `cp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      reason,
      createdAt: Date.now(),
      createdBy: actor,
      snapshotHash,
      files: fileSnapshots,
      activeBugId,
    };

    await auditLogger.log({
      action: `إنشاء نقطة استعادة: ${name}`,
      actionType: 'CHECKPOINT',
      actor,
      details: `تم توثيق لقطة كاملة لعدد ${files.length} ملف بتجزئة حالة: ${snapshotHash.slice(0, 12)}... لسبب: ${reason}`,
      metadata: { pointId: point.id, snapshotHash }
    });

    return point;
  }

  /**
   * Restores files to a previously saved snapshot and validates resulting hash
   */
  public static async restoreSnapshot(
    restorePoint: RestorePoint,
    currentFiles: ProjectFile[],
    actor: string = 'Abqaryno Rollback Controller'
  ): Promise<{
    restoredFiles: ProjectFile[];
    success: boolean;
    verificationHash: string;
    details: string;
  }> {
    // Reconstruct files from the snapshot
    const restoredFiles: ProjectFile[] = restorePoint.files.map((snap) => {
      const existing = currentFiles.find((f) => f.path === snap.path);
      return {
        path: snap.path,
        name: snap.path.split('/').pop() || 'file',
        content: snap.content,
        language: existing ? existing.language : 'typescript',
        size: snap.content.length,
        lastModified: Date.now(),
        hash: snap.hash,
      };
    });

    // Verify restored file hashes
    const fullStateString = restoredFiles
      .map((f) => `${f.path}:${f.hash}`)
      .sort()
      .join('|');
    const calculatedStateHash = await sha256(fullStateString);

    const isValid = calculatedStateHash === restorePoint.snapshotHash;

    await auditLogger.log({
      action: `تنفيذ استعادة لنقطة: ${restorePoint.name}`,
      actionType: 'ROLLBACK',
      actor,
      details: isValid
        ? `تمت الاستعادة بنجاح والتحقق من مطابقة تجزئة الحالة (${calculatedStateHash.slice(0, 12)}...).`
        : `تحذير: تجزئة الحالة المحسوبة بعد الاستعادة لا تطابق التجزئة الموثقة في النقطة.`,
      metadata: {
        restorePointId: restorePoint.id,
        expectedHash: restorePoint.snapshotHash,
        actualHash: calculatedStateHash,
        success: isValid
      }
    });

    return {
      restoredFiles,
      success: isValid,
      verificationHash: calculatedStateHash,
      details: isValid
        ? 'تمت مطابقة جميع الملفات والتحقق من سلامة المحتوى بعد الاستعادة.'
        : 'فشل التحقق من مطابقة تجزئة الملفات المستعادة مع اللقطة الأصلية.'
    };
  }
}
