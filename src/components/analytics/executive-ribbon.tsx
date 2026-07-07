"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  HeartPulse,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  UserRound,
  UsersRound,
} from "lucide-react";
import { AnalyticsResult } from "@/lib/analytics/types";
import { PeopleDashboardResult } from "@/lib/analytics/people-dashboard-engine";
import { PeopleIntelligenceResult } from "@/lib/analytics/people-intelligence-engine";
import { buildExecutiveCommandCenter } from "@/lib/analytics/executive-command-engine";
import { AnimatedCounter, MotionReveal } from "@/components/analytics/motion-ui";
import {
  getPresentationMode,
  subscribePresentationMode,
} from "@/lib/analytics/presentation-mode-store";

type SessionUser = {
  username: string;
  name: string;
  role: string;
};

function kpiNumber(result: AnalyticsResult, id: string) {
  return Number(result.kpis.find((kpi) => kpi.id === id)?.value ?? 0);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusClass(score: number) {
  if (score >= 88) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (score >= 72) return "bg-blue-100 text-blue-700 border-blue-200";
  if (score >= 55) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-red-100 text-red-700 border-red-200";
}

export function ExecutiveRibbon({
  result,
  dashboard,
  intelligence,
}: {
  result: AnalyticsResult;
  dashboard: PeopleDashboardResult;
  intelligence: PeopleIntelligenceResult;
}) {
  const [presentation, setPresentation] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setPresentation(getPresentationMode());

    return subscribePresentationMode((nextState) => {
      setPresentation(nextState.enabled);
    });
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("solint_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      setUser(null);
    }
  }, []);

  const command = useMemo(
    () =>
      buildExecutiveCommandCenter({
        result,
        dashboard,
        intelligence,
      }),
    [result, dashboard, intelligence]
  );

  const headcount = kpiNumber(result, "headcount");
  const rotation = kpiNumber(result, "rotation");

  if (presentation) return null;

  return (
    <MotionReveal>
      <section className="sticky top-20 z-20 overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,94,184,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,116,21,0.12),transparent_35%)]" />

        <div className="relative grid gap-4 p-4 xl:grid-cols-[1.2fr_2fr_auto] xl:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#04224a] text-[#ffb375] shadow-lg">
              <Activity className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#005eb8]">
                Executive Ribbon
              </p>
              <h2 className="mt-1 text-lg font-black text-[#04224a]">
                Enterprise People Intelligence
              </h2>
              <p className="mt-1 text-xs font-bold text-slate-500">
                DATA GENERAL · {result.metadata.source}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <RibbonMetric
              icon={HeartPulse}
              label="Health"
              value={intelligence.organizationalHealthScore}
              suffix="/100"
              className={statusClass(intelligence.organizationalHealthScore)}
            />
            <RibbonMetric
              icon={ShieldCheck}
              label="Executive"
              value={command.executiveScore}
              suffix="/100"
              className={statusClass(command.executiveScore)}
            />
            <RibbonMetric
              icon={UsersRound}
              label="Headcount"
              value={headcount}
              className="border-blue-200 bg-blue-50 text-blue-700"
            />
            <RibbonMetric
              icon={RotateCcw}
              label="Rotación"
              value={rotation}
              suffix="%"
              className={
                rotation >= 15
                  ? "border-red-200 bg-red-50 text-red-700"
                  : rotation >= 8
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }
            />
            <RibbonMetric
              icon={TrendingUp}
              label="Estado"
              textValue={command.executiveLabel}
              className={statusClass(command.executiveScore)}
            />
          </div>

          <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white/80 p-3 text-xs font-bold text-slate-500">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-[#005eb8]" />
              {formatDate(result.createdAt)}
            </div>
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-[#ff7415]" />
              {user?.name ?? "Usuario SOLINT"}
            </div>
          </div>
        </div>
      </section>
    </MotionReveal>
  );
}

function RibbonMetric({
  icon: Icon,
  label,
  value,
  suffix = "",
  textValue,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value?: number;
  suffix?: string;
  textValue?: string;
  className: string;
}) {
  return (
    <div className={`rounded-2xl border px-3 py-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-[0.16em] opacity-80">
          {label}
        </span>
      </div>
      <p className="mt-1 text-lg font-black leading-none">
        {textValue ? (
          textValue
        ) : (
          <>
            <AnimatedCounter value={value ?? 0} />
            {suffix}
          </>
        )}
      </p>
    </div>
  );
}
