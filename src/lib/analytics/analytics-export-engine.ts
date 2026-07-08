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

const BLUE = { r: 4, g: 34, b: 74 };
const BLUE2 = { r: 0, g: 94, b: 184 };
const ORANGE = { r: 255, g: 116, b: 21 };
const SLATE = { r: 80, g: 92, b: 110 };
const LIGHT = { r: 244, g: 247, b: 251 };

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

function valueText(value: unknown, unit?: string) {
  const text = safeText(value);

  return unit ? `${text} ${unit}` : text;
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
    version: "3.0 Executive PDF Engine",
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

function addSolintBrand(pdf: jsPDF, logoBase64: string | null, x: number, y: number, w: number, h: number) {
  if (logoBase64) {
    try {
      pdf.addImage(logoBase64, "PNG", x, y, w, h, undefined, "FAST");
      return;
    } catch {
      // fallback
    }
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(BLUE2.r, BLUE2.g, BLUE2.b);
  pdf.text("SOLINT", x, y + 10);

  pdf.setFontSize(8);
  pdf.setTextColor(BLUE.r, BLUE.g, BLUE.b);
  pdf.text("Business Suite", x, y + 17);
}

function addPageBackground(pdf: jsPDF) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.setFillColor(LIGHT.r, LIGHT.g, LIGHT.b);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");
}

function addHeader(pdf: jsPDF, title: string, logoBase64: string | null) {
  const pageWidth = pdf.internal.pageSize.getWidth();

  pdf.setFillColor(BLUE.r, BLUE.g, BLUE.b);
  pdf.rect(0, 0, pageWidth, 20, "F");

  pdf.setFillColor(ORANGE.r, ORANGE.g, ORANGE.b);
  pdf.rect(0, 20, pageWidth, 2.2, "F");

  addSolintBrand(pdf, logoBase64, 10, 3, 32, 12);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.text("SOLINT Business Suite · People Analytics", 50, 12);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(title, pageWidth - 12, 12, { align: "right" });
}

function addFooter(pdf: jsPDF, pageNumber: number) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.setDrawColor(220, 226, 235);
  pdf.line(12, pageHeight - 16, pageWidth - 12, pageHeight - 16);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(BLUE.r, BLUE.g, BLUE.b);
  pdf.text("SOLINT Business Suite", 12, pageHeight - 9);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(SLATE.r, SLATE.g, SLATE.b);
  pdf.text("People Analytics · Reporte Ejecutivo", 56, pageHeight - 9);
  pdf.text(`Página ${pageNumber}`, pageWidth - 12, pageHeight - 9, {
    align: "right",
  });
}

function addNewPage(pdf: jsPDF, title: string, pageNumber: number, logoBase64: string | null) {
  pdf.addPage();
  addPageBackground(pdf);
  addHeader(pdf, title, logoBase64);
  addFooter(pdf, pageNumber);
}

function sectionTitle(pdf: jsPDF, title: string, x: number, y: number) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(BLUE.r, BLUE.g, BLUE.b);
  pdf.text(title, x, y);

  pdf.setFillColor(ORANGE.r, ORANGE.g, ORANGE.b);
  pdf.roundedRect(x, y + 3.2, 30, 1.5, 0.7, 0.7, "F");
}

