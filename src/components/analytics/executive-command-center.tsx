"use client";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Maximize2,
  MonitorDot,
  Presentation,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AnalyticsResult } from "@/lib/analytics/types";
import { PeopleDashboardResult } from "@/lib/analytics/people-dashboard-engine";
import { PeopleIntelligenceResult } from "@/lib/analytics/people-intelligence-engine";
import {
  buildExecutiveCommandCenter,
  ExecutiveCommandMetric,
} from "@/lib/analytics/executive-command-engine";

function statusClasses(status: ExecutiveCommandMetric["status"]) {
  if (status === "excellent") {
    return {
      wrapper: "border-emerald-200 bg-emerald-50",
      icon: "bg-emerald-100 text-emerald-700",
      text: "text-emerald-700",
      bar: "bg-emerald-500",
      label: "Excelente",
    };
  }

  if (status === "good") {
    return {
      wrapper: "border-blue-200 bg-blue-50",
      icon: "bg-blue-100 text-blue-700",
      text: "text-blue-700",
      bar: "bg-blue-500",
      label: "Bueno",
    };
  }

  if (status === "warning") {
    return {
      wrapper: "border-amber-200 bg-amber-50",
      icon: "bg-amber-100 text-amber-700",
      text: "text-amber-700",
      bar: "bg-amber-500",
      label: "Atención",
    };
  }

  return {
    wrapper: "border-red-200 bg-red-50",
    icon: "bg-red-100 text-red-700",
    text: "text-red-700",
    bar: "bg-red-500",
    label: "Crítico",
  };
}

function operationalClasses(status: "online" | "attention" | "critical") {
  if (status === "online") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "attention") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-red-100 text-red-700";
}

export function ExecutiveCommandCenter({
  result,
  dashboard,
  intelligence,
}: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  intelligence: PeopleIntelligenceResult;
}) {
  const command = buildExecutiveCommandCenter({
    result,
    dashboard,
    intelligence,
  });

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[#061a3a] shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
      <div className="relative overflow-hidden p-6 text-white xl:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,94,184,0.55),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,116,21,0.32),transparent_38%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.07),transparent_35%,rgba(255,255,255,0.04))]" />

        <div className="relative z-10 grid gap-6 xl:grid-cols-[1fr_auto] xl:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100 backdrop-blur">
              <MonitorDot className="h-4 w-4 text-[#ffb375]" />
              Executive Command Center
            </div>

            <h2 className="mt-5 text-4xl font-black leading-tight xl:text-5xl">
              SOLINT People Intelligence Center
            </h2>

            <p className="mt-4 max-w-5xl text-sm leading-7 text-blue-100">
              Centro de control ejecutivo para monitorear salud organizacional,
              estabilidad, rotación, alertas estratégicas y concentración operativa
              desde DATA GENERAL.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${operationalClasses(
                  command.operationalStatus.status
                )}`}
              >
                {command.operationalStatus.status === "critical" ? (
                  <ShieldAlert className="h-4 w-4" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                {command.operationalStatus.label}
              </span>

              <button
                type="button"
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white/80 backdrop-blur"
                title="Preparado para la siguiente subfase"
              >
                <Presentation className="h-4 w-4" />
                Presentation Mode
              </button>

              <button
                type="button"
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white/80 backdrop-blur"
                title="Preparado para la siguiente subfase"
              >
                <Maximize2 className="h-4 w-4" />
                Full Screen
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 text-center shadow-2xl backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-100">
              Executive Score
            </p>
            <div className="relative mx-auto mt-4 flex h-36 w-36 items-center justify-center rounded-full border border-white/15 bg-white/10">
              <div className="absolute inset-3 rounded-full border-8 border-white/10" />
              <div
                className={
                  command.executiveScore >= 88
                    ? "absolute inset-3 rounded-full border-8 border-emerald-400"
                    : command.executiveScore >= 72
                      ? "absolute inset-3 rounded-full border-8 border-blue-400"
                      : command.executiveScore >= 55
                        ? "absolute inset-3 rounded-full border-8 border-amber-400"
                        : "absolute inset-3 rounded-full border-8 border-red-400"
                }
                style={{
                  clipPath: `polygon(0 0, ${command.executiveScore}% 0, ${command.executiveScore}% 100%, 0 100%)`,
                }}
              />
              <div className="relative z-10">
                <p className="text-5xl font-black">{command.executiveScore}</p>
                <p className="mt-1 text-xs font-black text-blue-100">/100</p>
              </div>
            </div>
            <p className="mt-4 text-lg font-black">{command.executiveLabel}</p>
          </div>
        </div>

        <div className="relative z-10 mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {command.metrics.map((metric) => (
            <ExecutiveMetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 border-t border-white/10 bg-white p-6 xl:grid-cols-[1.1fr_0.9fr] xl:p-8">
        <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#005eb8]">
              <Bot className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#005eb8]">
                Matheito Executive Brief
              </p>
              <h3 className="mt-2 text-2xl font-black text-[#04224a]">
                Lectura gerencial automática
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {command.topMessage}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {command.operationalStatus.description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <MiniStatus
            icon={Activity}
            label="Validación"
            value={
              result.validation.errors > 0
                ? "Error"
                : result.validation.warnings > 0
                  ? "Advertencia"
                  : "OK"
            }
            danger={result.validation.errors > 0}
            warning={result.validation.warnings > 0}
          />
          <MiniStatus
            icon={AlertTriangle}
            label="Alertas críticas"
            value={String(
              intelligence.strategicAlerts.filter(
                (alert) => alert.priority === "Crítica" || alert.priority === "Alta"
              ).length
            )}
            warning
          />
          <MiniStatus
            icon={Radar}
            label="Riesgo radar"
            value={`${Math.max(
              ...intelligence.strategicAlerts.map((alert) => alert.risk),
              0
            )}/100`}
          />
        </div>
      </div>
    </section>
  );
}

function ExecutiveMetricCard({ metric }: { metric: ExecutiveCommandMetric }) {
  const classes = statusClasses(metric.status);

  return (
    <div
      className={`group rounded-[1.4rem] border p-4 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${classes.wrapper}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${classes.icon}`}
        >
          {metric.status === "critical" ? (
            <ShieldAlert className="h-5 w-5" />
          ) : metric.status === "warning" ? (
            <AlertTriangle className="h-5 w-5" />
          ) : metric.status === "good" ? (
            <ArrowUpRight className="h-5 w-5" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
        </div>

        <span className={`rounded-full bg-white px-2 py-1 text-[10px] font-black ${classes.text}`}>
          {classes.label}
        </span>
      </div>

      <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {metric.label}
      </p>
      <p className="mt-2 text-3xl font-black text-[#04224a]">{metric.value}</p>
      <p className="mt-3 min-h-12 text-xs leading-5 text-slate-600">
        {metric.description}
      </p>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white">
        <div className={`h-full w-2/3 rounded-full ${classes.bar}`} />
      </div>
    </div>
  );
}

function MiniStatus({
  icon: Icon,
  label,
  value,
  danger,
  warning,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  danger?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5">
      <div
        className={
          danger
            ? "flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700"
            : warning
              ? "flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"
              : "flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-[#005eb8]"
        }
      >
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-black text-[#04224a]">{value}</p>
    </div>
  );
}
