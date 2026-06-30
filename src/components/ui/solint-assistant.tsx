"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  FileSpreadsheet,
  GitCompareArrows,
  History,
  Lightbulb,
  MessageCircle,
  Settings,
  Sparkles,
  X,
} from "lucide-react";

export function SolintAssistant() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const context = useMemo(() => getContextMessage(pathname), [pathname]);
  const recommended = useMemo(() => getRecommendedAction(pathname), [pathname]);

  return (
    <div className="pointer-events-none fixed bottom-14 right-3 z-50 sm:bottom-16 sm:right-6">
      <div
        className={
          open
            ? "pointer-events-auto absolute bottom-full right-0 mb-3 w-[calc(100vw-1.5rem)] max-w-[480px] translate-x-0 translate-y-0 scale-100 opacity-100 transition-all duration-300 ease-out sm:mb-4"
            : "pointer-events-none absolute bottom-full right-0 mb-3 w-[calc(100vw-1.5rem)] max-w-[480px] translate-x-8 translate-y-10 scale-95 opacity-0 transition-all duration-200 ease-in sm:mb-4"
        }
        aria-hidden={!open}
      >
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl sm:rounded-[2rem]">
          <div className="grid grid-cols-[auto_1fr_auto] gap-3 bg-gradient-to-br from-[#005eb8] to-[#04224a] p-4 text-white sm:gap-4 sm:p-5">
            <MatheitoRobot />

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-100">
                Matheito
              </p>
              <h3 className="mt-1 text-lg font-black leading-tight sm:text-xl">
                Asistente SOLINT
              </h3>
              <p className="mt-2 text-xs leading-5 text-blue-100">
                Te acompaño para validar, comparar, exportar y entregar archivos
                sin errores.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-9 rounded-xl bg-white/10 p-2 transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto sm:max-h-[440px]">
            <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-3 sm:p-4 md:grid-cols-2">
              <InfoBox
                icon={Lightbulb}
                title="Consejo"
                text={context}
                orange
              />
              <InfoBox
                icon={Sparkles}
                title="Acción recomendada"
                text={recommended}
              />
            </div>

            <div className="grid gap-3 p-3 sm:p-4 sm:grid-cols-2">
              <AssistantLink
                href="/acumulados"
                icon={FileSpreadsheet}
                title="Acumulados"
                text="Unir SCTR y VidaLey."
                onNavigate={() => setOpen(false)}
              />
              <AssistantLink
                href="/comparador"
                icon={GitCompareArrows}
                title="Comparador"
                text="Detectar nuevos."
                onNavigate={() => setOpen(false)}
              />
              <AssistantLink
                href="/configuracion"
                icon={Settings}
                title="Configurar"
                text="Valores por defecto."
                onNavigate={() => setOpen(false)}
              />
              <AssistantLink
                href="/historial"
                icon={History}
                title="Historial"
                text="Auditoría local."
                onNavigate={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="pointer-events-auto group flex items-center gap-2 rounded-full bg-[#ff7415] px-4 py-3 text-xs font-black text-white shadow-2xl shadow-orange-500/30 transition hover:bg-[#04224a] sm:gap-3 sm:px-5 sm:text-sm"
      >
        <MiniRobot active={open} />
        Matheito
        <ChevronDown
          className={
            open
              ? "h-5 w-5 rotate-180 transition-transform duration-300"
              : "h-5 w-5 transition-transform duration-300"
          }
        />
      </button>
    </div>
  );
}

function InfoBox({
  icon: Icon,
  title,
  text,
  orange,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  orange?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-3 shadow-sm">
      <div
        className={
          orange
            ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#ff7415]"
            : "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#005eb8]"
        }
      >
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-sm font-black text-[#04224a]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function MatheitoRobot() {
  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center sm:h-16 sm:w-16">
      <div className="absolute h-14 w-14 animate-pulse rounded-full bg-[#ff7415]/20 sm:h-16 sm:w-16" />
      <div className="relative flex h-12 w-12 animate-[matheito-float_2.4s_ease-in-out_infinite] items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur sm:h-14 sm:w-14">
        <div className="relative h-8 w-9 rounded-2xl border border-blue-100/40 bg-white sm:h-9 sm:w-10">
          <div className="absolute -top-2 left-1/2 h-2 w-0.5 -translate-x-1/2 bg-blue-100" />
          <div className="absolute -top-3 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#ffb375]" />

          <div className="absolute left-2 top-3 h-2 w-2 animate-pulse rounded-full bg-[#005eb8]" />
          <div className="absolute right-2 top-3 h-2 w-2 animate-pulse rounded-full bg-[#005eb8]" />

          <div className="absolute bottom-2 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-[#ff7415]" />
        </div>
      </div>
    </div>
  );
}

function MiniRobot({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
      <span
        className={
          active
            ? "absolute h-7 w-7 animate-ping rounded-full bg-white/20"
            : "absolute h-7 w-7 rounded-full bg-white/10"
        }
      />
      <span className="relative h-4 w-5 rounded-md bg-white">
        <span className="absolute left-1 top-1.5 h-1 w-1 rounded-full bg-[#005eb8]" />
        <span className="absolute right-1 top-1.5 h-1 w-1 rounded-full bg-[#005eb8]" />
        <span className="absolute bottom-1 left-1/2 h-0.5 w-2 -translate-x-1/2 rounded-full bg-[#ff7415]" />
      </span>
    </span>
  );
}

function AssistantLink({
  href,
  icon: Icon,
  title,
  text,
  onNavigate,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  text: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-[#005eb8] hover:bg-blue-50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#005eb8]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-black text-[#04224a]">{title}</p>
        <p className="mt-0.5 text-xs leading-4 text-slate-500">{text}</p>
      </div>
    </Link>
  );
}

function getContextMessage(pathname: string) {
  if (pathname.includes("/acumulados")) {
    return "Carga tus Excel históricos y genera acumulados maestros antes de comparar.";
  }

  if (pathname.includes("/comparador")) {
    return "Revisa auditoría, diferencias y validaciones antes de exportar.";
  }

  if (pathname.includes("/configuracion")) {
    return "Los parámetros guardados aquí se aplican automáticamente en nuevas tramas.";
  }

  if (pathname.includes("/historial")) {
    return "Filtra por errores o advertencias para encontrar eventos críticos rápido.";
  }

  return "Empieza con acumulados, luego compara y finalmente exporta desde Export Center.";
}

function getRecommendedAction(pathname: string) {
  if (pathname.includes("/acumulados")) {
    return "Selecciona todos los archivos SCTR y VidaLey antes de presionar generar.";
  }

  if (pathname.includes("/comparador")) {
    return "Corrige primero los errores del panel de validaciones si aparecen.";
  }

  if (pathname.includes("/configuracion")) {
    return "Guarda cambios antes de volver al comparador.";
  }

  if (pathname.includes("/historial")) {
    return "Exporta la auditoría a Excel si necesitas respaldo del proceso.";
  }

  return "Usa el Dashboard para ver el estado general del sistema.";
}
