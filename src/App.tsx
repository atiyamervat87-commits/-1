/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ABQARYNO SELF-HEALING ULTIMATE V3 - Main Application
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SystemHealthBar } from './components/SystemHealthBar';
import { SelfHealingWorkflow } from './components/SelfHealingWorkflow';
import { FileTreeExplorer } from './components/FileTreeExplorer';
import { TestRunnerView } from './components/TestRunnerView';
import { AuditLogView } from './components/AuditLogView';
import { RestorePointsView } from './components/RestorePointsView';
import { DeploymentView } from './components/DeploymentView';
import { RequirementsView } from './components/RequirementsView';
import { ExportView } from './components/ExportView';
import { PatchDiffModal } from './components/PatchDiffModal';
import { IdeaToProjectModal } from './components/IdeaToProjectModal';
import { NotificationSettingsView } from './components/NotificationSettingsView';
import { AbqarynoMindChatView } from './components/AbqarynoMindChatView';
import { IronMemoryView } from './components/IronMemoryView';
import { LMStudioView } from './components/LMStudioView';

import { Project, TestCase, AuditLogEntry, SystemHealth, HealingPhaseNumber, RestorePoint } from './types';
import { createInitialSeedProject, generateProjectFromIdea } from './services/projectEngine';
import { TestRunnerService, MANDATORY_TEST_SPECS } from './services/testRunner';
import { SelfHealingEngineService } from './services/selfHealingEngine';
import { CheckpointService } from './services/checkpointService';
import { auditLogger } from './services/auditLogger';
import { ZipExporterService } from './services/zipExporter';
import { notificationService } from './services/notificationService';


