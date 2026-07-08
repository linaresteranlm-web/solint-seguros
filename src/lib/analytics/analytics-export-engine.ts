"use client";

import jsPDF from "jspdf";
import { AnalyticsResult } from "@/lib/analytics/types";
import {
  PeopleDashboardResult,
  PeopleFilters,
  RankingItem,
} from "@/lib/analytics/people-dashboard-engine";

export type AnalyticsExportPayload = {
  app: "SOLINT Business Suite";
  product: "People Analytics";
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

const BRAND = {
  blue: [4, 34, 74] as const,
  blue2: [0, 94, 184] as const,
  orange: [255, 116, 21] as const,
  slate: [80, 92, 110] as const,
  light: [244, 247, 251] as const,
  border: [220, 226, 235] as const,
  white: [255, 255, 255] as const,
};

function setFill(pdf: jsPDF, color: readonly [number, number, number]) {
  pdf.setFillColor(color[0], color[1], color[2]);
}

function setText(pdf: jsPDF, color: readonly [number, number, number]) {
  pdf.setTextColor(color[0], color[1], color[2]);
}

function setDraw(pdf: jsPDF, color: readonly [number, number, number]) {
  pdf.setDrawColor(color[0], color[1], color[2]);
}

function dateText(value = new Date()) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(value);
}

function numberText(value: number) {
  return new Intl.NumberFormat("es-PE").format(value);
}

function safeText(value: unknown) {
  const text = String(value ?? "").trim();
  return text || "—";
}

function metricValue(value: unknown, unit?: string) {
  return `${safeText(value)}${unit ? ` ${unit}` : ""}`;
}

