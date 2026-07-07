"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Brain, DatabaseZap, Layers3 } from "lucide-react";
import { AnalyticsShell } from "@/components/analytics/analytics-shell";
import { ANALYTICS_DOMAINS } from "@/lib/analytics/domain-registry";

export default function AnalyticsHomePage() {
  return (
    <AnalyticsShell active="/analytics">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FrameworkCard icon={Layers3} title="Arquitectura modular" text="UI, motores, validación, insights, recomendaciones y exportación desacoplados." />
        <FrameworkCard icon={DatabaseZap} title="Sin base de datos" text="Fase 1 trabaja en memoria y queda preparada para conectar proveedores." />
        <FrameworkCard icon={Brain} title="Future AI Ready" text="Contratos preparados para predicción, anomalías y resúmenes ejecutivos." />
        <FrameworkCard icon={BarChart3} title="BI reutilizable" text="People es el primer dominio; luego podrán agregarse finanzas, ventas e inventario." />
      </div>

      <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">Dominios analíticos</p>
          <h2 className="mt-2 text-2xl font-black text-[#04224a]">Plataforma lista para crecer</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ANALYTICS_DOMAINS.map((domain) => (
            <Link key={domain.id} href={domain.route} className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-[#005eb8] hover:bg-blue-50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-black text-[#04224a]">{domain.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{domain.description}</p>
                </div>
                <span className={domain.status === "available" ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700" : "rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-600"}>
                  {domain.status === "available" ? "Disponible" : "Próximo"}
                </span>
              </div>
              <p className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#005eb8]">Abrir <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></p>
            </Link>
          ))}
        </div>
      </section>
    </AnalyticsShell>
  );
}

function FrameworkCard({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#005eb8]"><Icon className="h-6 w-6" /></div>
      <p className="mt-5 text-lg font-black text-[#04224a]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
