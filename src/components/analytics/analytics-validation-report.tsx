"use client";

import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { AnalyticsValidationResult } from "@/lib/analytics/types";

export function AnalyticsValidationReport({
  validation,
}: {
  validation: AnalyticsValidationResult;
}) {
  const status = validation.errors > 0 ? "error" : validation.warnings > 0 ? "warning" : "ok";

  return (
    <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={
              status === "error"
                ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700"
                : status === "warning"
                  ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"
                  : "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"
            }
          >
            {status === "error" ? (
              <ShieldAlert className="h-6 w-6" />
            ) : status === "warning" ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <CheckCircle2 className="h-6 w-6" />
            )}
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
              Auditor Enterprise
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#04224a]">
              Reporte de validación
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Validación de estructura, campos obligatorios y consistencia de datos.
            </p>
          </div>
        </div>

        <span
          className={
            status === "error"
              ? "rounded-2xl bg-red-100 px-4 py-2 text-sm font-black text-red-700"
              : status === "warning"
                ? "rounded-2xl bg-amber-100 px-4 py-2 text-sm font-black text-amber-700"
                : "rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700"
          }
        >
          {status === "error" ? "Requiere corrección" : status === "warning" ? "Con advertencias" : "Aprobado"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric label="Registros" value={validation.totalRows} />
        <Metric label="Errores" value={validation.errors} danger />
        <Metric label="Advertencias" value={validation.warnings} warning />
      </div>

      {validation.issues.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-black text-[#04224a]">
              Observaciones detectadas
            </p>
          </div>

          <div className="max-h-80 overflow-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="sticky top-0 bg-[#04224a] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Fila</th>
                  <th className="px-4 py-3 text-left">Columna</th>
                  <th className="px-4 py-3 text-left">Observación</th>
                  <th className="px-4 py-3 text-left">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {validation.issues.slice(0, 100).map((issue) => (
                  <tr key={issue.id} className="border-b border-slate-200">
                    <td className="px-4 py-3">
                      <span
                        className={
                          issue.severity === "error"
                            ? "rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700"
                            : issue.severity === "warning"
                              ? "rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700"
                              : "rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700"
                        }
                      >
                        {issue.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-600">
                      {issue.row ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-600">
                      {issue.column ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-black text-[#04224a]">
                      {issue.title}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {issue.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
  danger,
  warning,
}: {
  label: string;
  value: number;
  danger?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p
        className={
          danger
            ? "mt-2 text-3xl font-black text-red-700"
            : warning
              ? "mt-2 text-3xl font-black text-amber-700"
              : "mt-2 text-3xl font-black text-[#04224a]"
        }
      >
        {value}
      </p>
    </div>
  );
}
