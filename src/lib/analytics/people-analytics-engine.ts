import {
  AnalyticsDataset,
  AnalyticsKpi,
  AnalyticsResult,
} from "@/lib/analytics/types";
import {
  runValidationEngine,
  validateDuplicatedColumns,
  validateNulls,
  validateRequiredColumns,
} from "@/lib/analytics/validation-engine";
import {
  buildInsightsFromKpis,
  buildRecommendationsFromInsights,
} from "@/lib/analytics/insights-engine";
import {
  DATA_GENERAL_REQUIRED_HEADERS,
  isActivePeopleRow,
  isExitPeopleRow,
  normalizeDataGeneralRows,
} from "@/lib/analytics/data-general-adapter";

export const PEOPLE_REQUIRED_COLUMNS = DATA_GENERAL_REQUIRED_HEADERS;

export function runPeopleAnalytics(dataset: AnalyticsDataset): AnalyticsResult {
  const validation = runValidationEngine(dataset, [
    validateRequiredColumns(PEOPLE_REQUIRED_COLUMNS),
    validateDuplicatedColumns(),
    validateNulls(["Nro Identidad", "Ape. Paterno", "Nombres", "Situación"]),
  ]);

  const normalizedRows = normalizeDataGeneralRows(dataset.rows);

  const headcount = normalizedRows.filter(isActivePeopleRow).length;
  const exits = normalizedRows.filter(isExitPeopleRow).length;
  const total = normalizedRows.length;
  const rotation = total > 0 ? Number(((exits / total) * 100).toFixed(2)) : 0;

  const sedes = new Set(normalizedRows.map((row) => row.Sede).filter(Boolean));
  const departamentos = new Set(
    normalizedRows.map((row) => row.Departamento).filter(Boolean)
  );

  const kpis: AnalyticsKpi[] = [
    {
      id: "total",
      label: "Total registros",
      value: total,
      severity: "info",
      trend: "flat",
      interpretation: `La base DATA GENERAL contiene ${total} registros procesables.`,
    },
    {
      id: "headcount",
      label: "Headcount",
      value: headcount,
      severity: "success",
      trend: "flat",
      interpretation: `Actualmente se identifican ${headcount} colaboradores activos o subsidiados.`,
    },
    {
      id: "exits",
      label: "Ceses / Bajas",
      value: exits,
      severity: exits > 0 ? "warning" : "success",
      trend: exits > 0 ? "up" : "flat",
      interpretation:
        exits > 0
          ? `Se detectaron ${exits} registros en situación de baja.`
          : "No se detectaron registros en baja.",
    },
    {
      id: "rotation",
      label: "Rotación estimada",
      value: rotation,
      unit: "%",
      severity: rotation >= 15 ? "danger" : rotation >= 8 ? "warning" : "success",
      trend: rotation > 0 ? "up" : "flat",
      interpretation: `La rotación estimada es ${rotation} % sobre DATA GENERAL.`,
    },
    {
      id: "sedes",
      label: "Sedes",
      value: sedes.size,
      severity: "info",
      trend: "flat",
      interpretation: `Se identificaron ${sedes.size} sedes o establecimientos.`,
    },
    {
      id: "departamentos",
      label: "Departamentos",
      value: departamentos.size,
      severity: "info",
      trend: "flat",
      interpretation: `La base contiene registros distribuidos en ${departamentos.size} departamentos.`,
    },
  ];

  const insights = buildInsightsFromKpis(kpis);
  const recommendations = buildRecommendationsFromInsights(insights);

  return {
    id: crypto.randomUUID(),
    domain: "people",
    title: "People Analytics",
    createdAt: new Date().toISOString(),
    dataset,
    validation,
    kpis,
    insights,
    recommendations,
    metadata: {
      version: "1.1 DATA GENERAL REAL",
      company: "SOLINT SEGUROS",
      source: dataset.name,
    },
  };
}
