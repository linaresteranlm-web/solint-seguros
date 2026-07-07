"use client";

import jsPDF from "jspdf";
import {
  AnalyticsResult,
} from "@/lib/analytics/types";
import {
  PeopleDashboardResult,
  PeopleFilters,
  RankingItem,
} from "@/lib/analytics/people-dashboard-engine";

export type AnalyticsExportPayload = {
  app: "SOLINT Analytics";
  product: "SOLINT SEGUROS";
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

function dateText() {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date());
}

function numberText(value: number) {
  return new Intl.NumberFormat("es-PE").format(value);
}

function buildPayload(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  filters: PeopleFilters;
}): AnalyticsExportPayload {
  const { result, dashboard, filters } = params;

  return {
    app: "SOLINT Analytics",
    product: "SOLINT SEGUROS",
    version: "1.0 Export Engine",
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
  link.download = `SOLINT_ANALYTICS_${payload.domain.toUpperCase()}_${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  document.body.appendChild(link);
  link.click();

  link.remove();
  URL.revokeObjectURL(url);
}

function safeText(value: unknown) {
  const text = String(value ?? "").trim();

  return text || "—";
}

function addFooter(pdf: jsPDF, pageWidth: number, pageHeight: number) {
  pdf.setFillColor(4, 34, 74);
  pdf.roundedRect(10, pageHeight - 18, pageWidth - 20, 11, 3, 3, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.text("SOLINT Analytics · SOLINT SEGUROS", 16, pageHeight - 11);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.text("Powered by SOLINT Business Systems", pageWidth - 16, pageHeight - 11, {
    align: "right",
  });
}

function addRanking(pdf: jsPDF, title: string, items: RankingItem[], x: number, y: number, width: number) {
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x, y, width, 50, 5, 5, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(x, y, width, 50, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(4, 34, 74);
  pdf.text(title, x + 6, y + 9);

  const max = Math.max(...items.map((item) => item.total), 1);

  items.slice(0, 5).forEach((item, index) => {
    const rowY = y + 18 + index * 6;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(80, 92, 110);

    const label = item.label.length > 28 ? `${item.label.slice(0, 28)}...` : item.label;
    pdf.text(label, x + 6, rowY);

    pdf.text(`${numberText(item.total)} · ${item.percentage}%`, x + width - 6, rowY, {
      align: "right",
    });

    pdf.setFillColor(226, 232, 240);
    pdf.roundedRect(x + 6, rowY + 2, width - 12, 2.2, 1, 1, "F");

    pdf.setFillColor(0, 94, 184);
    pdf.roundedRect(x + 6, rowY + 2, Math.max(((width - 12) * item.total) / max, 5), 2.2, 1, 1, "F");
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

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.setFillColor(244, 247, 251);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Header
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(10, 8, pageWidth - 20, 42, 6, 6, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(10, 8, pageWidth - 20, 42, 6, 6, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(4, 34, 74);
  pdf.text("SOLINT Analytics", 18, 24);

  pdf.setFontSize(11);
  pdf.setTextColor(0, 94, 184);
  pdf.text("Reporte Ejecutivo · People Analytics", 18, 34);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(80, 92, 110);
  pdf.text(`Emitido: ${dateText()}`, 18, 42);

  pdf.setFillColor(255, 116, 21);
  pdf.roundedRect(pageWidth - 72, 17, 52, 22, 5, 5, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("SOLINT SEGUROS", pageWidth - 46, 26, { align: "center" });
  pdf.setFontSize(10);
  pdf.text("BI REPORT", pageWidth - 46, 34, { align: "center" });

  // KPIs
  const kpis = result.kpis.slice(0, 6);
  const cardW = 43;
  const startX = 10;
  const startY = 60;

  kpis.forEach((kpi, index) => {
    const x = startX + index * (cardW + 5);

    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(x, startY, cardW, 30, 5, 5, "F");
    pdf.setDrawColor(220, 226, 235);
    pdf.roundedRect(x, startY, cardW, 30, 5, 5, "S");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.6);
    pdf.setTextColor(110, 123, 145);
    pdf.text(kpi.label.toUpperCase(), x + 4, startY + 8);

    pdf.setFontSize(16);
    pdf.setTextColor(kpi.severity === "danger" ? 185 : kpi.severity === "warning" ? 180 : 4, kpi.severity === "danger" ? 28 : kpi.severity === "warning" ? 83 : 34, kpi.severity === "danger" ? 28 : kpi.severity === "warning" ? 9 : 74);
    pdf.text(`${safeText(kpi.value)}${kpi.unit ? ` ${kpi.unit}` : ""}`, x + 4, startY + 21);
  });

  // Filters
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(10, 100, pageWidth - 20, 24, 5, 5, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(10, 100, pageWidth - 20, 24, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(4, 34, 74);
  pdf.text("Filtros aplicados", 18, 110);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(80, 92, 110);
  pdf.text(
    `Sede: ${filters.sede} · Área: ${filters.area} · Cargo: ${filters.cargo} · Estado: ${filters.estado} · Departamento: ${filters.departamento} · Provincia: ${filters.provincia}`,
    18,
    118
  );

  // Insights and recommendations
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(10, 133, 135, 38, 5, 5, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(10, 133, 135, 38, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(4, 34, 74);
  pdf.text("Insights principales", 18, 143);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(80, 92, 110);

  let y = 151;
  result.insights.slice(0, 3).forEach((insight) => {
    const lines = pdf.splitTextToSize(`• ${insight.title}: ${insight.description}`, 120);
    pdf.text(lines, 18, y);
    y += lines.length * 4 + 2;
  });

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(153, 133, pageWidth - 163, 38, 5, 5, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(153, 133, pageWidth - 163, 38, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(4, 34, 74);
  pdf.text("Recomendaciones", 161, 143);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(80, 92, 110);

  y = 151;
  result.recommendations.slice(0, 3).forEach((rec) => {
    const lines = pdf.splitTextToSize(`• ${rec.priority}: ${rec.description}`, 120);
    pdf.text(lines, 161, y);
    y += lines.length * 4 + 2;
  });

  // Rankings
  addRanking(pdf, "Ranking por Sede", dashboard.sedeRanking, 10, 180, 88);
  addRanking(pdf, "Ranking por Cargo", dashboard.cargoRanking, 105, 180, 88);
  addRanking(pdf, "Ranking por Área", dashboard.areaRanking, 200, 180, 87);

  addFooter(pdf, pageWidth, pageHeight);

  return pdf;
}

export function openAnalyticsPdf(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  filters: PeopleFilters;
}) {
  generateAnalyticsPdf(params).then((pdf) => {
    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
  });
}

export function downloadAnalyticsPdf(params: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  filters: PeopleFilters;
}) {
  generateAnalyticsPdf(params).then((pdf) => {
    pdf.save(`SOLINT_ANALYTICS_PEOPLE_${new Date().toISOString().slice(0, 10)}.pdf`);
  });
}
