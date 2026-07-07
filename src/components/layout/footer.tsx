"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { APP_NAME, APP_POWERED_BY, APP_VERSION } from "@/lib/app-version";
import {
  getPresentationMode,
  subscribePresentationMode,
} from "@/lib/analytics/presentation-mode-store";

export function Footer() {
  const [presentation, setPresentation] = useState(false);

  useEffect(() => {
    setPresentation(getPresentationMode());

    return subscribePresentationMode((nextState) => {
      setPresentation(nextState.enabled);
    });
  }, []);

  if (presentation) return null;

  return (
    <footer className="sticky bottom-0 z-20 shrink-0 border-t border-slate-200 bg-white/95 px-6 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
      <div className="flex flex-col gap-2 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#005eb8]" />
          <span className="font-bold text-[#04224a]">{APP_NAME}</span>
          <span>© 2026</span>
          <span className="hidden h-1 w-1 rounded-full bg-slate-300 md:block" />
          <span>Versión {APP_VERSION}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span>Gestión de SCTR y Vida Ley</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>{APP_POWERED_BY}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span className="font-bold text-emerald-600">Sistema operativo</span>
        </div>
      </div>
    </footer>
  );
}
