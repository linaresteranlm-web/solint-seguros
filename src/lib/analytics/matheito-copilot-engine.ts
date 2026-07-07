"use client";

import { AnalyticsResult } from "@/lib/analytics/types";
import { PeopleDashboardResult, RankingItem } from "@/lib/analytics/people-dashboard-engine";
import { PeopleIntelligenceResult } from "@/lib/analytics/people-intelligence-engine";
import { buildExecutiveCommandCenter } from "@/lib/analytics/executive-command-engine";

export const MATHEITO_COPILOT_CONTEXT_KEY = "solint_matheito_copilot_context_v40";

export type MatheitoCopilotContext = {
  savedAt: string;
  source: string;
  executiveScore: number;
  executiveLabel: string;
  healthScore: number;
  healthLabel: string;
  headcount: number;
  exits: number;
  rotation: number;
  stabilityIndex: number;
  diversityIndex: number;
  totalRows: number;
  totalSedes: number;
  totalCargos: number;
  totalAreas: number;
  topSede?: RankingItem;
  topCargo?: RankingItem;
  topArea?: RankingItem;
  topDepartamento?: RankingItem;
  alerts: {
    title: string;
    description: string;
    priority: string;
    impact: string;
    risk: number;
    recommendation: string;
  }[];
  recommendations: {
    title: string;
    description: string;
    priority: string;
    impact: string;
  }[];
  insights: {
    title: string;
    description: string;
    severity: string;
  }[];
};

function kpiNumber(result: AnalyticsResult, id: string) {
  return Number(result.kpis.find((kpi) => kpi.id === id)?.value ?? 0);
}

export function buildMatheitoCopilotContext(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  intelligence: PeopleIntelligenceResult;
}): MatheitoCopilotContext {
  const { result, dashboard, intelligence } = params;
  const command = buildExecutiveCommandCenter({ result, dashboard, intelligence });

  return {
    savedAt: new Date().toISOString(),
    source: result.metadata.source,
    executiveScore: command.executiveScore,
    executiveLabel: command.executiveLabel,
    healthScore: intelligence.organizationalHealthScore,
    healthLabel: intelligence.healthLabel,
    headcount: kpiNumber(result, "headcount"),
    exits: kpiNumber(result, "exits"),
    rotation: kpiNumber(result, "rotation"),
    stabilityIndex: intelligence.stabilityIndex,
    diversityIndex: intelligence.diversityIndex,
    totalRows: dashboard.totalRows,
    totalSedes: dashboard.totalSedes,
    totalCargos: dashboard.totalCargos,
    totalAreas: dashboard.totalAreas,
    topSede: dashboard.sedeRanking[0],
    topCargo: dashboard.cargoRanking[0],
    topArea: dashboard.areaRanking[0],
    topDepartamento: dashboard.departamentoRanking[0],
    alerts: intelligence.strategicAlerts.map((alert) => ({
      title: alert.title,
      description: alert.description,
      priority: alert.priority,
      impact: alert.impact,
      risk: alert.risk,
      recommendation: alert.recommendation,
    })),
    recommendations: result.recommendations.slice(0, 8).map((rec) => ({
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      impact: rec.impact,
    })),
    insights: result.insights.slice(0, 8).map((insight) => ({
      title: insight.title,
      description: insight.description,
      severity: insight.severity,
    })),
  };
}

export function saveMatheitoCopilotContext(context: MatheitoCopilotContext) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MATHEITO_COPILOT_CONTEXT_KEY, JSON.stringify(context));
  window.dispatchEvent(new CustomEvent("solint:matheito-context-updated", { detail: context }));
}

export function getMatheitoCopilotContext(): MatheitoCopilotContext | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(MATHEITO_COPILOT_CONTEXT_KEY);
    return raw ? (JSON.parse(raw) as MatheitoCopilotContext) : null;
  } catch {
    return null;
  }
}

function money(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value);
}

function intro(context: MatheitoCopilotContext) {
  return `Estoy trabajando con el último análisis cargado: ${context.source}. Executive Score: ${context.executiveScore}/100 (${context.executiveLabel}), Health Score: ${context.healthScore}/100 (${context.healthLabel}), Headcount: ${context.headcount}, Rotación: ${context.rotation}%.`;
}

function firstAlert(context: MatheitoCopilotContext) {
  return context.alerts.find((alert) => alert.priority === "Crítica" || alert.priority === "Alta") ?? context.alerts[0];
}

