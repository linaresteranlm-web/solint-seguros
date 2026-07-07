import { AnalyticsShell } from "@/components/analytics/analytics-shell";
export default function AnalyticsConfiguracionPage() {
  return <AnalyticsShell active="/analytics/configuracion"><section className="rounded-[1.7rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"><p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">Configuration Engine</p><h2 className="mt-2 text-3xl font-black text-[#04224a]">Configuración de SOLINT Analytics</h2><p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">Aquí se configurarán empresa, logo, colores, idioma, moneda, metas, semáforos, costos y parámetros globales.</p></section></AnalyticsShell>;
}
