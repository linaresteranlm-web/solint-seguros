"use client";

import { Download, ExternalLink, FileJson, FileText } from "lucide-react";
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
      title: "SOLINT Analytics JSON exportado",
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
      title: "SOLINT Analytics PDF generado",
      description: "Se generó el PDF Ejecutivo de People Analytics.",
      status: "OK",
      metrics: {
        registros: dashboard.totalRows,
        kpis: result.kpis.length,
      },
    });

    showToast({
      title: "PDF generado",
      description: "El reporte ejecutivo se abrirá en una nueva pestaña.",
      variant: "success",
    });
  }

  function handleDownloadPdf() {
    downloadAnalyticsPdf({ result, dashboard, filters });

    showToast({
      title: "PDF descargado",
      description: "El reporte ejecutivo fue descargado.",
      variant: "success",
    });
  }

  return (
    <section className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200 bg-gradient-to-br from-[#04224a] to-[#005eb8] p-6 text-white">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-100">
          Export Engine
        </p>
        <h2 className="mt-2 text-2xl font-black">Exportaciones Enterprise</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">
          Exporta el análisis completo para presentaciones, auditoría,
          comparación histórica y futuras integraciones.
        </p>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-3">
        <button
          type="button"
          onClick={handleJson}
          className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-[#005eb8] hover:bg-blue-50"
        >
          <FileJson className="h-7 w-7 text-[#005eb8]" />
          <span className="text-base font-black text-[#04224a]">
            Descargar JSON
          </span>
          <span className="text-sm leading-6 text-slate-600">
            KPIs, insights, filtros, validación, rankings y metadata.
          </span>
        </button>

        <button
          type="button"
          onClick={handleOpenPdf}
          className="flex flex-col items-start gap-3 rounded-2xl bg-[#ff7415] p-5 text-left text-white transition hover:bg-[#04224a]"
        >
          <ExternalLink className="h-7 w-7" />
          <span className="text-base font-black">Generar PDF</span>
          <span className="text-sm leading-6 text-orange-50">
            Abre reporte ejecutivo en nueva pestaña.
          </span>
        </button>

        <button
          type="button"
          onClick={handleDownloadPdf}
          className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-[#005eb8] hover:bg-blue-50"
        >
          <FileText className="h-7 w-7 text-[#005eb8]" />
          <span className="text-base font-black text-[#04224a]">
            Descargar PDF
          </span>
          <span className="text-sm leading-6 text-slate-600">
            Informe de consultoría listo para compartir.
          </span>
        </button>
      </div>
    </section>
  );
}
