"use client";

import { AnalyticsResult } from "@/lib/analytics/types";
import { PeopleDashboardResult } from "@/lib/analytics/people-dashboard-engine";
import { PeopleIntelligenceResult } from "@/lib/analytics/people-intelligence-engine";
import { buildExecutiveCommandCenter } from "@/lib/analytics/executive-command-engine";

export type MatheitoLiveStatus = "analyzing" | "thinking" | "done";

export type MatheitoLiveBrief = {
  status: MatheitoLiveStatus;
  greeting: string;
  title: string;
  executiveBrief: string;
  detected: string[];
  nextAction: string;
  confidence: number;
  tone: "positive" | "attention" | "critical";
};

function kpiNumber(result: AnalyticsResult, id: string) {
  return Number(result.kpis.find((kpi) => kpi.id === id)?.value ?? 0);
}

function greetingByHour() {
  const hour = new Date().getHours();

  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function buildMatheitoLiveBrief(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  intelligence: PeopleIntelligenceResult;
}): MatheitoLiveBrief {
  const { result, dashboard, intelligence } = params;

  const command = buildExecutiveCommandCenter({
    result,
    dashboard,
    intelligence,
  });

  const headcount = kpiNumber(result, "headcount");
  const rotation = kpiNumber(result, "rotation");
  const exits = kpiNumber(result, "exits");

  const criticalAlerts = intelligence.strategicAlerts.filter(
    (alert) => alert.priority === "Crítica" || alert.priority === "Alta"
  );

  const tone: MatheitoLiveBrief["tone"] =
    command.executiveScore < 60 || criticalAlerts.length > 0
      ? "critical"
      : command.executiveScore < 75
        ? "attention"
        : "positive";

  const title =
    tone === "positive"
      ? "Análisis completado con escenario favorable"
      : tone === "attention"
        ? "Análisis completado con puntos de atención"
        : "Análisis completado con riesgos prioritarios";

  const executiveBrief =
    tone === "positive"
      ? `He terminado de analizar DATA GENERAL. El Executive Score es ${command.executiveScore}/100 y el Health Score es ${intelligence.organizationalHealthScore}/100. La operación muestra una base estable con ${headcount} colaboradores activos y una rotación estimada de ${rotation} %.`
      : tone === "attention"
        ? `He terminado de analizar DATA GENERAL. El Executive Score es ${command.executiveScore}/100. La operación es utilizable para revisión gerencial, pero recomiendo observar rotación, ceses y concentración operativa antes de presentar conclusiones finales.`
        : `He terminado de analizar DATA GENERAL. El Executive Score es ${command.executiveScore}/100 y se detectaron alertas prioritarias. Recomiendo revisar primero las alertas críticas o altas antes de tomar decisiones operativas.`;

  const detected = [
    `Headcount analizado: ${headcount} colaboradores activos o subsidiados.`,
    `Rotación estimada: ${rotation} %.`,
    `Ceses o bajas detectadas: ${exits}.`,
    `Health Score: ${intelligence.organizationalHealthScore}/100 (${intelligence.healthLabel}).`,
    `Alertas estratégicas generadas: ${intelligence.strategicAlerts.length}.`,
  ];

  const nextAction =
    criticalAlerts[0]?.recommendation ??
    intelligence.strategicAlerts[0]?.recommendation ??
    "Guardar el snapshot actual y compararlo contra el siguiente periodo para evaluar evolución.";

  const dataQualityScore = Math.max(
    0,
    100 - result.validation.errors * 15 - result.validation.warnings * 3
  );

  const confidence = Math.max(
    50,
    Math.min(
      99,
      Math.round(
        dataQualityScore * 0.55 +
          intelligence.organizationalHealthScore * 0.25 +
          command.executiveScore * 0.2
      )
    )
  );

  return {
    status: "done",
    greeting: greetingByHour(),
    title,
    executiveBrief,
    detected,
    nextAction,
    confidence,
    tone,
  };
}
