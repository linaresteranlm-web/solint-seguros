"use client";

import { AnalyticsDataset } from "@/lib/analytics/types";
import {
  NormalizedPeopleRow,
  normalizeDataGeneralRows,
} from "@/lib/analytics/data-general-adapter";

export type RotationMonth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type RotationPeriod = {
  year: number;
  fromMonth: RotationMonth;
  toMonth: RotationMonth;
};

export type RotationMonthlyIndicator = {
  month: RotationMonth;
  monthName: string;
  year: number;
  headcountStart: number;
  headcountEnd: number;
  averageHeadcount: number;
  hires: number;
  exits: number;
  rotationRate: number;
  netChange: number;
};

export type RotationRankingItem = {
  label: string;
  averageHeadcount: number;
  hires: number;
  exits: number;
  rotationRate: number;
  netChange: number;
};

export type RotationAnalysisResult = {
  datasetName: string;
  generatedAt: string;
  period: RotationPeriod;
  monthly: RotationMonthlyIndicator[];
  summary: {
    averageHeadcount: number;
    totalHires: number;
    totalExits: number;
    accumulatedRotation: number;
    netChange: number;
    highestMonth: RotationMonthlyIndicator | null;
    lowestMonth: RotationMonthlyIndicator | null;
  };
  rankings: {
    bySede: RotationRankingItem[];
    byCargo: RotationRankingItem[];
    byArea: RotationRankingItem[];
    byDepartamento: RotationRankingItem[];
  };
  insights: string[];
  conclusions: string[];
  recommendations: string[];
  methodology: string[];
};

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function monthName(month: number) {
  return MONTHS[month - 1] ?? `Mes ${month}`;
}

export function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("es-PE", {
    maximumFractionDigits: 2,
  }).format(value);
}

function parseExcelSerial(value: number) {
  if (value <= 0) return null;

  const date = new Date(Math.round((value - 25569) * 86400 * 1000));

  if (Number.isNaN(date.getTime())) return null;

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parsePeopleDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === "number") {
    return parseExcelSerial(value);
  }

  const text = String(value)
    .trim()
    .replace(/_x000D_/gi, "")
    .replace(/\s+/g, " ");

  if (!text) return null;

  const serial = Number(text);
  if (Number.isFinite(serial) && serial > 20000 && serial < 90000) {
    return parseExcelSerial(serial);
  }

  const firstPart = text.split(" ")[0];
  const parts = firstPart.split(/[/-]/).map((part) => Number(part));

  if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
    const [a, b, c] = parts;

    if (a > 1900) {
      return new Date(a, b - 1, c);
    }

    if (c > 1900) {
      return new Date(c, b - 1, a);
    }
  }

  const nativeDate = new Date(text);

  if (Number.isNaN(nativeDate.getTime())) return null;

  return new Date(
    nativeDate.getFullYear(),
    nativeDate.getMonth(),
    nativeDate.getDate()
  );
}

function startOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1);
}

function endOfMonth(year: number, month: number) {
  return new Date(year, month, 0, 23, 59, 59, 999);
}

function isInMonth(date: Date | null, year: number, month: number) {
  if (!date) return false;

  return date.getFullYear() === year && date.getMonth() + 1 === month;
}

function isEmployeeActiveAt(row: NormalizedPeopleRow, date: Date) {
  const ingreso = parsePeopleDate(row.FechaIngreso);
  const cese = parsePeopleDate(row.FechaCese);

  if (!ingreso) return false;

  const joined = ingreso.getTime() <= date.getTime();
  const notExited = !cese || cese.getTime() > date.getTime();

  return joined && notExited;
}

function buildMonthly(rows: NormalizedPeopleRow[], period: RotationPeriod) {
  const months: RotationMonthlyIndicator[] = [];

  for (let month = period.fromMonth; month <= period.toMonth; month += 1) {
    const start = startOfMonth(period.year, month);
    const end = endOfMonth(period.year, month);

    const headcountStart = rows.filter((row) => isEmployeeActiveAt(row, start)).length;
    const headcountEnd = rows.filter((row) => isEmployeeActiveAt(row, end)).length;
    const averageHeadcount = Number(((headcountStart + headcountEnd) / 2).toFixed(2));
    const hires = rows.filter((row) => isInMonth(parsePeopleDate(row.FechaIngreso), period.year, month)).length;
    const exits = rows.filter((row) => isInMonth(parsePeopleDate(row.FechaCese), period.year, month)).length;
    const rotationRate = averageHeadcount > 0 ? Number(((exits / averageHeadcount) * 100).toFixed(2)) : 0;

    months.push({
      month: month as RotationMonth,
      monthName: monthName(month),
      year: period.year,
      headcountStart,
      headcountEnd,
      averageHeadcount,
      hires,
      exits,
      rotationRate,
      netChange: hires - exits,
    });
  }

  return months;
}

