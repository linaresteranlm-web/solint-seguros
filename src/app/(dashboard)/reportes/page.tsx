"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle2,
  Download,
  FileArchive,
  FileText,
  GitCompareArrows,
  TrendingUp,
  UsersRound,
  XCircle,
} from "lucide-react";
import { ModulePage } from "@/components/ui/module-page";
import { EnterpriseCard } from "@/components/ui/enterprise-card";
import {
  getAnalyticsSummary,
  getDailyAnalytics,
  getMatheitoAnalyticsMessage,
} from "@/lib/analytics-engine";
import {
  formatDateTime,
  getProcessHistory,
  ProcessHistoryItem,
} from "@/lib/process-history";

function formatoNumero(value: number) {
  return new Intl.NumberFormat("es-PE").format(value);
}

export default function ReportesPage() {
  const [history, setHistory] = useState<ProcessHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getProcessHistory());

    const interval = window.setInterval(() => {
      setHistory(getProcessHistory());
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const summary = useMemo(() => getAnalyticsSummary(history), [history]);
  const daily = useMemo(() => getDailyAnalytics(history), [history]);
  const maxDaily = Math.max(...daily.map((item) => item.total), 1);
  const matheitoMessage = getMatheitoAnalyticsMessage(summary);

  return (
    <ModulePage
      eyebrow="Analíticas"
      title="Panel de Analíticas"
      description="Indicadores locales de uso, actividad, exportaciones, errores y productividad del sistema."
      icon={<BarChart3 className="h-10 w-10" />}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Activity} label="Procesos" value={summary.totalProcesses} />
        <MetricCard icon={GitCompareArrows} label="Comparaciones" value={summary.comparisons} />
        <MetricCard icon={Download} label="Descargas" value={summary.downloads} orange />
        <MetricCard icon={UsersRound} label="Personas procesadas" value={summary.peopleProcessed} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={FileText} label="PDFs" value={summary.pdfs} />
        <MetricCard icon={FileArchive} label="ZIPs" value={summary.zips} orange />
        <MetricCard icon={AlertTriangle} label="Advertencias" value={summary.warnings} warning />
        <MetricCard icon={XCircle} label="Errores" value={summary.errors} danger />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <EnterpriseCard>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
            Actividad por día
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#04224a]">
            Procesos registrados
          </h2>

          {daily.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <BarChart3 className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-4 text-sm font-black text-[#04224a]">
                Sin datos todavía
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Ejecuta procesos para construir el gráfico.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {daily.map((item) => (
                <div key={item.date}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-black text-[#04224a]">{item.date}</span>
                    <span className="font-bold text-slate-500">
                      {formatoNumero(item.total)} procesos
                    </span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#005eb8] to-[#ff7415]"
                      style={{ width: `${Math.max((item.total / maxDaily) * 100, 8)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                    <span>Comparaciones: {item.comparisons}</span>
                    <span>Descargas: {item.downloads}</span>
                    <span>Errores: {item.errors}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </EnterpriseCard>

        <div className="space-y-6">
          <EnterpriseCard>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#ff7415]">
                <Bot className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#ff7415]">
                  Matheito Analytics
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#04224a]">
                  Diagnóstico operativo
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {matheitoMessage}
                </p>
              </div>
            </div>
          </EnterpriseCard>

          <EnterpriseCard>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
              Calidad del flujo
            </p>

            <div className="mt-5 grid gap-3">
              <QualityRow label="Procesos correctos" value={summary.success} icon={CheckCircle2} />
              <QualityRow label="Nuevos SCTR" value={summary.newSctr} icon={TrendingUp} />
              <QualityRow label="Nuevos VidaLey" value={summary.newVidaLey} icon={TrendingUp} />
            </div>
          </EnterpriseCard>
        </div>
      </div>

      <EnterpriseCard>
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
          Última actividad
        </p>
        <h2 className="mt-2 text-2xl font-black text-[#04224a]">
          Eventos recientes
        </h2>

        {history.length === 0 ? (
          <p className="mt-5 text-sm text-slate-500">Aún no existen eventos.</p>
        ) : (
          <div className="mt-5 grid gap-3">
            {history.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="font-black text-[#04224a]">{item.title}</p>
                  <span className="text-xs font-bold text-slate-400">
                    {formatDateTime(item.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </EnterpriseCard>
    </ModulePage>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  orange,
  warning,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  orange?: boolean;
  warning?: boolean;
  danger?: boolean;
}) {
  return (
    <EnterpriseCard>
      <div
        className={
          danger
            ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700"
            : warning
              ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"
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
      <p className={danger ? "mt-2 text-3xl font-black text-red-700" : warning ? "mt-2 text-3xl font-black text-amber-700" : orange ? "mt-2 text-3xl font-black text-[#ff7415]" : "mt-2 text-3xl font-black text-[#04224a]"}>
        {formatoNumero(value)}
      </p>
    </EnterpriseCard>
  );
}

function QualityRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-600">
        <Icon className="h-4 w-4 text-[#005eb8]" />
        {label}
      </span>
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-[#005eb8]">
        {formatoNumero(value)}
      </span>
    </div>
  );
}
