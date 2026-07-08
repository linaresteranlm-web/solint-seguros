"use client";

import jsPDF from "jspdf";
import { AnalyticsResult } from "@/lib/analytics/types";
import {
  PeopleDashboardResult,
  PeopleFilters,
  RankingItem,
} from "@/lib/analytics/people-dashboard-engine";

const BLUE = [23, 59, 118] as const;
const DARK = [9, 30, 66] as const;
const ORANGE = [245, 130, 32] as const;
const SLATE = [80, 92, 110] as const;
const LIGHT = [244, 247, 251] as const;

export type AnalyticsExportPayload = {
  app: "CORPRISEG";
  product: "People Analytics";
  preparedBy: "SOLINT Business Suite © LC2026";
  version: string;
  exportedAt: string;
  domain: string;
  filters: PeopleFilters;
  result: AnalyticsResult;
  dashboard: {
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
};

function dateText(value = new Date()) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(value);
}

function numberText(value: number) {
  return new Intl.NumberFormat("es-PE").format(value);
}

function text(value: unknown) {
  const v = String(value ?? "").trim();
  return v || "—";
}

function valueText(value: unknown, unit?: string) {
  return unit ? `${text(value)} ${unit}` : text(value);
}

function buildPayload(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  filters: PeopleFilters;
}): AnalyticsExportPayload {
  const { result, dashboard, filters } = params;
  return {
    app: "CORPRISEG",
    product: "People Analytics",
    preparedBy: "SOLINT Business Suite © LC2026",
    version: "4.0 CORPRISEG Corporate Report",
    exportedAt: new Date().toISOString(),
    domain: result.domain,
    filters,
    result,
    dashboard: {
      totalRows: dashboard.totalRows,
      totalSedes: dashboard.totalSedes,
      totalCargos: dashboard.totalCargos,
      totalAreas: dashboard.totalAreas,
      totalDepartamentos: dashboard.totalDepartamentos,
      estadoDistribution: dashboard.estadoDistribution,
      sedeRanking: dashboard.sedeRanking,
      cargoRanking: dashboard.cargoRanking,
      areaRanking: dashboard.areaRanking,
      departamentoRanking: dashboard.departamentoRanking,
    },
  };
}

