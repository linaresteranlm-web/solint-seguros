"use client";

import {
  AlertTriangle,
  Brain,
  CalendarDays,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
  UsersRound,
  UserX,
} from "lucide-react";
import { PeopleIntelligenceResult } from "@/lib/analytics/people-intelligence-engine";

function scoreColor(score: number) {
  if (score >= 85) return "text-emerald-700 bg-emerald-100";
  if (score >= 70) return "text-blue-700 bg-blue-100";
  if (score >= 50) return "text-amber-700 bg-amber-100";
  return "text-red-700 bg-red-100";
}

export function PeopleIntelligencePanel({
  intelligence,
}: {
  intelligence: PeopleIntelligenceResult;
}) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="bg-gradient-to-br from-[#04224a] via-[#005eb8] to-[#063763] p-6 text-white">
          <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#ffb375]">
                <Brain className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-100">
                  People Intelligence IA
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Diagnóstico ejecutivo automatizado
                </h2>
                <p className="mt-2 max-w-4xl text-sm leading-6 text-blue-100">
                  Análisis inteligente de salud organizacional, estabilidad,
                  diversidad, movimientos recientes y alertas estratégicas.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                Health Score
              </p>
              <p className="mt-2 text-5xl font-black">
                {intelligence.organizationalHealthScore}
              </p>
              <p className="mt-1 text-sm font-black text-blue-100">
                {intelligence.healthLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-5">
          <IntelligenceMetric
            icon={ShieldCheck}
            label="Estabilidad"
            value={`${intelligence.stabilityIndex}%`}
            text="Personal activo sobre universo analizado."
          />
          <IntelligenceMetric
            icon={UsersRound}
            label="Diversidad"
            value={`${intelligence.diversityIndex}/100`}
            text="Balance estimado por sexo registrado."
          />
          <IntelligenceMetric
            icon={TrendingUp}
            label="Antigüedad promedio"
            value={`${intelligence.averageSeniorityYears} años`}
            text="Promedio calculado desde FecIng."
          />
          <IntelligenceMetric
            icon={UserPlus}
            label="Ingresos 30 días"
            value={String(intelligence.newHiresLast30Days)}
            text="Altas recientes detectadas."
          />
          <IntelligenceMetric
            icon={UserX}
            label="Ceses 30 días"
            value={String(intelligence.exitsLast30Days)}
            text="Bajas recientes detectadas."
          />
        </div>

        <div className="border-t border-slate-200 bg-slate-50 p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#ff7415]" />
            <p className="text-sm leading-7 text-slate-700">
              {intelligence.consultantSummary}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="mb-5 flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-[#ff7415]" />
            <h2 className="text-xl font-black text-[#04224a]">
              Alertas Estratégicas
            </h2>
          </div>

          <div className="space-y-3">
            {intelligence.strategicAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-black text-[#04224a]">{alert.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {alert.description}
                    </p>
                  </div>
                  <span
                    className={
                      alert.priority === "Crítica"
                        ? "rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700"
                        : alert.priority === "Alta"
                          ? "rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700"
                          : alert.priority === "Media"
                            ? "rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700"
                            : "rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700"
                    }
                  >
                    {alert.priority}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                  <p className="text-sm leading-6 text-slate-600">
                    <b>Acción sugerida:</b> {alert.recommendation}
                  </p>
                  <span className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-[#005eb8]">
                    Riesgo {alert.risk}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="mb-5 flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-[#005eb8]" />
            <h2 className="text-xl font-black text-[#04224a]">
              Próximos cumpleaños
            </h2>
          </div>

          {intelligence.birthdaysThisMonth.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">
              No hay cumpleaños detectados para este mes.
            </div>
          ) : (
            <div className="space-y-3">
              {intelligence.birthdaysThisMonth.map((item) => (
                <div
                  key={`${item.document}-${item.date}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div>
                    <p className="font-black text-[#04224a]">{item.name}</p>
                    <p className="text-xs font-bold text-slate-500">
                      {item.date} · DNI {item.document || "—"}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-[#005eb8]">
                    {item.daysLeft} días
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SimpleDistribution
          title="Distribución por sexo"
          items={intelligence.genderDistribution}
        />
        <SimpleDistribution
          title="Distribución geográfica"
          items={intelligence.geographicDistribution}
        />
      </section>
    </div>
  );
}

function IntelligenceMetric({
  icon: Icon,
  label,
  value,
  text,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#005eb8]">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-[#04224a]">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}

function SimpleDistribution({
  title,
  items,
}: {
  title: string;
  items: {
    label: string;
    total: number;
    percentage: number;
  }[];
}) {
  const max = Math.max(...items.map((item) => item.total), 1);

  return (
    <div className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <h2 className="text-xl font-black text-[#04224a]">{title}</h2>

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">Sin datos disponibles.</p>
        ) : (
          items.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="truncate font-black text-[#04224a]">
                  {item.label}
                </span>
                <span className="shrink-0 font-bold text-slate-500">
                  {item.total} · {item.percentage}%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#005eb8] to-[#ff7415]"
                  style={{
                    width: `${Math.max((item.total / max) * 100, 6)}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