function buildGroupRanking(
  rows: NormalizedPeopleRow[],
  period: RotationPeriod,
  getter: (row: NormalizedPeopleRow) => string,
  limit = 10
): RotationRankingItem[] {
  const groupMap = new Map<string, NormalizedPeopleRow[]>();

  rows.forEach((row) => {
    const label = getter(row).trim() || "Sin dato";
    const currentRows = groupMap.get(label) ?? [];
    currentRows.push(row);
    groupMap.set(label, currentRows);
  });

  return Array.from(groupMap.entries())
    .map(([label, groupRows]) => {
      const monthly = buildMonthly(groupRows, period);
      const averageHeadcount = Number(
        (monthly.reduce((sum, item) => sum + item.averageHeadcount, 0) / Math.max(monthly.length, 1)).toFixed(2)
      );
      const hires = monthly.reduce((sum, item) => sum + item.hires, 0);
      const exits = monthly.reduce((sum, item) => sum + item.exits, 0);
      const denominator = monthly.reduce((sum, item) => sum + item.averageHeadcount, 0);
      const rotationRate = denominator > 0 ? Number(((exits / denominator) * 100).toFixed(2)) : 0;

      return {
        label,
        averageHeadcount,
        hires,
        exits,
        rotationRate,
        netChange: hires - exits,
      };
    })
    .filter((item) => item.averageHeadcount > 0 || item.exits > 0 || item.hires > 0)
    .sort((a, b) => b.rotationRate - a.rotationRate || b.exits - a.exits)
    .slice(0, limit);
}

function buildInsights(monthly: RotationMonthlyIndicator[], bySede: RotationRankingItem[]) {
  const insights: string[] = [];
  const totalExits = monthly.reduce((sum, item) => sum + item.exits, 0);
  const totalHires = monthly.reduce((sum, item) => sum + item.hires, 0);
  const highest = monthly.reduce<RotationMonthlyIndicator | null>((current, item) => {
    if (!current || item.rotationRate > current.rotationRate) return item;
    return current;
  }, null);
  const lowest = monthly.reduce<RotationMonthlyIndicator | null>((current, item) => {
    if (!current || item.rotationRate < current.rotationRate) return item;
    return current;
  }, null);
  const topSede = bySede[0];

  insights.push(
    `Durante el periodo se registraron ${totalExits} ceses y ${totalHires} ingresos.`
  );

  if (highest) {
    insights.push(
      `${highest.monthName} fue el mes con mayor rotación (${formatPercent(highest.rotationRate)}), con ${highest.exits} ceses.`
    );
  }

  if (lowest) {
    insights.push(
      `${lowest.monthName} fue el mes con menor rotación (${formatPercent(lowest.rotationRate)}).`
    );
  }

  if (topSede) {
    insights.push(
      `La sede/unidad con mayor rotación fue ${topSede.label}, con ${formatPercent(topSede.rotationRate)} y ${topSede.exits} ceses.`
    );
  }

  return insights;
}

function buildConclusions(summary: RotationAnalysisResult["summary"]) {
  const conclusions: string[] = [];

  if (summary.accumulatedRotation >= 15) {
    conclusions.push(
      "La rotación acumulada se encuentra en un nivel alto y requiere revisión prioritaria por parte de Gestión Humana y Operaciones."
    );
  } else if (summary.accumulatedRotation >= 8) {
    conclusions.push(
      "La rotación acumulada se encuentra en nivel de observación; no es crítica, pero conviene monitorear las unidades con mayor incidencia."
    );
  } else {
    conclusions.push(
      "La rotación acumulada se mantiene en un rango controlado para el periodo analizado."
    );
  }

  if (summary.netChange < 0) {
    conclusions.push(
      "El periodo muestra una reducción neta de personal, dado que los ceses superan a los ingresos."
    );
  } else if (summary.netChange > 0) {
    conclusions.push(
      "El periodo muestra crecimiento neto de personal, dado que los ingresos superan a los ceses."
    );
  } else {
    conclusions.push(
      "El periodo mantiene equilibrio entre ingresos y ceses."
    );
  }

  return conclusions;
}

