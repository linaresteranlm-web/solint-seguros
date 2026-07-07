"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Brain,
  CheckCircle2,
  CircleDot,
  Lightbulb,
  ListChecks,
  Sparkles,
  Target,
} from "lucide-react";
import { AnalyticsResult } from "@/lib/analytics/types";
import { PeopleDashboardResult } from "@/lib/analytics/people-dashboard-engine";
import { PeopleIntelligenceResult } from "@/lib/analytics/people-intelligence-engine";
import {
  buildMatheitoLiveBrief,
  MatheitoLiveStatus,
} from "@/lib/analytics/matheito-live-engine";
import { AnimatedCounter, MotionReveal } from "@/components/analytics/motion-ui";

function statusLabel(status: MatheitoLiveStatus) {
  if (status === "analyzing") return "Analizando";
  if (status === "thinking") return "Pensando";
  return "Finalizado";
}

function toneClass(tone: "positive" | "attention" | "critical") {
  if (tone === "positive") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (tone === "attention") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

export function MatheitoLivePanel({
  result,
  dashboard,
  intelligence,
}: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  intelligence: PeopleIntelligenceResult;
}) {
  const [status, setStatus] = useState<MatheitoLiveStatus>("analyzing");
  const [dots, setDots] = useState(".");

  const brief = useMemo(
    () =>
      buildMatheitoLiveBrief({
        result,
        dashboard,
        intelligence,
      }),
    [result, dashboard, intelligence]
  );

  useEffect(() => {
    setStatus("analyzing");

    const t1 = window.setTimeout(() => setStatus("thinking"), 700);
    const t2 = window.setTimeout(() => setStatus("done"), 1450);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [result.id]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDots((current) => {
        if (current === "...") return ".";
        return `${current}.`;
      });
    }, 420);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <MotionReveal>
      <section className="overflow-hidden rounded-[1.9rem] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.12)]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#04224a] via-[#005eb8] to-[#061a3a] p-6 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,116,21,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.13),transparent_35%)]" />

          <div className="relative z-10 grid gap-6 xl:grid-cols-[auto_1fr_auto] xl:items-center">
            <MatheitoAvatar status={status} />

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100 backdrop-blur">
                  <Bot className="h-4 w-4 text-[#ffb375]" />
                  Matheito Live AI
                </span>

                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${toneClass(
                    brief.tone
                  )}`}
                >
                  <CircleDot className="h-4 w-4" />
                  {statusLabel(status)}
                  {status !== "done" ? dots : ""}
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-black leading-tight">
                {brief.greeting}. {brief.title}
              </h2>

              <p className="mt-3 max-w-5xl text-sm leading-7 text-blue-100">
                {status === "done"
                  ? brief.executiveBrief
                  : status === "thinking"
                    ? "Estoy cruzando indicadores, validación, alertas y tendencias para generar una lectura ejecutiva."
                    : "Estoy leyendo la estructura de DATA GENERAL y preparando el diagnóstico."}
              </p>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 px-6 py-5 text-center backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                Confianza
              </p>
              <p className="mt-2 text-4xl font-black">
                <AnimatedCounter value={status === "done" ? brief.confidence : 0} />%
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center gap-3">
              <ListChecks className="h-6 w-6 text-[#005eb8]" />
              <h3 className="text-xl font-black text-[#04224a]">
                Qué detectó Matheito
              </h3>
            </div>

            <div className="space-y-3">
              {brief.detected.map((item, index) => (
                <MotionReveal key={item} delay={index * 100}>
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                </MotionReveal>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50 p-5">
              <div className="mb-3 flex items-center gap-3">
                <Target className="h-6 w-6 text-[#005eb8]" />
                <h3 className="text-xl font-black text-[#04224a]">
                  Siguiente acción recomendada
                </h3>
              </div>
              <p className="text-sm leading-7 text-slate-700">
                {brief.nextAction}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-orange-100 bg-orange-50 p-5">
              <div className="mb-3 flex items-center gap-3">
                <Lightbulb className="h-6 w-6 text-[#ff7415]" />
                <h3 className="text-xl font-black text-[#04224a]">
                  Lectura consultiva
                </h3>
              </div>
              <p className="text-sm leading-7 text-slate-700">
                Esta conclusión se basa únicamente en el análisis cargado en memoria.
                En una siguiente fase, Matheito podrá responder preguntas específicas
                sobre sedes, cargos, áreas, riesgos y evolución histórica.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MotionReveal>
  );
}

function MatheitoAvatar({ status }: { status: MatheitoLiveStatus }) {
  const active = status !== "done";

  return (
    <div
      className={
        active
          ? "relative flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur solint-glow"
          : "relative flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur"
      }
    >
      <div className="absolute -inset-2 rounded-[2.2rem] bg-[#ff7415]/20 blur-xl" />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-[#04224a]">
        {status === "thinking" ? (
          <Brain className="h-9 w-9 text-[#005eb8]" />
        ) : status === "done" ? (
          <Sparkles className="h-9 w-9 text-[#ff7415]" />
        ) : (
          <Bot className="h-9 w-9 text-[#04224a]" />
        )}
      </div>

      <div className="absolute bottom-4 flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#ff7415]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#ff7415] [animation-delay:120ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#ff7415] [animation-delay:240ms]" />
      </div>
    </div>
  );
}
