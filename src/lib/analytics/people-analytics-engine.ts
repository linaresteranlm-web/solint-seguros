import { AnalyticsDataset, AnalyticsKpi, AnalyticsResult } from "@/lib/analytics/types";
import { runValidationEngine, validateDuplicatedColumns, validateNulls, validateRequiredColumns } from "@/lib/analytics/validation-engine";
import { buildInsightsFromKpis, buildRecommendationsFromInsights } from "@/lib/analytics/insights-engine";

export const PEOPLE_REQUIRED_COLUMNS = ["Documento", "Nombres", "Fecha Ingreso", "Estado", "Sede", "Cargo"];

function isActive(value: unknown) {
  const text = String(value ?? "").trim().toLowerCase();
  return ["activo", "activa", "vigente", "1", "si", "sí"].includes(text);
}

function isExit(value: unknown) {
  const text = String(value ?? "").trim().toLowerCase();
  return ["cese", "cesado", "cesada", "baja", "inactivo", "inactiva"].includes(text);
}

export function runPeopleAnalytics(dataset: AnalyticsDataset): AnalyticsResult {
  const validation = runValidationEngine(dataset, [
    validateRequiredColumns(PEOPLE_REQUIRED_COLUMNS),
    validateDuplicatedColumns(),
    validateNulls(["Documento", "Nombres", "Estado"]),
  ]);

  const headcount = dataset.rows.filter((row) => isActive(row["Estado"])).length;
  const exits = dataset.rows.filter((row) => isExit(row["Estado"])).length;
  const total = dataset.rows.length;
  const rotation = total > 0 ? Number(((exits / total) * 100).toFixed(2)) : 0;

  const kpis: AnalyticsKpi[] = [
    { id: "headcount", label: "Headcount", value: headcount, severity: "success", trend: "flat", interpretation: `Actualmente se identifican ${headcount} colaboradores activos.` },
    { id: "exits", label: "Ceses", value: exits, severity: exits > 0 ? "warning" : "success", trend: exits > 0 ? "up" : "flat", interpretation: exits > 0 ? `Se detectaron ${exits} ceses en la base analizada.` : "No se detectaron ceses en la base analizada." },
    { id: "rotation", label: "Rotación", value: rotation, unit: "%", severity: rotation >= 15 ? "danger" : rotation >= 8 ? "warning" : "success", trend: rotation > 0 ? "up" : "flat", interpretation: `La rotación estimada es ${rotation} % sobre la base analizada.` },
  ];

  const insights = buildInsightsFromKpis(kpis);
  const recommendations = buildRecommendationsFromInsights(insights);

  return { id: crypto.randomUUID(), domain: "people", title: "People Analytics", createdAt: new Date().toISOString(), dataset, validation, kpis, insights, recommendations, metadata: { version: "1.0", company: "SOLINT SEGUROS", source: dataset.name } };
}
