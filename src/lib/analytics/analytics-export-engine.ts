"use client";

import jsPDF from "jspdf";
import { AnalyticsResult } from "@/lib/analytics/types";
import {
  PeopleDashboardResult,
  PeopleFilters,
  RankingItem,
} from "@/lib/analytics/people-dashboard-engine";

type RGB = readonly [number, number, number];

const CORP_BLUE: RGB = [23, 59, 118];
const CORP_DARK: RGB = [9, 30, 66];
const CORP_ORANGE: RGB = [245, 130, 32];
const CORP_SLATE: RGB = [80, 92, 110];
const CORP_LIGHT: RGB = [244, 247, 251];
const WHITE: RGB = [255, 255, 255];

const PREPARED_BY = "Elaborado por SOLINT Business Suite © LC2026";

export type AnalyticsExportPayload = {
  app: "CORPRISEG";
  product: "People Analytics";
  preparedBy: typeof PREPARED_BY;
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

function setFill(pdf: jsPDF, color: RGB) {
  pdf.setFillColor(color[0], color[1], color[2]);
}

function setText(pdf: jsPDF, color: RGB) {
  pdf.setTextColor(color[0], color[1], color[2]);
}

function setDraw(pdf: jsPDF, color: RGB) {
  pdf.setDrawColor(color[0], color[1], color[2]);
}

function formatDate(value = new Date()) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-PE").format(value);
}

function safeText(value: unknown) {
  const output = String(value ?? "").trim();
  return output || "—";
}

function valueText(value: unknown, unit?: string) {
  return unit ? `${safeText(value)} ${unit}` : safeText(value);
}

