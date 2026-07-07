"use client";

import { PeopleSnapshot } from "@/lib/analytics/local-trend-engine";

const SNAPSHOT_HISTORY_KEY = "solint_analytics_people_snapshot_history";

export type SnapshotComparisonMetric = {
  label: string;
  current: number;
  previous: number;
  variation: number;
  direction: "up" | "down" | "flat";
  good: boolean;
};

export type SnapshotComparisonResult = {
  previous: PeopleSnapshot;
  current: PeopleSnapshot;
  metrics: SnapshotComparisonMetric[];
  executiveSummary: string;
};

export function getSnapshotHistory(): PeopleSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOT_HISTORY_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw) as PeopleSnapshot[];

    return parsed.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export function saveSnapshotToHistory(snapshot: PeopleSnapshot) {
  const history = getSnapshotHistory();

  const exists = history.some(
    (item) =>
      item.createdAt === snapshot.createdAt &&
      item.source === snapshot.source &&
      item.totalRows === snapshot.totalRows
  );

  const nextHistory = exists ? history : [snapshot, ...history];

  localStorage.setItem(SNAPSHOT_HISTORY_KEY, JSON.stringify(nextHistory));
}

export function clearSnapshotHistory() {
  localStorage.removeItem(SNAPSHOT_HISTORY_KEY);
}

export function deleteSnapshot(snapshotId: string) {
  const nextHistory = getSnapshotHistory().filter((item) => item.id !== snapshotId);

  localStorage.setItem(SNAPSHOT_HISTORY_KEY, JSON.stringify(nextHistory));
}

export function exportSnapshotJson(snapshot: PeopleSnapshot) {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `SOLINT_PEOPLE_SNAPSHOT_${snapshot.createdAt
    .replace(/[:.]/g, "-")
    .slice(0, 19)}.json`;

  document.body.appendChild(link);
  link.click();

  link.remove();
  URL.revokeObjectURL(url);
}

function buildMetric(
  label: string,
  current: number,
  previous: number,
  higherIsGood: boolean
): SnapshotComparisonMetric {
  const variation = Number((current - previous).toFixed(2));
  const direction = variation > 0 ? "up" : variation < 0 ? "down" : "flat";

  const good =
    direction === "flat"
      ? true
      : (higherIsGood && direction === "up") ||
        (!higherIsGood && direction === "down");

  return {
    label,
    current,
    previous,
    variation,
    direction,
    good,
  };
}

export function compareSnapshots(
  previous: PeopleSnapshot,
  current: PeopleSnapshot
): SnapshotComparisonResult {
  const metrics = [
    buildMetric("Headcount", current.headcount, previous.headcount, true),
    buildMetric("Ceses", current.exits, previous.exits, false),
    buildMetric("Rotación", current.rotation, previous.rotation, false),
    buildMetric("Health Score", current.healthScore, previous.healthScore, true),
    buildMetric("Executive Score", current.executiveScore, previous.executiveScore, true),
    buildMetric("Estabilidad", current.stabilityIndex, previous.stabilityIndex, true),
  ];

  const improved = metrics.filter((item) => item.good && item.direction !== "flat").length;
  const worsened = metrics.filter((item) => !item.good).length;

  const executiveSummary =
    worsened === 0
      ? `La evolución histórica es favorable: ${improved} indicador(es) mejoraron y no se detectan deterioros relevantes.`
      : `La comparación histórica muestra ${worsened} indicador(es) con deterioro. Se recomienda revisar Headcount, rotación y ceses por sede o área.`;

  return {
    previous,
    current,
    metrics,
    executiveSummary,
  };
}

export function formatSnapshotDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