export function answerMatheitoQuestion(question: string, context: MatheitoCopilotContext | null) {
  const q = question.trim().toLowerCase();

  if (!context) {
    return "Todavía no tengo un análisis cargado en memoria. Carga DATA GENERAL o activa Demo Mode en People Analytics y luego podré responder sobre indicadores, riesgos, sedes, cargos y recomendaciones.";
  }

  if (!q) {
    return "Escríbeme una pregunta sobre el análisis actual: rotación, headcount, sedes, cargos, riesgos, recomendaciones o resumen para gerencia.";
  }

  if (q.includes("resumen") || q.includes("gerencia") || q.includes("ejecutivo")) {
    const alert = firstAlert(context);
    return `${intro(context)}\n\nLectura ejecutiva: la operación muestra ${context.totalRows} registros analizados, ${context.totalSedes} sedes, ${context.totalAreas} áreas y ${context.totalCargos} cargos. ${context.topSede ? `La sede con mayor concentración es ${context.topSede.label} (${context.topSede.percentage}%).` : ""}\n\nPunto principal: ${alert ? `${alert.title}. ${alert.description}` : "no se detectan alertas relevantes."}\n\nRecomendación: ${alert?.recommendation ?? "guardar el snapshot actual y comparar el siguiente periodo."}`;
  }

  if (q.includes("rotaci")) {
    const impact = Math.round(Math.max(0, context.exits) * 2800);
    return `La rotación estimada es ${context.rotation}%. Se calcularon ${context.exits} ceses o bajas.\n\nInterpretación: ${context.rotation >= 15 ? "es un nivel alto y requiere revisión prioritaria." : context.rotation >= 8 ? "está en observación y conviene monitorearla por sede o cargo." : "se mantiene en un rango saludable."}\n\nImpacto estimado referencial: si cada reemplazo costara S/ 2,800, el impacto potencial sería aproximadamente ${money(impact)}. Este valor es orientativo y luego puede hacerse configurable.`;
  }

  if (q.includes("sede") || q.includes("lugar") || q.includes("establecimiento")) {
    return context.topSede
      ? `La sede con mayor concentración es ${context.topSede.label}, con ${context.topSede.total} registros (${context.topSede.percentage}%).\n\nRecomendación: revisar si allí también se concentran alertas, ceses o rotación. Si es una sede crítica para la operación, conviene asegurar cobertura, reemplazos y supervisión.`
      : "No encontré una sede dominante en el análisis actual.";
  }

  if (q.includes("cargo") || q.includes("puesto")) {
    return context.topCargo
      ? `El cargo con mayor concentración es ${context.topCargo.label}, con ${context.topCargo.total} registros (${context.topCargo.percentage}%).\n\nRecomendación: si este cargo es operativo, revisaría cobertura, rotación, ausentismo y necesidades de capacitación.`
      : "No encontré un cargo dominante en el análisis actual.";
  }

  if (q.includes("área") || q.includes("area")) {
    return context.topArea
      ? `El área con mayor concentración es ${context.topArea.label}, con ${context.topArea.total} registros (${context.topArea.percentage}%).\n\nRecomendación: validar si esta área concentra carga operativa, ceses o necesidad de refuerzo.`
      : "No encontré un área dominante en el análisis actual.";
  }

  if (q.includes("riesgo") || q.includes("alerta") || q.includes("preocupa")) {
    const alerts = context.alerts.slice(0, 4);
    return alerts.length
      ? `Riesgos principales detectados:\n\n${alerts.map((alert, index) => `${index + 1}. ${alert.priority}: ${alert.title}. ${alert.description}\nAcción: ${alert.recommendation}`).join("\n\n")}`
      : "No se registran alertas estratégicas relevantes en el análisis actual.";
  }

  if (q.includes("recom") || q.includes("acci") || q.includes("hacer") || q.includes("director")) {
    const alert = firstAlert(context);
    const recommendations = context.recommendations.slice(0, 3);

    return `Si yo fuera Director de RRHH, priorizaría estas acciones:\n\n${alert ? `1. ${alert.recommendation}` : "1. Guardar el snapshot y monitorear evolución."}\n${recommendations.map((rec, index) => `${index + 2}. ${rec.description}`).join("\n")}\n\nEnfoque: primero controlar riesgos críticos, luego mejorar calidad de datos y finalmente comparar contra el siguiente periodo.`;
  }

  if (q.includes("health") || q.includes("salud")) {
    return `El Health Score es ${context.healthScore}/100 y se clasifica como ${context.healthLabel}.\n\nEste indicador combina señales como rotación, ceses recientes, estabilidad y calidad de datos. ${context.healthScore >= 85 ? "La lectura es favorable." : context.healthScore >= 70 ? "La lectura es buena, pero conviene monitorear alertas." : "La lectura requiere revisión gerencial."}`;
  }

  if (q.includes("executive") || q.includes("score")) {
    return `El Executive Score es ${context.executiveScore}/100 (${context.executiveLabel}).\n\nEste score resume estabilidad, salud organizacional, diversidad, rotación, calidad de datos y alertas. Mi lectura: ${context.executiveScore >= 88 ? "escenario ejecutivo muy favorable." : context.executiveScore >= 72 ? "escenario bueno con puntos de control." : context.executiveScore >= 55 ? "escenario en observación." : "escenario crítico que requiere acción."}`;
  }

  if (q.includes("diversidad") || q.includes("sexo") || q.includes("género") || q.includes("genero")) {
    return `El índice de diversidad es ${context.diversityIndex}/100.\n\nInterpretación: ${context.diversityIndex >= 80 ? "hay un balance saludable en los datos analizados." : context.diversityIndex >= 60 ? "hay equilibrio moderado." : "hay concentración y conviene revisar si responde a la naturaleza de la operación o a brechas de contratación."}`;
  }

  if (q.includes("snapshot") || q.includes("compar")) {
    return "Para comparar periodos, usa el Snapshot Manager. Guarda el corte actual y luego carga el siguiente DATA GENERAL. Yo puedo interpretar la variación cuando exista información histórica disponible.";
  }

  return `${intro(context)}\n\nPuedo responder mejor si me preguntas por: rotación, sede principal, cargo principal, área principal, riesgos, recomendaciones, Health Score, Executive Score, diversidad o resumen para gerencia.`;
}

export const MATHEITO_SUGGESTED_QUESTIONS = [
  "Dame un resumen ejecutivo",
  "¿Qué riesgo preocupa más?",
  "¿Qué sede debo revisar primero?",
  "¿Cómo está la rotación?",
  "¿Qué haría un Director de RRHH?",
  "Explícame el Executive Score",
];
