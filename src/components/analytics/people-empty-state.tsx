"use client";

import { Bot, Database, FileSpreadsheet, PlayCircle, Sparkles, UploadCloud } from "lucide-react";
import { MotionReveal } from "@/components/analytics/motion-ui";

export function PeopleEmptyState({ onDemo }: { onDemo?: () => void }) {
  return (
    <MotionReveal>
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.12)]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#04224a] via-[#005eb8] to-[#061a3a] p-8 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,116,21,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.13),transparent_35%)]" />
          <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr_auto] xl:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-100">
                Welcome Experience
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
                Empieza cargando DATA GENERAL
              </h2>
              <p className="mt-5 max-w-4xl text-sm leading-7 text-blue-100">
                Matheito analizará la información, generará indicadores ejecutivos,
                detectará riesgos, preparará recomendaciones y activará el Command Center.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 text-center backdrop-blur">
              <Bot className="mx-auto h-16 w-16 text-[#ffb375]" />
              <p className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-blue-100">
                Matheito AI
              </p>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                Listo para ayudarte.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          <StepCard icon={UploadCloud} title="1. Carga el Excel" text="Selecciona el archivo DATA GENERAL con el formato real de trabajo." />
          <StepCard icon={Database} title="2. Procesa datos" text="El sistema detecta cabeceras, normaliza campos y valida la información." />
          <StepCard icon={Sparkles} title="3. Presenta resultados" text="Activa Command Center, Matheito Live, Radar, Timeline y Snapshot Manager." />
        </div>

        <div className="border-t border-slate-200 bg-slate-50 p-6">
          <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#005eb8]">
                <FileSpreadsheet className="h-7 w-7" />
              </div>
              <div>
                <p className="text-lg font-black text-[#04224a]">
                  Sin base de datos, con experiencia enterprise
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Todo el análisis se ejecuta en navegador y queda preparado para exportar,
                  presentar y comparar snapshots históricos.
                </p>
              </div>
            </div>

            <button type="button" onClick={onDemo} className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-400" title="Preparado para Fase 39.3 Demo Mode">
              <PlayCircle className="h-5 w-5" />
              Demo Mode próximamente
            </button>
          </div>
        </div>
      </section>
    </MotionReveal>
  );
}

function StepCard({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#005eb8]">
        <Icon className="h-7 w-7" />
      </div>
      <p className="mt-5 text-lg font-black text-[#04224a]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
