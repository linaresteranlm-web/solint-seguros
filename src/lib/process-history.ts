"use client";

export type ProcessType =
  | "GENERAR_ACUMULADOS"
  | "COMPARAR_TRAMAS"
  | "DESCARGA_ARCHIVO";

export type ProcessHistoryItem = {
  id: string;
  type: ProcessType;
  title: string;
  description: string;
  status: "OK" | "ADVERTENCIA" | "ERROR";
  user: string;
  createdAt: string;
  metrics?: Record<string, number | string>;
};

const STORAGE_KEY = "solint_process_history";

function getCurrentUserName(): string {
  if (typeof window === "undefined") return "Sistema";

  try {
    const raw = localStorage.getItem("solint_user");
    if (!raw) return "Sistema";

    const user = JSON.parse(raw);
    return user?.name ?? user?.username ?? "Sistema";
  } catch {
    return "Sistema";
  }
}

export function addProcessHistory(
  item: Omit<ProcessHistoryItem, "id" | "createdAt" | "user">
) {
  if (typeof window === "undefined") return;

  const current = getProcessHistory();

  const nextItem: ProcessHistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    user: getCurrentUserName(),
  };

  const next = [nextItem, ...current].slice(0, 100);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getProcessHistory(): ProcessHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function clearProcessHistory() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEY);
}

export function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
