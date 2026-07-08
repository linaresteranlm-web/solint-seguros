"use client";

import {
  CheckCircle2,
  Download,
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
      title: "SOLINT Business Suite JSON exportado",
      description: "Se exportó el análisis People Analytics en formato JSON Enterprise.",
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
      title: "PDF Ejecutivo v3 generado",
      description:
        "Se generó el PDF Ejecutivo multipágina de SOLINT Business Suite · People Analytics.",
      status: "OK",
      metrics: {
        registros: dashboard.totalRows,
        kpis: result.kpis.length,
        engine: "PDF_V3_MULTIPAGINA",
      },
    });

    showToast({
      title: "PDF Ejecutivo v3 generado",
      description:
        "Debe abrirse en nueva pestaña con portada multipágina y marca SOLINT Business Suite.",
      variant: "success",
    });
  }

  function handleDownloadPdf() {
    downloadAnalyticsPdf({ result, dashboard, filters });

    showToast({
      title: "PDF v3 descargado",
      description:
        "El reporte ejecutivo multipágina fue descargado con el nuevo motor.",
      variant: "success",
    });
  }

  function handleValidationMessage() {
    showToast({
      title: "Validación PDF v3",
      description:
        "Si el PDF todavía dice SOLINT Analytics / SOLINT SEGUROS, limpia .next y reinicia npm run dev.",
      variant: "warning",
    });
  }

  return (
    <section className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-[#04224a] via-[#005eb8] to-[#061a3a] p-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,116,21,0.28),transparent_35%)]" />

        <div className="relative z-10 grid gap-5 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-100">
              Export Center
            </p>
            <h2 className="mt-2 text-2xl font-black">
              PDF Engine v3 Multipágina
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">
              Este panel usa el nuevo generador de reportes de SOLINT Business
              Suite. El PDF debe salir en varias páginas, con portada ejecutiva,
              KPIs, insights, rankings y validación.
            </p>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 text-center backdrop-blur">
            <CheckCircle2 className="mx-auto h-8 w-8 text-[#ffb375]" />
            <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-blue-100">
              Activo
            </p>
            <p className="mt-1 text-sm font-black">v3 Multipágina</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-4">
        <button
          type="button"
          onClick={handleOpenPdf}
          className="flex flex-col items-start gap-3 rounded-2xl bg-[#ff7415] p-5 text-left text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#04224a] hover:shadow-xl"
        >
          <ExternalLink className="h-7 w-7" />
          <span className="text-base font-black">Abrir PDF Ejecutivo v3</span>
          <span className="text-sm leading-6 text-orange-50">
            Abre el reporte multipágina en nueva pestaña.
          </span>
        </button>

        <button
          type="button"
          onClick={handleDownloadPdf}
          className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:border-[#005eb8] hover:bg-blue-50 hover:shadow-xl"
        >
          <FileText className="h-7 w-7 text-[#005eb8]" />
          <span className="text-base font-black text-[#04224a]">
            Descargar PDF v3
          </span>
          <span className="text-sm leading-6 text-slate-600">
            Descarga el informe ejecutivo nuevo.
          </span>
        </button>

        <button
          type="button"
          onClick={handleJson}
          className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:border-[#005eb8] hover:bg-blue-50 hover:shadow-xl"
        >
          <FileJson className="h-7 w-7 text-[#005eb8]" />
          <span className="text-base font-black text-[#04224a]">
            Descargar JSON
          </span>
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
            Validar cambio
          </span>
          <span className="text-sm leading-6 text-amber-800">
            Ayuda si aún ves el PDF antiguo.
          </span>
        </button>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex flex-col gap-2 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between">
          <span>
            Validación esperada: portada azul, texto <b>SOLINT Business Suite</b>,
            módulo <b>People Analytics</b> y varias páginas.
          </span>
          <span className="font-black text-[#005eb8]">
            Ya no debe aparecer “SOLINT SEGUROS” en el PDF general.
          </span>
        </div>
      </div>
    </section>
  );
}
