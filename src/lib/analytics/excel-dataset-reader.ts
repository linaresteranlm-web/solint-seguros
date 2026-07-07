"use client";

import * as XLSX from "xlsx";
import { AnalyticsDataset, AnalyticsDomain } from "@/lib/analytics/types";

function normalizeCellValue(value: unknown) {
  if (value === null || value === undefined) return "";

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value;
}

function ensureUniqueHeaders(headers: string[]) {
  const counter = new Map<string, number>();

  return headers.map((header, index) => {
    const clean = String(header || `Columna ${index + 1}`).trim();
    const current = counter.get(clean) ?? 0;

    counter.set(clean, current + 1);

    if (current === 0) return clean;

    return `${clean} (${current + 1})`;
  });
}

export async function readExcelAsAnalyticsDataset(params: {
  file: File;
  domain: AnalyticsDomain;
  sheetName?: string;
}): Promise<AnalyticsDataset> {
  const { file, domain, sheetName } = params;
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
  });

  const selectedSheetName = sheetName ?? workbook.SheetNames[0];

  if (!selectedSheetName) {
    throw new Error("El archivo no contiene hojas válidas.");
  }

  const sheet = workbook.Sheets[selectedSheetName];

  if (!sheet) {
    throw new Error(`No se encontró la hoja ${selectedSheetName}.`);
  }

  const rowsAsArrays = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
  });

  if (rowsAsArrays.length === 0) {
    throw new Error("El archivo está vacío.");
  }

  const rawHeaders = rowsAsArrays[0].map((value) => String(value ?? "").trim());
  const columns = ensureUniqueHeaders(rawHeaders);

  const rows = rowsAsArrays.slice(1).map((row) => {
    const item: Record<string, unknown> = {};

    columns.forEach((column, index) => {
      item[column] = normalizeCellValue(row[index]);
    });

    return item;
  });

  return {
    id: crypto.randomUUID(),
    domain,
    name: file.name,
    rows,
    columns,
    createdAt: new Date().toISOString(),
  };
}
