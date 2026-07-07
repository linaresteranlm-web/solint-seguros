"use client";

import { BarChart3 } from "lucide-react";
import { RankingItem } from "@/lib/analytics/people-dashboard-engine";

export function PeopleRankingCard({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: RankingItem[];
}) {
  const max = Math.max(...items.map((item) => item.total), 1);

  return (
    <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#005eb8]">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#04224a]">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">
          Sin datos para mostrar.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
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
          ))}
        </div>
      )}
    </section>
  );
}
