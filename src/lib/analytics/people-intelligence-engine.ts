"use client";

import { AnalyticsDataset } from "@/lib/analytics/types";
import {
  isActivePeopleRow,
  isExitPeopleRow,
  normalizeDataGeneralRows,
  NormalizedPeopleRow,
} from "@/lib/analytics/data-general-adapter";
import { RankingItem } from "@/lib/analytics/people-dashboard-engine";

export type PeopleStrategicAlert = {
  id: string;
  title: string;
  description: string;
  priority: "Crítica" | "Alta" | "Media" | "Baja";
  impact: "Alto" | "Medio" | "Bajo";
  risk: number;
  recommendation: string;
};

export type BirthdayItem = {
  name: string;
  document: string;
  date: string;
  daysLeft: number;
};

export type PeopleIntelligenceResult = {
  organizationalHealthScore: number;
  healthLabel: "Excelente" | "Bueno" | "Riesgo" | "Crítico";
  stabilityIndex: number;
  diversityIndex: number;
  averageSeniorityYears: number;
  newHiresLast30Days: number;
  exitsLast30Days: number;
  birthdaysThisMonth: BirthdayItem[];
  genderDistribution: RankingItem[];
  geographicDistribution: RankingItem[];
  strategicAlerts: PeopleStrategicAlert[];
  consultantSummary: string;
};

