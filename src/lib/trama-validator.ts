import { TablaGenerada } from "@/lib/excel-comparador";

export type ValidationSeverity = "ERROR" | "ADVERTENCIA" | "OK";

export type ValidationIssue = {
  rowIndex: number;
  columnName: string;
  severity: ValidationSeverity;
  message: string;
  value: string;
};

export type ValidationResult = {
  totalRows: number;
  errors: number;
  warnings: number;
  ok: number;
  issues: ValidationIssue[];
};

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function getColumnIndex(headers: string[], names: string[]) {
  const normalizedNames = names.map(normalizeHeader);

  return headers.findIndex((header) =>
    normalizedNames.includes(normalizeHeader(header))
  );
}

function getCell(row: unknown[], index: number) {
  if (index < 0) return "";

  return String(row[index] ?? "").trim();
}

function isValidDni(value: string) {
  return /^\d{8}$/.test(value);
}

function isValidMoney(value: string) {
  const cleaned = value.replace(/,/g, "").trim();

  if (!cleaned) return false;

  const number = Number(cleaned);
  return Number.isFinite(number) && number >= 0;
}

function isValidSexo(value: string) {
  if (!value) return false;

  const normalized = value.trim().toUpperCase();

  return ["M", "F", "MASCULINO", "FEMENINO"].includes(normalized);
}

export function validateGeneratedTable(
  tabla: TablaGenerada,
  tipo: "SCTR" | "VIDALEY"
): ValidationResult {
  const issues: ValidationIssue[] = [];

  const dniIndex =
    tipo === "SCTR"
      ? getColumnIndex(tabla.cabecera, ["Documento de Identidad"])
      : getColumnIndex(tabla.cabecera, ["NumDoc"]);

  const sexoIndex = getColumnIndex(tabla.cabecera, ["Sexo"]);
  const sueldoIndex =
    tipo === "SCTR"
      ? getColumnIndex(tabla.cabecera, ["Importe Sueldo"])
      : getColumnIndex(tabla.cabecera, ["Sueldo"]);

  const requiredColumns =
    tipo === "SCTR"
      ? [
          "Tipo Documento",
          "Documento de Identidad",
          "Apellido Paterno",
          "Apellido Materno",
          "Primer Nombre",
          "Fecha Nacimiento",
          "Sexo",
          "Nivel Riesgo",
          "Moneda Sueldo",
          "Importe Sueldo",
        ]
      : [
          "TipDoc",
          "NumDoc",
          "ApePaterno",
          "ApeMaterno",
          "Nombres",
          "Nacimiento",
          "Sueldo",
          "Ocupacion",
          "TipRiesgo",
          "LugarExposicion",
          "Sexo",
        ];

  const requiredIndexes = requiredColumns.map((column) => ({
    column,
    index: getColumnIndex(tabla.cabecera, [column]),
  }));

  const dniMap = new Map<string, number[]>();

  tabla.filas.forEach((row, rowIndex) => {
    const dni = getCell(row, dniIndex);

    if (!dni) {
      issues.push({
        rowIndex,
        columnName:
          tipo === "SCTR" ? "Documento de Identidad" : "NumDoc",
        severity: "ERROR",
        message: "DNI vacío.",
        value: dni,
      });
    } else if (!isValidDni(dni)) {
      issues.push({
        rowIndex,
        columnName:
          tipo === "SCTR" ? "Documento de Identidad" : "NumDoc",
        severity: "ERROR",
        message: "El DNI debe tener 8 dígitos numéricos.",
        value: dni,
      });
    }

    if (dni) {
      const current = dniMap.get(dni) ?? [];
      current.push(rowIndex);
      dniMap.set(dni, current);
    }

    const sexo = getCell(row, sexoIndex);

    if (!isValidSexo(sexo)) {
      issues.push({
        rowIndex,
        columnName: "Sexo",
        severity: "ADVERTENCIA",
        message: "Sexo vacío o no reconocido. Usar M o F.",
        value: sexo,
      });
    }

    const sueldo = getCell(row, sueldoIndex);

    if (!isValidMoney(sueldo)) {
      issues.push({
        rowIndex,
        columnName: tipo === "SCTR" ? "Importe Sueldo" : "Sueldo",
        severity: "ADVERTENCIA",
        message: "Sueldo vacío o formato no numérico.",
        value: sueldo,
      });
    }

    requiredIndexes.forEach(({ column, index }) => {
      if (index < 0) {
        issues.push({
          rowIndex,
          columnName: column,
          severity: "ERROR",
          message: `No existe la columna requerida: ${column}.`,
          value: "",
        });
        return;
      }

      const value = getCell(row, index);

      if (!value) {
        const severity: ValidationSeverity =
          column.toLowerCase().includes("segundo")
            ? "ADVERTENCIA"
            : "ERROR";

        issues.push({
          rowIndex,
          columnName: column,
          severity,
          message: "Campo requerido vacío.",
          value,
        });
      }
    });
  });

  dniMap.forEach((rows, dni) => {
    if (rows.length <= 1) return;

    rows.forEach((rowIndex) => {
      issues.push({
        rowIndex,
        columnName:
          tipo === "SCTR" ? "Documento de Identidad" : "NumDoc",
        severity: "ERROR",
        message: `DNI duplicado dentro de la trama. Aparece ${rows.length} veces.`,
        value: dni,
      });
    });
  });

  const errors = issues.filter((issue) => issue.severity === "ERROR").length;
  const warnings = issues.filter(
    (issue) => issue.severity === "ADVERTENCIA"
  ).length;

  return {
    totalRows: tabla.filas.length,
    errors,
    warnings,
    ok: Math.max(tabla.filas.length - errors - warnings, 0),
    issues,
  };
}
