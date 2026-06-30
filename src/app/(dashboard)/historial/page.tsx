"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileArchive,
  FileText,
  GitCompareArrows,
  RefreshCcw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { ModulePage } from "@/components/ui/module-page";
import { EnterpriseCard } from "@/components/ui/enterprise-card";
import {
  clearProcessHistory,
  formatDateTime,
  getProcessHistory,
  ProcessHistoryItem,
  ProcessType,
} from "@/lib/process-history";
import { exportHistoryToExcel } from "@/lib/history-export";
import { showToast } from "@/lib/toast-store";

type StatusFilter = "TODOS" | "OK" | "ADVERTENCIA" | "ERROR";
type TypeFilter = "TODOS" | ProcessType;

export default function HistorialPage() {
  const [history, setHistory] = useState<ProcessHistoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODOS");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("TODOS");

  useEffect(() => {
    setHistory(getProcessHistory());
  }, []);

  const filteredHistory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return history.filter((item) => {
      const matchesStatus =
        statusFilter === "TODOS" || item.status === statusFilter;

      const matchesType = typeFilter === "TODOS" || item.type === typeFilter;

      const haystack = [
        item.title,
        item.description,
        item.status,
        item.type,
        item.user,
        formatDateTime(item.createdAt),
        JSON.stringify(item.metrics ?? {}),
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);

      return matchesStatus && matchesType && matchesQuery;
    });
  }, [history, query, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    return {
      total: history.length,
      ok: history.filter((item) => item.status === "OK").length,
      warnings: history.filter((item) => item.status === "ADVERTENCIA").length,
      errors: history.filter((item) => item.status === "ERROR").length,
      downloads: history.filter((item) => item.type === "DESCARGA_ARCHIVO")
        .length,
    };
  }, [history]);

  const matheitoMessage = useMemo(() => {
    if (stats.total === 0) {
      return "Matheito aún no encontró actividad. Ejecuta procesos para alimentar la auditoría.";
    }

    if (stats.errors > 0) {
      return `Matheito detectó ${stats.errors} error(es). Revisa los registros filtrando por ERROR.`;
    }

    if (stats.warnings > 0) {
      return `Matheito detectó ${stats.warnings} advertencia(s). Revisa diferencias antes de entregar archivos.`;
    }

    return "Matheito no detecta errores en el historial. El flujo operativo se ve saludable.";
  }, [stats.errors, stats.total, stats.warnings]);

  function handleRefresh() {
    setHistory(getProcessHistory());

    showToast({
      title: "Historial actualizado",
      description: "Se refrescó la auditoría local.",
      variant: "info",
    });
  }

  function handleClear() {
    clearProcessHistory();
    setHistory([]);

    showToast({
      title: "Historial limpiado",
      description: "Se eliminó la auditoría local del navegador.",
      variant: "warning",
    });
  }

  function handleExport() {
    if (filteredHistory.length === 0) {
      showToast({
        title: "Sin datos para exportar",
        description: "No hay registros visibles en la auditoría.",
        variant: "warning",
      });
      return;
    }

    exportHistoryToExcel(filteredHistory);

    showToast({
      title: "Auditoría exportada",
      description: "Se generó el Excel de historial SOLINT.",
      variant: "success",
    });
  }

  return (
    <ModulePage
      eyebrow="Auditoría Enterprise"
      title="Historial de Procesos"
      description="Trazabilidad local de acumulados, comparaciones, descargas, PDF, ZIP y eventos del sistema."
      icon={<FileText className="h-10 w-10" />}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AuditMetric label="Procesos" value={stats.total} icon={FileText} />
        <AuditMetric label="OK" value={stats.ok} icon={CheckCircle2} success />
        <AuditMetric
          label="Advertencias"
          value={stats.warnings}
          icon={AlertTriangle}
          warning
        />
        <AuditMetric label="Errores" value={stats.errors} icon={XCircle} danger />
        <AuditMetric
          label="Descargas"
          value={stats.downloads}
          icon={Download}
          orange
        />
      </div>

      <EnterpriseCard>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#04224a]">
              Centro de Auditoría
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {matheitoMessage}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-[#04224a] transition hover:bg-blue-50 hover:text-[#005eb8]"
            >
              <RefreshCcw className="h-4 w-4" />
              Actualizar
            </button>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#005eb8] px-4 py-3 text-sm font-black text-white transition hover:bg-[#ff7415]"
            >
              <Download className="h-4 w-4" />
              Exportar Excel
            </button>

            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              Limpiar
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-[1fr_auto_auto]">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por proceso, usuario, estado, fecha, métrica..."
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-[#04224a]"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="OK">OK</option>
            <option value="ADVERTENCIA">Advertencia</option>
            <option value="ERROR">Error</option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-[#04224a]"
          >
            <option value="TODOS">Todos los tipos</option>
            <option value="GENERAR_ACUMULADOS">Acumulados</option>
            <option value="COMPARAR_TRAMAS">Comparaciones</option>
            <option value="DESCARGA_ARCHIVO">Descargas</option>
          </select>
        </div>
      </EnterpriseCard>

      <EnterpriseCard>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#04224a]">
              Registros visibles
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Mostrando {filteredHistory.length} de {history.length} registros.
            </p>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <p className="text-sm font-black text-[#04224a]">
              No hay registros para los filtros actuales.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Cambia la búsqueda o limpia los filtros.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="max-h-[620px] overflow-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead className="sticky top-0 bg-[#052b5b] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Fecha</th>
                    <th className="px-4 py-3 text-left">Proceso</th>
                    <th className="px-4 py-3 text-left">Tipo</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">Usuario</th>
                    <th className="px-4 py-3 text-left">Detalle</th>
                    <th className="px-4 py-3 text-left">Métricas</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="border-b border-slate-200">
                      <td className="px-4 py-3 font-semibold text-slate-600">
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-black text-[#04224a]">
                          {item.title}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <TypePill type={item.type} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={item.status} />
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-600">
                        {item.user}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.description}
                      </td>
                      <td className="px-4 py-3">
                        <MetricsPreview metrics={item.metrics} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </EnterpriseCard>
    </ModulePage>
  );
}

function AuditMetric({
  label,
  value,
  icon: Icon,
  success,
  warning,
  danger,
  orange,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  success?: boolean;
  warning?: boolean;
  danger?: boolean;
  orange?: boolean;
}) {
  return (
    <EnterpriseCard>
      <div
        className={
          danger
            ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700"
            : warning
              ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"
              : success
                ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"
                : orange
                  ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#ff7415]"
                  : "flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#005eb8]"
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
                : orange
                  ? "mt-2 text-3xl font-black text-[#ff7415]"
                  : "mt-2 text-3xl font-black text-[#04224a]"
        }
      >
        {value}
      </p>
    </EnterpriseCard>
  );
}

function StatusPill({ status }: { status: ProcessHistoryItem["status"] }) {
  return (
    <span
      className={
        status === "OK"
          ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700"
          : status === "ADVERTENCIA"
            ? "rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700"
            : "rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700"
      }
    >
      {status}
    </span>
  );
}

function TypePill({ type }: { type: ProcessType }) {
  const config =
    type === "GENERAR_ACUMULADOS"
      ? {
          label: "Acumulado",
          icon: FileArchive,
        }
      : type === "COMPARAR_TRAMAS"
        ? {
            label: "Comparación",
            icon: GitCompareArrows,
          }
        : {
            label: "Descarga",
            icon: Download,
          };

  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-[#005eb8]">
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function MetricsPreview({
  metrics,
}: {
  metrics?: Record<string, number | string>;
}) {
  if (!metrics) {
    return <span className="text-xs text-slate-400">Sin métricas</span>;
  }

  return (
    <div className="flex max-w-sm flex-wrap gap-1">
      {Object.entries(metrics).map(([key, value]) => (
        <span
          key={key}
          className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600"
        >
          {key}: {value}
        </span>
      ))}
    </div>
  );
}