function buildPayload({
  result,
  dashboard,
  filters,
}: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  filters: PeopleFilters;
}): AnalyticsExportPayload {
  return {
    app: "CORPRISEG",
    product: "People Analytics",
    preparedBy: PREPARED_BY,
    version: "4.1 CORPRISEG Stable PDF Engine",
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
  link.download = `CORPRISEG_PEOPLE_ANALYTICS_${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

async function loadImageBase64(url: string): Promise<string | null> {
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

function drawBrand(
  pdf: jsPDF,
  logo: string | null,
  x: number,
  y: number,
  w: number,
  h: number,
  light = false
) {
  if (logo) {
    try {
      pdf.addImage(logo, "PNG", x, y, w, h, undefined, "FAST");
      return;
    } catch {
      // fallback textual
    }
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  setText(pdf, light ? WHITE : CORP_BLUE);
  pdf.text("CORPRISEG", x, y + 10);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  setText(pdf, light ? [230, 238, 247] : CORP_SLATE);
  pdf.text("SEGURIDAD · PREVENCIÓN · CONFIANZA", x, y + 17);
}

function drawBackground(pdf: jsPDF) {
  setFill(pdf, CORP_LIGHT);
  pdf.rect(
    0,
    0,
    pdf.internal.pageSize.getWidth(),
    pdf.internal.pageSize.getHeight(),
    "F"
  );
}

function drawHeader(pdf: jsPDF, title: string, logo: string | null) {
  const width = pdf.internal.pageSize.getWidth();

  setFill(pdf, CORP_BLUE);
  pdf.rect(0, 0, width, 21, "F");

  setFill(pdf, CORP_ORANGE);
  pdf.rect(0, 21, width, 2.2, "F");

  drawBrand(pdf, logo, 10, 3.6, 36, 13, true);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setText(pdf, WHITE);
  pdf.text("CORPRISEG · Reporte Gerencial", 52, 12);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(title, width - 12, 12, { align: "right" });
}

function drawFooter(pdf: jsPDF, page: number) {
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();

  setDraw(pdf, [220, 226, 235]);
  pdf.line(12, height - 16, width - 12, height - 16);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  setText(pdf, CORP_BLUE);
  pdf.text("CORPRISEG", 12, height - 9);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  setText(pdf, CORP_SLATE);
  pdf.text("People Analytics · Reporte Ejecutivo", 40, height - 9);
  pdf.text(PREPARED_BY, width / 2, height - 9, { align: "center" });
  pdf.text(`Página ${page}`, width - 12, height - 9, { align: "right" });
}

function addPage(pdf: jsPDF, title: string, page: number, logo: string | null) {
  pdf.addPage();
  drawBackground(pdf);
  drawHeader(pdf, title, logo);
  drawFooter(pdf, page);
}

function drawSectionTitle(pdf: jsPDF, title: string, x: number, y: number) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  setText(pdf, CORP_BLUE);
  pdf.text(title, x, y);

  setFill(pdf, CORP_ORANGE);
  pdf.roundedRect(x, y + 3.2, 30, 1.5, 0.7, 0.7, "F");
}

function wrappedText(
  pdf: jsPDF,
  content: string,
  x: number,
  y: number,
  width: number,
  lineHeight = 5
) {
  const lines = pdf.splitTextToSize(content, width);
  pdf.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function accentColor(severity?: string): RGB {
  if (severity === "danger") return [185, 28, 28];
  if (severity === "warning") return CORP_ORANGE;
  if (severity === "success") return [4, 120, 87];
  return CORP_BLUE;
}

function drawKpiCard({
  pdf,
  label,
  value,
  x,
  y,
  width,
  color = CORP_BLUE,
}: {
  pdf: jsPDF;
  label: string;
  value: string;
  x: number;
  y: number;
  width: number;
  color?: RGB;
}) {
  setFill(pdf, WHITE);
  pdf.roundedRect(x, y, width, 28, 5, 5, "F");
  setDraw(pdf, [220, 226, 235]);
  pdf.roundedRect(x, y, width, 28, 5, 5, "S");

  setFill(pdf, color);
  pdf.roundedRect(x, y, 4, 28, 4, 4, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  setText(pdf, [100, 116, 139]);
  pdf.text(label.toUpperCase(), x + 8, y + 8);

  pdf.setFontSize(15);
  setText(pdf, CORP_DARK);
  pdf.text(value, x + 8, y + 20);
}

function drawInfoBox({
  pdf,
  title,
  body,
  x,
  y,
  width,
  height,
}: {
  pdf: jsPDF;
  title: string;
  body: string;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  setFill(pdf, WHITE);
  pdf.roundedRect(x, y, width, height, 5, 5, "F");
  setDraw(pdf, [220, 226, 235]);
  pdf.roundedRect(x, y, width, height, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setText(pdf, CORP_BLUE);
  pdf.text(title, x + 6, y + 10);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  setText(pdf, CORP_SLATE);
  wrappedText(pdf, body, x + 6, y + 18, width - 12, 4.2);
}

function drawBulletPanel({
  pdf,
  title,
  items,
  x,
  y,
  width,
}: {
  pdf: jsPDF;
  title: string;
  items: string[];
  x: number;
  y: number;
  width: number;
}) {
  setFill(pdf, WHITE);
  pdf.roundedRect(x, y, width, 100, 5, 5, "F");
  setDraw(pdf, [220, 226, 235]);
  pdf.roundedRect(x, y, width, 100, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  setText(pdf, CORP_BLUE);
  pdf.text(title, x + 6, y + 10);

  let currentY = y + 20;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  setText(pdf, CORP_SLATE);

  items.slice(0, 10).forEach((item) => {
    setFill(pdf, CORP_ORANGE);
    pdf.circle(x + 8, currentY - 1.5, 1.2, "F");
    currentY = wrappedText(pdf, item, x + 12, currentY, width - 18, 4.1) + 2;
  });
}

function drawRankingPanel({
  pdf,
  title,
  items,
  x,
  y,
  width,
  height = 82,
}: {
  pdf: jsPDF;
  title: string;
  items: RankingItem[];
  x: number;
  y: number;
  width: number;
  height?: number;
}) {
  setFill(pdf, WHITE);
  pdf.roundedRect(x, y, width, height, 5, 5, "F");
  setDraw(pdf, [220, 226, 235]);
  pdf.roundedRect(x, y, width, height, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setText(pdf, CORP_BLUE);
  pdf.text(title, x + 6, y + 10);

  const max = Math.max(...items.map((item) => item.total), 1);

  items.slice(0, 7).forEach((item, index) => {
    const rowY = y + 22 + index * 7.5;
    const label =
      item.label.length > 30 ? `${item.label.slice(0, 30)}...` : item.label;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.2);
    setText(pdf, CORP_SLATE);
    pdf.text(label, x + 6, rowY);

    pdf.setFont("helvetica", "bold");
    setText(pdf, CORP_BLUE);
    pdf.text(`${formatNumber(item.total)} · ${item.percentage}%`, x + width - 6, rowY, {
      align: "right",
    });

    setFill(pdf, [226, 232, 240]);
    pdf.roundedRect(x + 6, rowY + 2.3, width - 12, 2.5, 1.2, 1.2, "F");

    setFill(pdf, index === 0 ? CORP_ORANGE : CORP_BLUE);
    pdf.roundedRect(
      x + 6,
      rowY + 2.3,
      Math.max(((width - 12) * item.total) / max, 5),
      2.5,
      1.2,
      1.2,
      "F"
    );
  });
}

function drawKpiPage(
  pdf: jsPDF,
  result: AnalyticsResult,
  dashboard: PeopleDashboardResult,
  filters: PeopleFilters
) {
  const pageWidth = pdf.internal.pageSize.getWidth();

  let y = 34;
  drawSectionTitle(pdf, "Indicadores principales", 12, y);
  y += 12;

  const kpis = result.kpis.slice(0, 8);
  const cardWidth = (pageWidth - 34) / 2;

  kpis.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);

    drawKpiCard({
      pdf,
      label: item.label,
      value: valueText(item.value, item.unit),
      x: 12 + col * (cardWidth + 10),
      y: y + row * 34,
      width: cardWidth,
      color: accentColor(item.severity),
    });
  });

  y += Math.ceil(kpis.length / 2) * 34 + 4;

  drawInfoBox({
    pdf,
    title: "Filtros aplicados",
    body: `Sede: ${filters.sede} · Área: ${filters.area} · Cargo: ${filters.cargo} · Estado: ${filters.estado} · Departamento: ${filters.departamento} · Provincia: ${filters.provincia}`,
    x: 12,
    y,
    width: pageWidth - 24,
    height: 28,
  });

  y += 38;

  drawInfoBox({
    pdf,
    title: "Alcance del análisis",
    body: `Se analizaron ${formatNumber(dashboard.totalRows)} registros, distribuidos en ${formatNumber(dashboard.totalSedes)} sedes, ${formatNumber(dashboard.totalAreas)} áreas, ${formatNumber(dashboard.totalCargos)} cargos y ${formatNumber(dashboard.totalDepartamentos)} departamentos. Este reporte se presenta para gerencia y/o jefaturas de CORPRISEG.`,
    x: 12,
    y,
    width: pageWidth - 24,
    height: 34,
  });
}

function drawInsightsPage(pdf: jsPDF, result: AnalyticsResult) {
  drawBulletPanel({
    pdf,
    title: "Insights principales",
    items: result.insights.map((item) => `${item.title}: ${item.description}`),
    x: 12,
    y: 34,
    width: 132,
  });

  drawBulletPanel({
    pdf,
    title: "Recomendaciones",
    items: result.recommendations.map(
      (item) => `${item.priority} · ${item.title}: ${item.description}`
    ),
    x: 154,
    y: 34,
    width: 132,
  });
}

function drawRankingsPage(pdf: jsPDF, dashboard: PeopleDashboardResult) {
  drawSectionTitle(pdf, "Rankings ejecutivos", 12, 34);

  drawRankingPanel({
    pdf,
    title: "Ranking por sede",
    items: dashboard.sedeRanking,
    x: 12,
    y: 48,
    width: 86,
  });

  drawRankingPanel({
    pdf,
    title: "Ranking por cargo",
    items: dashboard.cargoRanking,
    x: 105,
    y: 48,
    width: 86,
  });

  drawRankingPanel({
    pdf,
    title: "Ranking por área",
    items: dashboard.areaRanking,
    x: 198,
    y: 48,
    width: 88,
  });

  drawRankingPanel({
    pdf,
    title: "Distribución por estado",
    items: dashboard.estadoDistribution,
    x: 12,
    y: 140,
    width: 86,
    height: 62,
  });

  drawRankingPanel({
    pdf,
    title: "Ranking por departamento",
    items: dashboard.departamentoRanking,
    x: 105,
    y: 140,
    width: 86,
    height: 62,
  });

  drawInfoBox({
    pdf,
    title: "Lectura sugerida",
    body: "Los rankings permiten identificar concentraciones, distribución operacional y focos de análisis para gerencia y jefaturas. Se recomienda cruzar estos resultados con rotación, ceses, antigüedad y supervisión.",
    x: 198,
    y: 140,
    width: 88,
    height: 62,
  });
}

function drawValidationPage(pdf: jsPDF, result: AnalyticsResult) {
  drawSectionTitle(pdf, "Calidad de datos y validación", 12, 34);

  drawKpiCard({
    pdf,
    label: "Total registros",
    value: formatNumber(result.validation.totalRows),
    x: 12,
    y: 48,
    width: 60,
  });

  drawKpiCard({
    pdf,
    label: "Errores",
    value: formatNumber(result.validation.errors),
    x: 82,
    y: 48,
    width: 48,
    color: result.validation.errors > 0 ? [185, 28, 28] : [4, 120, 87],
  });

  drawKpiCard({
    pdf,
    label: "Advertencias",
    value: formatNumber(result.validation.warnings),
    x: 140,
    y: 48,
    width: 56,
    color: result.validation.warnings > 0 ? CORP_ORANGE : [4, 120, 87],
  });

  drawKpiCard({
    pdf,
    label: "Estado",
    value: result.validation.valid ? "Válido" : "Revisar",
    x: 206,
    y: 48,
    width: 60,
    color: result.validation.valid ? [4, 120, 87] : CORP_ORANGE,
  });

  const issues = result.validation.issues.length
    ? result.validation.issues.slice(0, 12).map((issue) => {
        const location = issue.row ? `Fila ${issue.row}` : "Registro";
        return `${issue.severity.toUpperCase()} · ${location}${
          issue.column ? ` · ${issue.column}` : ""
        }: ${issue.title} - ${issue.description}`;
      })
    : ["No se detectaron errores críticos en la validación de datos."];

  drawBulletPanel({
    pdf,
    title: "Observaciones de validación",
    items: issues,
    x: 12,
    y: 90,
    width: 274,
  });
}

export async function generateAnalyticsPdf(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  filters: PeopleFilters;
}) {
  const { result, dashboard, filters } = params;
  const logo = await loadImageBase64("/images/corpriseg-logo.png");

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  setFill(pdf, CORP_BLUE);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  setFill(pdf, CORP_ORANGE);
  pdf.rect(0, 0, 12, pageHeight, "F");

  setFill(pdf, WHITE);
  pdf.roundedRect(22, 22, 76, 32, 6, 6, "F");
  drawBrand(pdf, logo, 31, 29, 56, 15);

  setText(pdf, WHITE);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(30);
  pdf.text("Reporte Ejecutivo", 22, 88);

  pdf.setFontSize(17);
  pdf.text("People Analytics", 22, 104);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Presentado a Gerencia y/o Jefaturas de CORPRISEG", 22, 116);
  pdf.text(`Emitido: ${formatDate()}`, 22, 129);
  pdf.text(`Fuente: ${result.metadata.source}`, 22, 138);
  pdf.text("Empresa / contexto: CORPRISEG", 22, 147);

  setFill(pdf, WHITE);
  pdf.roundedRect(22, 164, 250, 34, 6, 6, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setText(pdf, CORP_BLUE);
  pdf.text("Documento gerencial preparado para CORPRISEG", 32, 177);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  setText(pdf, CORP_SLATE);
  pdf.text(PREPARED_BY, 32, 187);

  addPage(pdf, "Indicadores principales", 2, logo);
  drawKpiPage(pdf, result, dashboard, filters);

  addPage(pdf, "Insights y recomendaciones", 3, logo);
  drawInsightsPage(pdf, result);

  addPage(pdf, "Rankings", 4, logo);
  drawRankingsPage(pdf, dashboard);

  addPage(pdf, "Validación", 5, logo);
  drawValidationPage(pdf, result);

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
      "<p style='font-family:Arial;padding:24px'>Generando reporte CORPRISEG...</p>"
    );
  }

  generateAnalyticsPdf(params).then((pdf) => {
    const url = URL.createObjectURL(pdf.output("blob"));

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
    pdf.save(`CORPRISEG_PEOPLE_ANALYTICS_${new Date().toISOString().slice(0, 10)}.pdf`);
  });
}
