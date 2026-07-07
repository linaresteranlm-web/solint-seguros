import { AnalyticsShell } from "@/components/analytics/analytics-shell";
export default function AnalyticsAyudaPage() {
  return <AnalyticsShell active="/analytics/ayuda"><section className="rounded-[1.7rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"><p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">Analytics Help</p><h2 className="mt-2 text-3xl font-black text-[#04224a]">Centro de ayuda analítica</h2><p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">Guías, metodología, diccionario de KPIs, interpretación de insights y uso recomendado para Gerencia.</p></section></AnalyticsShell>;
}