function paragraph(pdf: jsPDF, text: string, x: number, y: number, width: number, lineHeight = 5) {
  const lines = pdf.splitTextToSize(text, width);
  pdf.text(lines, x, y);

  return y + lines.length * lineHeight;
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
  const { pdf, label, value, x, y, w, h = 26, accent = "blue" } = params;

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x, y, w, h, 5, 5, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(x, y, w, h, 5, 5, "S");

  const accentColor =
    accent === "orange"
      ? ORANGE
      : accent === "red"
        ? { r: 185, g: 28, b: 28 }
        : accent === "green"
          ? { r: 4, g: 120, b: 87 }
          : BLUE2;

  pdf.setFillColor(accentColor.r, accentColor.g, accentColor.b);
  pdf.roundedRect(x, y, 4, h, 4, 4, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text(label.toUpperCase(), x + 8, y + 8);

  pdf.setFontSize(15);
  pdf.setTextColor(BLUE.r, BLUE.g, BLUE.b);
  pdf.text(value, x + 8, y + 20);
}

function addInfoBox(pdf: jsPDF, title: string, text: string, x: number, y: number, w: number, h: number) {
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x, y, w, h, 5, 5, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(x, y, w, h, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(BLUE.r, BLUE.g, BLUE.b);
  pdf.text(title, x + 6, y + 10);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(SLATE.r, SLATE.g, SLATE.b);
  paragraph(pdf, text, x + 6, y + 18, w - 12, 4.2);
}

function addBulletList(pdf: jsPDF, title: string, items: string[], x: number, y: number, w: number, maxItems = 8) {
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x, y, w, 100, 5, 5, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(x, y, w, 100, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(BLUE.r, BLUE.g, BLUE.b);
  pdf.text(title, x + 6, y + 10);

  let currentY = y + 20;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(SLATE.r, SLATE.g, SLATE.b);

  items.slice(0, maxItems).forEach((item) => {
    pdf.setFillColor(ORANGE.r, ORANGE.g, ORANGE.b);
    pdf.circle(x + 8, currentY - 1.5, 1.2, "F");

    currentY = paragraph(pdf, item, x + 12, currentY, w - 18, 4.1) + 2;
  });
}

function addRanking(pdf: jsPDF, title: string, items: RankingItem[], x: number, y: number, w: number, h = 82) {
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x, y, w, h, 5, 5, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(x, y, w, h, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(BLUE.r, BLUE.g, BLUE.b);
  pdf.text(title, x + 6, y + 10);

  const max = Math.max(...items.map((item) => item.total), 1);

  items.slice(0, 7).forEach((item, index) => {
    const rowY = y + 22 + index * 7.5;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.2);
    pdf.setTextColor(SLATE.r, SLATE.g, SLATE.b);

    const label = item.label.length > 30 ? `${item.label.slice(0, 30)}...` : item.label;
    pdf.text(label, x + 6, rowY);

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(BLUE.r, BLUE.g, BLUE.b);
    pdf.text(`${numberText(item.total)} · ${item.percentage}%`, x + w - 6, rowY, {
      align: "right",
    });

    pdf.setFillColor(226, 232, 240);
    pdf.roundedRect(x + 6, rowY + 2.3, w - 12, 2.5, 1.2, 1.2, "F");

    pdf.setFillColor(index === 0 ? ORANGE.r : BLUE2.r, index === 0 ? ORANGE.g : BLUE2.g, index === 0 ? ORANGE.b : BLUE2.b);
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

    const accent =
      kpi.severity === "danger"
        ? "red"
        : kpi.severity === "warning"
          ? "orange"
          : kpi.severity === "success"
            ? "green"
            : "blue";

    kpiCard({
      pdf,
      label: kpi.label,
      value: valueText(kpi.value, kpi.unit),
      x,
      y: cardY,
      w: cardW,
      h: 28,
      accent,
    });
  });

  y += Math.ceil(kpis.length / 2) * 34 + 4;

  addInfoBox(
    pdf,
    "Filtros aplicados",
    `Sede: ${filters.sede} · Área: ${filters.area} · Cargo: ${filters.cargo} · Estado: ${filters.estado} · Departamento: ${filters.departamento} · Provincia: ${filters.provincia}`,
    12,
    y,
    pageWidth - 24,
    28
  );

  y += 38;

  addInfoBox(
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

  addBulletList(pdf, "Insights principales", insights, 12, 34, 132, 10);
  addBulletList(pdf, "Recomendaciones", recommendations, 154, 34, 132, 10);
}

function addRankingsPage(pdf: jsPDF, dashboard: PeopleDashboardResult) {
  sectionTitle(pdf, "Rankings ejecutivos", 12, 34);

  addRanking(pdf, "Ranking por sede", dashboard.sedeRanking, 12, 48, 86);
  addRanking(pdf, "Ranking por cargo", dashboard.cargoRanking, 105, 48, 86);
  addRanking(pdf, "Ranking por área", dashboard.areaRanking, 198, 48, 88);

  addRanking(pdf, "Distribución por estado", dashboard.estadoDistribution, 12, 140, 86, 62);
  addRanking(pdf, "Ranking por departamento", dashboard.departamentoRanking, 105, 140, 86, 62);

  addInfoBox(
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
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(12, y, 274, 104, 5, 5, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(12, y, 274, 104, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(BLUE.r, BLUE.g, BLUE.b);
  pdf.text("Observaciones de validación", 20, y + 11);

  y += 24;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(SLATE.r, SLATE.g, SLATE.b);

  const issues = result.validation.issues.length
    ? result.validation.issues.slice(0, 12).map((issue) => {
        const location = issue.row ? `Fila ${issue.row}` : "Registro";
        return `${issue.severity.toUpperCase()} · ${location}${issue.column ? ` · ${issue.column}` : ""}: ${issue.title} - ${issue.description}`;
      })
    : ["No se detectaron errores críticos en la validación de datos."];

  issues.forEach((issue) => {
    pdf.setFillColor(ORANGE.r, ORANGE.g, ORANGE.b);
    pdf.circle(22, y - 1.5, 1.2, "F");
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
  pdf.setFillColor(BLUE.r, BLUE.g, BLUE.b);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  pdf.setFillColor(ORANGE.r, ORANGE.g, ORANGE.b);
  pdf.rect(0, 0, 12, pageHeight, "F");

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(22, 22, 66, 28, 6, 6, "F");
  addSolintBrand(pdf, logoBase64, 30, 28, 46, 14);

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(30);
  pdf.text("Reporte Ejecutivo", 22, 88);

  pdf.setFontSize(17);
  pdf.text("People Analytics", 22, 104);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`Emitido: ${dateText()}`, 22, 122);
  pdf.text(`Fuente: ${result.metadata.source}`, 22, 131);
  pdf.text(`Empresa / contexto: ${result.metadata.company || "No especificado"}`, 22, 140);

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(22, 158, 250, 32, 6, 6, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(BLUE.r, BLUE.g, BLUE.b);
  pdf.text("Preparado por SOLINT Business Suite", 32, 171);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(SLATE.r, SLATE.g, SLATE.b);
  pdf.text("Business Intelligence · Gestión Humana · Analítica Ejecutiva", 32, 181);

  // Página 2
  addNewPage(pdf, "Indicadores principales", 2, logoBase64);
  addKpiPage({ pdf, result, dashboard, filters });

  // Página 3
  addNewPage(pdf, "Insights y recomendaciones", 3, logoBase64);
  addInsightsPage(pdf, result);

  // Página 4
  addNewPage(pdf, "Rankings", 4, logoBase64);
  addRankingsPage(pdf, dashboard);

  // Página 5
  addNewPage(pdf, "Validación", 5, logoBase64);
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
    pdf.save(`SOLINT_BUSINESS_SUITE_PEOPLE_ANALYTICS_${new Date().toISOString().slice(0, 10)}.pdf`);
  });
}
