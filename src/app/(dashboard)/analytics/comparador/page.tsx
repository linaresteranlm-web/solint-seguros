import { AnalyticsShell } from "@/components/analytics/analytics-shell";
export default function AnalyticsComparadorPage() {
  return <AnalyticsShell active="/analytics/comparador"><section className="rounded-[1.7rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"><p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">Analytics Comparator</p><h2 className="mt-2 text-3xl font-black text-[#04224a]">Comparador de análisis JSON</h2><p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">Permitirá importar resultados JSON generados por SOLINT Analytics y comparar mes vs mes, trimestre vs trimestre, semestre vs semestre y año vs año.</p></section></AnalyticsShell>;
}
