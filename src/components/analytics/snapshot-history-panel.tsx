"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Download,
  GitCompareArrows,
  History,
  Trash2,
} from "lucide-react";
import {
  clearSnapshotHistory,
  compareSnapshots,
  deleteSnapshot,
  exportSnapshotJson,
  formatSnapshotDate,
  getSnapshotHistory,
  SnapshotComparisonResult,
} from "@/lib/analytics/snapshot-history-engine";
import { PeopleSnapshot } from "@/lib/analytics/local-trend-engine";
import { showToast } from "@/lib/toast-store";

function directionIcon(direction: "up" | "down" | "flat") {
  if (direction === "up") return ArrowUp;
  if (direction === "down") return ArrowDown;
  return ArrowRight;
}

export function SnapshotHistoryPanel({
  refreshKey = 0,
}: {
  refreshKey?: number;
}) {
  const [history, setHistory] = useState<PeopleSnapshot[]>([]);
  const [previousId, setPreviousId] = useState("");
  const [currentId, setCurrentId] = useState("");

  useEffect(() => {
    const items = getSnapshotHistory();
    setHistory(items);

    if (items.length >= 2) {
      setCurrentId(items[0].id);
      setPreviousId(items[1].id);
    } else if (items.length === 1) {
      setCurrentId(items[0].id);
    }
  }, [refreshKey]);

  const comparison = useMemo<SnapshotComparisonResult | null>(() => {
    const previous = history.find((item) => item.id === previousId);
    const current = history.find((item) => item.id === currentId);

    if (!previous || !current || previous.id === current.id) return null;

    return compareSnapshots(previous, current);
  }, [history, previousId, currentId]);

  function handleDelete(id: string) {
    deleteSnapshot(id);
    setHistory(getSnapshotHistory());

    showToast({
      title: "Snapshot eliminado",
      description: "Se eliminó el corte histórico seleccionado.",
      variant: "warning",
    });
  }

  function handleClear() {
    clearSnapshotHistory();
    setHistory([]);
    setPreviousId("");
    setCurrentId("");

    showToast({
      title: "Historial limpiado",
      description: "Se eliminó el historial local de snapshots.",
      variant: "warning",
    });
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="grid gap-4 border-b border-slate-200 bg-gradient-to-br from-[#04224a] to-[#005eb8] p-6 text-white xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#ffb375]">
              <History className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-100">
                Historical Snapshot Manager
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Historial local de inteligencia organizacional
              </h2>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                Cada análisis puede guardarse como un corte histórico para comparar periodos sin base de datos.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            disabled={history.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Limpiar historial
          </button>
        </div>

        <div className="p-6">
          {history.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <History className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-4 text-sm font-black text-[#04224a]">
                Aún no existen snapshots
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Genera un análisis en People Analytics y guarda el snapshot actual.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {history.map((snapshot) => (
                <SnapshotCard
                  key={snapshot.id}
                  snapshot={snapshot}
                  onDelete={() => handleDelete(snapshot.id)}
                  onExport={() => exportSnapshotJson(snapshot)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {history.length >= 2 && (
        <div className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#ff7415]">
              <GitCompareArrows className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#ff7415]">
                Comparador Histórico
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#04224a]">
                Actual vs Anterior
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Selecciona dos cortes para analizar evolución ejecutiva.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SnapshotSelect
              label="Periodo anterior"
              value={previousId}
              history={history}
              onChange={setPreviousId}
            />
            <SnapshotSelect
              label="Periodo actual"
              value={currentId}
              history={history}
              onChange={setCurrentId}
            />
          </div>

          {comparison && (
            <div className="mt-6 space-y-6">
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#005eb8]">
                  Matheito Evolution
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-700">
                  {comparison.executiveSummary}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {comparison.metrics.map((metric) => {
                  const Icon = directionIcon(metric.direction);

                  return (
                    <div
                      key={metric.label}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                            {metric.label}
                          </p>
                          <p className="mt-2 text-3xl font-black text-[#04224a]">
                            {metric.current}
                          </p>
                        </div>
                        <div
                          className={
                            metric.direction === "flat"
                              ? "flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"
                              : metric.good
                                ? "flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"
                                : "flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-700"
                          }
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                        <span>Anterior: {metric.previous}</span>
                        <span>Variación: {metric.variation}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <HistoricalHeatmap comparison={comparison} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SnapshotCard({
  snapshot,
  onDelete,
  onExport,
}: {
  snapshot: PeopleSnapshot;
  onDelete: () => void;
  onExport: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-[#005eb8] hover:bg-blue-50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#04224a]">
            {formatSnapshotDate(snapshot.createdAt)}
          </p>
          <p className="mt-1 line-clamp-1 text-xs font-bold text-slate-500">
            {snapshot.source}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onExport}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#005eb8] transition hover:bg-[#005eb8] hover:text-white"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-red-600 transition hover:bg-red-600 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Mini label="Health" value={snapshot.healthScore} />
        <Mini label="Executive" value={snapshot.executiveScore} />
        <Mini label="Headcount" value={snapshot.headcount} />
        <Mini label="Rotación" value={`${snapshot.rotation}%`} />
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-[#04224a]">{value}</p>
    </div>
  );
}

function SnapshotSelect({
  label,
  value,
  history,
  onChange,
}: {
  label: string;
  value: string;
  history: PeopleSnapshot[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-[#04224a]"
      >
        {history.map((snapshot) => (
          <option key={snapshot.id} value={snapshot.id}>
            {formatSnapshotDate(snapshot.createdAt)} · {snapshot.source}
          </option>
        ))}
      </select>
    </label>
  );
}

function HistoricalHeatmap({
  comparison,
}: {
  comparison: SnapshotComparisonResult;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-[#005eb8]">
        Heatmap Histórico
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="text-left text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              <th className="px-3 py-2">Indicador</th>
              <th className="px-3 py-2">Anterior</th>
              <th className="px-3 py-2">Actual</th>
              <th className="px-3 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {comparison.metrics.map((metric) => (
              <tr key={metric.label} className="border-t border-slate-200">
                <td className="px-3 py-3 font-black text-[#04224a]">
                  {metric.label}
                </td>
                <td className="px-3 py-3 font-bold text-slate-600">
                  {metric.previous}
                </td>
                <td className="px-3 py-3 font-bold text-slate-600">
                  {metric.current}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={
                      metric.direction === "flat"
                        ? "rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600"
                        : metric.good
                          ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700"
                          : "rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700"
                    }
                  >
                    {metric.direction === "flat"
                      ? "Estable"
                      : metric.good
                        ? "Mejora"
                        : "Deterioro"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
