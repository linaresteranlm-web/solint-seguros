"use client";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Maximize2,
  MonitorDot,
  Radar,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AnalyticsResult } from "@/lib/analytics/types";
import { PeopleDashboardResult } from "@/lib/analytics/people-dashboard-engine";
import { PeopleIntelligenceResult } from "@/lib/analytics/people-intelligence-engine";
import {
  buildExecutiveCommandCenter,
  ExecutiveCommandMetric,
} from "@/lib/analytics/executive-command-engine";
import {
  getPresentationMode,
  requestAppFullscreen,
  setPresentationMode,
  subscribePresentationMode,
} from "@/lib/analytics/presentation-mode-store";
import {
  PresentationModeButton,
  PresentationToolbar,
} from "@/components/analytics/presentation-toolbar";
import {
  AnimatedCounter,
  ExecutivePulse,
  MotionReveal,
} from "@/components/analytics/motion-ui";
import { showToast } from "@/lib/toast-store";

function statusClasses(status: ExecutiveCommandMetric["status"]) {
  if (status === "excellent") {
    return {
      wrapper: "border-emerald-200 bg-emerald-50",
      icon: "bg-emerald-100 text-emerald-700",
      text: "text-emerald-700",
      bar: "bg-emerald-500",
      label: "Excelente",
      pulse: "excellent" as const,
    };
  }

  if (status === "good") {
    return {
      wrapper: "border-blue-200 bg-blue-50",
      icon: "bg-blue-100 text-blue-700",
      text: "text-blue-700",
      bar: "bg-blue-500",
      label: "Bueno",
      pulse: "good" as const,
    };
  }

  if (status === "warning") {
    return {
      wrapper: "border-amber-200 bg-amber-50",
      icon: "bg-amber-100 text-amber-700",
      text: "text-amber-700",
      bar: "bg-amber-500",
      label: "Atención",
      pulse: "warning" as const,
    };
  }

  return {
    wrapper: "border-red-200 bg-red-50",
    icon: "bg-red-100 text-red-700",
    text: "text-red-700",
    bar: "bg-red-500",
    label: "Crítico",
    pulse: "critical" as const,
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

function pulseLevel(score: number) {
  if (score >= 88) return "excellent" as const;
  if (score >= 72) return "good" as const;
  if (score >= 55) return "warning" as const;
  return "critical" as const;
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
  const [presentation, setPresentation] = useState(false);

  useEffect(() => {
    setPresentation(getPresentationMode());

    return subscribePresentationMode((nextState) => {
      setPresentation(nextState.enabled);
    });
  }, []);

  const command = buildExecutiveCommandCenter({
    result,
    dashboard,
    intelligence,
  });

  async function handleFullscreen() {
    await requestAppFullscreen();

    showToast({
      title: "Pantalla completa",
      description: "Se alternó el modo pantalla completa.",
      variant: "success",
    });
  }

  return (
    <>
      <PresentationToolbar enabled={presentation} />

      <section
        className={
          presentation
            ? "relative min-h-screen overflow-hidden rounded-none border-0 bg-[#061a3a] shadow-none"
            : "overflow-hidden rounded-[2rem] border border-slate-200 bg-[#061a3a] shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
        }
      >
        {presentation && (
          <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.05]">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] whitespace-nowrap text-7xl font-black tracking-[0.18em] text-white xl:text-9xl">
              SOLINT BUSINESS SYSTEMS
            </div>
          </div>
        )}

        <div
          className={
            presentation
              ? "relative z-10 min-h-screen overflow-hidden p-8 text-white xl:p-12"
              : "relative overflow-hidden p-6 text-white xl:p-8"
          }
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,94,184,0.55),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,116,21,0.32),transparent_38%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.07),transparent_35%,rgba(255,255,255,0.04))]" />

          <div className="relative z-10 grid gap-6 xl:grid-cols-[1fr_auto] xl:items-start">
            <MotionReveal>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100 backdrop-blur">
                  <MonitorDot className="h-4 w-4 text-[#ffb375]" />
                  Executive Command Center
                </div>

                <h2
                  className={
                    presentation
                      ? "mt-5 text-5xl font-black leading-tight xl:text-7xl"
                      : "mt-5 text-4xl font-black leading-tight xl:text-5xl"
                  }
                >
                  SOLINT People Intelligence Center
                </h2>

                <p
                  className={
                    presentation
                      ? "mt-5 max-w-6xl text-base leading-8 text-blue-100 xl:text-lg"
                      : "mt-4 max-w-5xl text-sm leading-7 text-blue-100"
                  }
                >
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

                  <PresentationModeButton
                    enabled={presentation}
                    onToggle={() => setPresentationMode(!presentation)}
                  />

                  {!presentation && (
                    <button
                      type="button"
                      onClick={handleFullscreen}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white/90 backdrop-blur transition hover:bg-[#ff7415]"
                    >
                      <Maximize2 className="h-4 w-4" />
                      Full Screen
                    </button>
                  )}
                </div>
              </div>
            </MotionReveal>

            <MotionReveal delay={120}>
              <div
                className={
                  presentation
                    ? "rounded-[2rem] border border-white/15 bg-white/10 p-8 text-center shadow-2xl backdrop-blur"
                    : "rounded-[2rem] border border-white/15 bg-white/10 p-6 text-center shadow-2xl backdrop-blur"
                }
              >
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-100">
                  Executive Score
                </p>

                <ExecutivePulse level={pulseLevel(command.executiveScore)}>
                  <div
                    className={
                      presentation
                        ? "relative mx-auto mt-4 flex h-44 w-44 items-center justify-center rounded-full border border-white/15 bg-white/10"
                        : "relative mx-auto mt-4 flex h-36 w-36 items-center justify-center rounded-full border border-white/15 bg-white/10"
                    }
                  >
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
                      <p
                        className={
                          presentation ? "text-6xl font-black" : "text-5xl font-black"
                        }
                      >
                        <AnimatedCounter value={command.executiveScore} />
                      </p>
                      <p className="mt-1 text-xs font-black text-blue-100">/100</p>
                    </div>
                  </div>
                </ExecutivePulse>

                <p className="mt-4 text-lg font-black">{command.executiveLabel}</p>
              </div>
            </MotionReveal>
          </div>

          <div
            className={
              presentation
                ? "relative z-10 mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-6"
                : "relative z-10 mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6"
            }
          >
            {command.metrics.map((metric, index) => (
              <MotionReveal key={metric.id} delay={180 + index * 80}>
                <ExecutiveMetricCard metric={metric} />
              </MotionReveal>
            ))}
          </div>

          {presentation && (
            <MotionReveal delay={760}>
              <div className="relative z-10 mt-8 rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur">
                <div className="flex items-start gap-4">
                  <Bot className="mt-1 h-8 w-8 shrink-0 text-[#ffb375]" />
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-100">
                      Matheito Presenter
                    </p>
                    <p className="mt-3 text-lg leading-8 text-blue-50">
                      {command.topMessage} {command.operationalStatus.description}
                    </p>
                  </div>
                </div>
              </div>
            </MotionReveal>
          )}
        </div>

        {!presentation && (
          <div className="grid gap-6 border-t border-white/10 bg-white p-6 xl:grid-cols-[1.1fr_0.9fr] xl:p-8">
            <MotionReveal>
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
            </MotionReveal>

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
        )}
      </section>
    </>
  );
}

function ExecutiveMetricCard({ metric }: { metric: ExecutiveCommandMetric }) {
  const classes = statusClasses(metric.status);
  const number = Number(String(metric.value).replace(/[^\d.-]/g, ""));
  const suffix = String(metric.value).includes("%")
    ? "%"
    : String(metric.value).includes("/100")
      ? "/100"
      : String(metric.value).includes("sedes")
        ? " sedes"
        : "";

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
      <p className="mt-2 text-3xl font-black text-[#04224a]">
        {Number.isFinite(number) ? (
          <AnimatedCounter value={number} suffix={suffix} />
        ) : (
          metric.value
        )}
      </p>
      <p className="mt-3 min-h-12 text-xs leading-5 text-slate-600">
        {metric.description}
      </p>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white">
        <div className={`h-full w-2/3 rounded-full ${classes.bar} transition-all duration-700`} />
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
    <MotionReveal>
      <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
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
    </MotionReveal>
  );
}
