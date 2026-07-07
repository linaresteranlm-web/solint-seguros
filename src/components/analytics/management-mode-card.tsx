"use client";

import { Presentation, Sparkles } from "lucide-react";
import { AnalyticsResult } from "@/lib/analytics/types";
import { PeopleDashboardResult } from "@/lib/analytics/people-dashboard-engine";

export function ManagementModeCard({
  result,
  dashboard,
}: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
}) {
  const rotation = result.kpis.find((kpi) => kpi.id === "rotation");

  return (
    <section className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="bg-gradient-to-br from-[#04224a] to-[#005eb8] p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#ffb375]">
            <Presentation className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-100">
              Modo Gerencia
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Resumen ejecutivo inmediato
            </h2>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              Vista resumida para reuniones y decisiones rápidas.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 xl:grid-cols-3">
        <ExecutiveFact
          label="Personal activo"
          value={String(result.kpis.find((kpi) => kpi.id === "headcount")?.value ?? 0)}
          text="Colaboradores activos identificados en el análisis filtrado."
        />
        <ExecutiveFact
          label="Rotación"
          value={`${rotation?.value ?? 0}${rotation?.unit ?? ""}`}
          text={rotation?.interpretation ?? "Sin interpretación disponible."}
        />
        <ExecutiveFact
          label="Sedes evaluadas"
          value={String(dashboard.totalSedes)}
          text="Cantidad de sedes presentes en el universo filtrado."
        />
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#ff7415]" />
          <p className="text-sm leading-6 text-slate-600">
            {result.insights[0]?.description ??
              "No se detectaron alertas relevantes en el análisis actual."}
          </p>
        </div>
      </div>
    </section>
  );
}

function ExecutiveFact({
  label,
  value,
  text,
}: {
  label: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-4xl font-black text-[#04224a]">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