export default function App() {
  // 1. Projects State
  const [project, setProject] = useState<Project>(() => createInitialSeedProject());

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<string>('self_healing');

  // 3. Tests State (22 Mandatory Suites)
  const [testCases, setTestCases] = useState<TestCase[]>(() =>
    MANDATORY_TEST_SPECS.map(s => ({
      ...s,
      status: 'idle'
    }))
  );
  const [isRunningAllTests, setIsRunningAllTests] = useState(false);
  const [runningTestId, setRunningTestId] = useState<string | null>(null);

  // 4. Audit Log State
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>(() => auditLogger.getEntries());
  const [auditVerificationResult, setAuditVerificationResult] = useState<{
    isValid: boolean;
    totalEntries: number;
    errorReason?: string;
  } | null>(null);

  // 5. Self-Healing Execution State
  const [isRunningPhase, setIsRunningPhase] = useState(false);
  const [currentRunningPhaseNum, setCurrentRunningPhaseNum] = useState<HealingPhaseNumber | null>(null);
  const [lastReproductionLog, setLastReproductionLog] = useState<string>('');

  // 6. Modals State
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isRestoringPoint, setIsRestoringPoint] = useState(false);

  // 7. System Health State
  const [health, setHealth] = useState<SystemHealth>({
    status: 'optimal',
    cpuLoadPercent: 14,
    memoryUsedMB: 142,
    memoryTotalMB: 1024,
    latencyMs: 18,
    sandboxPathSecurity: 'enforced',
    auditTrailIntegrity: 'verified',
    activeEngines: {
      codeGenerator: true,
      testRunner: true,
      selfHealing: true,
      auditLedger: true,
      restoreManager: true,
    }
  });

  // Subscribe to audit logger updates
  useEffect(() => {
    const unsubscribe = auditLogger.subscribe((entries) => {
      setAuditEntries(entries);
    });
    return unsubscribe;
  }, []);

  // Periodic subtle telemetry update
  useEffect(() => {
    const timer = setInterval(() => {
      setHealth(prev => ({
        ...prev,
        cpuLoadPercent: Math.floor(10 + Math.random() * 12),
        latencyMs: Math.floor(15 + Math.random() * 8)
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Initial audit verification
  useEffect(() => {
    auditLogger.verifyIntegrity().then(setAuditVerificationResult);
  }, []);

  // Handlers for Self Healing
  const handleRunPhase = async (phaseNum: HealingPhaseNumber) => {
    setIsRunningPhase(true);
    setCurrentRunningPhaseNum(phaseNum);

    try {
      if (phaseNum === 1) {
        const { updatedPhases, detectedBug } = await SelfHealingEngineService.executePhase1Scan(project);
        setProject(prev => ({
          ...prev,
          healingPhases: updatedPhases,
          activeBug: detectedBug,
          activeHealingPhase: 2
        }));
      } else if (phaseNum === 2) {
        const { updatedPhases, bug } = await SelfHealingEngineService.executePhase2Localization(project);
        setProject(prev => ({
          ...prev,
          healingPhases: updatedPhases,
          activeBug: bug,
          activeHealingPhase: 3
        }));
      } else if (phaseNum === 3) {
        // CRITICAL BUTTON: Run Bug Reproduction Harness
        const { updatedPhases, reproductionLog } = await SelfHealingEngineService.executePhase3Reproduction(project);
        setLastReproductionLog(reproductionLog);

        // Also synthesize patch automatically to transition to phase 4
        const { updatedPhases: p4Phases, patch } = await SelfHealingEngineService.executePhase4PatchSynthesis({
          ...project,
          healingPhases: updatedPhases
        });

        // Also take snapshot (Phase 5) automatically to ensure security
        const { updatedPhases: p5Phases, restorePoint } = await SelfHealingEngineService.executePhase5Snapshot({
          ...project,
          currentPatch: patch,
          healingPhases: p4Phases
        });

        setProject(prev => ({
          ...prev,
          healingPhases: p5Phases,
          currentPatch: patch,
          restorePoints: [restorePoint, ...prev.restorePoints],
          activeHealingPhase: 6
        }));

        // Open diff modal for explicit developer review and approval
        setIsDiffModalOpen(true);
      } else if (phaseNum === 4) {
        const { updatedPhases, patch } = await SelfHealingEngineService.executePhase4PatchSynthesis(project);
        setProject(prev => ({
          ...prev,
          healingPhases: updatedPhases,
          currentPatch: patch,
          activeHealingPhase: 5
        }));
      } else if (phaseNum === 5) {
        const { updatedPhases, restorePoint } = await SelfHealingEngineService.executePhase5Snapshot(project);
        setProject(prev => ({
          ...prev,
          healingPhases: updatedPhases,
          restorePoints: [restorePoint, ...prev.restorePoints],
          activeHealingPhase: 6
        }));
        setIsDiffModalOpen(true);
      } else if (phaseNum === 6) {
        setIsDiffModalOpen(true);
      } else if (phaseNum >= 7) {
        const { updatedProject, success } = await SelfHealingEngineService.executePhase7Through10(project);
        setProject(updatedProject);
        if (success) {
          // Re-run test 11 & test 16 & test 17 to reflect green passes
          handleRunSingleTest('test_11');
          handleRunSingleTest('test_16');
          handleRunSingleTest('test_17');
        }
      }
    } catch (e: any) {
      console.error('Phase execution failed', e);
      await auditLogger.log({
        action: `فشل تنفيذ المرحلة #${phaseNum}`,
        actionType: 'SECURITY',
        actor: 'SelfHealingEngine',
        details: `خطأ أثناء التنفيذ: ${e.message}`
      });
    } finally {
      setIsRunningPhase(false);
      setCurrentRunningPhaseNum(null);
    }
  };

  // Full 10-Phase Automation Cycle
  const handleRunFullCycle = async () => {
    setIsRunningPhase(true);
    try {
      // Step 1: Scan
      const p1 = await SelfHealingEngineService.executePhase1Scan(project);
      // Step 2: Localize
      const p2 = await SelfHealingEngineService.executePhase2Localization({ ...project, healingPhases: p1.updatedPhases });
      // Step 3: Reproduce
      const p3 = await SelfHealingEngineService.executePhase3Reproduction({ ...project, healingPhases: p2.updatedPhases, activeBug: p2.bug });
      setLastReproductionLog(p3.reproductionLog);
      // Step 4: Patch Synthesis
      const p4 = await SelfHealingEngineService.executePhase4PatchSynthesis({ ...project, healingPhases: p3.updatedPhases });
      // Step 5: Snapshot
      const p5 = await SelfHealingEngineService.executePhase5Snapshot({ ...project, currentPatch: p4.patch, healingPhases: p4.updatedPhases });

      // Step 6: Approval
      const p6 = await SelfHealingEngineService.handlePhase6Approval({ ...project, currentPatch: p4.patch, healingPhases: p5.updatedPhases }, true);

      // Step 7-10: Apply, Verify, Audit, Preventive
      const p7to10 = await SelfHealingEngineService.executePhase7Through10({
        ...project,
        healingPhases: p6.updatedPhases,
        currentPatch: p6.patch,
        restorePoints: [p5.restorePoint, ...project.restorePoints]
      });

      setProject(p7to10.updatedProject);

      // Automated email dispatch on self-healing success if enabled
      if (p7to10.success && notificationService.getSettings().enabled && notificationService.getSettings().triggers.onSelfHealingSuccess) {
        notificationService.dispatchToAllRecipients(
          (recipient) => notificationService.generateHealingReportTemplate(p7to10.updatedProject, recipient, p7to10.report),
          'اكتمال دورة الإصلاح الذاتي بنجاح وتأمين كود المشروع'
        );
      }

      // Refresh test cases
      await handleRunAllTests();
    } catch (err: any) {
      console.error('Error running full cycle', err);
    } finally {
      setIsRunningPhase(false);
      setCurrentRunningPhaseNum(null);
    }
  };

  // Patch Approval Gate
  const handleApprovePatch = async () => {
    setIsDiffModalOpen(false);
    setIsRunningPhase(true);
    try {
      const { updatedPhases, patch } = await SelfHealingEngineService.handlePhase6Approval(project, true);
      const intermediateProject = { ...project, healingPhases: updatedPhases, currentPatch: patch };

      const { updatedProject, success, report } = await SelfHealingEngineService.executePhase7Through10(intermediateProject);
      setProject(updatedProject);

      if (success) {
        // Automated email dispatch on self-healing success
        if (notificationService.getSettings().enabled && notificationService.getSettings().triggers.onSelfHealingSuccess) {
          notificationService.dispatchToAllRecipients(
            (recipient) => notificationService.generateHealingReportTemplate(updatedProject, recipient, report),
            'تطبيق رقعة الإصلاح واجتياز اختبارات التحقق بنجاح'
          );
        }

        handleRunSingleTest('test_11');
        handleRunSingleTest('test_16');
        handleRunSingleTest('test_17');
      }
    } finally {
      setIsRunningPhase(false);
    }
  };

  const handleRejectPatch = async () => {
    setIsDiffModalOpen(false);
    const { updatedPhases, patch } = await SelfHealingEngineService.handlePhase6Approval(project, false);
    setProject(prev => ({
      ...prev,
      healingPhases: updatedPhases,
      currentPatch: patch
    }));
  };

  // Automated Tests Handlers
  const handleRunSingleTest = async (testId: string) => {
    setRunningTestId(testId);
    try {
      const updated = await TestRunnerService.executeTest(testId, project);
      setTestCases(prev => prev.map(t => t.id === testId ? updated : t));
    } finally {
      setRunningTestId(null);
    }
  };

  const handleRunAllTests = async () => {
    setIsRunningAllTests(true);
    const results: TestCase[] = [];

    for (const t of testCases) {
      setTestCases(prev => prev.map(x => x.id === t.id ? { ...x, status: 'running' } : x));
      const res = await TestRunnerService.executeTest(t.id, project);
      results.push(res);
      setTestCases(prev => prev.map(x => x.id === t.id ? res : x));
    }

    setIsRunningAllTests(false);
  };

  // Audit Verification & Tamper Simulation
  const handleVerifyAudit = async () => {
    const res = await auditLogger.verifyIntegrity();
    setAuditVerificationResult(res);
  };

  const handleSimulateTamper = async () => {
    const entries = auditLogger.getEntries();
    if (entries.length > 0) {
      auditLogger.simulateTamper(entries.length - 1, 'تعديل خبيث لاختبار كشف التلاعب (Simulation Attack)');
      const res = await auditLogger.verifyIntegrity();
      setAuditVerificationResult(res);
    }
  };

  // Snapshot Creation & Rollback
  const handleCreateSnapshot = async (name: string, reason: string) => {
    const snap = await CheckpointService.createSnapshot(project.files, name, reason, project.activeBug?.id, 'User');
    setProject(prev => ({
      ...prev,
      restorePoints: [snap, ...prev.restorePoints]
    }));
  };

  const handleRestoreSnapshot = async (point: RestorePoint) => {
    setIsRestoringPoint(true);
    try {
      const res = await CheckpointService.restoreSnapshot(point, project.files, 'User');
      if (res.success) {
        setProject(prev => ({
          ...prev,
          files: res.restoredFiles,
          activeBug: point.activeBugId ? prev.activeBug : null
        }));
      }
    } finally {
      setIsRestoringPoint(false);
    }
  };

  // ZIP Export Handler
  const handleExportZip = async () => {
    setIsExportingZip(true);
    try {
      const res = await ZipExporterService.exportProjectPackage(project, testCases);
      ZipExporterService.triggerBrowserDownload(res.downloadUrl, res.fileName);
    } finally {
      setIsExportingZip(false);
    }
  };

  // New Project Generator
  const handleGenerateProject = (idea: string, category: string, complexity: 'simple' | 'medium' | 'advanced') => {
    const newProj = generateProjectFromIdea(idea, category, complexity);
    setProject(newProj);
    setActiveTab('code_files');
    auditLogger.log({
      action: `توليد مشروع جديد من فكرة المستخدم`,
      actionType: 'SCAN',
      actor: 'Project Generator',
      details: `تم بناء المشروع ${newProj.name} (${newProj.files.length} ملفات) وفق تصنيف: ${category} ومستوى: ${complexity}`
    });
  };

  // Update file content in code editor
  const handleUpdateFileContent = (path: string, newContent: string) => {
    setProject(prev => ({
      ...prev,
      files: prev.files.map(f => f.path === path ? { ...f, content: newContent, size: newContent.length, lastModified: Date.now() } : f)
    }));
  };

  const devUrl = 'https://ais-dev-ob3d25g6m7hr5kjpzxwt7r-54187893681.europe-west3.run.app';
  const preUrl = 'https://ais-pre-ob3d25g6m7hr5kjpzxwt7r-54187893681.europe-west3.run.app';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif]">

      {/* Top Header */}
      <Header
        currentProject={project}
        onOpenNewProjectModal={() => setIsIdeaModalOpen(true)}
        onExportZip={handleExportZip}
        onRefreshHealth={() => auditLogger.verifyIntegrity().then(setAuditVerificationResult)}
        isExporting={isExportingZip}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Live System Health Bar */}
      <SystemHealthBar
        health={health}
        auditChainValid={auditVerificationResult?.isValid ?? true}
        onVerifyAudit={handleVerifyAudit}
      />

      {/* Main Tab Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {activeTab === 'mind_chat' && (
          <AbqarynoMindChatView />
        )}

        {activeTab === 'iron_memory' && (
          <IronMemoryView />
        )}

        {activeTab === 'lm_studio' && (
          <LMStudioView />
        )}

        {activeTab === 'self_healing' && (
          <SelfHealingWorkflow
            project={project}
            onRunPhase={handleRunPhase}
            onRunFullCycle={handleRunFullCycle}
            onOpenDiffModal={() => setIsDiffModalOpen(true)}
            isRunningPhase={isRunningPhase}
            currentRunningPhaseNum={currentRunningPhaseNum}
            lastReproductionLog={lastReproductionLog}
          />
        )}

        {activeTab === 'code_files' && (
          <FileTreeExplorer
            files={project.files}
            onUpdateFileContent={handleUpdateFileContent}
          />
        )}

        {activeTab === 'test_runner' && (
          <TestRunnerView
            testCases={testCases}
            onRunTest={handleRunSingleTest}
            onRunAllTests={handleRunAllTests}
            isRunningAll={isRunningAllTests}
            runningTestId={runningTestId}
          />
        )}

        {activeTab === 'requirements' && (
          <RequirementsView
            requirements={project.requirements}
          />
        )}

        {activeTab === 'checkpoints' && (
          <RestorePointsView
            restorePoints={project.restorePoints}
            onCreateSnapshot={handleCreateSnapshot}
            onRestoreSnapshot={handleRestoreSnapshot}
            isRestoring={isRestoringPoint}
          />
        )}

        {activeTab === 'audit_log' && (
          <AuditLogView
            entries={auditEntries}
            onVerifyIntegrity={handleVerifyAudit}
            onSimulateTamper={handleSimulateTamper}
            verificationResult={auditVerificationResult}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationSettingsView
            project={project}
            health={health}
          />
        )}

        {activeTab === 'deployment' && (
          <DeploymentView
            devUrl={devUrl}
            preUrl={preUrl}
          />
        )}

        {activeTab === 'export_pkg' && (
          <ExportView
            project={project}
            testResults={testCases}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ABQARYNO SELF-HEALING ULTIMATE V3 — عبقرينو المستقل لإنشاء البرامج وإصلاحها ونشرها</span>
          <span className="font-mono text-slate-600">نظام موثق بتجزئة مشفرة SHA-256</span>
        </div>
      </footer>

      {/* Diff Review & Approval Gate Modal */}
      <PatchDiffModal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        patch={project.currentPatch || null}
        onApprove={handleApprovePatch}
        onReject={handleRejectPatch}
      />

      {/* Idea to Project Generator Wizard Modal */}
      <IdeaToProjectModal
        isOpen={isIdeaModalOpen}
        onClose={() => setIsIdeaModalOpen(false)}
        onGenerate={handleGenerateProject}
      />

    </div>
  );
}
