"use client";

import { useMemo, useState } from "react";
import { FileSpreadsheet, UploadCloud, X } from "lucide-react";
import { AnalyticsShell } from "@/components/analytics/analytics-shell";
import { AnalyticsKpiCard } from "@/components/analytics/analytics-kpi-card";
import { InsightsPanel } from "@/components/analytics/insights-panel";
import {
  AnalyticsProgress,
  AnalyticsProgressStep,
} from "@/components/analytics/analytics-progress";
import { AnalyticsValidationReport } from "@/components/analytics/analytics-validation-report";
import { readExcelAsAnalyticsDataset } from "@/lib/analytics/excel-dataset-reader";
import { AnalyticsResult } from "@/lib/analytics/types";
import { runPeopleAnalytics } from "@/lib/analytics/people-analytics-engine";
import { showToast } from "@/lib/toast-store";

const initialSteps: AnalyticsProgressStep[] = [
  { id: "read", label: "Leyendo archivo", status: "pending" },
  { id: "structure", label: "Analizando estructura", status: "pending" },
  { id: "validation", label: "Validando datos", status: "pending" },
  { id: "kpis", label: "Calculando KPIs", status: "pending" },
  { id: "insights", label: "Generando Insights", status: "pending" },
  { id: "recommendations", label: "Generando Recomendaciones", status: "pending" },
  { id: "dashboard", label: "Generando Dashboard", status: "pending" },
];

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function updateStep(
  steps: AnalyticsProgressStep[],
  id: string,
  status: AnalyticsProgressStep["status"]
) {
  return steps.map((step) => (step.id === id ? { ...step, status } : step));
}

export default function PeopleAnalyticsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [steps, setSteps] = useState(initialSteps);
  const [result, setResult] = useState<AnalyticsResult | null>(null);

  const hasResult = Boolean(result);

  async function processFile(nextFile: File) {
    setProcessing(true);
    setResult(null);
    setSteps(initialSteps);

    try {
      setSteps((current) => updateStep(current, "read", "running"));
      await wait(250);

      const dataset = await readExcelAsAnalyticsDataset({
        file: nextFile,
        domain: "people",
      });

      setSteps((current) =>
        updateStep(updateStep(current, "read", "done"), "structure", "running")
      );
      await wait(250);

      setSteps((current) =>
        updateStep(updateStep(current, "structure", "done"), "validation", "running")
      );
      await wait(250);

      const analytics = runPeopleAnalytics(dataset);

      setSteps((current) =>
        updateStep(updateStep(current, "validation", "done"), "kpis", "running")
      );
      await wait(250);

      setSteps((current) =>
        updateStep(updateStep(current, "kpis", "done"), "insights", "running")
      );
      await wait(250);

      setSteps((current) =>
        updateStep(updateStep(current, "insights", "done"), "recommendations", "running")
      );
      await wait(250);

      setSteps((current) =>
        updateStep(updateStep(current, "recommendations", "done"), "dashboard", "running")
      );
      await wait(250);

      setResult(analytics);

      setSteps((current) => updateStep(current, "dashboard", "done"));

      showToast({
        title: "People Analytics generado",
        description: "El motor analítico procesó el archivo DATA GENERAL.",
        variant: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo procesar el archivo.";

      showToast({
        title: "Error de procesamiento",
        description: message,
        variant: "error",
      });
    } finally {
      setProcessing(false);
    }
  }

  function handleFile(nextFile: File | null) {
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

    setFile(nextFile);
    processFile(nextFile);
  }

  const kpis = useMemo(() => result?.kpis ?? [], [result]);

  return (
    <AnalyticsShell active="/analytics/people">
      <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
              People Analytics
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#04224a]">
              Carga DATA GENERAL
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
              Carga el archivo Excel base para analizar headcount, ceses, rotación,
              insights y recomendaciones automáticas.
            </p>
          </div>

          {file && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setResult(null);
                setSteps(initialSteps);
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100"
            >
              <X className="h-4 w-4" />
              Quitar archivo
            </button>
          )}
        </div>

        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition hover:border-[#005eb8] hover:bg-blue-50">
          <input
            type="file"
            accept=".xls,.xlsx"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />

          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100 text-[#005eb8]">
            {file ? (
              <FileSpreadsheet className="h-9 w-9" />
            ) : (
              <UploadCloud className="h-9 w-9" />
            )}
          </div>

          <p className="mt-5 text-lg font-black text-[#04224a]">
            {file?.name ?? "Seleccionar DATA GENERAL"}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Formatos permitidos: .xlsx y .xls
          </p>
        </label>
      </section>

      {(processing || hasResult) && <AnalyticsProgress steps={steps} />}

      {result && (
        <>
          <AnalyticsValidationReport validation={result.validation} />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {kpis.map((kpi) => (
              <AnalyticsKpiCard key={kpi.id} kpi={kpi} />
            ))}
          </div>

          <InsightsPanel
            insights={result.insights}
            recommendations={result.recommendations}
          />
        </>
      )}
    </AnalyticsShell>
  );
}
