"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { ValidationResult } from "@/lib/trama-validator";

function formatoNumero(valor: number) {
  return new Intl.NumberFormat("es-PE").format(valor);
}

export function ValidationPanel({
  result,
  tipo,
}: {
  result: ValidationResult;
  tipo: "SCTR" | "VIDALEY";
}) {
  const [open, setOpen] = useState(true);

  const topIssues = useMemo(() => result.issues.slice(0, 80), [result.issues]);

  const status =
    result.errors > 0
      ? "ERROR"
      : result.warnings > 0
        ? "ADVERTENCIA"
        : "OK";

  return (
    <section className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full flex-col gap-4 border-b border-slate-200 bg-gradient-to-br from-white to-blue-50 p-6 text-left lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="flex items-start gap-4">
          <div
            className={
              status === "ERROR"
                ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700"
                : status === "ADVERTENCIA"
                  ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"
                  : "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"
            }
          >
            {status === "ERROR" ? (
              <ShieldAlert className="h-6 w-6" />
            ) : status === "ADVERTENCIA" ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <ShieldCheck className="h-6 w-6" />
            )}
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
              Validaciones inteligentes
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#04224a]">
              Diagnóstico de trama {tipo}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Matheito revisó campos críticos antes de exportar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={
              status === "ERROR"
                ? "rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700"
                : status === "ADVERTENCIA"
                  ? "rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-black text-amber-700"
                  : "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700"
            }
          >
            {status === "OK"
              ? "Sin errores"
              : status === "ERROR"
                ? "Requiere corrección"
                : "Con advertencias"}
          </span>

          <ChevronDown
            className={
              open
                ? "h-5 w-5 rotate-180 text-slate-500 transition"
                : "h-5 w-5 text-slate-500 transition"
            }
          />
        </div>
      </button>

      {open && (
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <ValidationMetric
              label="Filas revisadas"
              value={result.totalRows}
              icon={ShieldCheck}
            />
            <ValidationMetric
              label="Errores"
              value={result.errors}
              icon={XCircle}
              danger
            />
            <ValidationMetric
              label="Advertencias"
              value={result.warnings}
              icon={AlertTriangle}
              warning
            />
            <ValidationMetric
              label="Sin observación"
              value={result.ok}
              icon={CheckCircle2}
              success
            />
          </div>

          {result.issues.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-black text-emerald-700">
                Matheito no encontró errores ni advertencias en esta trama.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-black text-[#04224a]">
                  Primeras {formatoNumero(topIssues.length)} observaciones
                </p>
              </div>

              <div className="max-h-80 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#052b5b] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Fila</th>
                      <th className="px-4 py-3 text-left">Columna</th>
                      <th className="px-4 py-3 text-left">Severidad</th>
                      <th className="px-4 py-3 text-left">Mensaje</th>
                      <th className="px-4 py-3 text-left">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topIssues.map((issue, index) => (
                      <tr
                        key={`${issue.rowIndex}-${issue.columnName}-${index}`}
                        className="border-b border-slate-200"
                      >
                        <td className="px-4 py-3 font-black text-[#04224a]">
                          {issue.rowIndex + 1}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">
                          {issue.columnName}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              issue.severity === "ERROR"
                                ? "rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700"
                                : "rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700"
                            }
                          >
                            {issue.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {issue.message}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">
                          {issue.value || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {result.issues.length > topIssues.length && (
                <div className="border-t border-slate-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                  Hay más observaciones no mostradas. Corrige las principales y vuelve a revisar.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ValidationMetric({
  label,
  value,
  icon: Icon,
  danger,
  warning,
  success,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  danger?: boolean;
  warning?: boolean;
  success?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div
        className={
          danger
            ? "flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700"
            : warning
              ? "flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"
              : success
                ? "flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"
                : "flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-[#005eb8]"
        }
      >
        <Icon className="h-6 w-6" />
      </div>

      <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p
        className={
          danger
            ? "mt-2 text-3xl font-black text-red-700"
            : warning
              ? "mt-2 text-3xl font-black text-amber-700"
              : success
                ? "mt-2 text-3xl font-black text-emerald-700"
                : "mt-2 text-3xl font-black text-[#04224a]"
        }
      >
        {formatoNumero(value)}
      </p>
    </div>
  );
}
