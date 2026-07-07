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

function detectHeaderRow(rowsAsArrays: unknown[][]) {
  const candidateKeywords = [
    "Situación",
    "Codigo",
    "Ape. Paterno",
    "Ape. Materno",
    "Nombres",
    "Nro Identidad",
    "FecIng",
    "Feccese",
    "Cargo",
    "Area",
  ];

  let bestIndex = 0;
  let bestScore = 0;

  rowsAsArrays.forEach((row, index) => {
    const values = row.map((value) => String(value ?? "").trim());
    const nonEmpty = values.filter(Boolean).length;
    const keywordScore = candidateKeywords.filter((keyword) =>
      values.some((value) => value.toLowerCase() === keyword.toLowerCase())
    ).length;

    const score = keywordScore * 10 + nonEmpty;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestIndex;
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

  const headerRowIndex = detectHeaderRow(rowsAsArrays);
  const rawHeaders = rowsAsArrays[headerRowIndex].map((value) =>
    String(value ?? "").trim()
  );

  const columns = ensureUniqueHeaders(rawHeaders);

  const rows = rowsAsArrays.slice(headerRowIndex + 1).map((row) => {
    const item: Record<string, unknown> = {};

    columns.forEach((column, index) => {
      item[column] = normalizeCellValue(row[index]);
    });

    return item;
  });

  const meaningfulRows = rows.filter((row) =>
    Object.values(row).some((value) => String(value ?? "").trim() !== "")
  );

  return {
    id: crypto.randomUUID(),
    domain,
    name: file.name,
    rows: meaningfulRows,
    columns,
    createdAt: new Date().toISOString(),
  };
}
