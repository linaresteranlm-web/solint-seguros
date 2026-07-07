"use client";

import { AnalyticsResult } from "@/lib/analytics/types";
import { PeopleDashboardResult } from "@/lib/analytics/people-dashboard-engine";
import { PeopleIntelligenceResult } from "@/lib/analytics/people-intelligence-engine";
import { LocalTrendResult } from "@/lib/analytics/local-trend-engine";

export type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  type: "success" | "info" | "warning" | "danger";
  timeLabel: string;
};

function nowLabel() {
  return new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export function buildOrganizationalTimeline(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  intelligence: PeopleIntelligenceResult;
  trends: LocalTrendResult;
}): TimelineEvent[] {
  const { result, dashboard, intelligence, trends } = params;

  const events: TimelineEvent[] = [
    {
      id: "file-loaded",
      title: "DATA GENERAL procesado",
      description: `${dashboard.totalRows} registros fueron analizados por SOLINT Analytics.`,
      type: "success",
      timeLabel: nowLabel(),
    },
    {
      id: "validation",
      title:
        result.validation.errors > 0
          ? "Validación con errores"
          : result.validation.warnings > 0
            ? "Validación con advertencias"
            : "Validación aprobada",
      description: `${result.validation.errors} errores y ${result.validation.warnings} advertencias detectadas.`,
      type:
        result.validation.errors > 0
          ? "danger"
          : result.validation.warnings > 0
            ? "warning"
            : "success",
      timeLabel: nowLabel(),
    },
    {
      id: "health",
      title: `Health Score ${intelligence.organizationalHealthScore}/100`,
      description: `Clasificación organizacional: ${intelligence.healthLabel}.`,
      type:
        intelligence.organizationalHealthScore >= 70
          ? "success"
          : intelligence.organizationalHealthScore >= 50
            ? "warning"
            : "danger",
      timeLabel: nowLabel(),
    },
  ];

  intelligence.strategicAlerts.slice(0, 3).forEach((alert) => {
    events.push({
      id: `alert-${alert.id}`,
      title: alert.title,
      description: alert.description,
      type:
        alert.priority === "Crítica" || alert.priority === "Alta"
          ? "danger"
          : alert.priority === "Media"
            ? "warning"
            : "info",
      timeLabel: nowLabel(),
    });
  });

  trends.trends.slice(0, 3).forEach((trend) => {
    events.push({
      id: `trend-${trend.label}`,
      title: `Tendencia: ${trend.label}`,
      description: trend.interpretation,
      type:
        trend.direction === "new"
          ? "info"
          : trend.variation === 0
            ? "info"
            : trend.interpretation.includes("mejoró")
              ? "success"
              : "warning",
      timeLabel: nowLabel(),
    });
  });

  return events;
}
