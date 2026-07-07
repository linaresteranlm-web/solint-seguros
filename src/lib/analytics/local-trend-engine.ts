"use client";

import { AnalyticsResult } from "@/lib/analytics/types";
import { PeopleDashboardResult } from "@/lib/analytics/people-dashboard-engine";
import { PeopleIntelligenceResult } from "@/lib/analytics/people-intelligence-engine";
import { buildExecutiveCommandCenter } from "@/lib/analytics/executive-command-engine";

const SNAPSHOT_KEY = "solint_analytics_people_last_snapshot";

export type PeopleSnapshot = {
  id: string;
  createdAt: string;
  source: string;
  headcount: number;
  exits: number;
  rotation: number;
  healthScore: number;
  executiveScore: number;
  stabilityIndex: number;
  totalRows: number;
};

export type TrendItem = {
  label: string;
  current: number;
  previous: number | null;
  variation: number | null;
  direction: "up" | "down" | "flat" | "new";
  interpretation: string;
};

export type LocalTrendResult = {
  currentSnapshot: PeopleSnapshot;
  previousSnapshot: PeopleSnapshot | null;
  trends: TrendItem[];
};

function kpiNumber(result: AnalyticsResult, id: string) {
  return Number(result.kpis.find((kpi) => kpi.id === id)?.value ?? 0);
}

export function buildPeopleSnapshot(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  intelligence: PeopleIntelligenceResult;
}): PeopleSnapshot {
  const { result, dashboard, intelligence } = params;
  const executive = buildExecutiveCommandCenter({ result, dashboard, intelligence });

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    source: result.metadata.source,
    headcount: kpiNumber(result, "headcount"),
    exits: kpiNumber(result, "exits"),
    rotation: kpiNumber(result, "rotation"),
    healthScore: intelligence.organizationalHealthScore,
    executiveScore: executive.executiveScore,
    stabilityIndex: intelligence.stabilityIndex,
    totalRows: dashboard.totalRows,
  };
}

export function getLastPeopleSnapshot(): PeopleSnapshot | null {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);

    if (!raw) return null;

    return JSON.parse(raw) as PeopleSnapshot;
  } catch {
    return null;
  }
}

export function saveLastPeopleSnapshot(snapshot: PeopleSnapshot) {
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
}

function buildTrend(
  label: string,
  current: number,
  previous: number | null,
  higherIsGood: boolean
): TrendItem {
  if (previous === null) {
    return {
      label,
      current,
      previous,
      variation: null,
      direction: "new",
      interpretation: "Primera medición disponible para este indicador.",
    };
  }

  const variation = Number((current - previous).toFixed(2));
  const direction = variation > 0 ? "up" : variation < 0 ? "down" : "flat";

  let interpretation = "El indicador se mantiene estable respecto a la carga anterior.";

  if (variation !== 0) {
    const improved =
      (higherIsGood && variation > 0) || (!higherIsGood && variation < 0);

    interpretation = improved
      ? `${label} mejoró respecto a la carga anterior.`
      : `${label} presenta deterioro respecto a la carga anterior.`;
  }

  return {
    label,
    current,
    previous,
    variation,
    direction,
    interpretation,
  };
}

export function buildLocalTrends(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  intelligence: PeopleIntelligenceResult;
}): LocalTrendResult {
  const currentSnapshot = buildPeopleSnapshot(params);
  const previousSnapshot = getLastPeopleSnapshot();

  return {
    currentSnapshot,
    previousSnapshot,
    trends: [
      buildTrend(
        "Headcount",
        currentSnapshot.headcount,
        previousSnapshot?.headcount ?? null,
        true
      ),
      buildTrend(
        "Ceses",
        currentSnapshot.exits,
        previousSnapshot?.exits ?? null,
        false
      ),
      buildTrend(
        "Rotación",
        currentSnapshot.rotation,
        previousSnapshot?.rotation ?? null,
        false
      ),
      buildTrend(
        "Health Score",
        currentSnapshot.healthScore,
        previousSnapshot?.healthScore ?? null,
        true
      ),
      buildTrend(
        "Executive Score",
        currentSnapshot.executiveScore,
        previousSnapshot?.executiveScore ?? null,
        true
      ),
      buildTrend(
        "Estabilidad",
        currentSnapshot.stabilityIndex,
        previousSnapshot?.stabilityIndex ?? null,
        true
      ),
    ],
  };
}
