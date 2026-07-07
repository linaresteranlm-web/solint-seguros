"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  PieChart,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { AnalyticsDataset } from "@/lib/analytics/types";
import {
  RotationMonth,
  analyzeRotationIndicators,
  formatNumber,
  formatPercent,
  inferRotationYear,
  monthName,
} from "@/lib/analytics/rotation-indicators-engine";
import { AnimatedCounter, MotionReveal } from "@/components/analytics/motion-ui";
import { RotationReportBuilder } from "@/components/analytics/rotation-report-builder";

const MONTH_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as RotationMonth[];

export function RotationIndicatorsPanel({ dataset }: { dataset: AnalyticsDataset }) {
  const inferredYear = useMemo(() => inferRotationYear(dataset), [dataset]);
  const [year, setYear] = useState(inferredYear);
  const [fromMonth, setFromMonth] = useState<RotationMonth>(1);
  const [toMonth, setToMonth] = useState<RotationMonth>(6);

  const analysis = useMemo(
    () =>
      analyzeRotationIndicators(dataset, {
        year,
        fromMonth,
        toMonth: toMonth < fromMonth ? fromMonth : toMonth,
      }),
    [dataset, year, fromMonth, toMonth]
  );

  return (
    <MotionReveal>
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.10)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#173b76] via-[#1e5ea8] to-[#0f172a] p-6 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,130,32,0.30),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_35%)]" />
            <div className="relative z-10 grid gap-6 xl:grid-cols-[1fr_auto] xl:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-100">
                  CORPRISEG · Gestión Humana
                </p>
                <h2 className="mt-3 text-3xl font-black leading-tight md:text-4xl">
                  Indicadores de Rotación Gerencial
                </h2>
                <p className="mt-3 max-w-4xl text-sm leading-7 text-blue-100">
                  Reporte especializado para analizar rotación mensual, acumulada,
                  rankings por sede/cargo/área y conclusiones ejecutivas para gerencia.
                </p>
              </div>

              <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 text-center backdrop-blur">
                <ShieldCheck className="mx-auto h-10 w-10 text-[#f58220]" />
                <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                  Elaborado por
                </p>
                <p className="mt-1 text-lg font-black">SOLINT Business Suite</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-b border-slate-200 bg-slate-50 p-5 lg:grid-cols-3">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Año
              </span>
              <input
                type="number"
                value={year}
                onChange={(event) => setYear(Number(event.target.value) || inferredYear)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-[#173b76]"
              />
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Desde
              </span>
              <select
                value={fromMonth}
                onChange={(event) => setFromMonth(Number(event.target.value) as RotationMonth)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-[#173b76]"
              >
                {MONTH_OPTIONS.map((month) => (
                  <option key={month} value={month}>
                    {monthName(month)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Hasta
              </span>
              <select
                value={toMonth}
                onChange={(event) => setToMonth(Number(event.target.value) as RotationMonth)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-[#173b76]"
              >
                {MONTH_OPTIONS.map((month) => (
                  <option key={month} value={month}>
                    {monthName(month)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-5">
            <Kpi label="HC promedio" value={analysis.summary.averageHeadcount} />
            <Kpi label="Ingresos" value={analysis.summary.totalHires} />
            <Kpi label="Ceses" value={analysis.summary.totalExits} />
            <Kpi
              label="Rotación acum."
              value={analysis.summary.accumulatedRotation}
              suffix="%"
              highlight
            />
            <Kpi label="Variación neta" value={analysis.summary.netChange} />
          </div>
        </div>

        <RotationReportBuilder analysis={analysis} />

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="mb-5 flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-[#173b76]" />
              <h3 className="text-xl font-black text-[#0f172a]">Evolución mensual</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="bg-[#173b76] text-left text-xs font-black uppercase tracking-[0.14em] text-white">
                    <th className="rounded-l-xl px-3 py-3">Mes</th>
                    <th className="px-3 py-3">HC Inicial</th>
                    <th className="px-3 py-3">HC Final</th>
                    <th className="px-3 py-3">HC Prom.</th>
                    <th className="px-3 py-3">Ingresos</th>
                    <th className="px-3 py-3">Ceses</th>
                    <th className="rounded-r-xl px-3 py-3">Rotación</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.monthly.map((item) => (
                    <tr key={item.month} className="border-b border-slate-100">
                      <td className="px-3 py-3 font-black text-[#173b76]">
                        {item.monthName}
                      </td>
                      <td className="px-3 py-3 font-bold text-slate-600">
                        {item.headcountStart}
                      </td>
                      <td className="px-3 py-3 font-bold text-slate-600">
                        {item.headcountEnd}
                      </td>
                      <td className="px-3 py-3 font-bold text-slate-600">
                        {formatNumber(item.averageHeadcount)}
                      </td>
                      <td className="px-3 py-3 font-bold text-emerald-700">
                        {item.hires}
                      </td>
                      <td className="px-3 py-3 font-bold text-red-700">
                        {item.exits}
                      </td>
                      <td className="px-3 py-3 font-black text-[#f58220]">
                        {formatPercent(item.rotationRate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="mb-5 flex items-center gap-3">
              <PieChart className="h-6 w-6 text-[#f58220]" />
              <h3 className="text-xl font-black text-[#0f172a]">Lectura rápida</h3>
            </div>
            <div className="space-y-3">
              {analysis.insights.slice(0, 5).map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Ranking title="Top sedes / unidades" items={analysis.rankings.bySede} />
          <Ranking title="Top cargos" items={analysis.rankings.byCargo} />
          <Ranking title="Top áreas" items={analysis.rankings.byArea} />
        </div>

        <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="mb-5 flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-[#173b76]" />
            <h3 className="text-xl font-black text-[#0f172a]">
              Hallazgos, conclusiones y recomendaciones
            </h3>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <TextList title="Hallazgos" items={analysis.insights} />
            <TextList title="Conclusiones" items={analysis.conclusions} />
            <TextList title="Recomendaciones" items={analysis.recommendations} />
          </div>
        </section>
      </section>
    </MotionReveal>
  );
}

function Kpi({
  label,
  value,
  suffix = "",
  highlight,
}: {
  label: string;
  value: number;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-3xl bg-[#f58220] p-5 text-white shadow-xl"
          : "rounded-3xl border border-slate-200 bg-slate-50 p-5"
      }
    >
      <p
        className={
          highlight
            ? "text-xs font-black uppercase tracking-[0.18em] text-orange-50"
            : "text-xs font-black uppercase tracking-[0.18em] text-slate-400"
        }
      >
        {label}
      </p>
      <p
        className={
          highlight
            ? "mt-3 text-4xl font-black text-white"
            : "mt-3 text-4xl font-black text-[#173b76]"
        }
      >
        <AnimatedCounter value={value} />
        {suffix}
      </p>
    </div>
  );
}

function Ranking({
  title,
  items,
}: {
  title: string;
  items: {
    label: string;
    rotationRate: number;
    exits: number;
    averageHeadcount: number;
  }[];
}) {
  const max = Math.max(...items.map((item) => item.rotationRate), 1);

  return (
    <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <h3 className="text-xl font-black text-[#173b76]">{title}</h3>
      <div className="mt-5 space-y-4">
        {items.slice(0, 7).map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-black text-[#0f172a]">{item.label}</span>
              <span className="shrink-0 font-black text-[#f58220]">
                {formatPercent(item.rotationRate)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#173b76] to-[#f58220]"
                style={{
                  width: `${Math.max((item.rotationRate / max) * 100, 5)}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs font-bold text-slate-500">
              {item.exits} ceses · HC prom. {formatNumber(item.averageHeadcount)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TextList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-lg font-black text-[#173b76]">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
