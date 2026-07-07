"use client";

export type DataGeneralRow = Record<string, unknown>;

export type NormalizedPeopleRow = {
  Documento: string;
  Codigo: string;
  Nombres: string;
  ApePaterno: string;
  ApeMaterno: string;
  Sexo: string;
  Estado: string;
  FechaIngreso: string;
  FechaCese: string;
  FechaNacimiento: string;
  Sede: string;
  Area: string;
  Cargo: string;
  ClienteUnidad: string;
  CentroCosto: string;
  Distrito: string;
  Provincia: string;
  Departamento: string;
  Supervisor: string;
  Raw: DataGeneralRow;
};

export const DATA_GENERAL_REQUIRED_HEADERS = [
  "Situación",
  "Codigo",
  "Ape. Paterno",
  "Ape. Materno",
  "Nombres",
  "Nro Identidad",
  "Sexo",
  "FecIng",
  "Feccese",
  "Fec.Nacim.",
  "Descrip. Establecimiento",
  "Area",
  "Cargo",
  "Descrip. Centro Costo",
  "Distrito",
  "Provincia",
  "Departamento",
];

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function findHeader(row: DataGeneralRow, names: string[]) {
  const keys = Object.keys(row);
  const normalizedNames = names.map(normalizeHeader);

  return (
    keys.find((key) => normalizedNames.includes(normalizeHeader(key))) ?? ""
  );
}

function get(row: DataGeneralRow, names: string[]) {
  const key = findHeader(row, names);

  if (!key) return "";

  return String(row[key] ?? "").trim();
}

export function cleanDocument(value: unknown) {
  return String(value ?? "")
    .replace(/_x000D_/gi, "")
    .replace(/\r/g, "")
    .replace(/\n/g, "")
    .replace(/[^\d]/g, "")
    .trim();
}

export function normalizeDateText(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value ?? "").trim();
}

export function normalizeEstado(value: unknown) {
  const text = String(value ?? "").trim().toUpperCase();

  if (text.includes("ACTIVO") || text.includes("SUBSIDIADO")) return "ACTIVO";
  if (text.includes("BAJA") || text.includes("CESE")) return "BAJA";

  return text || "SIN ESTADO";
}

export function normalizeDataGeneralRow(row: DataGeneralRow): NormalizedPeopleRow {
  const apePaterno = get(row, ["Ape. Paterno", "Apellido Paterno"]);
  const apeMaterno = get(row, ["Ape. Materno", "Apellido Materno"]);
  const nombres = get(row, ["Nombres", "Nombre"]);

  return {
    Documento: cleanDocument(get(row, ["Nro Identidad", "Documento", "DNI"])),
    Codigo: get(row, ["Codigo", "Código"]),
    Nombres: [apePaterno, apeMaterno, nombres].filter(Boolean).join(" "),
    ApePaterno: apePaterno,
    ApeMaterno: apeMaterno,
    Sexo: get(row, ["Sexo"]),
    Estado: normalizeEstado(get(row, ["Situación", "Situacion", "Estado"])),
    FechaIngreso: normalizeDateText(get(row, ["FecIng", "Fecha Ingreso"])),
    FechaCese: normalizeDateText(get(row, ["Feccese", "Fecha Cese"])),
    FechaNacimiento: normalizeDateText(get(row, ["Fec.Nacim.", "Fecha Nacimiento"])),
    Sede: get(row, ["Descrip. Establecimiento", "Establecimiento", "Sede"]),
    Area: get(row, ["Area", "Área", "Gerencia"]),
    Cargo: get(row, ["Cargo"]),
    ClienteUnidad: get(row, [
      "Descrip. Centro Costo",
      "Centro Costo",
      "Cliente",
      "Unidad",
    ]),
    CentroCosto: get(row, ["Centro Costo", "CenCos Pad"]),
    Distrito: get(row, ["Distrito"]),
    Provincia: get(row, ["Provincia"]),
    Departamento: get(row, ["Departamento"]),
    Supervisor: get(row, ["Supervisor"]),
    Raw: row,
  };
}

export function normalizeDataGeneralRows(rows: DataGeneralRow[]) {
  return rows.map(normalizeDataGeneralRow);
}

export function isActivePeopleRow(row: NormalizedPeopleRow) {
  return row.Estado === "ACTIVO";
}

export function isExitPeopleRow(row: NormalizedPeopleRow) {
  return row.Estado === "BAJA";
}
