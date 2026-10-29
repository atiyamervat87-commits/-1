/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ABQARYNO SELF-HEALING ULTIMATE V3 - Types & Domain Models
 */

export type ProjectStatus = 'draft' | 'analyzing' | 'generated' | 'testing' | 'healthy' | 'error_detected' | 'healing' | 'healed' | 'deployed';

export type FileType = 'typescript' | 'javascript' | 'json' | 'markdown' | 'css' | 'html' | 'yaml';

export interface ProjectFile {
  path: string;
  name: string;
  content: string;
  language: FileType;
  size: number;
  lastModified: number;
  hash: string;
  isReadOnly?: boolean;
}

export interface AcceptanceCriterion {
  id: string;
  title: string;
  given: string;
  when: string;
  then: string;
  status: 'passed' | 'failed' | 'pending';
}

export interface ProjectRequirement {
  id: string;
  category: 'functional' | 'security' | 'reliability' | 'performance';
  title: string;
  description: string;
  acceptanceCriteria: AcceptanceCriterion[];
}

export interface DetectedBug {
  id: string;
  title: string;
  file: string;
  line: number;
  column?: number;
  type: 'runtime_exception' | 'infinite_loop' | 'null_pointer' | 'timeout' | 'security_breach' | 'assertion_failure';
  severity: 'critical' | 'high' | 'medium' | 'low';
  stackTrace: string;
  reproductionScript: string;
  expectedBehavior: string;
  observedBehavior: string;
  evidence: {
    inputPayload?: string;
    environmentVars?: Record<string, string>;
    memoryUsageMB?: number;
    timestamp: number;
  };
}

export type HealingPhaseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface HealingPhase {
  phase: HealingPhaseNumber;
  titleAr: string;
  titleEn: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'skipped' | 'waiting_approval';
  startedAt?: number;
  completedAt?: number;
  output?: string;
  details?: Record<string, any>;
}

export interface ProposedPatch {
  id: string;
  bugId: string;
  filePath: string;
  originalCode: string;
  patchedCode: string;
  explanation: string;
  diffSummary: {
    addedLines: number;
    removedLines: number;
  };
  fileHashBeforePatch: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'applied' | 'reverted';
  preventiveTestCode: string;
  confidenceScore: number;
}

export interface RestorePoint {
  id: string;
  name: string;
  reason: string;
  createdAt: number;
  createdBy: string;
  snapshotHash: string;
  files: {
    path: string;
    content: string;
    hash: string;
  }[];
  activeBugId?: string;
}

export interface AuditLogEntry {
  id: string;
  index: number;
  timestamp: number;
  actor: string;
  action: string;
  actionType: 'SCAN' | 'REPRODUCE' | 'PATCH_PROPOSED' | 'PATCH_APPROVED' | 'PATCH_REJECTED' | 'PATCH_APPLIED' | 'ROLLBACK' | 'TEST_RUN' | 'CHECKPOINT' | 'EXPORT' | 'SECURITY';
  details: string;
  metadata?: Record<string, any>;
  previousHash: string;
  entryHash: string;
}

export interface TestCase {
  id: string;
  num: number;
  nameAr: string;
  nameEn: string;
  category: 'core' | 'self_healing' | 'security' | 'reliability' | 'export';
  description: string;
  status: 'idle' | 'running' | 'passed' | 'failed' | 'skipped';
  durationMs?: number;
  error?: string;
  output?: string;
  runAt?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  version: string;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;
  files: ProjectFile[];
  requirements: ProjectRequirement[];
  activeBug?: DetectedBug | null;
  currentPatch?: ProposedPatch | null;
  activeHealingPhase: HealingPhaseNumber;
  healingPhases: Record<HealingPhaseNumber, HealingPhase>;
  restorePoints: RestorePoint[];
  autoApprovePatches: boolean;
  deployedUrl?: string;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  recipients: string[];
  frequency: 'immediate' | 'hourly' | 'daily';
  triggers: {
    onSelfHealingSuccess: boolean;
    onTestFailure: boolean;
    onTamperDetected: boolean;
    onDailyDigest: boolean;
  };
  smtpConfig: {
    host: string;
    port: number;
    senderName: string;
    senderEmail: string;
  };
}

export interface EmailDispatchLog {
  id: string;
  timestamp: number;
  recipient: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  status: 'delivered' | 'queued' | 'failed';
  triggerReason: string;
  deliveryTimeMs: number;
}

export interface SystemHealth {
  status: 'optimal' | 'warning' | 'degraded';
  cpuLoadPercent: number;
  memoryUsedMB: number;
  memoryTotalMB: number;
  latencyMs: number;
  sandboxPathSecurity: 'enforced' | 'compromised';
  auditTrailIntegrity: 'verified' | 'tampered';
  activeEngines: {
    codeGenerator: boolean;
    testRunner: boolean;
    selfHealing: boolean;
    auditLedger: boolean;
    restoreManager: boolean;
  };
}

export type KnowledgeDomainType =
  | 'law_egyptian'
  | 'mathematics_logic'
  | 'physics_chemistry_biology'
  | 'medicine_health'
  | 'engineering_systems'
  | 'computer_science_ai'
  | 'cybersecurity'
  | 'economics_management'
  | 'history_languages'
  | 'education_social'
  | 'agriculture_environment'
  | 'professional_applied';

export interface IronMemoryItem {
  id: string;
  category: 'project' | 'experience' | 'fact' | 'law' | 'healed_bug' | 'user_pref';
  domain: KnowledgeDomainType;
  domainLabelAr: string;
  title: string;
  content: string;
  sourceCitation: string;
  legalArticleRef?: string;
  confidenceScore: number;
  isVerifiedFact: boolean;
  timestamp: number;
  tags: string[];
  hash: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'abqaryno_mind';
  text: string;
  timestamp: number;
  sourceType?: 'iron_memory' | 'lm_inference' | 'tool_execution' | 'rag_citation';
  sourceDetails?: string;
  confidence?: number;
  tokensUsed?: number;
  latencyMs?: number;
}

export interface AbqarynoLMConfig {
  modelName: string;
  targetParameters: number;
  layers: number;
  hiddenDim: number;
  attentionHeads: number;
  vocabSize: number;
  contextWindow: number;
  quantization: 'FP32' | 'FP16' | 'INT8' | 'Q4_K_M';
  inferenceMode: 'local_neural_kernel' | 'ollama_gpu_endpoint' | 'vllm_gpu_endpoint';
  customEndpointUrl: string;
  apiKey?: string;
  temperature: number;
  topK: number;
}

export interface TokenizerResult {
  tokens: string[];
  tokenIds: number[];
  tokenCount: number;
  charCount: number;
  compressionRatio: number;
}



