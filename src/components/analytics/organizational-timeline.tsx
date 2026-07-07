"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Info,
  XCircle,
} from "lucide-react";
import { TimelineEvent } from "@/lib/analytics/organizational-timeline-engine";

function iconFor(type: TimelineEvent["type"]) {
  if (type === "success") return CheckCircle2;
  if (type === "warning") return AlertTriangle;
  if (type === "danger") return XCircle;
  return Info;
}

function classFor(type: TimelineEvent["type"]) {
  if (type === "success") return "bg-emerald-100 text-emerald-700";
  if (type === "warning") return "bg-amber-100 text-amber-700";
  if (type === "danger") return "bg-red-100 text-red-700";
  return "bg-blue-100 text-[#005eb8]";
}

export function OrganizationalTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#ff7415]">
          <Clock3 className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#ff7415]">
            Timeline Organizacional
          </p>
          <h2 className="mt-1 text-xl font-black text-[#04224a]">
            Secuencia ejecutiva del análisis
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => {
          const Icon = iconFor(event.type);

          return (
            <div key={event.id} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${classFor(
                    event.type
                  )}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {index < events.length - 1 && (
                  <div className="mt-2 h-full min-h-8 w-px bg-slate-200" />
                )}
              </div>

              <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-black text-[#04224a]">{event.title}</p>
                  <span className="text-xs font-bold text-slate-400">
                    {event.timeLabel}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
