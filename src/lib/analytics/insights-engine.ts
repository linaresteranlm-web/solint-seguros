import { AnalyticsInsight, AnalyticsKpi, AnalyticsRecommendation } from "@/lib/analytics/types";

export function buildInsightsFromKpis(kpis: AnalyticsKpi[]): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];
  kpis.forEach((kpi) => {
    if (kpi.severity === "danger") {
      insights.push({ id: `danger-${kpi.id}`, title: `${kpi.label} requiere atención`, description: kpi.interpretation, severity: "danger", metric: kpi.id });
    }
    if (kpi.trend === "up" && kpi.severity !== "danger") {
      insights.push({ id: `trend-up-${kpi.id}`, title: `${kpi.label} muestra tendencia creciente`, description: kpi.interpretation, severity: kpi.severity, metric: kpi.id });
    }
    if (kpi.trend === "down") {
      insights.push({ id: `trend-down-${kpi.id}`, title: `${kpi.label} muestra reducción`, description: kpi.interpretation, severity: kpi.severity, metric: kpi.id });
    }
  });
  if (insights.length === 0) {
    insights.push({ id: "stable-context", title: "Comportamiento estable", description: "Los principales indicadores no muestran alertas críticas en este análisis.", severity: "success" });
  }
  return insights;
}

export function buildRecommendationsFromInsights(insights: AnalyticsInsight[]): AnalyticsRecommendation[] {
  return insights.map((insight) => {
    const high = insight.severity === "danger";
    return {
      id: `rec-${insight.id}`,
      title: high ? "Atención prioritaria de Gerencia" : "Monitoreo recomendado",
      description: high ? `Revisar el indicador "${insight.title}" y definir un plan de acción con responsable y fecha.` : `Mantener seguimiento del hallazgo: ${insight.title}.`,
      priority: high ? "Alta" : "Media",
      impact: high ? "Alto" : "Medio",
    };
  });
}
