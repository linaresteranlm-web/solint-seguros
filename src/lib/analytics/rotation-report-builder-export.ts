"use client";

import * as XLSX from "xlsx-js-style";
import {
  RotationAnalysisResult,
  RotationRankingItem,
  formatNumber,
  formatPercent,
} from "@/lib/analytics/rotation-indicators-engine";
import { RotationReportSections } from "@/lib/analytics/rotation-report-export";

const CORP_BLUE = "173b76";
const CORP_ORANGE = "f58220";

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

function aoaToSheet(data: unknown[][]) {
  return XLSX.utils.aoa_to_sheet(data);
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

function applyTitleStyle(sheet: XLSX.WorkSheet, cellRef: string, size = 18) {
  if (!sheet[cellRef]) return;

  sheet[cellRef].s = {
    font: { bold: true, color: { rgb: CORP_BLUE }, sz: size },
    alignment: { vertical: "center" },
  };
}

function styleRange(sheet: XLSX.WorkSheet, rangeRef: string) {
  const range = XLSX.utils.decode_range(rangeRef);

  for (let row = range.s.r; row <= range.e.r; row += 1) {
    for (let col = range.s.c; col <= range.e.c; col += 1) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (!sheet[cellRef]) continue;

      sheet[cellRef].s = {
        ...sheet[cellRef].s,
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

function addPortada(workbook: XLSX.WorkBook, analysis: RotationAnalysisResult) {
  const sheet = aoaToSheet([
    ["CORPRISEG"],
    ["Indicadores de Rotación Gerencial"],
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

  sheet["!cols"] = [{ wch: 30 }, { wch: 55 }];
  applyTitleStyle(sheet, "A1", 24);
  applyTitleStyle(sheet, "A2", 18);
  applyHeaderStyle(sheet, 8, 0, 1);
  styleRange(sheet, sheet["!ref"] ?? "A1:B14");

  XLSX.utils.book_append_sheet(workbook, sheet, "Portada");
}

function addMensual(workbook: XLSX.WorkBook, analysis: RotationAnalysisResult) {
  const sheet = aoaToSheet([
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

  sheet["!cols"] = [
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

  applyHeaderStyle(sheet, 0, 0, 8);
  styleRange(sheet, sheet["!ref"] ?? "A1:I1");

  XLSX.utils.book_append_sheet(workbook, sheet, "Rotación Mensual");
}

function addRankings(workbook: XLSX.WorkBook, analysis: RotationAnalysisResult) {
  const rankingHeaders = ["Ranking", "Grupo", "HC Promedio", "Ingresos", "Ceses", "Rotación %", "Variación neta"];
  const sheet = aoaToSheet([
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
    [""],
    ["Top departamentos"],
    rankingHeaders,
    ...rankingRows(analysis.rankings.byDepartamento),
  ]);

  sheet["!cols"] = [
    { wch: 10 },
    { wch: 42 },
    { wch: 14 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
  ];

  applyTitleStyle(sheet, "A1", 14);
  applyTitleStyle(sheet, "A15", 14);
  applyTitleStyle(sheet, "A29", 14);
  applyTitleStyle(sheet, "A43", 14);
  [1, 15, 29, 43].forEach((row) => applyHeaderStyle(sheet, row, 0, 6));
  styleRange(sheet, sheet["!ref"] ?? "A1:G1");

  XLSX.utils.book_append_sheet(workbook, sheet, "Rankings");
}

function addResumen(workbook: XLSX.WorkBook, analysis: RotationAnalysisResult, sections: RotationReportSections) {
  const rows: unknown[][] = [["Tipo", "Detalle"]];

  if (sections.hallazgos) {
    analysis.insights.forEach((item) => rows.push(["Hallazgo", item]));
    analysis.conclusions.forEach((item) => rows.push(["Conclusión", item]));
  }

  if (sections.recomendaciones) {
    analysis.recommendations.forEach((item) => rows.push(["Recomendación", item]));
  }

  if (sections.metodologia) {
    analysis.methodology.forEach((item) => rows.push(["Metodología", item]));
  }

  const sheet = aoaToSheet(rows);
  sheet["!cols"] = [{ wch: 20 }, { wch: 120 }];
  applyHeaderStyle(sheet, 0, 0, 1);
  styleRange(sheet, sheet["!ref"] ?? "A1:B1");

  XLSX.utils.book_append_sheet(workbook, sheet, "Resumen Ejecutivo");
}

function addFichaTecnica(workbook: XLSX.WorkBook, analysis: RotationAnalysisResult) {
  const sheet = aoaToSheet([
    ["Ficha Técnica"],
    [""],
    ["Cliente", "CORPRISEG"],
    ["Sistema", "SOLINT Business Suite"],
    ["Módulo", "People Analytics · Indicadores de Rotación"],
    ["Periodo", periodText(analysis)],
    ["Fuente", analysis.datasetName],
    ["Fecha emisión", dateText(analysis.generatedAt)],
    [""],
    ["Fórmula principal"],
    ["Rotación mensual = Ceses del mes / Headcount promedio del mes × 100"],
    ["Headcount promedio = (Headcount inicial + Headcount final) / 2"],
  ]);

  sheet["!cols"] = [{ wch: 34 }, { wch: 95 }];
  applyTitleStyle(sheet, "A1", 18);
  styleRange(sheet, sheet["!ref"] ?? "A1:B12");

  XLSX.utils.book_append_sheet(workbook, sheet, "Ficha Técnica");
}

export function downloadRotationExcelBySections(
  analysis: RotationAnalysisResult,
  sections: RotationReportSections
) {
  const workbook = XLSX.utils.book_new();

  if (sections.portada) addPortada(workbook, analysis);
  if (sections.mensual) addMensual(workbook, analysis);
  if (sections.rankings) addRankings(workbook, analysis);

  if (sections.hallazgos || sections.recomendaciones || sections.metodologia) {
    addResumen(workbook, analysis, sections);
  }

  addFichaTecnica(workbook, analysis);

  if (workbook.SheetNames.length === 1) {
    addPortada(workbook, analysis);
  }

  XLSX.writeFile(
    workbook,
    `CORPRISEG_ROTACION_REPORT_BUILDER_${analysis.period.year}_${analysis.period.fromMonth}_${analysis.period.toMonth}.xlsx`
  );
}
