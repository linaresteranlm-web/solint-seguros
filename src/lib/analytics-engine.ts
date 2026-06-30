"use client";

import { getProcessHistory, ProcessHistoryItem } from "@/lib/process-history";

export type AnalyticsSummary = {
  totalProcesses: number;
  comparisons: number;
  accumulated: number;
  downloads: number;
  pdfs: number;
  zips: number;
  errors: number;
  warnings: number;
  success: number;
  peopleProcessed: number;
  newSctr: number;
  newVidaLey: number;
};

export type DailyAnalytics = {
  date: string;
  total: number;
  comparisons: number;
  downloads: number;
  errors: number;
};

function containsText(item: ProcessHistoryItem, word: string) {
  return `${item.title} ${item.description}`.toLowerCase().includes(word);
}

function dayKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function getAnalyticsSummary(history = getProcessHistory()): AnalyticsSummary {
  return {
    totalProcesses: history.length,
    comparisons: history.filter((i) => i.type === "COMPARAR_TRAMAS").length,
    accumulated: history.filter((i) => i.type === "GENERAR_ACUMULADOS").length,
    downloads: history.filter((i) => i.type === "DESCARGA_ARCHIVO").length,
    pdfs: history.filter((i) => containsText(i, "pdf")).length,
    zips: history.filter((i) => containsText(i, "zip")).length,
    errors: history.filter((i) => i.status === "ERROR").length,
    warnings: history.filter((i) => i.status === "ADVERTENCIA").length,
    success: history.filter((i) => i.status === "OK").length,
    peopleProcessed: history.reduce((total, i) => total + Number(i.metrics?.totalGeneral ?? 0) + Number(i.metrics?.filasSctr ?? 0) + Number(i.metrics?.filasVidaLey ?? 0) + Number(i.metrics?.filas ?? 0), 0),
    newSctr: history.reduce((total, i) => total + Number(i.metrics?.nuevosSctr ?? 0), 0),
    newVidaLey: history.reduce((total, i) => total + Number(i.metrics?.nuevosVidaLey ?? 0), 0),
  };
}

export function getDailyAnalytics(history = getProcessHistory()): DailyAnalytics[] {
  const map = new Map<string, DailyAnalytics>();

  history.forEach((item) => {
    const key = dayKey(item.createdAt);
    const current = map.get(key) ?? {
      date: key,
      total: 0,
      comparisons: 0,
      downloads: 0,
      errors: 0,
    };

    current.total += 1;
    if (item.type === "COMPARAR_TRAMAS") current.comparisons += 1;
    if (item.type === "DESCARGA_ARCHIVO") current.downloads += 1;
    if (item.status === "ERROR") current.errors += 1;

    map.set(key, current);
  });

  return Array.from(map.values()).slice(0, 14);
}

export function getMatheitoAnalyticsMessage(summary: AnalyticsSummary) {
  if (summary.totalProcesses === 0) {
    return "Aún no hay actividad suficiente. Ejecuta comparaciones y exportaciones para alimentar las analíticas.";
  }

  if (summary.errors > 0) {
    return `Detecté ${summary.errors} error(es). Revisa Historial antes de entregar archivos finales.`;
  }

  if (summary.warnings > 0) {
    return `Hay ${summary.warnings} advertencia(s). Valida diferencias y tramas antes de exportar.`;
  }

  if (summary.zips > 0 && summary.pdfs > 0) {
    return "El flujo operativo se ve completo: estás generando ZIP final y PDF ejecutivo correctamente.";
  }

  return "El sistema está funcionando correctamente. Te recomiendo generar paquete ZIP final y reporte PDF para cerrar cada proceso.";
}
