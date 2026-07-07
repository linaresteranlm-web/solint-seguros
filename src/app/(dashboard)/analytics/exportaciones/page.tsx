import { AnalyticsShell } from "@/components/analytics/analytics-shell";

export default function AnalyticsExportacionesPage() {
  return (
    <AnalyticsShell active="/analytics/exportaciones">
      <section className="rounded-[1.7rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
          Export Engine
        </p>
        <h2 className="mt-2 text-3xl font-black text-[#04224a]">
          Centro de Exportaciones Enterprise
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
          Desde People Analytics podrás generar JSON Enterprise y PDF Ejecutivo.
          En las siguientes fases este centro consolidará también Excel
          corporativo, paquetes ZIP e histórico comparativo.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <ExportInfo
            title="JSON Enterprise"
            text="Incluye indicadores, filtros, insights, recomendaciones, validación, rankings, metadata y versión."
          />
          <ExportInfo
            title="PDF Ejecutivo"
            text="Diseño de consultoría para presentar resultados a Gerencia."
          />
          <ExportInfo
            title="Excel Corporativo"
            text="Próxima fase: informe con portada, dashboard, KPIs, metodología y base procesada."
          />
        </div>
      </section>
    </AnalyticsShell>
  );
}

function ExportInfo({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-lg font-black text-[#04224a]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
