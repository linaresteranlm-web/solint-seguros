"use client";

import * as XLSX from "xlsx-js-style";
import { ProcessHistoryItem } from "@/lib/process-history";

const thinBorder = {
  top: { style: "thin", color: { rgb: "CBD5E1" } },
  bottom: { style: "thin", color: { rgb: "CBD5E1" } },
  left: { style: "thin", color: { rgb: "CBD5E1" } },
  right: { style: "thin", color: { rgb: "CBD5E1" } },
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

function metricsToText(metrics?: Record<string, number | string>) {
  if (!metrics) return "";

  return Object.entries(metrics)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" | ");
}

export function exportHistoryToExcel(history: ProcessHistoryItem[]) {
  const workbook = XLSX.utils.book_new();

  const data = [
    [
      "Fecha",
      "Tipo",
      "Título",
      "Descripción",
      "Estado",
      "Usuario",
      "Métricas",
    ],
    ...history.map((item) => [
      formatDate(item.createdAt),
      item.type,
      item.title,
      item.description,
      item.status,
      item.user,
      metricsToText(item.metrics),
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  const range = XLSX.utils.decode_range(worksheet["!ref"] ?? "A1:A1");

  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const address = XLSX.utils.encode_cell({ r: row, c: col });

      if (!worksheet[address]) {
        worksheet[address] = { t: "s", v: "" };
      }

      worksheet[address].s = {
        border: thinBorder,
        alignment: {
          vertical: "center",
          horizontal: row === 0 ? "center" : "left",
          wrapText: true,
        },
        font: {
          bold: row === 0,
          color: {
            rgb: row === 0 ? "FFFFFF" : "0F172A",
          },
        },
        fill:
          row === 0
            ? {
                fgColor: {
                  rgb: "04224A",
                },
              }
            : undefined,
      };
    }
  }

  worksheet["!cols"] = [
    { wch: 22 },
    { wch: 24 },
    { wch: 36 },
    { wch: 58 },
    { wch: 16 },
    { wch: 24 },
    { wch: 60 },
  ];

  worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };
  worksheet["!zoom"] = 80;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Historial");

  const resumen = [
    ["RESUMEN DE AUDITORÍA", ""],
    ["Total procesos", history.length],
    ["OK", history.filter((item) => item.status === "OK").length],
    [
      "Advertencias",
      history.filter((item) => item.status === "ADVERTENCIA").length,
    ],
    ["Errores", history.filter((item) => item.status === "ERROR").length],
    [
      "Acumulados",
      history.filter((item) => item.type === "GENERAR_ACUMULADOS").length,
    ],
    [
      "Comparaciones",
      history.filter((item) => item.type === "COMPARAR_TRAMAS").length,
    ],
    [
      "Descargas",
      history.filter((item) => item.type === "DESCARGA_ARCHIVO").length,
    ],
  ];

  const resumenSheet = XLSX.utils.aoa_to_sheet(resumen);
  XLSX.utils.book_append_sheet(workbook, resumenSheet, "Resumen");

  XLSX.writeFile(workbook, "AUDITORIA_SOLINT_HISTORIAL.xlsx", {
    compression: true,
  });
}
