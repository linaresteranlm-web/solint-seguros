import { AnalyticsDomain } from "@/lib/analytics/types";

export type AnalyticsDomainConfig = {
  id: AnalyticsDomain;
  label: string;
  description: string;
  status: "available" | "planned";
  route: string;
};

export const ANALYTICS_DOMAINS: AnalyticsDomainConfig[] = [
  { id: "people", label: "People Analytics", description: "Headcount, ingresos, ceses, rotación, costos y permanencia.", status: "available", route: "/analytics/people" },
  { id: "finance", label: "Finance Analytics", description: "Rentabilidad, costos, flujo, márgenes y variaciones.", status: "planned", route: "/analytics" },
  { id: "sales", label: "Sales Analytics", description: "Ventas, clientes, conversión, tickets y desempeño comercial.", status: "planned", route: "/analytics" },
  { id: "inventory", label: "Inventory Analytics", description: "Stock, rotación, quiebres, valorización y abastecimiento.", status: "planned", route: "/analytics" },
  { id: "insurance", label: "Insurance Analytics", description: "SCTR, Vida Ley, cobertura, vigencias, riesgos y alertas.", status: "planned", route: "/analytics" },
];
