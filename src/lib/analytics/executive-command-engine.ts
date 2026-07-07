"use client";

import { AnalyticsResult } from "@/lib/analytics/types";
import { PeopleDashboardResult } from "@/lib/analytics/people-dashboard-engine";
import { PeopleIntelligenceResult } from "@/lib/analytics/people-intelligence-engine";

export type ExecutiveCommandMetric = {
  id: string;
  label: string;
  value: string;
  description: string;
  status: "excellent" | "good" | "warning" | "critical";
};

export type ExecutiveCommandCenterResult = {
  executiveScore: number;
  executiveLabel: "Excelente" | "Bueno" | "Atención" | "Crítico";
  metrics: ExecutiveCommandMetric[];
  operationalStatus: {
    label: string;
    description: string;
    status: "online" | "attention" | "critical";
  };
  topMessage: string;
};

function findKpi(result: AnalyticsResult, id: string) {
  return result.kpis.find((kpi) => kpi.id === id);
}

function labelFromScore(score: number): ExecutiveCommandCenterResult["executiveLabel"] {
  if (score >= 88) return "Excelente";
  if (score >= 72) return "Bueno";
  if (score >= 55) return "Atención";
  return "Crítico";
}

function statusFromScore(score: number): ExecutiveCommandMetric["status"] {
  if (score >= 88) return "excellent";
  if (score >= 72) return "good";
  if (score >= 55) return "warning";
  return "critical";
}

export function buildExecutiveCommandCenter(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  intelligence: PeopleIntelligenceResult;
}): ExecutiveCommandCenterResult {
  const { result, dashboard, intelligence } = params;

  const rotation = Number(findKpi(result, "rotation")?.value ?? 0);
  const dataQualityPenalty = result.validation.errors * 8 + result.validation.warnings * 2;
  const alertPenalty = intelligence.strategicAlerts.reduce((total, alert) => {
    if (alert.priority === "Crítica") return total + 18;
    if (alert.priority === "Alta") return total + 12;
    if (alert.priority === "Media") return total + 6;
    return total + 2;
  }, 0);

  const executiveScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        intelligence.organizationalHealthScore * 0.45 +
          intelligence.stabilityIndex * 0.25 +
          intelligence.diversityIndex * 0.15 +
          Math.max(0, 100 - rotation * 3) * 0.15 -
          dataQualityPenalty -
          alertPenalty * 0.15
      )
    )
  );

  const criticalAlerts = intelligence.strategicAlerts.filter(
    (alert) => alert.priority === "Crítica" || alert.priority === "Alta"
  ).length;

  const operationalStatus =
    executiveScore < 55 || result.validation.errors > 0
      ? {
          label: "Operación en riesgo",
          description:
            "Se detectaron señales que requieren revisión antes de presentar resultados finales.",
          status: "critical" as const,
        }
      : executiveScore < 72 || criticalAlerts > 0
        ? {
            label: "Operación en observación",
            description:
              "El análisis es utilizable, pero existen indicadores que deben ser revisados por gerencia.",
            status: "attention" as const,
          }
        : {
            label: "Operación estable",
            description:
              "El análisis presenta condiciones favorables para revisión ejecutiva.",
            status: "online" as const,
          };

  const topMessage =
    intelligence.strategicAlerts[0]?.description ??
    "No se detectaron alertas críticas en el análisis actual.";

  return {
    executiveScore,
    executiveLabel: labelFromScore(executiveScore),
    operationalStatus,
    topMessage,
    metrics: [
      {
        id: "health",
        label: "Health Score",
        value: `${intelligence.organizationalHealthScore}/100`,
        description: `Salud organizacional: ${intelligence.healthLabel}.`,
        status: statusFromScore(intelligence.organizationalHealthScore),
      },
      {
        id: "headcount",
        label: "Headcount",
        value: String(findKpi(result, "headcount")?.value ?? 0),
        description: "Personal activo o subsidiado identificado.",
        status: "excellent",
      },
      {
        id: "rotation",
        label: "Rotación",
        value: `${findKpi(result, "rotation")?.value ?? 0}%`,
        description: "Rotación estimada sobre DATA GENERAL.",
        status: rotation >= 15 ? "critical" : rotation >= 8 ? "warning" : "excellent",
      },
      {
        id: "stability",
        label: "Estabilidad",
        value: `${intelligence.stabilityIndex}%`,
        description: "Índice de estabilidad operativa.",
        status: statusFromScore(intelligence.stabilityIndex),
      },
      {
        id: "alerts",
        label: "Alertas",
        value: String(intelligence.strategicAlerts.length),
        description: "Alertas estratégicas generadas por el motor.",
        status:
          criticalAlerts > 0
            ? "critical"
            : intelligence.strategicAlerts.length > 1
              ? "warning"
              : "good",
      },
      {
        id: "coverage",
        label: "Cobertura",
        value: `${dashboard.totalSedes} sedes`,
        description: "Alcance operativo del análisis filtrado.",
        status: dashboard.totalSedes > 0 ? "good" : "warning",
      },
    ],
  };
}
