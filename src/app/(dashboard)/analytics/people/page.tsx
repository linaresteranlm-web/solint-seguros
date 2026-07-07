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
import { PeopleFilterBar } from "@/components/analytics/people-filter-bar";
import { PeopleRankingCard } from "@/components/analytics/people-ranking-card";
import { ManagementModeCard } from "@/components/analytics/management-mode-card";
import { AnalyticsExportActions } from "@/components/analytics/analytics-export-actions";
import { PeopleIntelligencePanel } from "@/components/analytics/people-intelligence-panel";
import { ExecutiveCommandCenter } from "@/components/analytics/executive-command-center";
import { readExcelAsAnalyticsDataset } from "@/lib/analytics/excel-dataset-reader";
import { AnalyticsDataset, AnalyticsResult } from "@/lib/analytics/types";
import { runPeopleAnalytics } from "@/lib/analytics/people-analytics-engine";
import { runPeopleIntelligence } from "@/lib/analytics/people-intelligence-engine";
import {
  buildPeopleDashboard,
  EMPTY_PEOPLE_FILTERS,
  PeopleFilters,
} from "@/lib/analytics/people-dashboard-engine";
import { showToast } from "@/lib/toast-store";

const initialSteps: AnalyticsProgressStep[] = [
  { id: "read", label: "Leyendo archivo", status: "pending" },
  { id: "structure", label: "Detectando cabecera real", status: "pending" },
  { id: "validation", label: "Validando DATA GENERAL", status: "pending" },
  { id: "kpis", label: "Calculando KPIs", status: "pending" },
  { id: "insights", label: "Generando Insights consultivos", status: "pending" },
  { id: "recommendations", label: "Generando People Intelligence", status: "pending" },
  { id: "dashboard", label: "Generando Command Center", status: "pending" },
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
  const [dataset, setDataset] = useState<AnalyticsDataset | null>(null);
  const [processing, setProcessing] = useState(false);
  const [steps, setSteps] = useState(initialSteps);
  const [result, setResult] = useState<AnalyticsResult | null>(null);
  const [filters, setFilters] = useState<PeopleFilters>(EMPTY_PEOPLE_FILTERS);

  const dashboard = useMemo(() => {
    if (!dataset) return null;

    return buildPeopleDashboard(dataset, filters);
  }, [dataset, filters]);

  const activeResult = dashboard?.analytics ?? result;

  const intelligence = useMemo(() => {
    if (!dashboard?.filteredDataset) return null;

    return runPeopleIntelligence(dashboard.filteredDataset);
  }, [dashboard?.filteredDataset]);

  async function processFile(nextFile: File) {
    setProcessing(true);
    setResult(null);
    setDataset(null);
    setFilters(EMPTY_PEOPLE_FILTERS);
    setSteps(initialSteps);

    try {
      setSteps((current) => updateStep(current, "read", "running"));
      await wait(250);

      const nextDataset = await readExcelAsAnalyticsDataset({
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

      const analytics = runPeopleAnalytics(nextDataset);

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

      setDataset(nextDataset);
      setResult(analytics);
      setSteps((current) => updateStep(current, "dashboard", "done"));

      showToast({
        title: "Executive Command Center generado",
        description: "DATA GENERAL fue analizado en modo ejecutivo.",
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

  return (
    <AnalyticsShell active="/analytics/people">
      <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
              People Analytics
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#04224a]">
              Executive Command Center
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
              Carga DATA GENERAL para generar un centro de control ejecutivo con
              People Intelligence, Health Score, Executive Score, alertas
              estratégicas, KPIs, rankings y recomendaciones.
            </p>
          </div>

          {file && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setResult(null);
                setDataset(null);
                setFilters(EMPTY_PEOPLE_FILTERS);
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

      {(processing || activeResult) && <AnalyticsProgress steps={steps} />}

      {dataset && (
        <PeopleFilterBar
          dataset={dataset}
          filters={filters}
          onChange={setFilters}
        />
      )}

      {activeResult && dashboard && intelligence && (
        <>
          <ExecutiveCommandCenter
            result={activeResult}
            dashboard={dashboard}
            intelligence={intelligence}
          />

          <PeopleIntelligencePanel intelligence={intelligence} />

          <ManagementModeCard result={activeResult} dashboard={dashboard} />

          <AnalyticsExportActions
            result={activeResult}
            dashboard={dashboard}
            filters={filters}
          />

          <AnalyticsValidationReport validation={activeResult.validation} />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeResult.kpis.map((kpi) => (
              <AnalyticsKpiCard key={kpi.id} kpi={kpi} />
            ))}
            <ExtraMetric label="Registros filtrados" value={dashboard.totalRows} />
            <ExtraMetric label="Áreas" value={dashboard.totalAreas} />
            <ExtraMetric label="Departamentos" value={dashboard.totalDepartamentos} />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <PeopleRankingCard
              title="Distribución por Estado"
              subtitle="ACTIVO, BAJA u otros estados"
              items={dashboard.estadoDistribution}
            />
            <PeopleRankingCard
              title="Ranking por Sede"
              subtitle="Concentración por establecimiento"
              items={dashboard.sedeRanking}
            />
            <PeopleRankingCard
              title="Ranking por Cargo"
              subtitle="Concentración por cargo"
              items={dashboard.cargoRanking}
            />
            <PeopleRankingCard
              title="Ranking por Área"
              subtitle="Concentración por área"
              items={dashboard.areaRanking}
            />
            <PeopleRankingCard
              title="Ranking por Departamento"
              subtitle="Distribución geográfica"
              items={dashboard.departamentoRanking}
            />
          </div>

          <InsightsPanel
            insights={activeResult.insights}
            recommendations={activeResult.recommendations}
          />
        </>
      )}
    </AnalyticsShell>
  );
}

function ExtraMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-4xl font-black text-[#04224a]">{value}</p>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        Indicador calculado automáticamente según los filtros activos.
      </p>
    </div>
  );
}