function toDate(value: string) {
  if (!value) return null;

  const normalized = value.trim();

  if (!normalized) return null;

  const parts = normalized.split(/[/-]/);

  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);

    if (c > 1900) {
      const date = new Date(c, b - 1, a);
      if (!Number.isNaN(date.getTime())) return date;
    }

    if (a > 1900) {
      const date = new Date(a, b - 1, c);
      if (!Number.isNaN(date.getTime())) return date;
    }
  }

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function diffDays(dateA: Date, dateB: Date) {
  const ms = dateA.getTime() - dateB.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function diffYears(dateA: Date, dateB: Date) {
  return (dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
}

function buildRankingFromRows(
  rows: NormalizedPeopleRow[],
  getter: (row: NormalizedPeopleRow) => string,
  limit = 8
): RankingItem[] {
  const map = new Map<string, number>();

  rows.forEach((row) => {
    const value = getter(row).trim() || "Sin dato";
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

function healthLabel(score: number): PeopleIntelligenceResult["healthLabel"] {
  if (score >= 85) return "Excelente";
  if (score >= 70) return "Bueno";
  if (score >= 50) return "Riesgo";
  return "Crítico";
}

function scoreColorPenalty(rotation: number, exitsLast30: number, missingDocs: number) {
  let score = 100;

  if (rotation >= 20) score -= 35;
  else if (rotation >= 15) score -= 25;
  else if (rotation >= 8) score -= 12;

  if (exitsLast30 >= 10) score -= 15;
  else if (exitsLast30 >= 5) score -= 8;

  if (missingDocs > 0) score -= Math.min(15, missingDocs);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildStrategicAlerts(params: {
  rows: NormalizedPeopleRow[];
  active: number;
  exits: number;
  rotation: number;
  exitsLast30: number;
  sedeRanking: RankingItem[];
  genderDistribution: RankingItem[];
}): PeopleStrategicAlert[] {
  const alerts: PeopleStrategicAlert[] = [];

  if (params.rotation >= 15) {
    alerts.push({
      id: "rotation-high",
      title: "Rotación elevada",
      description: `La rotación estimada alcanza ${params.rotation} %, superando el umbral recomendado para una operación estable.`,
      priority: "Crítica",
      impact: "Alto",
      risk: 92,
      recommendation:
        "Revisar clima laboral, supervisión directa, proceso de inducción y causas de salida por sede.",
    });
  } else if (params.rotation >= 8) {
    alerts.push({
      id: "rotation-warning",
      title: "Rotación en observación",
      description: `La rotación estimada es ${params.rotation} %. No es crítica, pero debe monitorearse.`,
      priority: "Media",
      impact: "Medio",
      risk: 61,
      recommendation:
        "Activar seguimiento mensual y revisar si la rotación se concentra en una sede, cargo o área.",
    });
  }

  if (params.exitsLast30 > 0) {
    alerts.push({
      id: "recent-exits",
      title: "Ceses recientes detectados",
      description: `Se registran ${params.exitsLast30} ceses durante los últimos 30 días.`,
      priority: params.exitsLast30 >= 5 ? "Alta" : "Media",
      impact: params.exitsLast30 >= 5 ? "Alto" : "Medio",
      risk: params.exitsLast30 >= 5 ? 78 : 52,
      recommendation:
        "Validar motivos de cese y ejecutar entrevistas de salida para detectar patrones tempranos.",
    });
  }

  const topSede = params.sedeRanking[0];

  if (topSede && topSede.percentage >= 35) {
    alerts.push({
      id: "sede-concentration",
      title: "Alta concentración operativa por sede",
      description: `${topSede.label} concentra el ${topSede.percentage} % del personal analizado.`,
      priority: "Media",
      impact: "Medio",
      risk: 55,
      recommendation:
        "Asegurar planes de continuidad operativa, cobertura de reemplazos y supervisión reforzada en esta sede.",
    });
  }

  const genderTop = params.genderDistribution[0];

  if (genderTop && genderTop.percentage >= 80) {
    alerts.push({
      id: "gender-concentration",
      title: "Concentración de género",
      description: `${genderTop.label} representa el ${genderTop.percentage} % del universo analizado.`,
      priority: "Baja",
      impact: "Bajo",
      risk: 35,
      recommendation:
        "Monitorear diversidad del personal y evaluar oportunidades de equilibrio según el tipo de operación.",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "stable-operation",
      title: "Sin alertas críticas",
      description:
        "No se detectaron señales críticas en rotación, ceses recientes o concentración operativa.",
      priority: "Baja",
      impact: "Bajo",
      risk: 18,
      recommendation:
        "Mantener seguimiento mensual y comparar contra cortes futuros para identificar cambios tempranos.",
    });
  }

  return alerts;
}

export function runPeopleIntelligence(dataset: AnalyticsDataset): PeopleIntelligenceResult {
  const rows = normalizeDataGeneralRows(dataset.rows);
  const now = new Date();

  const activeRows = rows.filter(isActivePeopleRow);
  const exitRows = rows.filter(isExitPeopleRow);

  const active = activeRows.length;
  const exits = exitRows.length;
  const total = rows.length;
  const rotation = total > 0 ? Number(((exits / total) * 100).toFixed(2)) : 0;

  const stabilityIndex = total > 0 ? Number(((active / total) * 100).toFixed(1)) : 0;

  const genderDistribution = buildRankingFromRows(rows, (row) => {
    const sexo = row.Sexo.trim().toUpperCase();

    if (sexo === "M") return "Masculino";
    if (sexo === "F") return "Femenino";

    return sexo || "Sin dato";
  });

  const genderGroups = genderDistribution.filter((item) => item.label !== "Sin dato").length;
  const diversityIndex =
    genderGroups <= 1
      ? 50
      : Math.round(
          100 -
            Math.abs((genderDistribution[0]?.percentage ?? 50) - 50)
        );

  const seniorityValues = activeRows
    .map((row) => toDate(row.FechaIngreso))
    .filter((date): date is Date => Boolean(date))
    .map((date) => diffYears(now, date));

  const averageSeniorityYears =
    seniorityValues.length > 0
      ? Number(
          (
            seniorityValues.reduce((sum, value) => sum + value, 0) /
            seniorityValues.length
          ).toFixed(1)
        )
      : 0;

  const newHiresLast30Days = rows.filter((row) => {
    const date = toDate(row.FechaIngreso);
    if (!date) return false;

    const days = diffDays(now, date);

    return days >= 0 && days <= 30;
  }).length;

  const exitsLast30Days = rows.filter((row) => {
    const date = toDate(row.FechaCese);
    if (!date) return false;

    const days = diffDays(now, date);

    return days >= 0 && days <= 30;
  }).length;

  const birthdaysThisMonth = rows
    .map((row) => {
      const birth = toDate(row.FechaNacimiento);

      if (!birth) return null;

      const nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());

      if (nextBirthday < now) {
        nextBirthday.setFullYear(now.getFullYear() + 1);
      }

      if (nextBirthday.getMonth() !== now.getMonth()) return null;

      return {
        name: row.Nombres || "Sin nombre",
        document: row.Documento,
        date: `${String(birth.getDate()).padStart(2, "0")}/${String(
          birth.getMonth() + 1
        ).padStart(2, "0")}`,
        daysLeft: diffDays(nextBirthday, now),
      };
    })
    .filter((item): item is BirthdayItem => Boolean(item))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 8);

  const geographicDistribution = buildRankingFromRows(rows, (row) => row.Departamento);
  const sedeRanking = buildRankingFromRows(rows, (row) => row.Sede);
  const missingDocs = rows.filter((row) => !row.Documento).length;

  const organizationalHealthScore = scoreColorPenalty(
    rotation,
    exitsLast30Days,
    missingDocs
  );

  const strategicAlerts = buildStrategicAlerts({
    rows,
    active,
    exits,
    rotation,
    exitsLast30: exitsLast30Days,
    sedeRanking,
    genderDistribution,
  });

  const topSede = sedeRanking[0];

  const consultantSummary =
    topSede && total > 0
      ? `La operación presenta ${active} colaboradores activos sobre ${total} registros analizados. ${topSede.label} concentra el ${topSede.percentage} % del personal, por lo que representa un punto operativo clave. La rotación estimada es ${rotation} %, con un índice de estabilidad de ${stabilityIndex} %. Se recomienda enfocar el análisis gerencial en sedes, cargos o áreas con mayor concentración para anticipar riesgos de continuidad.`
      : `La base contiene ${total} registros analizados. La rotación estimada es ${rotation} % y el índice de estabilidad alcanza ${stabilityIndex} %.`;

  return {
    organizationalHealthScore,
    healthLabel: healthLabel(organizationalHealthScore),
    stabilityIndex,
    diversityIndex,
    averageSeniorityYears,
    newHiresLast30Days,
    exitsLast30Days,
    birthdaysThisMonth,
    genderDistribution,
    geographicDistribution,
    strategicAlerts,
    consultantSummary,
  };
}