function buildPayload(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  filters: PeopleFilters;
}): AnalyticsExportPayload {
  const { result, dashboard, filters } = params;

  return {
    app: "SOLINT Business Suite",
    product: "People Analytics",
    version: "4.0 Multi Page Executive PDF",
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
  link.download = `SOLINT_BUSINESS_SUITE_${payload.domain.toUpperCase()}_${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

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

function paragraph(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  lineHeight = 4.5
) {
  const lines = pdf.splitTextToSize(text, width);
  pdf.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function drawSolintBrand(
  pdf: jsPDF,
  logoBase64: string | null,
  x: number,
  y: number,
  width: number,
  height: number,
  light = false
) {
  if (logoBase64) {
    try {
      pdf.addImage(logoBase64, "PNG", x, y, width, height, undefined, "FAST");
      return;
    } catch {
      // text fallback
    }
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(17);
  setText(pdf, light ? BRAND.white : BRAND.blue2);
  pdf.text("SOLINT", x, y + 10);
  pdf.setFontSize(7.5);
  setText(pdf, light ? [230, 240, 255] : BRAND.blue);
  pdf.text("Business Suite", x, y + 17);
}

function pageBackground(pdf: jsPDF) {
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();
  setFill(pdf, BRAND.light);
  pdf.rect(0, 0, w, h, "F");
}

function header(pdf: jsPDF, title: string, logoBase64: string | null) {
  const w = pdf.internal.pageSize.getWidth();

  setFill(pdf, BRAND.blue);
  pdf.rect(0, 0, w, 20, "F");
  setFill(pdf, BRAND.orange);
  pdf.rect(0, 20, w, 2.2, "F");

  drawSolintBrand(pdf, logoBase64, 11, 3.2, 30, 11.5, true);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  setText(pdf, BRAND.white);
  pdf.text("SOLINT Business Suite · People Analytics", 48, 12);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(title, w - 12, 12, { align: "right" });
}

function footer(pdf: jsPDF, pageNumber: number) {
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  setDraw(pdf, BRAND.border);
  pdf.line(12, h - 15, w - 12, h - 15);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  setText(pdf, BRAND.blue);
  pdf.text("SOLINT Business Suite", 12, h - 8.5);

  pdf.setFont("helvetica", "normal");
  setText(pdf, BRAND.slate);
  pdf.text("People Analytics · Reporte Ejecutivo", 52, h - 8.5);
  pdf.text(`Página ${pageNumber}`, w - 12, h - 8.5, { align: "right" });
}

function newReportPage(
  pdf: jsPDF,
  title: string,
  pageNumber: number,
  logoBase64: string | null
) {
  pdf.addPage();
  pageBackground(pdf);
  header(pdf, title, logoBase64);
  footer(pdf, pageNumber);
}

function sectionTitle(pdf: jsPDF, title: string, x: number, y: number) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  setText(pdf, BRAND.blue);
  pdf.text(title, x, y);

  setFill(pdf, BRAND.orange);
  pdf.roundedRect(x, y + 3.2, 30, 1.4, 0.6, 0.6, "F");
}

function kpiCard(params: {
  pdf: jsPDF;
  label: string;
  value: string;
  x: number;
  y: number;
  w: number;
  h?: number;
  accent?: "blue" | "orange" | "red" | "green";
}) {
  const { pdf, label, value, x, y, w, h = 28, accent = "blue" } = params;

  setFill(pdf, BRAND.white);
  pdf.roundedRect(x, y, w, h, 5, 5, "F");
  setDraw(pdf, BRAND.border);
  pdf.roundedRect(x, y, w, h, 5, 5, "S");

  const accentColor =
    accent === "orange"
      ? BRAND.orange
      : accent === "red"
        ? ([185, 28, 28] as const)
        : accent === "green"
          ? ([4, 120, 87] as const)
          : BRAND.blue2;

  setFill(pdf, accentColor);
  pdf.roundedRect(x, y, 4.2, h, 4, 4, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.9);
  setText(pdf, [100, 116, 139]);
  pdf.text(label.toUpperCase(), x + 8, y + 8);

  pdf.setFontSize(15);
  setText(pdf, BRAND.blue);
  pdf.text(value, x + 8, y + 20.5);
}

function infoBox(
  pdf: jsPDF,
  title: string,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number
) {
  setFill(pdf, BRAND.white);
  pdf.roundedRect(x, y, w, h, 5, 5, "F");
  setDraw(pdf, BRAND.border);
  pdf.roundedRect(x, y, w, h, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setText(pdf, BRAND.blue);
  pdf.text(title, x + 6, y + 10);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  setText(pdf, BRAND.slate);
  paragraph(pdf, text, x + 6, y + 18, w - 12, 4.3);
}

function bulletList(
  pdf: jsPDF,
  title: string,
  items: string[],
  x: number,
  y: number,
  w: number,
  h: number,
  maxItems = 8
) {
  setFill(pdf, BRAND.white);
  pdf.roundedRect(x, y, w, h, 5, 5, "F");
  setDraw(pdf, BRAND.border);
  pdf.roundedRect(x, y, w, h, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  setText(pdf, BRAND.blue);
  pdf.text(title, x + 6, y + 10);

  let currentY = y + 21;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  setText(pdf, BRAND.slate);

  items.slice(0, maxItems).forEach((item) => {
    if (currentY > y + h - 8) return;

    setFill(pdf, BRAND.orange);
    pdf.circle(x + 8, currentY - 1.5, 1.1, "F");
    currentY = paragraph(pdf, item, x + 12, currentY, w - 18, 4.1) + 2;
  });
}

function rankingCard(
  pdf: jsPDF,
  title: string,
  items: RankingItem[],
  x: number,
  y: number,
  w: number,
  h = 82
) {
  setFill(pdf, BRAND.white);
  pdf.roundedRect(x, y, w, h, 5, 5, "F");
  setDraw(pdf, BRAND.border);
  pdf.roundedRect(x, y, w, h, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setText(pdf, BRAND.blue);
  pdf.text(title, x + 6, y + 10);

  const max = Math.max(...items.map((item) => item.total), 1);

  items.slice(0, 7).forEach((item, index) => {
    const rowY = y + 22 + index * 7.5;
    const label = item.label.length > 30 ? `${item.label.slice(0, 30)}...` : item.label;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.2);
    setText(pdf, BRAND.slate);
    pdf.text(label, x + 6, rowY);

    pdf.setFont("helvetica", "bold");
    setText(pdf, BRAND.blue);
    pdf.text(`${numberText(item.total)} · ${item.percentage}%`, x + w - 6, rowY, {
      align: "right",
    });

    pdf.setFillColor(226, 232, 240);
    pdf.roundedRect(x + 6, rowY + 2.3, w - 12, 2.5, 1.2, 1.2, "F");

    const bar = index === 0 ? BRAND.orange : BRAND.blue2;
    setFill(pdf, bar);
    pdf.roundedRect(
      x + 6,
      rowY + 2.3,
      Math.max(((w - 12) * item.total) / max, 5),
      2.5,
      1.2,
      1.2,
      "F"
    );
  });
}

function severityAccent(severity: string): "blue" | "orange" | "red" | "green" {
  if (severity === "danger") return "red";
  if (severity === "warning") return "orange";
  if (severity === "success") return "green";
  return "blue";
}

function addKpiPage(params: {
  pdf: jsPDF;
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  filters: PeopleFilters;
}) {
  const { pdf, result, dashboard, filters } = params;
  const pageWidth = pdf.internal.pageSize.getWidth();

  let y = 34;
  sectionTitle(pdf, "Indicadores principales", 12, y);
  y += 12;

  const kpis = result.kpis.slice(0, 8);
  const cardW = (pageWidth - 34) / 2;

  kpis.forEach((kpi, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 12 + col * (cardW + 10);
    const cardY = y + row * 34;

    kpiCard({
      pdf,
      label: kpi.label,
      value: metricValue(kpi.value, kpi.unit),
      x,
      y: cardY,
      w: cardW,
      h: 28,
      accent: severityAccent(kpi.severity),
    });
  });

  y += Math.ceil(kpis.length / 2) * 34 + 5;

  infoBox(
    pdf,
    "Filtros aplicados",
    `Sede: ${filters.sede} · Área: ${filters.area} · Cargo: ${filters.cargo} · Estado: ${filters.estado} · Departamento: ${filters.departamento} · Provincia: ${filters.provincia}`,
    12,
    y,
    pageWidth - 24,
    28
  );

  y += 38;

  infoBox(
    pdf,
    "Alcance del análisis",
    `Se analizaron ${numberText(dashboard.totalRows)} registros, distribuidos en ${numberText(dashboard.totalSedes)} sedes, ${numberText(dashboard.totalAreas)} áreas, ${numberText(dashboard.totalCargos)} cargos y ${numberText(dashboard.totalDepartamentos)} departamentos. Este reporte se genera con los datos actualmente cargados en el navegador.`,
    12,
    y,
    pageWidth - 24,
    34
  );
}

function addInsightsPage(pdf: jsPDF, result: AnalyticsResult) {
  const insights = result.insights.map((item) => `${item.title}: ${item.description}`);
  const recommendations = result.recommendations.map(
    (item) => `${item.priority} · ${item.title}: ${item.description}`
  );

  bulletList(pdf, "Insights principales", insights, 12, 34, 132, 128, 10);
  bulletList(pdf, "Recomendaciones", recommendations, 154, 34, 132, 128, 10);
}

function addRankingsPage(pdf: jsPDF, dashboard: PeopleDashboardResult) {
  sectionTitle(pdf, "Rankings ejecutivos", 12, 34);

  rankingCard(pdf, "Ranking por sede", dashboard.sedeRanking, 12, 48, 86);
  rankingCard(pdf, "Ranking por cargo", dashboard.cargoRanking, 105, 48, 86);
  rankingCard(pdf, "Ranking por área", dashboard.areaRanking, 198, 48, 88);

  rankingCard(pdf, "Distribución por estado", dashboard.estadoDistribution, 12, 140, 86, 62);
  rankingCard(pdf, "Ranking por departamento", dashboard.departamentoRanking, 105, 140, 86, 62);

  infoBox(
    pdf,
    "Lectura sugerida",
    "Los rankings permiten identificar concentraciones, distribución operacional y focos de análisis. Para conclusiones gerenciales, se recomienda cruzar estos resultados con rotación, ceses, antigüedad y supervisión.",
    198,
    140,
    88,
    62
  );
}

function addValidationPage(pdf: jsPDF, result: AnalyticsResult) {
  sectionTitle(pdf, "Calidad de datos y validación", 12, 34);

  kpiCard({
    pdf,
    label: "Total registros",
    value: numberText(result.validation.totalRows),
    x: 12,
    y: 48,
    w: 60,
    accent: "blue",
  });

  kpiCard({
    pdf,
    label: "Errores",
    value: numberText(result.validation.errors),
    x: 82,
    y: 48,
    w: 48,
    accent: result.validation.errors > 0 ? "red" : "green",
  });

  kpiCard({
    pdf,
    label: "Advertencias",
    value: numberText(result.validation.warnings),
    x: 140,
    y: 48,
    w: 56,
    accent: result.validation.warnings > 0 ? "orange" : "green",
  });

  kpiCard({
    pdf,
    label: "Estado",
    value: result.validation.valid ? "Válido" : "Revisar",
    x: 206,
    y: 48,
    w: 60,
    accent: result.validation.valid ? "green" : "orange",
  });

  let y = 90;
  setFill(pdf, BRAND.white);
  pdf.roundedRect(12, y, 274, 104, 5, 5, "F");
  setDraw(pdf, BRAND.border);
  pdf.roundedRect(12, y, 274, 104, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  setText(pdf, BRAND.blue);
  pdf.text("Observaciones de validación", 20, y + 11);

  y += 24;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  setText(pdf, BRAND.slate);

  const issues = result.validation.issues.length
    ? result.validation.issues.slice(0, 12).map((issue) => {
        const location = issue.row ? `Fila ${issue.row}` : "Registro";
        return `${issue.severity.toUpperCase()} · ${location}${issue.column ? ` · ${issue.column}` : ""}: ${issue.title} - ${issue.description}`;
      })
    : ["No se detectaron errores críticos en la validación de datos."];

  issues.forEach((issue) => {
    setFill(pdf, BRAND.orange);
    pdf.circle(22, y - 1.5, 1.1, "F");
    y = paragraph(pdf, issue, 28, y, 248, 4.1) + 2;
  });
}

export async function generateAnalyticsPdf(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  filters: PeopleFilters;
}) {
  const { result, dashboard, filters } = params;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const logoBase64 = await imageUrlToBase64("/images/solint-business-systems.png");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Portada
  setFill(pdf, BRAND.blue);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");
  setFill(pdf, BRAND.orange);
  pdf.rect(0, 0, 13, pageHeight, "F");

  setFill(pdf, BRAND.white);
  pdf.roundedRect(24, 23, 68, 28, 6, 6, "F");
  drawSolintBrand(pdf, logoBase64, 31, 29, 49, 15);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(30);
  setText(pdf, BRAND.white);
  pdf.text("Reporte Ejecutivo", 24, 88);

  pdf.setFontSize(17);
  pdf.text("People Analytics", 24, 104);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`Emitido: ${dateText()}`, 24, 122);
  pdf.text(`Fuente: ${result.metadata.source}`, 24, 131);
  pdf.text(`Empresa / contexto: ${result.metadata.company || "No especificado"}`, 24, 140);

  setFill(pdf, BRAND.white);
  pdf.roundedRect(24, 158, 250, 32, 6, 6, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setText(pdf, BRAND.blue);
  pdf.text("Preparado por SOLINT Business Suite", 34, 171);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  setText(pdf, BRAND.slate);
  pdf.text("Business Intelligence · Gestión Humana · Analítica Ejecutiva", 34, 181);

  newReportPage(pdf, "Indicadores principales", 2, logoBase64);
  addKpiPage({ pdf, result, dashboard, filters });

  newReportPage(pdf, "Insights y recomendaciones", 3, logoBase64);
  addInsightsPage(pdf, result);

  newReportPage(pdf, "Rankings", 4, logoBase64);
  addRankingsPage(pdf, dashboard);

  newReportPage(pdf, "Validación", 5, logoBase64);
  addValidationPage(pdf, result);

  return pdf;
}

export function openAnalyticsPdf(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  filters: PeopleFilters;
}) {
  const reportWindow = window.open("", "_blank", "noopener,noreferrer");

  if (reportWindow) {
    reportWindow.document.write(
      "<p style='font-family:Arial;padding:24px'>Generando reporte ejecutivo SOLINT Business Suite...</p>"
    );
  }

  generateAnalyticsPdf(params).then((pdf) => {
    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);

    if (reportWindow) {
      reportWindow.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  });
}

export function downloadAnalyticsPdf(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  filters: PeopleFilters;
}) {
  generateAnalyticsPdf(params).then((pdf) => {
    pdf.save(
      `SOLINT_BUSINESS_SUITE_PEOPLE_ANALYTICS_${new Date().toISOString().slice(0, 10)}.pdf`
    );
  });
}
