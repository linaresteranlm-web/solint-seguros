"use client";

import { ArrowDown, ArrowRight, ArrowUp, History, Save } from "lucide-react";
import {
  LocalTrendResult,
  saveLastPeopleSnapshot,
} from "@/lib/analytics/local-trend-engine";
import { showToast } from "@/lib/toast-store";

function directionIcon(direction: string) {
  if (direction === "up") return ArrowUp;
  if (direction === "down") return ArrowDown;
  return ArrowRight;
}

function directionClass(direction: string) {
  if (direction === "up") return "bg-blue-100 text-blue-700";
  if (direction === "down") return "bg-amber-100 text-amber-700";
  if (direction === "new") return "bg-slate-100 text-slate-600";
  return "bg-emerald-100 text-emerald-700";
}

export function LocalTrendPanel({ trends }: { trends: LocalTrendResult }) {
  function handleSaveSnapshot() {
    saveLastPeopleSnapshot(trends.currentSnapshot);

    showToast({
      title: "Snapshot guardado",
      description: "Este análisis será usado como referencia para la próxima carga.",
      variant: "success",
    });
  }

  return (
    <section className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="grid gap-4 border-b border-slate-200 bg-gradient-to-br from-[#04224a] to-[#005eb8] p-6 text-white xl:grid-cols-[1fr_auto] xl:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#ffb375]">
            <History className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-100">
              Motor de Tendencias Local
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Actual vs análisis anterior
            </h2>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              Compara la carga actual contra el último snapshot guardado en este navegador.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveSnapshot}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff7415] px-5 py-3 text-sm font-black text-white transition hover:bg-white hover:text-[#04224a]"
        >
          <Save className="h-4 w-4" />
          Guardar snapshot actual
        </button>
      </div>

      <div className="p-6">
        {!trends.previousSnapshot && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
            Aún no existe snapshot anterior. Guarda el análisis actual para comparar la siguiente carga.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trends.trends.map((trend) => {
            const Icon = directionIcon(trend.direction);

            return (
              <div
                key={trend.label}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      {trend.label}
                    </p>
                    <p className="mt-2 text-3xl font-black text-[#04224a]">
                      {trend.current}
                    </p>
                  </div>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${directionClass(
                      trend.direction
                    )}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                  <span>Anterior: {trend.previous ?? "—"}</span>
                  <span>Variación: {trend.variation ?? "—"}</span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {trend.interpretation}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
