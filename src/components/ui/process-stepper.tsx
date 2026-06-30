import {
  CheckCircle2,
  CircleDashed,
  FileSpreadsheet,
  GitCompareArrows,
  SearchCheck,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

export type ProcessStepStatus = "done" | "active" | "pending";

export type ProcessStep = {
  label: string;
  description: string;
  status: ProcessStepStatus;
};

const icons = [UploadCloud, ShieldCheck, GitCompareArrows, SearchCheck, FileSpreadsheet];

export function ProcessStepper({ steps }: { steps: ProcessStep[] }) {
  return (
    <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="mb-5">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
          Flujo del proceso
        </p>
        <h2 className="mt-2 text-xl font-black text-[#04224a]">
          Progreso operativo
        </h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = icons[index] ?? CircleDashed;

          return (
            <div
              key={step.label}
              className={
                step.status === "done"
                  ? "rounded-3xl border border-emerald-200 bg-emerald-50 p-5"
                  : step.status === "active"
                    ? "rounded-3xl border border-[#005eb8] bg-blue-50 p-5 shadow-lg shadow-blue-100"
                    : "rounded-3xl border border-slate-200 bg-slate-50 p-5"
              }
            >
              <div
                className={
                  step.status === "done"
                    ? "flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white"
                    : step.status === "active"
                      ? "flex h-11 w-11 items-center justify-center rounded-2xl bg-[#005eb8] text-white"
                      : "flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-400"
                }
              >
                {step.status === "done" ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <Icon className="h-6 w-6" />
                )}
              </div>

              <p
                className={
                  step.status === "pending"
                    ? "mt-4 text-sm font-black text-slate-500"
                    : "mt-4 text-sm font-black text-[#04224a]"
                }
              >
                {index + 1}. {step.label}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