export function downloadAnalyticsJson(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  filters: PeopleFilters;
}) {
  const payload = buildPayload(params);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `CORPRISEG_PEOPLE_ANALYTICS_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function brand(pdf: jsPDF, logo: string | null, x: number, y: number, w: number, h: number, light = false) {
  if (logo) {
    try {
      pdf.addImage(logo, "PNG", x, y, w, h, undefined, "FAST");
      return;
    } catch {}
  }
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(light ? 255 : BLUE[0], light ? 255 : BLUE[1], light ? 255 : BLUE[2]);
  pdf.text("CORPRISEG", x, y + 10);
  pdf.setFontSize(7);
  pdf.setTextColor(light ? 230 : SLATE[0], light ? 238 : SLATE[1], light ? 247 : SLATE[2]);
  pdf.text("SEGURIDAD · PREVENCIÓN · CONFIANZA", x, y + 17);
}

function bg(pdf: jsPDF) {
  pdf.setFillColor(LIGHT[0], LIGHT[1], LIGHT[2]);
  pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), "F");
}

function header(pdf: jsPDF, title: string, logo: string | null) {
  const w = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
  pdf.rect(0, 0, w, 21, "F");
  pdf.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2]);
  pdf.rect(0, 21, w, 2.2, "F");
  brand(pdf, logo, 10, 3.6, 36, 13, true);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.text("CORPRISEG · Reporte Gerencial", 52, 12);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(title, w - 12, 12, { align: "right" });
}

function footer(pdf: jsPDF, page: number) {
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();
  pdf.setDrawColor(220, 226, 235);
  pdf.line(12, h - 16, w - 12, h - 16);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
  pdf.text("CORPRISEG", 12, h - 9);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(SLATE[0], SLATE[1], SLATE[2]);
  pdf.text("People Analytics · Reporte Ejecutivo", 40, h - 9);
  pdf.text("Elaborado por SOLINT Business Suite © LC2026", w / 2, h - 9, { align: "center" });
  pdf.text(`Página ${page}`, w - 12, h - 9, { align: "right" });
}

function newPage(pdf: jsPDF, title: string, page: number, logo: string | null) {
  pdf.addPage();
  bg(pdf);
  header(pdf, title, logo);
  footer(pdf, page);
}

function section(pdf: jsPDF, title: string, x: number, y: number) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
  pdf.text(title, x, y);
  pdf.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2]);
  pdf.roundedRect(x, y + 3.2, 30, 1.5, 0.7, 0.7, "F");
}

function wrap(pdf: jsPDF, value: string, x: number, y: number, width: number, lineHeight = 5) {
  const lines = pdf.splitTextToSize(value, width);
  pdf.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function kpi(pdf: jsPDF, label: string, value: string, x: number, y: number, w: number, accent: "blue" | "orange" | "red" | "green" = "blue") {
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x, y, w, 28, 5, 5, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(x, y, w, 28, 5, 5, "S");
  const color = accent === "orange" ? ORANGE : accent === "red" ? [185, 28, 28] as const : accent === "green" ? [4, 120, 87] as const : BLUE;
  pdf.setFillColor(color[0], color[1], color[2]);
  pdf.roundedRect(x, y, 4, 28, 4, 4, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text(label.toUpperCase(), x + 8, y + 8);
  pdf.setFontSize(15);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  pdf.text(value, x + 8, y + 20);
}

function box(pdf: jsPDF, title: string, body: string, x: number, y: number, w: number, h: number) {
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x, y, w, h, 5, 5, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(x, y, w, h, 5, 5, "S");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
  pdf.text(title, x + 6, y + 10);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(SLATE[0], SLATE[1], SLATE[2]);
  wrap(pdf, body, x + 6, y + 18, w - 12, 4.2);
}

function bullets(pdf: jsPDF, title: string, items: string[], x: number, y: number, w: number) {
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x, y, w, 100, 5, 5, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(x, y, w, 100, 5, 5, "S");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
  pdf.text(title, x + 6, y + 10);
  let cy = y + 20;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(SLATE[0], SLATE[1], SLATE[2]);
  items.slice(0, 10).forEach((item) => {
    pdf.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2]);
    pdf.circle(x + 8, cy - 1.5, 1.2, "F");
    cy = wrap(pdf, item, x + 12, cy, w - 18, 4.1) + 2;
  });
}

function ranking(pdf: jsPDF, title: string, items: RankingItem[], x: number, y: number, w: number, h = 82) {
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x, y, w, h, 5, 5, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(x, y, w, h, 5, 5, "S");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
  pdf.text(title, x + 6, y + 10);
  const max = Math.max(...items.map((item) => item.total), 1);
  items.slice(0, 7).forEach((item, index) => {
    const ry = y + 22 + index * 7.5;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.2);
    pdf.setTextColor(SLATE[0], SLATE[1], SLATE[2]);
    const label = item.label.length > 30 ? `${item.label.slice(0, 30)}...` : item.label;
    pdf.text(label, x + 6, ry);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
    pdf.text(`${numberText(item.total)} · ${item.percentage}%`, x + w - 6, ry, { align: "right" });
    pdf.setFillColor(226, 232, 240);
    pdf.roundedRect(x + 6, ry + 2.3, w - 12, 2.5, 1.2, 1.2, "F");
    if (index === 0) {
      pdf.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2]);
    } else {
      pdf.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
    }
    pdf.roundedRect(x + 6, ry + 2.3, Math.max(((w - 12) * item.total) / max, 5), 2.5, 1.2, 1.2, "F");
  });
}

function kpiPage(pdf: jsPDF, result: AnalyticsResult, dashboard: PeopleDashboardResult, filters: PeopleFilters) {
  const pageW = pdf.internal.pageSize.getWidth();
  let y = 34;
  section(pdf, "Indicadores principales", 12, y);
  y += 12;
  const cardW = (pageW - 34) / 2;
  result.kpis.slice(0, 8).forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const accent = item.severity === "danger" ? "red" : item.severity === "warning" ? "orange" : item.severity === "success" ? "green" : "blue";
    kpi(pdf, item.label, valueText(item.value, item.unit), 12 + col * (cardW + 10), y + row * 34, cardW, accent);
  });
  y += Math.ceil(result.kpis.slice(0, 8).length / 2) * 34 + 4;
  box(pdf, "Filtros aplicados", `Sede: ${filters.sede} · Área: ${filters.area} · Cargo: ${filters.cargo} · Estado: ${filters.estado} · Departamento: ${filters.departamento} · Provincia: ${filters.provincia}`, 12, y, pageW - 24, 28);
  y += 38;
  box(pdf, "Alcance del análisis", `Se analizaron ${numberText(dashboard.totalRows)} registros, distribuidos en ${numberText(dashboard.totalSedes)} sedes, ${numberText(dashboard.totalAreas)} áreas, ${numberText(dashboard.totalCargos)} cargos y ${numberText(dashboard.totalDepartamentos)} departamentos. Este reporte se presenta para gerencia y/o jefaturas de CORPRISEG.`, 12, y, pageW - 24, 34);
}

function insightsPage(pdf: jsPDF, result: AnalyticsResult) {
  bullets(pdf, "Insights principales", result.insights.map((i) => `${i.title}: ${i.description}`), 12, 34, 132);
  bullets(pdf, "Recomendaciones", result.recommendations.map((i) => `${i.priority} · ${i.title}: ${i.description}`), 154, 34, 132);
}

function rankingsPage(pdf: jsPDF, dashboard: PeopleDashboardResult) {
  section(pdf, "Rankings ejecutivos", 12, 34);
  ranking(pdf, "Ranking por sede", dashboard.sedeRanking, 12, 48, 86);
  ranking(pdf, "Ranking por cargo", dashboard.cargoRanking, 105, 48, 86);
  ranking(pdf, "Ranking por área", dashboard.areaRanking, 198, 48, 88);
  ranking(pdf, "Distribución por estado", dashboard.estadoDistribution, 12, 140, 86, 62);
  ranking(pdf, "Ranking por departamento", dashboard.departamentoRanking, 105, 140, 86, 62);
  box(pdf, "Lectura sugerida", "Los rankings permiten identificar concentraciones, distribución operacional y focos de análisis para gerencia y jefaturas. Se recomienda cruzar estos resultados con rotación, ceses, antigüedad y supervisión.", 198, 140, 88, 62);
}

function validationPage(pdf: jsPDF, result: AnalyticsResult) {
  section(pdf, "Calidad de datos y validación", 12, 34);
  kpi(pdf, "Total registros", numberText(result.validation.totalRows), 12, 48, 60, "blue");
  kpi(pdf, "Errores", numberText(result.validation.errors), 82, 48, 48, result.validation.errors > 0 ? "red" : "green");
  kpi(pdf, "Advertencias", numberText(result.validation.warnings), 140, 48, 56, result.validation.warnings > 0 ? "orange" : "green");
  kpi(pdf, "Estado", result.validation.valid ? "Válido" : "Revisar", 206, 48, 60, result.validation.valid ? "green" : "orange");
  const issues = result.validation.issues.length
    ? result.validation.issues.slice(0, 12).map((issue) => {
        const location = issue.row ? `Fila ${issue.row}` : "Registro";
        return `${issue.severity.toUpperCase()} · ${location}${issue.column ? ` · ${issue.column}` : ""}: ${issue.title} - ${issue.description}`;
      })
    : ["No se detectaron errores críticos en la validación de datos."];
  bullets(pdf, "Observaciones de validación", issues, 12, 90, 274);
}

export async function generateAnalyticsPdf(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  filters: PeopleFilters;
}) {
  const { result, dashboard, filters } = params;
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const logo = await imageUrlToBase64("/images/corpriseg-logo.png");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  pdf.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
  pdf.rect(0, 0, pageW, pageH, "F");
  pdf.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2]);
  pdf.rect(0, 0, 12, pageH, "F");
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(22, 22, 76, 32, 6, 6, "F");
  brand(pdf, logo, 31, 29, 56, 15);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(30);
  pdf.text("Reporte Ejecutivo", 22, 88);
  pdf.setFontSize(17);
  pdf.text("People Analytics", 22, 104);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Presentado a Gerencia y/o Jefaturas de CORPRISEG", 22, 116);
  pdf.text(`Emitido: ${dateText()}`, 22, 129);
  pdf.text(`Fuente: ${result.metadata.source}`, 22, 138);
  pdf.text("Empresa / contexto: CORPRISEG", 22, 147);
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(22, 164, 250, 34, 6, 6, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
  pdf.text("Documento gerencial preparado para CORPRISEG", 32, 177);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(SLATE[0], SLATE[1], SLATE[2]);
  pdf.text("Elaborado por SOLINT Business Suite © LC2026", 32, 187);

  newPage(pdf, "Indicadores principales", 2, logo);
  kpiPage(pdf, result, dashboard, filters);
  newPage(pdf, "Insights y recomendaciones", 3, logo);
  insightsPage(pdf, result);
  newPage(pdf, "Rankings", 4, logo);
  rankingsPage(pdf, dashboard);
  newPage(pdf, "Validación", 5, logo);
  validationPage(pdf, result);
  return pdf;
}

export function openAnalyticsPdf(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  filters: PeopleFilters;
}) {
  const reportWindow = window.open("", "_blank", "noopener,noreferrer");
  if (reportWindow) {
    reportWindow.document.write("<p style='font-family:Arial;padding:24px'>Generando reporte CORPRISEG...</p>");
  }
  generateAnalyticsPdf(params).then((pdf) => {
    const url = URL.createObjectURL(pdf.output("blob"));
    if (reportWindow) reportWindow.location.href = url;
    else window.open(url, "_blank", "noopener,noreferrer");
  });
}

export function downloadAnalyticsPdf(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  filters: PeopleFilters;
}) {
  generateAnalyticsPdf(params).then((pdf) => {
    pdf.save(`CORPRISEG_PEOPLE_ANALYTICS_${new Date().toISOString().slice(0, 10)}.pdf`);
  });
}
