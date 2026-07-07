import { AnalyticsDataset, AnalyticsValidationIssue, AnalyticsValidationResult } from "@/lib/analytics/types";

export type ValidationRule = {
  id: string;
  label: string;
  validate: (dataset: AnalyticsDataset) => AnalyticsValidationIssue[];
};

export function validateRequiredColumns(requiredColumns: string[]): ValidationRule {
  return {
    id: "required-columns",
    label: "Columnas requeridas",
    validate(dataset) {
      return requiredColumns.filter((column) => !dataset.columns.includes(column)).map((column) => ({
        id: `missing-${column}`,
        column,
        title: "Columna faltante",
        description: `No se encontró la columna requerida: ${column}.`,
        severity: "error",
      }));
    },
  };
}

export function validateDuplicatedColumns(): ValidationRule {
  return {
    id: "duplicated-columns",
    label: "Columnas duplicadas",
    validate(dataset) {
      const seen = new Set<string>();
      const duplicates = new Set<string>();
      dataset.columns.forEach((column) => {
        if (seen.has(column)) duplicates.add(column);
        seen.add(column);
      });
      return Array.from(duplicates).map((column) => ({
        id: `duplicated-${column}`,
        column,
        title: "Columna duplicada",
        description: `La columna ${column} aparece más de una vez.`,
        severity: "error",
      }));
    },
  };
}

export function validateNulls(requiredColumns: string[]): ValidationRule {
  return {
    id: "null-values",
    label: "Valores vacíos",
    validate(dataset) {
      const issues: AnalyticsValidationIssue[] = [];
      dataset.rows.forEach((row, index) => {
        requiredColumns.forEach((column) => {
          const value = row[column];
          if (value === null || value === undefined || String(value).trim() === "") {
            issues.push({
              id: `null-${index}-${column}`,
              row: index + 1,
              column,
              title: "Campo obligatorio vacío",
              description: `La fila ${index + 1} no tiene valor en ${column}.`,
              severity: "warning",
            });
          }
        });
      });
      return issues;
    },
  };
}

export function runValidationEngine(dataset: AnalyticsDataset, rules: ValidationRule[]): AnalyticsValidationResult {
  const issues = rules.flatMap((rule) => rule.validate(dataset));
  const errors = issues.filter((issue) => issue.severity === "error").length;
  const warnings = issues.filter((issue) => issue.severity === "warning").length;
  return { valid: errors === 0, totalRows: dataset.rows.length, errors, warnings, issues };
}
