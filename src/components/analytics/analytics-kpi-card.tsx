import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { AnalyticsKpi } from "@/lib/analytics/types";

export function AnalyticsKpiCard({ kpi }: { kpi: AnalyticsKpi }) {
  const TrendIcon = kpi.trend === "up" ? ArrowUp : kpi.trend === "down" ? ArrowDown : ArrowRight;

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{kpi.label}</p>
          <p className={kpi.severity === "danger" ? "mt-3 text-4xl font-black text-red-700" : kpi.severity === "warning" ? "mt-3 text-4xl font-black text-amber-700" : "mt-3 text-4xl font-black text-[#04224a]"}>
            {kpi.value}{kpi.unit && <span className="text-xl"> {kpi.unit}</span>}
          </p>
        </div>
        <div className={kpi.severity === "danger" ? "flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700" : kpi.severity === "warning" ? "flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700" : "flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"}>
          <TrendIcon className="h-6 w-6" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{kpi.interpretation}</p>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={kpi.severity === "danger" ? "h-full w-4/5 rounded-full bg-red-500" : kpi.severity === "warning" ? "h-full w-3/5 rounded-full bg-amber-500" : "h-full w-2/5 rounded-full bg-emerald-500"} />
      </div>
    </div>
  );
}
