"use client";

import { AnalyticsDataset } from "@/lib/analytics/types";
import { runPeopleAnalytics } from "@/lib/analytics/people-analytics-engine";
import {
  normalizeDataGeneralRow,
  normalizeDataGeneralRows,
} from "@/lib/analytics/data-general-adapter";

export type PeopleFilters = {
  sede: string;
  area: string;
  cargo: string;
  estado: string;
  departamento: string;
  provincia: string;
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
  totalAreas: number;
  totalDepartamentos: number;
  estadoDistribution: RankingItem[];
  sedeRanking: RankingItem[];
  cargoRanking: RankingItem[];
  areaRanking: RankingItem[];
  departamentoRanking: RankingItem[];
};

export const EMPTY_PEOPLE_FILTERS: PeopleFilters = {
  sede: "TODOS",
  area: "TODOS",
  cargo: "TODOS",
  estado: "TODOS",
  departamento: "TODOS",
  provincia: "TODOS",
};

function text(value: unknown) {
  return String(value ?? "").trim();
}

function matchesFilter(value: unknown, filter: string) {
  if (filter === "TODOS") return true;

  return text(value).toLowerCase() === filter.toLowerCase();
}

export function uniqueValues(dataset: AnalyticsDataset, normalizedColumn: keyof ReturnType<typeof normalizeDataGeneralRow>) {
  const values = new Set<string>();

  dataset.rows.forEach((row) => {
    const normalized = normalizeDataGeneralRow(row);
    const value = text(normalized[normalizedColumn]);

    if (value) values.add(value);
  });

  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

function buildRanking(
  rows: ReturnType<typeof normalizeDataGeneralRows>,
  column: keyof ReturnType<typeof normalizeDataGeneralRow>,
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
      percentage:
        rows.length > 0 ? Number(((total / rows.length) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function buildPeopleDashboard(
  dataset: AnalyticsDataset,
  filters: PeopleFilters
): PeopleDashboardResult {
  const normalizedRows = normalizeDataGeneralRows(dataset.rows);

  const filteredOriginalRows = dataset.rows.filter((row, index) => {
    const normalized = normalizedRows[index];

    return (
      matchesFilter(normalized.Sede, filters.sede) &&
      matchesFilter(normalized.Area, filters.area) &&
      matchesFilter(normalized.Cargo, filters.cargo) &&
      matchesFilter(normalized.Estado, filters.estado) &&
      matchesFilter(normalized.Departamento, filters.departamento) &&
      matchesFilter(normalized.Provincia, filters.provincia)
    );
  });

  const filteredNormalizedRows = filteredOriginalRows.map(normalizeDataGeneralRow);

  const filteredDataset: AnalyticsDataset = {
    ...dataset,
    id: `${dataset.id}-filtered`,
    rows: filteredOriginalRows,
  };

  return {
    filteredDataset,
    analytics: runPeopleAnalytics(filteredDataset),
    totalRows: filteredOriginalRows.length,
    totalSedes: new Set(filteredNormalizedRows.map((row) => row.Sede).filter(Boolean)).size,
    totalCargos: new Set(filteredNormalizedRows.map((row) => row.Cargo).filter(Boolean)).size,
    totalAreas: new Set(filteredNormalizedRows.map((row) => row.Area).filter(Boolean)).size,
    totalDepartamentos: new Set(
      filteredNormalizedRows.map((row) => row.Departamento).filter(Boolean)
    ).size,
    estadoDistribution: buildRanking(filteredNormalizedRows, "Estado", 10),
    sedeRanking: buildRanking(filteredNormalizedRows, "Sede", 8),
    cargoRanking: buildRanking(filteredNormalizedRows, "Cargo", 8),
    areaRanking: buildRanking(filteredNormalizedRows, "Area", 8),
    departamentoRanking: buildRanking(filteredNormalizedRows, "Departamento", 8),
  };
}
