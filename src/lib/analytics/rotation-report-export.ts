"use client";

import jsPDF from "jspdf";
import * as XLSX from "xlsx-js-style";
import {
  RotationAnalysisResult,
  RotationRankingItem,
  formatNumber,
  formatPercent,
} from "@/lib/analytics/rotation-indicators-engine";

export type RotationReportSections = {
  portada: boolean;
  metodologia: boolean;
  mensual: boolean;
  rankings: boolean;
  hallazgos: boolean;
  recomendaciones: boolean;
};

export const DEFAULT_ROTATION_REPORT_SECTIONS: RotationReportSections = {
  portada: true,
  metodologia: true,
  mensual: true,
  rankings: true,
  hallazgos: true,
  recomendaciones: true,
};

const CORP_BLUE = "173b76";
const CORP_ORANGE = "f58220";
const CORP_DARK = "0f172a";

function periodText(analysis: RotationAnalysisResult) {
  const first = analysis.monthly[0]?.monthName ?? "Inicio";
  const last = analysis.monthly[analysis.monthly.length - 1]?.monthName ?? "Fin";

  return `${first} - ${last} ${analysis.period.year}`;
}

function dateText(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function drawHeader(pdf: jsPDF, title: string) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(23, 59, 118);
  pdf.rect(0, 0, pageWidth, 18, "F");
  pdf.setFillColor(245, 130, 32);
  pdf.rect(0, 18, pageWidth, 2, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("CORPRISEG · Indicadores Gerenciales", 12, 12);
  pdf.setFontSize(9);
  pdf.text(title, pageWidth - 12, 12, { align: "right" });
}

function drawFooter(pdf: jsPDF, pageNumber: number) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.setDrawColor(230, 234, 242);
  pdf.line(12, pageHeight - 15, pageWidth - 12, pageHeight - 15);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Elaborado por SOLINT Business Suite", 12, pageHeight - 8);
  pdf.text(`Página ${pageNumber}`, pageWidth - 12, pageHeight - 8, { align: "right" });
}

function addNewPage(pdf: jsPDF, title: string, pageNumber: number) {
  pdf.addPage();
  drawHeader(pdf, title);
  drawFooter(pdf, pageNumber);
}

function addWrappedText(pdf: jsPDF, text: string, x: number, y: number, width: number, lineHeight = 5) {
  const lines = pdf.splitTextToSize(text, width);
  pdf.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function drawKpiCard(pdf: jsPDF, label: string, value: string, x: number, y: number, w: number) {
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(x, y, w, 22, 4, 4, "F");
  pdf.setDrawColor(225, 232, 240);
  pdf.roundedRect(x, y, w, 22, 4, 4, "S");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text(label.toUpperCase(), x + 4, y + 7);
  pdf.setFontSize(14);
  pdf.setTextColor(23, 59, 118);
  pdf.text(value, x + 4, y + 17);
}

function drawMonthlyTable(pdf: jsPDF, analysis: RotationAnalysisResult, startY: number) {
  const headers = ["Mes", "HC Inicial", "HC Final", "HC Prom.", "Ingresos", "Ceses", "Rotación"];
  const widths = [30, 24, 24, 24, 24, 20, 26];
  let y = startY;
  let x = 12;

  pdf.setFillColor(23, 59, 118);
  pdf.rect(12, y, 172, 8, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);
  headers.forEach((header, index) => {
    pdf.text(header, x + 2, y + 5.5);
    x += widths[index];
  });
  y += 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(15, 23, 42);
  analysis.monthly.forEach((item, rowIndex) => {
    x = 12;
    pdf.setFillColor(rowIndex % 2 === 0 ? 248 : 255, rowIndex % 2 === 0 ? 250 : 255, rowIndex % 2 === 0 ? 252 : 255);
    pdf.rect(12, y, 172, 8, "F");
    const values = [
      item.monthName,
      String(item.headcountStart),
      String(item.headcountEnd),
      formatNumber(item.averageHeadcount),
      String(item.hires),
      String(item.exits),
      formatPercent(item.rotationRate),
    ];
    values.forEach((value, index) => {
      pdf.text(value, x + 2, y + 5.5);
      x += widths[index];
    });
    y += 8;
  });

  return y + 4;
}

function drawRanking(pdf: jsPDF, title: string, items: RotationRankingItem[], x: number, y: number, w: number) {
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(x, y, w, 54, 4, 4, "F");
  pdf.setDrawColor(225, 232, 240);
  pdf.roundedRect(x, y, w, 54, 4, 4, "S");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(23, 59, 118);
  pdf.text(title, x + 4, y + 7);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.8);
  pdf.setTextColor(71, 85, 105);
  items.slice(0, 5).forEach((item, index) => {
    const rowY = y + 15 + index * 7;
    const label = item.label.length > 24 ? `${item.label.slice(0, 24)}...` : item.label;
    pdf.text(label, x + 4, rowY);
    pdf.text(`${formatPercent(item.rotationRate)} · ${item.exits} ceses`, x + w - 4, rowY, { align: "right" });
  });
}