function buildRecommendations(summary: RotationAnalysisResult["summary"], bySede: RotationRankingItem[]) {
  const recommendations = [
    "Revisar las causas de cese por sede/unidad y priorizar entrevistas de salida en las unidades con mayor rotación.",
    "Comparar la rotación por cargo para identificar puestos críticos, especialmente en personal operativo o de alta demanda.",
    "Implementar seguimiento mensual con el mismo criterio de cálculo para presentar tendencia a gerencia.",
  ];

  if (summary.accumulatedRotation >= 8) {
    recommendations.unshift(
      "Preparar un plan de acción de retención enfocado en las sedes y cargos con mayor rotación acumulada."
    );
  }

  if (bySede[0]) {
    recommendations.unshift(
      `Priorizar revisión operativa de ${bySede[0].label}, por registrar la mayor rotación del periodo.`
    );
  }

  return recommendations;
}

export function inferRotationYear(dataset: AnalyticsDataset) {
  const rows = normalizeDataGeneralRows(dataset.rows);
  const years = rows
    .flatMap((row) => [parsePeopleDate(row.FechaIngreso), parsePeopleDate(row.FechaCese)])
    .filter((date): date is Date => Boolean(date))
    .map((date) => date.getFullYear())
    .filter((year) => year >= 2020 && year <= 2100);

  if (years.length === 0) return new Date().getFullYear();

  return years.sort((a, b) => b - a)[0];
}

export function analyzeRotationIndicators(
  dataset: AnalyticsDataset,
  period: RotationPeriod = {
    year: inferRotationYear(dataset),
    fromMonth: 1,
    toMonth: 6,
  }
): RotationAnalysisResult {
  const rows = normalizeDataGeneralRows(dataset.rows);
  const monthly = buildMonthly(rows, period);
  const denominator = monthly.reduce((sum, item) => sum + item.averageHeadcount, 0);
  const totalExits = monthly.reduce((sum, item) => sum + item.exits, 0);
  const totalHires = monthly.reduce((sum, item) => sum + item.hires, 0);
  const averageHeadcount = Number((denominator / Math.max(monthly.length, 1)).toFixed(2));
  const accumulatedRotation = denominator > 0 ? Number(((totalExits / denominator) * 100).toFixed(2)) : 0;
  const highestMonth = monthly.reduce<RotationMonthlyIndicator | null>((current, item) => {
    if (!current || item.rotationRate > current.rotationRate) return item;
    return current;
  }, null);
  const lowestMonth = monthly.reduce<RotationMonthlyIndicator | null>((current, item) => {
    if (!current || item.rotationRate < current.rotationRate) return item;
    return current;
  }, null);

  const bySede = buildGroupRanking(rows, period, (row) => row.Sede);
  const byCargo = buildGroupRanking(rows, period, (row) => row.Cargo);
  const byArea = buildGroupRanking(rows, period, (row) => row.Area);
  const byDepartamento = buildGroupRanking(rows, period, (row) => row.Departamento);

  const summary = {
    averageHeadcount,
    totalHires,
    totalExits,
    accumulatedRotation,
    netChange: totalHires - totalExits,
    highestMonth,
    lowestMonth,
  };

  return {
    datasetName: dataset.name,
    generatedAt: new Date().toISOString(),
    period,
    monthly,
    summary,
    rankings: {
      bySede,
      byCargo,
      byArea,
      byDepartamento,
    },
    insights: buildInsights(monthly, bySede),
    conclusions: buildConclusions(summary),
    recommendations: buildRecommendations(summary, bySede),
    methodology: [
      "El análisis utiliza DATA GENERAL como fuente principal.",
      "Headcount inicial: personal con fecha de ingreso igual o anterior al primer día del mes y sin fecha de cese previa a dicha fecha.",
      "Headcount final: personal con fecha de ingreso igual o anterior al último día del mes y sin fecha de cese previa o igual a dicha fecha.",
      "Headcount promedio mensual = (Headcount inicial + Headcount final) / 2.",
      "Rotación mensual = Ceses del mes / Headcount promedio mensual × 100.",
      "Rotación acumulada = Total de ceses del periodo / suma de headcount promedio mensual del periodo × 100.",
    ],
  };
}
