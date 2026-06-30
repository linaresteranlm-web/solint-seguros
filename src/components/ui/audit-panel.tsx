import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { AuditResult, AuditStatus } from "@/lib/auditor";

export function AuditPanel({ audit }: { audit: AuditResult }) {
  return (
    <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#005eb8]">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#04224a]">{audit.title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Validación visual del flujo antes de generar y descargar archivos.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {audit.items.map((item) => (
          <AuditRow key={item.label} item={item} />
        ))}
      </div>
    </section>
  );
}

function AuditRow({
  item,
}: {
  item: {
    label: string;
    description: string;
    status: AuditStatus;
  };
}) {
  const config = getStatusConfig(item.status);
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className={config.iconClass}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-black text-[#04224a]">{item.label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {item.description}
        </p>
      </div>
    </div>
  );
}

function getStatusConfig(status: AuditStatus) {
  switch (status) {
    case "OK":
      return {
        icon: CheckCircle2,
        iconClass:
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700",
      };
    case "ADVERTENCIA":
      return {
        icon: AlertTriangle,
        iconClass:
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700",
      };
    case "ERROR":
      return {
        icon: XCircle,
        iconClass:
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700",
      };
    default:
      return {
        icon: CircleDashed,
        iconClass:
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-500",
      };
  }
}