export function openRotationPdf(analysis: RotationAnalysisResult, sections: RotationReportSections) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let pageNumber = 1;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  if (sections.portada) {
    pdf.setFillColor(23, 59, 118);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    pdf.setFillColor(245, 130, 32);
    pdf.rect(0, 0, 10, pageHeight, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(27);
    pdf.text("CORPRISEG", 18, 42);
    pdf.setFontSize(11);
    pdf.text("SEGURIDAD Y VIGILANCIA PRIVADA", 18, 51);
    pdf.setFontSize(22);
    pdf.text("Indicadores de Rotación", 18, 84);
    pdf.setFontSize(15);
    pdf.text(periodText(analysis), 18, 96);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Informe gerencial de Gestión Humana", 18, 108);
    pdf.text(`Fuente: ${analysis.datasetName}`, 18, 122);
    pdf.text(`Fecha de emisión: ${dateText(analysis.generatedAt)}`, 18, 130);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(18, 160, 174, 42, 6, 6, "F");
    pdf.setTextColor(23, 59, 118);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Elaborado por", 28, 176);
    pdf.setFontSize(20);
    pdf.text("SOLINT Business Suite", 28, 188);
    pdf.setTextColor(100, 116, 139);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("Business Intelligence · People Analytics · Report Builder", 28, 197);
  }

  addNewPage(pdf, "Resumen ejecutivo", ++pageNumber);
  let y = 32;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(17);
  pdf.setTextColor(23, 59, 118);
  pdf.text("Resumen ejecutivo de rotación", 12, y);
  y += 10;

  drawKpiCard(pdf, "Headcount promedio", formatNumber(analysis.summary.averageHeadcount), 12, y, 42);
  drawKpiCard(pdf, "Ingresos", String(analysis.summary.totalHires), 58, y, 32);
  drawKpiCard(pdf, "Ceses", String(analysis.summary.totalExits), 94, y, 28);
  drawKpiCard(pdf, "Rotación acumulada", formatPercent(analysis.summary.accumulatedRotation), 126, y, 58);
  y += 34;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(23, 59, 118);
  pdf.text("Lectura ejecutiva", 12, y);
  y += 7;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(51, 65, 85);
  [...analysis.insights, ...analysis.conclusions].slice(0, 7).forEach((item) => {
    y = addWrappedText(pdf, `• ${item}`, 15, y, 176, 5) + 2;
  });

  if (sections.metodologia) {
    y += 4;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(23, 59, 118);
    pdf.text("Metodología y fórmula", 12, y);
    y += 7;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(51, 65, 85);
    analysis.methodology.forEach((item) => {
      y = addWrappedText(pdf, `• ${item}`, 15, y, 176, 4.5) + 1.5;
    });
  }

  if (sections.mensual) {
    addNewPage(pdf, "Indicadores mensuales", ++pageNumber);
    y = 32;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(23, 59, 118);
    pdf.text("Indicadores mensuales", 12, y);
    y += 10;
    y = drawMonthlyTable(pdf, analysis, y);
  }

  if (sections.rankings) {
    addNewPage(pdf, "Rankings de rotación", ++pageNumber);
    y = 32;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(23, 59, 118);
    pdf.text("Ranking de unidades con mayor rotación", 12, y);
    y += 10;
    drawRanking(pdf, "Top sedes / unidades", analysis.rankings.bySede, 12, y, 86);
    drawRanking(pdf, "Top cargos", analysis.rankings.byCargo, 106, y, 86);
    y += 64;
    drawRanking(pdf, "Top áreas", analysis.rankings.byArea, 12, y, 86);
    drawRanking(pdf, "Top departamentos", analysis.rankings.byDepartamento, 106, y, 86);
  }

  if (sections.recomendaciones) {
    addNewPage(pdf, "Conclusiones y recomendaciones", ++pageNumber);
    y = 32;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(23, 59, 118);
    pdf.text("Conclusiones", 12, y);
    y += 8;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(51, 65, 85);
    analysis.conclusions.forEach((item) => {
      y = addWrappedText(pdf, `• ${item}`, 15, y, 176, 5) + 2;
    });
    y += 5;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(23, 59, 118);
    pdf.text("Recomendaciones", 12, y);
    y += 8;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(51, 65, 85);
    analysis.recommendations.forEach((item) => {
      y = addWrappedText(pdf, `• ${item}`, 15, y, 176, 5) + 2;
    });
  }

  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
}

function aoaToSheet(data: unknown[][]) {
  return XLSX.utils.aoa_to_sheet(data);
}

