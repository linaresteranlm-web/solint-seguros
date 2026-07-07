"use client";

import { CheckCircle2, Loader2 } from "lucide-react";

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
  return (
    <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
        Procesamiento
      </p>
      <h2 className="mt-2 text-2xl font-black text-[#04224a]">
        Motor analítico en ejecución
      </h2>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={
              step.status === "done"
                ? "flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
                : step.status === "running"
                  ? "flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4"
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
        ))}
      </div>
    </section>
  );
}
