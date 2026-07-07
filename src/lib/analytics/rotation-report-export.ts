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
const LOGO_PATH = "/images/corpriseg-logo.png";

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

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function setHexFill(pdf: jsPDF, hex: string) {
  const color = hexToRgb(hex);
  pdf.setFillColor(color.r, color.g, color.b);
}

function setHexText(pdf: jsPDF, hex: string) {
  const color = hexToRgb(hex);
  pdf.setTextColor(color.r, color.g, color.b);
}

function setHexDraw(pdf: jsPDF, hex: string) {
  const color = hexToRgb(hex);
  pdf.setDrawColor(color.r, color.g, color.b);
}

async function loadImageAsDataUrl(src: string): Promise<string | null> {
  try {
    const response = await fetch(src);
    if (!response.ok) return null;

    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function drawBrand(pdf: jsPDF, logoDataUrl: string | null, x: number, y: number, maxW: number, maxH: number, light = false) {
  if (logoDataUrl) {
    try {
      pdf.addImage(logoDataUrl, "PNG", x, y, maxW, maxH, undefined, "FAST");
      return;
    } catch {
      // Fallback to text brand
    }
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(light ? 255 : 23, light ? 255 : 59, light ? 255 : 118);
  pdf.text("CORPRISEG", x, y + 10);
  pdf.setFontSize(7);
  pdf.text("SEGURIDAD Y VIGILANCIA PRIVADA", x, y + 16);
}

function drawHeader(pdf: jsPDF, title: string, logoDataUrl: string | null) {
  const pageWidth = pdf.internal.pageSize.getWidth();

  setHexFill(pdf, CORP_BLUE);
  pdf.rect(0, 0, pageWidth, 19, "F");
  setHexFill(pdf, CORP_ORANGE);
  pdf.rect(0, 19, pageWidth, 2, "F");

  drawBrand(pdf, logoDataUrl, 10, 3, 30, 12, true);

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("Indicadores Gerenciales de Rotación", 48, 12);

  pdf.setFontSize(8);
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

function addNewPage(pdf: jsPDF, title: string, pageNumber: number, logoDataUrl: string | null) {
  pdf.addPage();
  drawHeader(pdf, title, logoDataUrl);
  drawFooter(pdf, pageNumber);
}

function addWrappedText(pdf: jsPDF, text: string, x: number, y: number, width: number, lineHeight = 5) {
  const lines = pdf.splitTextToSize(text, width);
  pdf.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function drawSectionTitle(pdf: jsPDF, title: string, x: number, y: number) {
  setHexText(pdf, CORP_BLUE);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text(title, x, y);

  setHexFill(pdf, CORP_ORANGE);
  pdf.roundedRect(x, y + 3, 22, 1.4, 0.6, 0.6, "F");
}

function drawKpiCard(pdf: jsPDF, label: string, value: string, x: number, y: number, w: number, variant: "blue" | "orange" | "light" = "light") {
  if (variant === "blue") {
    setHexFill(pdf, CORP_BLUE);
  } else if (variant === "orange") {
    setHexFill(pdf, CORP_ORANGE);
  } else {
    pdf.setFillColor(248, 250, 252);
  }

  pdf.roundedRect(x, y, w, 25, 4, 4, "F");
  setHexDraw(pdf, variant === "light" ? "e2e8f0" : variant === "blue" ? CORP_BLUE : CORP_ORANGE);
  pdf.roundedRect(x, y, w, 25, 4, 4, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(variant === "light" ? 100 : 255, variant === "light" ? 116 : 255, variant === "light" ? 139 : 255);
  pdf.text(label.toUpperCase(), x + 4, y + 8);

  pdf.setFontSize(15);
  pdf.setTextColor(variant === "light" ? 23 : 255, variant === "light" ? 59 : 255, variant === "light" ? 118 : 255);
  pdf.text(value, x + 4, y + 19);
}

function drawChartCard(pdf: jsPDF, title: string, x: number, y: number, w: number, h: number) {
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(x, y, w, h, 5, 5, "F");
  setHexDraw(pdf, "e2e8f0");
  pdf.roundedRect(x, y, w, h, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  setHexText(pdf, CORP_BLUE);
  pdf.text(title, x + 5, y + 8);
}

function drawRotationLineChart(pdf: jsPDF, analysis: RotationAnalysisResult, x: number, y: number, w: number, h: number) {
  drawChartCard(pdf, "Evolución de la rotación mensual", x, y, w, h);

  const chartX = x + 10;
  const chartY = y + 18;
  const chartW = w - 20;
  const chartH = h - 28;

  const maxValue = Math.max(...analysis.monthly.map((item) => item.rotationRate), 1);
  const points = analysis.monthly.map((item, index) => {
    const px = chartX + (analysis.monthly.length === 1 ? 0 : (index / (analysis.monthly.length - 1)) * chartW);
    const py = chartY + chartH - (item.rotationRate / maxValue) * chartH;
    return { x: px, y: py, item };
  });

  pdf.setDrawColor(203, 213, 225);
  pdf.line(chartX, chartY, chartX, chartY + chartH);
  pdf.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH);

  setHexDraw(pdf, CORP_ORANGE);
  pdf.setLineWidth(1.1);
  points.forEach((point, index) => {
    if (index === 0) return;
    const prev = points[index - 1];
    pdf.line(prev.x, prev.y, point.x, point.y);
  });

  points.forEach((point) => {
    setHexFill(pdf, CORP_ORANGE);
    pdf.circle(point.x, point.y, 1.8, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.2);
    setHexText(pdf, CORP_DARK);
    pdf.text(formatPercent(point.item.rotationRate), point.x, point.y - 3, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6);
    pdf.setTextColor(100, 116, 139);
    pdf.text(point.item.monthName.slice(0, 3), point.x, chartY + chartH + 5, { align: "center" });
  });
}

function drawHiresExitsChart(pdf: jsPDF, analysis: RotationAnalysisResult, x: number, y: number, w: number, h: number) {
  drawChartCard(pdf, "Ingresos vs ceses", x, y, w, h);

  const chartX = x + 12;
  const chartY = y + 18;
  const chartW = w - 22;
  const chartH = h - 28;
  const maxValue = Math.max(...analysis.monthly.flatMap((item) => [item.hires, item.exits]), 1);
  const groupW = chartW / analysis.monthly.length;

  analysis.monthly.forEach((item, index) => {
    const gx = chartX + index * groupW + 2;
    const hireH = (item.hires / maxValue) * chartH;
    const exitH = (item.exits / maxValue) * chartH;

    setHexFill(pdf, CORP_BLUE);
    pdf.rect(gx, chartY + chartH - hireH, groupW * 0.32, hireH, "F");

    setHexFill(pdf, CORP_ORANGE);
    pdf.rect(gx + groupW * 0.38, chartY + chartH - exitH, groupW * 0.32, exitH, "F");

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6);
    pdf.setTextColor(100, 116, 139);
    pdf.text(item.monthName.slice(0, 3), gx + groupW * 0.35, chartY + chartH + 5, { align: "center" });
  });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  setHexText(pdf, CORP_BLUE);
  pdf.text("Ingresos", x + w - 40, y + 8);
  setHexText(pdf, CORP_ORANGE);
  pdf.text("Ceses", x + w - 18, y + 8);
}

function drawMonthlyTable(pdf: jsPDF, analysis: RotationAnalysisResult, startY: number) {
  const headers = ["Mes", "HC Inicial", "HC Final", "HC Prom.", "Ingresos", "Ceses", "Rotación", "Var. neta"];
  const widths = [26, 22, 22, 24, 20, 18, 24, 18];
  let y = startY;
  let x = 12;

  setHexFill(pdf, CORP_BLUE);
  pdf.rect(12, y, 174, 8, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.8);
  pdf.setTextColor(255, 255, 255);

  headers.forEach((header, index) => {
    pdf.text(header, x + 2, y + 5.5);
    x += widths[index];
  });

  y += 8;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.8);
  pdf.setTextColor(15, 23, 42);

  analysis.monthly.forEach((item, rowIndex) => {
    x = 12;
    const fill = rowIndex % 2 === 0 ? 248 : 255;
    pdf.setFillColor(fill, fill === 248 ? 250 : 255, fill === 248 ? 252 : 255);
    pdf.rect(12, y, 174, 8, "F");

    const values = [
      item.monthName,
      String(item.headcountStart),
      String(item.headcountEnd),
      formatNumber(item.averageHeadcount),
      String(item.hires),
      String(item.exits),
      formatPercent(item.rotationRate),
      String(item.netChange),
    ];

    values.forEach((value, index) => {
      if (index === 6) {
        setHexText(pdf, CORP_ORANGE);
        pdf.setFont("helvetica", "bold");
      } else {
        pdf.setTextColor(51, 65, 85);
        pdf.setFont("helvetica", "normal");
      }

      pdf.text(value, x + 2, y + 5.5);
      x += widths[index];
    });

    y += 8;
  });

  return y + 4;
}

function drawRanking(pdf: jsPDF, title: string, items: RotationRankingItem[], x: number, y: number, w: number, h = 62) {
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(x, y, w, h, 4, 4, "F");
  setHexDraw(pdf, "e2e8f0");
  pdf.roundedRect(x, y, w, h, 4, 4, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  setHexText(pdf, CORP_BLUE);
  pdf.text(title, x + 4, y + 7);

  const maxRate = Math.max(...items.slice(0, 6).map((item) => item.rotationRate), 1);

  items.slice(0, 6).forEach((item, index) => {
    const rowY = y + 15 + index * 7;
    const label = item.label.length > 23 ? `${item.label.slice(0, 23)}...` : item.label;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.6);
    pdf.setTextColor(71, 85, 105);
    pdf.text(label, x + 4, rowY);

    const barX = x + 46;
    const barW = w - 72;
    pdf.setFillColor(226, 232, 240);
    pdf.roundedRect(barX, rowY - 3.5, barW, 2.5, 1, 1, "F");
    setHexFill(pdf, CORP_ORANGE);
    pdf.roundedRect(barX, rowY - 3.5, Math.max((item.rotationRate / maxRate) * barW, 2), 2.5, 1, 1, "F");

    pdf.setFont("helvetica", "bold");
    setHexText(pdf, CORP_ORANGE);
    pdf.text(formatPercent(item.rotationRate), x + w - 4, rowY, { align: "right" });
  });
}

function drawBulletList(pdf: jsPDF, title: string, items: string[], x: number, y: number, w: number, colorHex = CORP_BLUE) {
  drawSectionTitle(pdf, title, x, y);
  y += 10;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(51, 65, 85);

  items.forEach((item) => {
    setHexFill(pdf, colorHex);
    pdf.circle(x + 2, y - 1.5, 1.2, "F");
    y = addWrappedText(pdf, item, x + 6, y, w - 8, 4.5) + 2;
  });

  return y;
}

function drawMethodologyBox(pdf: jsPDF, analysis: RotationAnalysisResult, x: number, y: number, w: number) {
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(x, y, w, 42, 5, 5, "F");
  setHexDraw(pdf, "e2e8f0");
  pdf.roundedRect(x, y, w, 42, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  setHexText(pdf, CORP_BLUE);
  pdf.text("Fórmula aplicada", x + 5, y + 8);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setHexText(pdf, CORP_ORANGE);
  pdf.text("Rotación mensual = Ceses del mes / Headcount promedio del mes × 100", x + 5, y + 18);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text("Headcount promedio = (Headcount inicial + Headcount final) / 2", x + 5, y + 27);
  pdf.text(`Periodo evaluado: ${periodText(analysis)}`, x + 5, y + 35);
}

async function buildRotationPdfBlob(
  analysis: RotationAnalysisResult,
  sections: RotationReportSections
) {
  const logoDataUrl = await loadImageAsDataUrl(LOGO_PATH);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let pageNumber = 1;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  if (sections.portada) {
    setHexFill(pdf, CORP_BLUE);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    setHexFill(pdf, CORP_ORANGE);
    pdf.rect(0, 0, 11, pageHeight, "F");

    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(18, 24, 64, 28, 5, 5, "F");
    drawBrand(pdf, logoDataUrl, 24, 30, 46, 16, false);

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(25);
    pdf.text("Indicadores de Rotación", 18, 88);

    pdf.setFontSize(15);
    pdf.text(periodText(analysis), 18, 101);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Informe gerencial de Gestión Humana", 18, 113);
    pdf.text(`Fuente: ${analysis.datasetName}`, 18, 126);
    pdf.text(`Fecha de emisión: ${dateText(analysis.generatedAt)}`, 18, 134);

    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(18, 158, 174, 58, 7, 7, "F");

    setHexText(pdf, CORP_BLUE);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("Resumen del periodo", 28, 174);

    drawKpiCard(pdf, "HC Prom.", formatNumber(analysis.summary.averageHeadcount), 28, 181, 35, "light");
    drawKpiCard(pdf, "Ingresos", String(analysis.summary.totalHires), 68, 181, 32, "light");
    drawKpiCard(pdf, "Ceses", String(analysis.summary.totalExits), 105, 181, 28, "light");
    drawKpiCard(pdf, "Rotación", formatPercent(analysis.summary.accumulatedRotation), 138, 181, 42, "orange");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    setHexText(pdf, CORP_BLUE);
    pdf.text("Elaborado por SOLINT Business Suite", 18, 258);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(210, 220, 235);
    pdf.text("Business Intelligence · People Analytics · Report Builder", 18, 266);
  }

  addNewPage(pdf, "Resumen ejecutivo", ++pageNumber, logoDataUrl);
  let y = 32;

  drawSectionTitle(pdf, "Resumen ejecutivo de rotación", 12, y);
  y += 12;

  drawKpiCard(pdf, "Headcount promedio", formatNumber(analysis.summary.averageHeadcount), 12, y, 42, "light");
  drawKpiCard(pdf, "Ingresos", String(analysis.summary.totalHires), 58, y, 32, "blue");
  drawKpiCard(pdf, "Ceses", String(analysis.summary.totalExits), 94, y, 28, "light");
  drawKpiCard(pdf, "Rotación acumulada", formatPercent(analysis.summary.accumulatedRotation), 126, y, 58, "orange");
  y += 34;

  drawRotationLineChart(pdf, analysis, 12, y, 174, 70);
  y += 80;

  drawHiresExitsChart(pdf, analysis, 12, y, 174, 55);

  if (sections.hallazgos) {
    addNewPage(pdf, "Lectura ejecutiva", ++pageNumber, logoDataUrl);
    y = 32;
    y = drawBulletList(pdf, "Hallazgos principales", analysis.insights.slice(0, 8), 12, y, 176, CORP_ORANGE) + 5;
    y = drawBulletList(pdf, "Conclusiones", analysis.conclusions.slice(0, 7), 12, y, 176, CORP_BLUE);
  }

  if (sections.metodologia) {
    if (y > 225) {
      addNewPage(pdf, "Metodología", ++pageNumber, logoDataUrl);
      y = 32;
    }
    y += 5;
    drawMethodologyBox(pdf, analysis, 12, y, 174);
    y += 50;
  }

  if (sections.mensual) {
    addNewPage(pdf, "Indicadores mensuales", ++pageNumber, logoDataUrl);
    y = 32;
    drawSectionTitle(pdf, "Tabla mensual de rotación", 12, y);
    y += 12;
    y = drawMonthlyTable(pdf, analysis, y);
    y += 6;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(71, 85, 105);
    addWrappedText(
      pdf,
      "Esta tabla permite revisar el comportamiento mensual de headcount, ingresos, ceses y rotación. El resultado acumulado debe interpretarse considerando el tamaño promedio de la dotación durante el periodo.",
      12,
      y,
      174,
      4.5
    );
  }

  if (sections.rankings) {
    addNewPage(pdf, "Rankings de rotación", ++pageNumber, logoDataUrl);
    y = 32;
    drawSectionTitle(pdf, "Ranking de unidades con mayor rotación", 12, y);
    y += 12;

    drawRanking(pdf, "Top sedes / unidades", analysis.rankings.bySede, 12, y, 86);
    drawRanking(pdf, "Top cargos", analysis.rankings.byCargo, 106, y, 86);
    y += 72;
    drawRanking(pdf, "Top áreas", analysis.rankings.byArea, 12, y, 86);
    drawRanking(pdf, "Top departamentos", analysis.rankings.byDepartamento, 106, y, 86);

    y += 78;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(71, 85, 105);
    addWrappedText(
      pdf,
      "Los rankings priorizan los grupos con mayor tasa de rotación dentro del periodo seleccionado. Para una lectura gerencial, debe revisarse no solo el porcentaje, sino también el número de ceses y el headcount promedio del grupo.",
      12,
      y,
      174,
      4.5
    );
  }

  if (sections.recomendaciones) {
    addNewPage(pdf, "Recomendaciones", ++pageNumber, logoDataUrl);
    y = 32;
    y = drawBulletList(pdf, "Recomendaciones priorizadas", analysis.recommendations, 12, y, 176, CORP_ORANGE);

    if (y < 210) {
      y += 8;
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(12, y, 174, 38, 5, 5, "F");
      setHexDraw(pdf, "e2e8f0");
      pdf.roundedRect(12, y, 174, 38, 5, 5, "S");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      setHexText(pdf, CORP_BLUE);
      pdf.text("Siguiente paso sugerido", 18, y + 10);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(71, 85, 105);
      addWrappedText(
        pdf,
        "Validar las sedes, cargos o áreas con mayor rotación y cruzar los resultados con entrevistas de salida, supervisión directa, cobertura de puestos y tiempo promedio de reemplazo.",
        18,
        y + 20,
        160,
        4.5
      );
    }
  }

  const totalPages = pdf.getNumberOfPages();

  for (let i = 2; i <= totalPages; i += 1) {
    pdf.setPage(i);
    drawFooter(pdf, i);
  }

  return pdf.output("blob");
}

export function openRotationPdf(analysis: RotationAnalysisResult, sections: RotationReportSections) {
  const reportWindow = window.open("", "_blank", "noopener,noreferrer");

  if (reportWindow) {
    reportWindow.document.write("<p style='font-family:Arial;padding:24px'>Generando reporte CORPRISEG...</p>");
  }

  buildRotationPdfBlob(analysis, sections).then((blob) => {
    const url = URL.createObjectURL(blob);

    if (reportWindow) {
      reportWindow.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  });
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
