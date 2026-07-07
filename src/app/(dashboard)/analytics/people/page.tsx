"use client";

import { useMemo } from "react";
import { AnalyticsShell } from "@/components/analytics/analytics-shell";
import { AnalyticsKpiCard } from "@/components/analytics/analytics-kpi-card";
import { InsightsPanel } from "@/components/analytics/insights-panel";
import { AnalyticsDataset } from "@/lib/analytics/types";
import { runPeopleAnalytics } from "@/lib/analytics/people-analytics-engine";

const demoDataset: AnalyticsDataset = {
  id: "demo-people",
  domain: "people",
  name: "DATA GENERAL DEMO",
  createdAt: new Date().toISOString(),
  columns: ["Documento", "Nombres", "Fecha Ingreso", "Estado", "Sede", "Cargo"],
  rows: [
    { Documento: "10000001", Nombres: "Colaborador 1", "Fecha Ingreso": "2026-01-01", Estado: "Activo", Sede: "Lima", Cargo: "Operario" },
    { Documento: "10000002", Nombres: "Colaborador 2", "Fecha Ingreso": "2026-01-05", Estado: "Cese", Sede: "Lima", Cargo: "Supervisor" },
    { Documento: "10000003", Nombres: "Colaborador 3", "Fecha Ingreso": "2026-02-10", Estado: "Activo", Sede: "Chancay", Cargo: "Operario" },
  ],
};

export default function PeopleAnalyticsPage() {
  const result = useMemo(() => runPeopleAnalytics(demoDataset), []);

  return (
    <AnalyticsShell active="/analytics/people">
      <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">People Analytics</p>
        <h2 className="mt-2 text-3xl font-black text-[#04224a]">Primer dominio analítico de SOLINT Analytics</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">Esta pantalla ya usa Analytics Engine, Validation Engine, Insights Engine y Recommendation Engine. En la siguiente fase conectaremos la carga real del archivo DATA GENERAL.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {result.kpis.map((kpi) => <AnalyticsKpiCard key={kpi.id} kpi={kpi} />)}
      </div>

      <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">Validación</p>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <ValidationMetric label="Registros" value={result.validation.totalRows} />
          <ValidationMetric label="Errores" value={result.validation.errors} danger />
          <ValidationMetric label="Advertencias" value={result.validation.warnings} warning />
          <ValidationMetric label="Estado" value={result.validation.valid ? "OK" : "Revisar"} />
        </div>
      </section>

      <InsightsPanel insights={result.insights} recommendations={result.recommendations} />
    </AnalyticsShell>
  );
}

function ValidationMetric({ label, value, danger, warning }: { label: string; value: number | string; danger?: boolean; warning?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className={danger ? "mt-2 text-2xl font-black text-red-700" : warning ? "mt-2 text-2xl font-black text-amber-700" : "mt-2 text-2xl font-black text-[#04224a]"}>{value}</p>
    </div>
  );
}
