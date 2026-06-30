"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  FileArchive,
  FileSpreadsheet,
  FileText,
  GitCompareArrows,
  History,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { EnterpriseCard } from "@/components/ui/enterprise-card";
import {
  formatDateTime,
  getProcessHistory,
  ProcessHistoryItem,
} from "@/lib/process-history";

type SessionUser = {
  username: string;
  name: string;
  role: string;
};

function formatoNumero(valor: number) {
  return new Intl.NumberFormat("es-PE").format(valor);
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function getNowText() {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date());
}

export default function DashboardPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [history, setHistory] = useState<ProcessHistoryItem[]>([]);
  const [nowText, setNowText] = useState(getNowText());

  useEffect(() => {
    const raw = localStorage.getItem("solint_user");

    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }

    setHistory(getProcessHistory());

    const interval = window.setInterval(() => {
      setNowText(getNowText());
      setHistory(getProcessHistory());
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const comparaciones = history.filter((item) => item.type === "COMPARAR_TRAMAS");
    const acumulados = history.filter((item) => item.type === "GENERAR_ACUMULADOS");
    const descargas = history.filter((item) => item.type === "DESCARGA_ARCHIVO");
    const errores = history.filter((item) => item.status === "ERROR");
    const advertencias = history.filter((item) => item.status === "ADVERTENCIA");
    const pdfs = history.filter((item) =>
      item.title.toLowerCase().includes("pdf") ||
      item.description.toLowerCase().includes("pdf")
    );
    const zips = history.filter((item) =>
      item.title.toLowerCase().includes("zip") ||
      item.description.toLowerCase().includes("zip")
    );

    const personasProcesadas = history.reduce((total, item) => {
      const totalGeneral = Number(item.metrics?.totalGeneral ?? 0);
      const filasSctr = Number(item.metrics?.filasSctr ?? 0);
      const filasVidaLey = Number(item.metrics?.filasVidaLey ?? 0);
      const filas = Number(item.metrics?.filas ?? 0);

      return total + totalGeneral + filasSctr + filasVidaLey + filas;
    }, 0);

    const nuevosSctr = history.reduce(
      (total, item) => total + Number(item.metrics?.nuevosSctr ?? 0),
      0
    );

    const nuevosVidaLey = history.reduce(
      (total, item) => total + Number(item.metrics?.nuevosVidaLey ?? 0),
      0
    );

    return {
      procesos: history.length,
      comparaciones: comparaciones.length,
      acumulados: acumulados.length,
      descargas: descargas.length,
      errores: errores.length,
      advertencias: advertencias.length,
      pdfs: pdfs.length,
      zips: zips.length,
      personasProcesadas,
      nuevosSctr,
      nuevosVidaLey,
    };
  }, [history]);

  const lastProcess = history[0];

  const matheitoMessage = useMemo(() => {
    if (history.length === 0) {
      return "Aún no hay procesos registrados. Te recomiendo empezar generando acumulados maestros y luego usar el comparador.";
    }

    if (stats.errores > 0) {
      return `Detecté ${stats.errores} proceso(s) con error. Revisa el historial antes de continuar con una exportación final.`;
    }

    if (stats.advertencias > 0) {
      return `Hay ${stats.advertencias} advertencia(s). Valida el Centro de Diferencias antes de entregar las tramas.`;
    }

    if (stats.zips > 0) {
      return "El flujo está completo: ya generaste paquetes ZIP finales. El sistema está operando correctamente.";
    }

    return "El sistema está saludable. Puedes continuar generando tramas, PDF ejecutivo o paquete final ZIP.";
  }, [history.length, stats.advertencias, stats.errores, stats.zips]);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#005eb8] via-[#074a86] to-[#04224a] p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#ff7415]/20 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-80px] h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-100">
              SOLINT Business Systems
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-5xl">
              {getGreeting()}, {user?.name ?? "usuario"}.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100">
              Bienvenido al Dashboard Ejecutivo del ERP SCTR & VidaLey Manager.
              Aquí tienes una vista consolidada del estado operativo, procesos,
              exportaciones, reportes y actividad reciente.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 font-bold text-white">
                <Clock className="h-4 w-4 text-[#ffb375]" />
                {nowText}
              </span>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Rol: {user?.role ?? "Sesión"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/20 px-4 py-2 font-bold text-emerald-100">
                <CheckCircle2 className="h-4 w-4" />
                Sistema operativo
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/comparador"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#ff7415] px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-900/20 transition hover:bg-white hover:text-[#04224a]"
              >
                Ir al comparador
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/acumulados"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white hover:text-[#04224a]"
              >
                Generar acumulados
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[520px]">
            <HeroMetric icon={Activity} label="Procesos" value={stats.procesos} />
            <HeroMetric icon={FileArchive} label="ZIP finales" value={stats.zips} />
            <HeroMetric icon={FileText} label="Reportes PDF" value={stats.pdfs} />
            <HeroMetric icon={UsersRound} label="Personas" value={stats.personasProcesadas} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={GitCompareArrows}
          title="Comparaciones"
          value={stats.comparaciones}
          description="General vs acumulados"
        />
        <KpiCard
          icon={FileSpreadsheet}
          title="Acumulados"
          value={stats.acumulados}
          description="Procesos de consolidación"
        />
        <KpiCard
          icon={FileArchive}
          title="Descargas"
          value={stats.descargas}
          description="Excel, ZIP y PDF"
          orange
        />
        <KpiCard
          icon={TrendingUp}
          title="Nuevos detectados"
          value={stats.nuevosSctr + stats.nuevosVidaLey}
          description="SCTR + VidaLey"
          orange
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <EnterpriseCard>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
                Actividad reciente
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#04224a]">
                Timeline operativo
              </h2>
            </div>

            <Link
              href="/historial"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-[#04224a] transition hover:bg-blue-50 hover:text-[#005eb8]"
            >
              Ver historial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {history.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <History className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-4 text-sm font-black text-[#04224a]">
                Sin actividad registrada
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Ejecuta una comparación o genera acumulados para alimentar el dashboard.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 6).map((item) => (
                <TimelineItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </EnterpriseCard>

        <div className="space-y-6">
          <EnterpriseCard>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#ff7415]">
                <Bot className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#ff7415]">
                  Matheito
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#04224a]">
                  Diagnóstico inteligente
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {matheitoMessage}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <HealthRow label="Motor Excel" value="Activo" />
              <HealthRow label="Motor PDF" value="Activo" />
              <HealthRow label="Export Center" value="Activo" />
              <HealthRow label="Matheito" value="Conectado" />
            </div>
          </EnterpriseCard>

          <EnterpriseCard>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
              Último proceso
            </p>
            {lastProcess ? (
              <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-lg font-black text-[#04224a]">
                  {lastProcess.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {lastProcess.description}
                </p>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  {formatDateTime(lastProcess.createdAt)}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Aún no existe un último proceso registrado.
              </p>
            )}
          </EnterpriseCard>
        </div>
      </div>

      <EnterpriseCard>
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
            Accesos rápidos
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#04224a]">
            Centro de trabajo
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <QuickAccess href="/acumulados" icon={FileSpreadsheet} title="Acumulados" />
          <QuickAccess href="/comparador" icon={GitCompareArrows} title="Comparador" />
          <QuickAccess href="/configuracion" icon={ShieldCheck} title="Configuración" />
          <QuickAccess href="/reportes" icon={FileText} title="Reportes" />
          <QuickAccess href="/historial" icon={History} title="Historial" />
        </div>
      </EnterpriseCard>
    </div>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur transition hover:bg-white/15">
      <Icon className="h-7 w-7 text-[#ffb375]" />
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-white">
        {formatoNumero(value)}
      </p>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  title,
  value,
  description,
  orange,
}: {
  icon: React.ElementType;
  title: string;
  value: number;
  description: string;
  orange?: boolean;
}) {
  return (
    <EnterpriseCard className="transition hover:-translate-y-1 hover:shadow-2xl">
      <div
        className={
          orange
            ? "flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#ff7415]"
            : "flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#005eb8]"
        }
      >
        <Icon className="h-7 w-7" />
      </div>
      <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-4xl font-black text-[#04224a]">
        {formatoNumero(value)}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </EnterpriseCard>
  );
}

function TimelineItem({ item }: { item: ProcessHistoryItem }) {
  return (
    <div className="flex gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div
        className={
          item.status === "OK"
            ? "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"
            : item.status === "ADVERTENCIA"
              ? "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"
              : "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700"
        }
      >
        <CheckCircle2 className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="font-black text-[#04224a]">{item.title}</p>
          <span className="text-xs font-bold text-slate-400">
            {formatDateTime(item.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {item.description}
        </p>
      </div>
    </div>
  );
}

function HealthRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
        {value}
      </span>
    </div>
  );
}

function QuickAccess({
  href,
  icon: Icon,
  title,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-[#005eb8] hover:bg-blue-50"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#005eb8] shadow-sm transition group-hover:bg-[#005eb8] group-hover:text-white">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-4 text-sm font-black text-[#04224a]">{title}</p>
      <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#005eb8]">
        Abrir módulo
        <ArrowRight className="h-3 w-3" />
      </p>
    </Link>
  );
}
