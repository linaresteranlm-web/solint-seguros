"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  GitCompareArrows,
  Settings,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import {
  getPresentationMode,
  subscribePresentationMode,
} from "@/lib/analytics/presentation-mode-store";

const menuPrincipal = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Generar Acumulados", href: "/acumulados", icon: FileSpreadsheet },
  { label: "Comparador y Tramas", href: "/comparador", icon: GitCompareArrows },
  { label: "Historial de Procesos", href: "/historial", icon: FileText },
  { label: "Reportes", href: "/reportes", icon: FileText },
];

const menuAnalytics = [
  { label: "SOLINT Analytics", href: "/analytics", icon: BrainCircuit },
  { label: "People Analytics", href: "/analytics/people", icon: UsersRound },
  { label: "Analytics Comparador", href: "/analytics/comparador", icon: GitCompareArrows },
  { label: "Analytics Exportaciones", href: "/analytics/exportaciones", icon: FileSpreadsheet },
  { label: "Analytics Configuración", href: "/analytics/configuracion", icon: Settings },
];

const menuConfig = [
  { label: "Usuarios", href: "/usuarios", icon: UsersRound },
  { label: "Configuración", href: "/configuracion", icon: Settings },
];

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const [presentation, setPresentation] = useState(false);

  useEffect(() => {
    setPresentation(getPresentationMode());

    return subscribePresentationMode((nextState) => {
      setPresentation(nextState.enabled);
    });
  }, []);

  if (presentation) return null;

  return (
    <>
      <aside
        className={
          collapsed
            ? "sticky top-0 hidden h-dvh w-24 shrink-0 overflow-hidden border-r border-blue-100 bg-gradient-to-b from-white via-[#eef6ff] to-[#d8ecff] text-[#04224a] shadow-xl transition-all duration-300 lg:flex lg:flex-col"
            : "sticky top-0 hidden h-dvh w-72 shrink-0 overflow-hidden border-r border-blue-100 bg-gradient-to-b from-white via-[#eef6ff] to-[#d8ecff] text-[#04224a] shadow-xl transition-all duration-300 lg:flex lg:flex-col 2xl:w-80"
        }
      >
        <SidebarContent collapsed={collapsed} onToggle={onToggle} />
      </aside>

      <div
        className={
          mobileOpen
            ? "fixed inset-0 z-[70] bg-slate-950/40 opacity-100 backdrop-blur-sm transition-opacity lg:hidden"
            : "pointer-events-none fixed inset-0 z-[70] bg-slate-950/40 opacity-0 backdrop-blur-sm transition-opacity lg:hidden"
        }
        onClick={onCloseMobile}
      />

      <aside
        className={
          mobileOpen
            ? "fixed left-0 top-0 z-[80] flex h-dvh w-[86vw] max-w-[340px] translate-x-0 flex-col overflow-hidden border-r border-blue-100 bg-gradient-to-b from-white via-[#eef6ff] to-[#d8ecff] text-[#04224a] shadow-2xl transition-transform duration-300 lg:hidden"
            : "fixed left-0 top-0 z-[80] flex h-dvh w-[86vw] max-w-[340px] -translate-x-full flex-col overflow-hidden border-r border-blue-100 bg-gradient-to-b from-white via-[#eef6ff] to-[#d8ecff] text-[#04224a] shadow-2xl transition-transform duration-300 lg:hidden"
        }
      >
        <SidebarContent
          collapsed={false}
          mobile
          onToggle={() => onCloseMobile?.()}
        />
      </aside>
    </>
  );
}

function SidebarContent({
  collapsed,
  mobile,
  onToggle,
}: {
  collapsed: boolean;
  mobile?: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="relative flex h-full flex-col">
      <div className="absolute inset-x-0 bottom-0 h-96 bg-[radial-gradient(circle_at_bottom,rgba(0,94,184,0.18),transparent_62%)]" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,rgba(255,116,21,0.16),transparent_55%)]" />

      <div className="relative flex items-center justify-between px-5 pb-5 pt-6">
        <div
          className={
            collapsed
              ? "relative h-16 w-14 shrink-0"
              : "relative h-20 min-w-0 flex-1"
          }
        >
          <Image
            src={
              collapsed
                ? "/images/solint-business-systems-c.png"
                : "/images/solint-business-systems.png"
            }
            alt="SOLINT Business Systems"
            fill
            sizes={collapsed ? "56px" : "(max-width: 1024px) 240px, 280px"}
            className="object-contain object-center"
            priority
          />
        </div>

        <button
          onClick={onToggle}
          className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-[#005eb8] shadow-sm transition hover:bg-[#ff7415] hover:text-white"
        >
          {mobile ? (
            <X className="h-5 w-5" />
          ) : collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="relative flex-1 space-y-7 overflow-y-auto px-4 pb-4">
        <MenuBlock
          title="SOLINT Seguros"
          items={menuPrincipal}
          pathname={pathname}
          collapsed={collapsed}
          onNavigate={mobile ? onToggle : undefined}
        />
        <MenuBlock
          title="SOLINT Analytics"
          items={menuAnalytics}
          pathname={pathname}
          collapsed={collapsed}
          onNavigate={mobile ? onToggle : undefined}
        />
        <MenuBlock
          title="Configuración"
          items={menuConfig}
          pathname={pathname}
          collapsed={collapsed}
          onNavigate={mobile ? onToggle : undefined}
        />
      </nav>

      {!collapsed && (
        <div className="relative mx-5 mb-5 overflow-hidden rounded-[1.7rem] border border-blue-100 bg-white/85 p-5 shadow-lg backdrop-blur">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,122,26,0.18),transparent_45%)]" />
          <ShieldCheck className="relative h-8 w-8 text-[#ff7415]" />
          <p className="relative mt-5 text-sm font-black uppercase tracking-wide text-[#04224a]">
            SOLINT Analytics
          </p>
          <p className="relative mt-2 text-sm leading-6 text-slate-600">
            Motor BI Enterprise integrado a SOLINT Seguros.
          </p>
        </div>
      )}
    </div>
  );
}

function MenuBlock({
  title,
  items,
  pathname,
  collapsed,
  onNavigate,
}: {
  title: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
  }[];
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div>
      {!collapsed && (
        <p className="mb-3 px-3 text-xs font-black uppercase tracking-[0.18em] text-[#005eb8]/70">
          {title}
        </p>
      )}

      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={
                active
                  ? collapsed
                    ? "flex h-12 items-center justify-center rounded-2xl bg-[#ff7415] text-white shadow-lg shadow-orange-500/25 transition"
                    : "flex items-center gap-3 rounded-2xl bg-[#ff7415] px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#fb6a06]"
                  : collapsed
                    ? "flex h-12 items-center justify-center rounded-2xl text-[#005eb8] transition hover:bg-white hover:text-[#ff7415] hover:shadow-sm"
                    : "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-[#04224a] transition hover:bg-white hover:text-[#005eb8] hover:shadow-sm"
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
