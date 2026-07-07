"use client";

import { AnalyticsDataset } from "@/lib/analytics/types";
import { runPeopleAnalytics } from "@/lib/analytics/people-analytics-engine";

export type PeopleFilters = {
  sede: string;
  cargo: string;
  estado: string;
};

export type RankingItem = {
  label: string;
  total: number;
  percentage: number;
};

export type PeopleDashboardResult = {
  filteredDataset: AnalyticsDataset;
  analytics: ReturnType<typeof runPeopleAnalytics>;
  totalRows: number;
  totalSedes: number;
  totalCargos: number;
  estadoDistribution: RankingItem[];
  sedeRanking: RankingItem[];
  cargoRanking: RankingItem[];
};

export const EMPTY_PEOPLE_FILTERS: PeopleFilters = {
  sede: "TODOS",
  cargo: "TODOS",
  estado: "TODOS",
};

function text(value: unknown) {
  return String(value ?? "").trim();
}

function matchesFilter(value: unknown, filter: string) {
  if (filter === "TODOS") return true;

  return text(value).toLowerCase() === filter.toLowerCase();
}

export function uniqueValues(dataset: AnalyticsDataset, column: string) {
  const values = new Set<string>();

  dataset.rows.forEach((row) => {
    const value = text(row[column]);

    if (value) values.add(value);
  });

  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

function buildRanking(
  rows: Record<string, unknown>[],
  column: string,
  limit = 7
): RankingItem[] {
  const map = new Map<string, number>();

  rows.forEach((row) => {
    const value = text(row[column]) || "Sin dato";

    map.set(value, (map.get(value) ?? 0) + 1);
  });

  return Array.from(map.entries())
    .map(([label, total]) => ({
      label,
      total,
      percentage: rows.length > 0 ? Number(((total / rows.length) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function buildPeopleDashboard(
  dataset: AnalyticsDataset,
  filters: PeopleFilters
): PeopleDashboardResult {
  const filteredRows = dataset.rows.filter((row) => {
    return (
      matchesFilter(row["Sede"], filters.sede) &&
      matchesFilter(row["Cargo"], filters.cargo) &&
      matchesFilter(row["Estado"], filters.estado)
    );
  });

  const filteredDataset: AnalyticsDataset = {
    ...dataset,
    id: `${dataset.id}-filtered`,
    rows: filteredRows,
  };

  return {
    filteredDataset,
    analytics: runPeopleAnalytics(filteredDataset),
    totalRows: filteredRows.length,
    totalSedes: uniqueValues(filteredDataset, "Sede").length,
    totalCargos: uniqueValues(filteredDataset, "Cargo").length,
    estadoDistribution: buildRanking(filteredRows, "Estado", 10),
    sedeRanking: buildRanking(filteredRows, "Sede", 8),
    cargoRanking: buildRanking(filteredRows, "Cargo", 8),
  };
}
