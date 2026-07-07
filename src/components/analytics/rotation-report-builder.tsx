"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Layers3,
  LayoutList,
  Settings2,
} from "lucide-react";
import { RotationAnalysisResult } from "@/lib/analytics/rotation-indicators-engine";
import {
  DEFAULT_ROTATION_REPORT_SECTIONS,
  RotationReportSections,
  openRotationPdf,
} from "@/lib/analytics/rotation-report-export";
import { downloadRotationExcelBySections } from "@/lib/analytics/rotation-report-builder-export";
import { showToast } from "@/lib/toast-store";

type ReportPreset = {
  id: string;
  title: string;
  description: string;
  sections: RotationReportSections;
};

const SECTION_LABELS: Record<keyof RotationReportSections, string> = {
  portada: "Portada corporativa",
  metodologia: "Metodología y fórmula",
  mensual: "Tabla mensual de rotación",
  rankings: "Rankings por sede, cargo y área",
  hallazgos: "Hallazgos y conclusiones",
  recomendaciones: "Recomendaciones",
};

const PRESETS: ReportPreset[] = [
  {
    id: "full",
    title: "Reporte completo",
    description: "Portada, metodología, mensual, rankings, hallazgos y recomendaciones.",
    sections: DEFAULT_ROTATION_REPORT_SECTIONS,
  },
  {
    id: "rotation-only",
    title: "Solo indicadores de rotación",
    description: "Ideal para cuando gerencia pide únicamente rotación enero-junio.",
    sections: {
      portada: true,
      metodologia: true,
      mensual: true,
      rankings: false,
      hallazgos: true,
      recomendaciones: true,
    },
  },
  {
    id: "monthly",
    title: "Solo comparativo mensual",
    description: "Enfocado en evolución mensual: headcount, ingresos, ceses y rotación.",
    sections: {
      portada: true,
      metodologia: true,
      mensual: true,
      rankings: false,
      hallazgos: false,
      recomendaciones: false,
    },
  },
  {
    id: "rankings",
    title: "Solo rankings",
    description: "Top sedes, cargos, áreas y departamentos con mayor rotación.",
    sections: {
      portada: true,
      metodologia: false,
      mensual: false,
      rankings: true,
      hallazgos: true,
      recomendaciones: true,
    },
  },
  {
    id: "executive",
    title: "Solo conclusiones ejecutivas",
    description: "Resumen ejecutivo con lectura gerencial y acciones sugeridas.",
    sections: {
      portada: true,
      metodologia: false,
      mensual: false,
      rankings: false,
      hallazgos: true,
      recomendaciones: true,
    },
  },
];

export function RotationReportBuilder({
  analysis,
}: {
  analysis: RotationAnalysisResult;
}) {
  const [selectedPreset, setSelectedPreset] = useState("rotation-only");
  const [sections, setSections] = useState<RotationReportSections>(
    PRESETS.find((preset) => preset.id === "rotation-only")?.sections ??
      DEFAULT_ROTATION_REPORT_SECTIONS
  );

  const selectedSectionsCount = useMemo(
    () => Object.values(sections).filter(Boolean).length,
    [sections]
  );

  function applyPreset(preset: ReportPreset) {
    setSelectedPreset(preset.id);
    setSections(preset.sections);
  }

  function toggleSection(key: keyof RotationReportSections) {
    setSelectedPreset("custom");
    setSections((current) => ({ ...current, [key]: !current[key] }));
  }

  function handlePdf() {
    openRotationPdf(analysis, sections);
    showToast({
      title: "PDF generado",
      description: "Se abrió el reporte de rotación con las secciones seleccionadas.",
      variant: "success",
    });
  }

  function handleExcel() {
    downloadRotationExcelBySections(analysis, sections);
    showToast({
      title: "Excel generado",
      description: "Se descargó el Excel gerencial con las hojas seleccionadas.",
      variant: "success",
    });
  }

  return (
    <section className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#173b76] to-[#0f172a] p-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,130,32,0.26),transparent_35%)]" />
        <div className="relative z-10 grid gap-5 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#f58220]">
              <Layers3 className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-100">
                Report Builder CORPRISEG
              </p>
              <h3 className="mt-2 text-2xl font-black">
                Generador selectivo de reportes
              </h3>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-blue-100">
                Elige si deseas generar el informe completo o solo indicadores de
                rotación, mensual, rankings o conclusiones ejecutivas.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 text-center backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
              Secciones
            </p>
            <p className="mt-1 text-3xl font-black">{selectedSectionsCount}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <LayoutList className="h-6 w-6 text-[#173b76]" />
            <h4 className="text-xl font-black text-[#0f172a]">
              Tipo de reporte
            </h4>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={
                  selectedPreset === preset.id
                    ? "rounded-3xl border-2 border-[#f58220] bg-orange-50 p-5 text-left shadow-lg"
                    : "rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-[#173b76] hover:bg-white hover:shadow-lg"
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-[#173b76]">{preset.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {preset.description}
                    </p>
                  </div>
                  {selectedPreset === preset.id && (
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-[#f58220]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-3">
            <Settings2 className="h-6 w-6 text-[#f58220]" />
            <h4 className="text-xl font-black text-[#0f172a]">
              Secciones incluidas
            </h4>
          </div>

          <div className="space-y-3">
            {(Object.keys(sections) as (keyof RotationReportSections)[]).map(
              (key) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-white"
                >
                  <span className="text-sm font-black text-[#173b76]">
                    {SECTION_LABELS[key]}
                  </span>
                  <input
                    type="checkbox"
                    checked={sections[key]}
                    onChange={() => toggleSection(key)}
                    className="h-5 w-5 accent-[#f58220]"
                  />
                </label>
              )
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handlePdf}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f58220] px-5 py-3 text-sm font-black text-white transition hover:bg-[#173b76]"
            >
              <FileText className="h-4 w-4" />
              Generar PDF
            </button>

            <button
              type="button"
              onClick={handleExcel}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#173b76] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0f172a]"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Generar Excel
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
