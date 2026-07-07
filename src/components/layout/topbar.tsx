"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Home,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  getPresentationMode,
  subscribePresentationMode,
} from "@/lib/analytics/presentation-mode-store";

type SessionUser = {
  username: string;
  name: string;
  role: string;
};

const notifications = [
  {
    title: "SOLINT SEGUROS activo",
    text: "El sistema está listo para gestionar SCTR y Vida Ley.",
    type: "success",
  },
  {
    title: "Validación obligatoria",
    text: "Revisa la trama editable antes de descargar el Excel final.",
    type: "warning",
  },
  {
    title: "Matheito conectado",
    text: "El asistente operativo está listo para ayudarte.",
    type: "info",
  },
];

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [userOpen, setUserOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [presentation, setPresentation] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("solint_user");

    if (raw) {
      setUser(JSON.parse(raw));
    }

    setPresentation(getPresentationMode());

    return subscribePresentationMode((nextState) => {
      setPresentation(nextState.enabled);
    });
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogout() {
    localStorage.removeItem("solint_user");
    window.location.href = "/login";
  }

  if (presentation) return null;

  return (
    <header className="sticky top-0 z-30 flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-xl sm:min-h-20 sm:px-5 lg:px-6">
      <div className="flex min-w-0 items-center gap-3 sm:gap-5">
        <button
          onClick={onToggleSidebar}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#005eb8] hover:text-[#005eb8] sm:h-11 sm:w-11"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-wide text-[#005eb8] sm:text-sm">
            SOLINT SEGUROS
          </p>
          <p className="mt-0.5 hidden truncate text-xs font-medium text-slate-500 sm:block lg:text-sm">
            Gestión Inteligente de SCTR y Vida Ley · Powered by SOLINT Business Systems
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-3 text-sm xl:flex">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-bold text-[#005eb8]"
        >
          <Home className="h-4 w-4" />
          Inicio
        </Link>
        <span className="text-slate-300">›</span>
        <span className="font-medium text-slate-500">Panel de trabajo</span>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen((value) => !value)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#005eb8] hover:text-[#005eb8] sm:h-11 sm:w-11"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff7415] text-[10px] font-black text-white">
              {notifications.length}
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-96 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-slate-950">
                  Centro de notificaciones
                </p>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-[#005eb8]">
                  {notifications.length} nuevas
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {notifications.map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <div
                      className={
                        item.type === "success"
                          ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"
                          : item.type === "warning"
                            ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#ff7415]"
                            : "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#005eb8]"
                      }
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden h-11 w-px bg-slate-200 md:block" />

        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setUserOpen((value) => !value)}
            className="flex items-center gap-2 rounded-2xl px-1 py-1 transition hover:bg-slate-100 sm:gap-3 sm:px-2"
          >
            <div className="hidden text-right sm:block">
              <p className="text-sm font-black text-slate-950">
                {user?.name ?? "Usuario"}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                {user?.role ?? "Sesión"}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[#005eb8] sm:h-12 sm:w-12">
              <UserRound className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {userOpen && (
            <div className="absolute right-0 mt-3 w-72 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl">
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-orange-50 p-4">
                <ShieldCheck className="h-6 w-6 text-[#005eb8]" />
                <p className="mt-3 text-sm font-black text-slate-950">
                  {user?.name ?? "Usuario SOLINT"}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {user?.role ?? "Sin rol"}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="mt-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
