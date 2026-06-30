"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { ModulePage } from "@/components/ui/module-page";
import { EnterpriseCard } from "@/components/ui/enterprise-card";
import { getProcessHistory, ProcessHistoryItem } from "@/lib/process-history";

export default function ReportesPage() {
  const [history, setHistory] = useState<ProcessHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getProcessHistory());
  }, []);

  const stats = useMemo(() => {
    const acumulados = history.filter((item) => item.type === "GENERAR_ACUMULADOS");
    const comparaciones = history.filter((item) => item.type === "COMPARAR_TRAMAS");
    const descargas = history.filter((item) => item.type === "DESCARGA_ARCHIVO");
    const errores = history.filter((item) => item.status === "ERROR");

    return {
      acumulados: acumulados.length,
      comparaciones: comparaciones.length,
      descargas: descargas.length,
      errores: errores.length,
    };
  }, [history]);

  return (
    <ModulePage
      eyebrow="Inteligencia"
      title="Reportes"
      description="Indicadores operativos locales basados en los procesos ejecutados en el navegador."
      icon={<FileText className="h-10 w-10" />}
    >
      <EnterpriseCard>
        <div className="grid gap-4 md:grid-cols-4">
          <ReportMetric title="Acumulados" value={stats.acumulados} />
          <ReportMetric title="Comparaciones" value={stats.comparaciones} />
          <ReportMetric title="Descargas" value={stats.descargas} />
          <ReportMetric title="Errores" value={stats.errores} danger />
        </div>
      </EnterpriseCard>
    </ModulePage>
  );
}

function ReportMetric({
  title,
  value,
  danger,
}: {
  title: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
        {title}
      </p>
      <p
        className={
          danger
            ? "mt-3 text-3xl font-black text-red-600"
            : "mt-3 text-3xl font-black text-[#04224a]"
        }
      >
        {value}
      </p>
    </div>
  );
}
