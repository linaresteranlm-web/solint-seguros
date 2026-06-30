import { ReactNode } from "react";
import { EnterpriseCard } from "@/components/ui/enterprise-card";

export function ModulePage({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#005eb8] via-[#064b89] to-[#04224a] p-8 text-white shadow-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-100">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-black">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100">
              {description}
            </p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-[#ffb375]">
            {icon}
          </div>
        </div>
      </section>

      {children ?? (
        <EnterpriseCard>
          <div className="grid gap-4 md:grid-cols-3">
            <PlaceholderMetric title="Estado" value="Activo" />
            <PlaceholderMetric title="Versión" value="v2.0" />
            <PlaceholderMetric title="Modo" value="Enterprise" />
          </div>
        </EnterpriseCard>
      )}
    </div>
  );
}

function PlaceholderMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
        {title}
      </p>
      <p className="mt-3 text-2xl font-black text-[#04224a]">{value}</p>
    </div>
  );
}
