"use client";

import { SkeletonCard, MotionReveal } from "@/components/analytics/motion-ui";

export function DashboardSkeleton() {
  return (
    <MotionReveal>
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="h-5 w-48 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-4 h-10 w-80 max-w-full animate-pulse rounded-full bg-slate-200" />
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    </MotionReveal>
  );
}
