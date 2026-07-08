"use client";

import {
  CheckCircle2,
  ExternalLink,
  FileJson,
  FileText,
  RefreshCcw,
} from "lucide-react";
import { AnalyticsResult } from "@/lib/analytics/types";
import {
  PeopleDashboardResult,
  PeopleFilters,
} from "@/lib/analytics/people-dashboard-engine";
import {
  downloadAnalyticsJson,
  downloadAnalyticsPdf,
  openAnalyticsPdf,
} from "@/lib/analytics/analytics-export-engine";
import { showToast } from "@/lib/toast-store";
import { addProcessHistory } from "@/lib/process-history";

export function AnalyticsExportActions({
  result,
  dashboard,
  filters,
}: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  filters: PeopleFilters;
}) {
  function handleJson() {
    downloadAnalyticsJson({ result, dashboard, filters });
    addProcessHistory({
      type: "DESCARGA_ARCHIVO",
      title: "CORPRISEG JSON exportado",
      description: "Se exportó el análisis People Analytics en formato JSON.",
      status: "OK",
      metrics: {
        kpis: result.kpis.length,
        insights: result.insights.length,
        recomendaciones: result.recommendations.length,
      },
    });
    showToast({
      title: "JSON exportado",
      description: "El análisis completo fue descargado en formato JSON.",
      variant: "success",
    });
  }

  function handleOpenPdf() {
    openAnalyticsPdf({ result, dashboard, filters });
    addProcessHistory({
      type: "DESCARGA_ARCHIVO",
      title: "Reporte CORPRISEG v4 generado",
      description:
        "Se generó el PDF corporativo CORPRISEG con pie Elaborado por SOLINT Business Suite © LC2026.",
      status: "OK",
      metrics: {
        registros: dashboard.totalRows,
        kpis: result.kpis.length,
        engine: "CORPRISEG_CORPORATE_V4",
      },
    });
    showToast({
      title: "Reporte CORPRISEG generado",
      description:
        "Debe abrirse en nueva pestaña con logo/diseño CORPRISEG y pie SOLINT Business Suite © LC2026.",
      variant: "success",
    });
  }

  function handleDownloadPdf() {
    downloadAnalyticsPdf({ result, dashboard, filters });
    showToast({
      title: "Reporte CORPRISEG descargado",
      description: "El reporte ejecutivo fue descargado con branding CORPRISEG.",
      variant: "success",
    });
  }

  function handleValidationMessage() {
    showToast({
      title: "Validación reporte CORPRISEG",
      description:
        "Coloca el logo en public/images/corpriseg-logo.png y limpia .next antes de validar.",
      variant: "warning",
    });
  }

  return (
    <section className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-[#173b76] via-[#1f4f99] to-[#0f172a] p-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,130,32,0.32),transparent_35%)]" />
        <div className="relative z-10 grid gap-5 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-100">
              Report Center CORPRISEG
            </p>
            <h2 className="mt-2 text-2xl font-black">Reporte Corporativo v4</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">
              Los reportes se generan con identidad CORPRISEG para presentación
              a gerencia y/o jefaturas. SOLINT aparece únicamente como elaborador técnico.
            </p>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 text-center backdrop-blur">
            <CheckCircle2 className="mx-auto h-8 w-8 text-[#f58220]" />
            <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-blue-100">
              Branding
            </p>
            <p className="mt-1 text-sm font-black">CORPRISEG</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-4">
        <button
          type="button"
          onClick={handleOpenPdf}
          className="flex flex-col items-start gap-3 rounded-2xl bg-[#f58220] p-5 text-left text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#173b76] hover:shadow-xl"
        >
          <ExternalLink className="h-7 w-7" />
          <span className="text-base font-black">Abrir Reporte CORPRISEG</span>
          <span className="text-sm leading-6 text-orange-50">
            Abre el PDF gerencial en nueva pestaña.
          </span>
        </button>

        <button
          type="button"
          onClick={handleDownloadPdf}
          className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:border-[#173b76] hover:bg-blue-50 hover:shadow-xl"
        >
          <FileText className="h-7 w-7 text-[#173b76]" />
          <span className="text-base font-black text-[#0f172a]">
            Descargar PDF CORPRISEG
          </span>
          <span className="text-sm leading-6 text-slate-600">
            Descarga el informe para gerencia/jefaturas.
          </span>
        </button>

        <button
          type="button"
          onClick={handleJson}
          className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:border-[#173b76] hover:bg-blue-50 hover:shadow-xl"
        >
          <FileJson className="h-7 w-7 text-[#173b76]" />
          <span className="text-base font-black text-[#0f172a]">Descargar JSON</span>
          <span className="text-sm leading-6 text-slate-600">
            KPIs, insights, filtros, validación y rankings.
          </span>
        </button>

        <button
          type="button"
          onClick={handleValidationMessage}
          className="flex flex-col items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left transition hover:-translate-y-1 hover:bg-amber-100 hover:shadow-xl"
        >
          <RefreshCcw className="h-7 w-7 text-amber-700" />
          <span className="text-base font-black text-amber-800">
            Validar branding
          </span>
          <span className="text-sm leading-6 text-amber-800">
            Revisa logo, portada y pie de página.
          </span>
        </button>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex flex-col gap-2 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between">
          <span>
            Esperado: portada CORPRISEG, colores azul/naranja, logo si existe y PDF multipágina.
          </span>
          <span className="font-black text-[#173b76]">
            Pie: Elaborado por SOLINT Business Suite © LC2026
          </span>
        </div>
      </div>
    </section>
  );
}
