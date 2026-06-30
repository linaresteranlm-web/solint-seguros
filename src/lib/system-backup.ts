"use client";

import { SOLINT_STORAGE_KEYS } from "@/lib/storage-keys";
import { DEFAULT_TRAMA_SETTINGS } from "@/lib/trama-settings";
import { ProcessHistoryItem } from "@/lib/process-history";

export type SolintBackupFile = {
  metadata: {
    app: "SOLINT Business Systems";
    module: "SCTR & VidaLey Manager";
    version: string;
    exportedAt: string;
  };
  data: {
    tramaSettings: unknown;
    processHistory: ProcessHistoryItem[];
  };
};

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function buildSystemBackup(): SolintBackupFile {
  const tramaSettings = safeJsonParse(
    localStorage.getItem(SOLINT_STORAGE_KEYS.tramaSettings),
    DEFAULT_TRAMA_SETTINGS
  );

  const processHistory = safeJsonParse<ProcessHistoryItem[]>(
    localStorage.getItem(SOLINT_STORAGE_KEYS.processHistory),
    []
  );

  return {
    metadata: {
      app: "SOLINT Business Systems",
      module: "SCTR & VidaLey Manager",
      version: "2.5 Enterprise",
      exportedAt: new Date().toISOString(),
    },
    data: {
      tramaSettings,
      processHistory,
    },
  };
}

export function downloadSystemBackup() {
  const backup = buildSystemBackup();

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const timestamp = new Date()
    .toISOString()
    .replaceAll(":", "-")
    .replaceAll(".", "-");

  link.href = url;
  link.download = `SOLINT_BACKUP_${timestamp}.json`;

  document.body.appendChild(link);
  link.click();

  link.remove();
  URL.revokeObjectURL(url);
}

export async function readBackupFile(file: File): Promise<SolintBackupFile> {
  const text = await file.text();
  const parsed = JSON.parse(text) as SolintBackupFile;

  if (parsed?.metadata?.app !== "SOLINT Business Systems") {
    throw new Error("El archivo no parece ser un backup válido de SOLINT.");
  }

  if (!parsed.data) {
    throw new Error("El backup no contiene información restaurable.");
  }

  return parsed;
}

export function restoreSystemBackup(backup: SolintBackupFile) {
  localStorage.setItem(
    SOLINT_STORAGE_KEYS.tramaSettings,
    JSON.stringify(backup.data.tramaSettings ?? DEFAULT_TRAMA_SETTINGS)
  );

  localStorage.setItem(
    SOLINT_STORAGE_KEYS.processHistory,
    JSON.stringify(backup.data.processHistory ?? [])
  );
}

export function clearLocalSystemData() {
  localStorage.removeItem(SOLINT_STORAGE_KEYS.tramaSettings);
  localStorage.removeItem(SOLINT_STORAGE_KEYS.processHistory);
}

export function getBackupStats() {
  const processHistory = safeJsonParse<ProcessHistoryItem[]>(
    localStorage.getItem(SOLINT_STORAGE_KEYS.processHistory),
    []
  );

  const hasSettings = Boolean(
    localStorage.getItem(SOLINT_STORAGE_KEYS.tramaSettings)
  );

  return {
    historyCount: processHistory.length,
    hasSettings,
  };
}
