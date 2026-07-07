"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { MotionReveal } from "@/components/analytics/motion-ui";

export type AnalyticsProgressStep = {
  id: string;
  label: string;
  status: "pending" | "running" | "done";
};

export function AnalyticsProgress({
  steps,
}: {
  steps: AnalyticsProgressStep[];
}) {
  const completed = steps.filter((step) => step.status === "done").length;
  const runningIndex = steps.findIndex((step) => step.status === "running");
  const progress = Math.round((completed / steps.length) * 100);

  return (
    <MotionReveal>
      <section className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-gradient-to-br from-[#04224a] to-[#005eb8] p-6 text-white">
          <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-100">
                Procesamiento
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Motor analítico en ejecución
              </h2>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                {runningIndex >= 0
                  ? steps[runningIndex].label
                  : progress === 100
                    ? "Análisis completado"
                    : "Preparando análisis"}
              </p>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 text-center backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                Avance
              </p>
              <p className="mt-1 text-3xl font-black">{progress}%</p>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ff7415] to-white transition-all duration-700 solint-shimmer"
              style={{ width: `${Math.max(progress, 6)}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 p-6 md:grid-cols-2 xl:grid-cols-3">
          {steps.map((step, index) => (
            <MotionReveal key={step.id} delay={index * 70}>
              <div
                className={
                  step.status === "done"
                    ? "flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
                    : step.status === "running"
                      ? "flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 solint-glow"
                      : "flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                }
              >
                {step.status === "done" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" />
                ) : step.status === "running" ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#005eb8]" />
                ) : (
                  <div className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-300" />
                )}

                <span
                  className={
                    step.status === "done"
                      ? "text-sm font-black text-emerald-700"
                      : step.status === "running"
                        ? "text-sm font-black text-[#005eb8]"
                        : "text-sm font-bold text-slate-500"
                  }
                >
                  {step.label}
                </span>
              </div>
            </MotionReveal>
          ))}
        </div>
      </section>
    </MotionReveal>
  );
}
