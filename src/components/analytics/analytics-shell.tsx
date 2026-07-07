"use client";

import Link from "next/link";
import {
  BarChart3,
  FileArchive,
  GitCompareArrows,
  HelpCircle,
  RotateCcw,
  Settings,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getPresentationMode,
  subscribePresentationMode,
} from "@/lib/analytics/presentation-mode-store";

const items = [
  {
    label: "Dashboard Ejecutivo",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "People Analytics",
    href: "/analytics/people",
    icon: UsersRound,
  },
  {
    label: "Indicadores de Rotación",
    href: "/analytics/rotacion",
    icon: RotateCcw,
  },
  {
    label: "Comparador",
    href: "/analytics/comparador",
    icon: GitCompareArrows,
  },
  {
    label: "Exportaciones",
    href: "/analytics/exportaciones",
    icon: FileArchive,
  },
  {
    label: "Configuración",
    href: "/analytics/configuracion",
    icon: Settings,
  },
  {
    label: "Ayuda",
    href: "/analytics/ayuda",
    icon: HelpCircle,
  },
];

export function AnalyticsShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: string;
}) {
  const [presentation, setPresentation] = useState(false);

  useEffect(() => {
    setPresentation(getPresentationMode());

    return subscribePresentationMode((nextState) => {
      setPresentation(nextState.enabled);
    });
  }, []);

  return (
    <div
      className={
        presentation
          ? "space-y-6 bg-[#061a3a] p-0 text-white"
          : "space-y-6"
      }
    >
      {!presentation && (
        <>
          <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#04224a] via-[#005eb8] to-[#063763] p-6 text-white shadow-xl">
            <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-100">
                  SOLINT Analytics
                </p>
                <h1 className="mt-3 text-4xl font-black leading-tight">
                  Enterprise Business Intelligence Platform
                </h1>
                <p className="mt-3 max-w-4xl text-sm leading-7 text-blue-100">
                  Motor analítico modular para transformar datos en decisiones, insights
                  y recomendaciones ejecutivas.
                </p>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 text-center">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                  Framework
                </p>
                <p className="mt-2 text-2xl font-black">v1.0</p>
              </div>
            </div>
          </section>

          <nav className="flex gap-3 overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm">
            {items.map((item) => {
              const Icon = item.icon;
              const selected = active === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    selected
                      ? "inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#ff7415] px-4 py-3 text-sm font-black text-white"
                      : "inline-flex shrink-0 items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-[#04224a] transition hover:bg-blue-50 hover:text-[#005eb8]"
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </>
      )}

      {children}
    </div>
  );
}
