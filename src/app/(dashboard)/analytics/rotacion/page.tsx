"use client";

import { useState } from "react";
import { FileSpreadsheet, UploadCloud, X } from "lucide-react";
import { AnalyticsShell } from "@/components/analytics/analytics-shell";
import { PeopleEmptyState } from "@/components/analytics/people-empty-state";
import { RotationIndicatorsPanel } from "@/components/analytics/rotation-indicators-panel";
import { readExcelAsAnalyticsDataset } from "@/lib/analytics/excel-dataset-reader";
import { buildDemoPeopleDataset } from "@/lib/analytics/demo-people-dataset";
import { AnalyticsDataset } from "@/lib/analytics/types";
import { showToast } from "@/lib/toast-store";

export default function RotationIndicatorsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dataset, setDataset] = useState<AnalyticsDataset | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(nextFile: File | null) {
    if (!nextFile) return;

    const name = nextFile.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      showToast({
        title: "Archivo inválido",
        description: "Carga un archivo Excel .xlsx o .xls.",
        variant: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      const nextDataset = await readExcelAsAnalyticsDataset({
        file: nextFile,
        domain: "people",
      });
      setFile(nextFile);
      setDataset(nextDataset);
      showToast({
        title: "DATA GENERAL cargado",
        description: "Ya puedes generar indicadores de rotación y reportes gerenciales.",
        variant: "success",
      });
    } catch (error) {
      showToast({
        title: "Error al cargar archivo",
        description: error instanceof Error ? error.message : "No se pudo leer el Excel.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleDemoMode() {
    setFile(null);
    setDataset(buildDemoPeopleDataset());
    showToast({
      title: "Demo Mode activado",
      description: "Se generó una base ficticia para demostrar indicadores de rotación.",
      variant: "success",
    });
  }

  return (
    <AnalyticsShell active="/analytics/rotacion">
      <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#173b76]">
              People Analytics · CORPRISEG
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#0f172a]">
              Indicadores de Rotación Enero-Junio
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
              Carga DATA GENERAL y genera un informe gerencial de rotación mensual,
              acumulada, rankings y recomendaciones. El reporte usa branding CORPRISEG
              y firma técnica SOLINT Business Suite.
            </p>
          </div>

          {dataset && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setDataset(null);
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100"
            >
              <X className="h-4 w-4" />
              Quitar archivo
            </button>
          )}
        </div>

        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition hover:border-[#173b76] hover:bg-blue-50">
          <input
            type="file"
            accept=".xls,.xlsx"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100 text-[#173b76]">
            {file ? <FileSpreadsheet className="h-9 w-9" /> : <UploadCloud className="h-9 w-9" />}
          </div>
          <p className="mt-5 text-lg font-black text-[#0f172a]">
            {loading ? "Procesando archivo..." : file?.name ?? dataset?.name ?? "Seleccionar DATA GENERAL"}
          </p>
          <p className="mt-2 text-sm text-slate-500">Formatos permitidos: .xlsx y .xls</p>
        </label>
      </section>

      {!dataset && <PeopleEmptyState onDemo={handleDemoMode} />}

      {dataset && <RotationIndicatorsPanel dataset={dataset} />}
    </AnalyticsShell>
  );
}
