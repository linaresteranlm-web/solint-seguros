import { Lightbulb, Sparkles } from "lucide-react";
import { AnalyticsInsight, AnalyticsRecommendation } from "@/lib/analytics/types";

export function InsightsPanel({ insights, recommendations }: { insights: AnalyticsInsight[]; recommendations: AnalyticsRecommendation[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-3"><Lightbulb className="h-6 w-6 text-[#ff7415]" /><h2 className="text-xl font-black text-[#04224a]">Insights</h2></div>
        <div className="mt-5 space-y-3">
          {insights.map((insight) => (
            <div key={insight.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-black text-[#04224a]">{insight.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{insight.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-3"><Sparkles className="h-6 w-6 text-[#005eb8]" /><h2 className="text-xl font-black text-[#04224a]">Recomendaciones</h2></div>
        <div className="mt-5 space-y-3">
          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-black text-[#04224a]">{recommendation.title}</p>
                <span className={recommendation.priority === "Alta" ? "rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700" : recommendation.priority === "Media" ? "rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700" : "rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700"}>{recommendation.priority}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">{recommendation.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
