"use client";

import { Radar } from "lucide-react";
import { AnalyticsResult } from "@/lib/analytics/types";
import { PeopleIntelligenceResult } from "@/lib/analytics/people-intelligence-engine";
import { MotionReveal } from "@/components/analytics/motion-ui";

type RadarItem = {
  label: string;
  value: number;
  goodHigh: boolean;
};

function kpiNumber(result: AnalyticsResult, id: string) {
  return Number(result.kpis.find((kpi) => kpi.id === id)?.value ?? 0);
}

function statusColor(value: number, goodHigh: boolean) {
  const score = goodHigh ? value : 100 - value;

  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

export function RiskRadarCard({
  result,
  intelligence,
}: {
  result: AnalyticsResult;
  intelligence: PeopleIntelligenceResult;
}) {
  const rotation = Math.min(100, kpiNumber(result, "rotation") * 5);
  const dataQuality = Math.max(
    0,
    100 - result.validation.errors * 15 - result.validation.warnings * 4
  );
  const maxRisk = Math.max(...intelligence.strategicAlerts.map((alert) => alert.risk), 0);

  const items: RadarItem[] = [
    { label: "Estabilidad", value: intelligence.stabilityIndex, goodHigh: true },
    { label: "Diversidad", value: intelligence.diversityIndex, goodHigh: true },
    { label: "Calidad de datos", value: dataQuality, goodHigh: true },
    { label: "Rotación", value: rotation, goodHigh: false },
    { label: "Riesgo alertas", value: maxRisk, goodHigh: false },
    {
      label: "Health Score",
      value: intelligence.organizationalHealthScore,
      goodHigh: true,
    },
  ];

  return (
    <MotionReveal delay={180}>
      <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#005eb8]">
            <Radar className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
              Radar de Riesgo
            </p>
            <h2 className="mt-1 text-xl font-black text-[#04224a]">
              Lectura ejecutiva multidimensional
            </h2>
          </div>
        </div>

        <div className="grid gap-4">
          {items.map((item, index) => (
            <MotionReveal key={item.label} delay={index * 90}>
              <div>
                <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                  <span className="font-black text-[#04224a]">{item.label}</span>
                  <span className="font-bold text-slate-500">
                    {Math.round(item.value)}/100
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${statusColor(
                      item.value,
                      item.goodHigh
                    )}`}
                    style={{ width: `${Math.max(Math.min(item.value, 100), 4)}%` }}
                  />
                </div>
              </div>
            </MotionReveal>
          ))}
        </div>
      </section>
    </MotionReveal>
  );
}