function styleRange(sheet: XLSX.WorkSheet, rangeRef: string) {
  const range = XLSX.utils.decode_range(rangeRef);
  for (let row = range.s.r; row <= range.e.r; row += 1) {
    for (let col = range.s.c; col <= range.e.c; col += 1) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (!sheet[cellRef]) continue;
      sheet[cellRef].s = {
        border: {
          top: { style: "thin", color: { rgb: "CBD5E1" } },
          bottom: { style: "thin", color: { rgb: "CBD5E1" } },
          left: { style: "thin", color: { rgb: "CBD5E1" } },
          right: { style: "thin", color: { rgb: "CBD5E1" } },
        },
        alignment: { vertical: "center", wrapText: true },
      };
    }
  }
}

function applyHeaderStyle(sheet: XLSX.WorkSheet, rowIndex: number, fromCol: number, toCol: number) {
  for (let col = fromCol; col <= toCol; col += 1) {
    const ref = XLSX.utils.encode_cell({ r: rowIndex, c: col });
    if (!sheet[ref]) continue;
    sheet[ref].s = {
      fill: { fgColor: { rgb: CORP_BLUE } },
      font: { bold: true, color: { rgb: "FFFFFF" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: CORP_BLUE } },
        bottom: { style: "thin", color: { rgb: CORP_BLUE } },
        left: { style: "thin", color: { rgb: CORP_BLUE } },
        right: { style: "thin", color: { rgb: CORP_BLUE } },
      },
    };
  }
}

function rankingRows(items: RotationRankingItem[]) {
  return items.map((item, index) => [
    index + 1,
    item.label,
    item.averageHeadcount,
    item.hires,
    item.exits,
    item.rotationRate,
    item.netChange,
  ]);
}

export function downloadRotationExcel(analysis: RotationAnalysisResult) {
  const workbook = XLSX.utils.book_new();

  const portada = aoaToSheet([
    ["CORPRISEG"],
    ["Indicadores de Rotación"],
    [periodText(analysis)],
    [""],
    ["Fuente", analysis.datasetName],
    ["Fecha de emisión", dateText(analysis.generatedAt)],
    ["Elaborado por", "SOLINT Business Suite"],
    [""],
    ["KPI", "Valor"],
    ["Headcount promedio", analysis.summary.averageHeadcount],
    ["Ingresos", analysis.summary.totalHires],
    ["Ceses", analysis.summary.totalExits],
    ["Rotación acumulada", analysis.summary.accumulatedRotation],
    ["Variación neta", analysis.summary.netChange],
  ]);
  portada["!cols"] = [{ wch: 28 }, { wch: 45 }];
  applyHeaderStyle(portada, 8, 0, 1);
  XLSX.utils.book_append_sheet(workbook, portada, "Portada");

  const mensual = aoaToSheet([
    ["Mes", "Año", "HC Inicial", "HC Final", "HC Promedio", "Ingresos", "Ceses", "Rotación %", "Variación neta"],
    ...analysis.monthly.map((item) => [
      item.monthName,
      item.year,
      item.headcountStart,
      item.headcountEnd,
      item.averageHeadcount,
      item.hires,
      item.exits,
      item.rotationRate,
      item.netChange,
    ]),
  ]);
  mensual["!cols"] = [
    { wch: 16 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
  ];
  applyHeaderStyle(mensual, 0, 0, 8);
  styleRange(mensual, mensual["!ref"] ?? "A1:I1");
  XLSX.utils.book_append_sheet(workbook, mensual, "Rotación Mensual");

  const rankingHeaders = ["Ranking", "Grupo", "HC Promedio", "Ingresos", "Ceses", "Rotación %", "Variación neta"];
  const rankingSheet = aoaToSheet([
    ["Top sedes / unidades"],
    rankingHeaders,
    ...rankingRows(analysis.rankings.bySede),
    [""],
    ["Top cargos"],
    rankingHeaders,
    ...rankingRows(analysis.rankings.byCargo),
    [""],
    ["Top áreas"],
    rankingHeaders,
    ...rankingRows(analysis.rankings.byArea),
  ]);
  rankingSheet["!cols"] = [
    { wch: 10 },
    { wch: 38 },
    { wch: 14 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
  ];
  [1, 14, 27].forEach((row) => applyHeaderStyle(rankingSheet, row, 0, 6));
  XLSX.utils.book_append_sheet(workbook, rankingSheet, "Rankings");

  const resumen = aoaToSheet([
    ["Tipo", "Detalle"],
    ...analysis.insights.map((item) => ["Hallazgo", item]),
    ...analysis.conclusions.map((item) => ["Conclusión", item]),
    ...analysis.recommendations.map((item) => ["Recomendación", item]),
    ...analysis.methodology.map((item) => ["Metodología", item]),
  ]);
  resumen["!cols"] = [{ wch: 18 }, { wch: 110 }];
  applyHeaderStyle(resumen, 0, 0, 1);
  styleRange(resumen, resumen["!ref"] ?? "A1:B1");
  XLSX.utils.book_append_sheet(workbook, resumen, "Resumen Ejecutivo");

  XLSX.writeFile(
    workbook,
    `CORPRISEG_ROTACION_${analysis.period.year}_${analysis.period.fromMonth}_${analysis.period.toMonth}.xlsx`
  );
}
