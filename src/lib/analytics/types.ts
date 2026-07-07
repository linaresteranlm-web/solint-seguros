export type AnalyticsDomain =
  | "people" | "finance" | "sales" | "crm" | "procurement" | "inventory"
  | "operations" | "executive" | "warehouse" | "insurance" | "customer";

export type AnalyticsSeverity = "success" | "info" | "warning" | "danger";

export type AnalyticsKpi = {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  variation?: number;
  trend?: "up" | "down" | "flat";
  severity: AnalyticsSeverity;
  interpretation: string;
};

export type AnalyticsInsight = {
  id: string;
  title: string;
  description: string;
  severity: AnalyticsSeverity;
  metric?: string;
};

export type AnalyticsRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "Alta" | "Media" | "Baja";
  impact: "Alto" | "Medio" | "Bajo";
};

export type AnalyticsValidationIssue = {
  id: string;
  row?: number;
  column?: string;
  title: string;
  description: string;
  severity: "error" | "warning" | "info";
};

export type AnalyticsValidationResult = {
  valid: boolean;
  totalRows: number;
  errors: number;
  warnings: number;
  issues: AnalyticsValidationIssue[];
};

export type AnalyticsDataset = {
  id: string;
  domain: AnalyticsDomain;
  name: string;
  rows: Record<string, unknown>[];
  columns: string[];
  createdAt: string;
};

export type AnalyticsResult = {
  id: string;
  domain: AnalyticsDomain;
  title: string;
  createdAt: string;
  dataset: AnalyticsDataset;
  validation: AnalyticsValidationResult;
  kpis: AnalyticsKpi[];
  insights: AnalyticsInsight[];
  recommendations: AnalyticsRecommendation[];
  metadata: {
    version: string;
    company: string;
    source: string;
  };
};
