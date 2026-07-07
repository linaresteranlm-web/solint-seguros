"use client";

import { Maximize2, Minimize2, Presentation, X } from "lucide-react";
import {
  requestAppFullscreen,
  setPresentationMode,
} from "@/lib/analytics/presentation-mode-store";
import { showToast } from "@/lib/toast-store";

export function PresentationToolbar({
  enabled,
}: {
  enabled: boolean;
}) {
  async function handleFullscreen() {
    await requestAppFullscreen();

    showToast({
      title: "Pantalla completa",
      description: "Se alternó el modo pantalla completa del navegador.",
      variant: "success",
    });
  }

  if (!enabled) return null;

  return (
    <div className="fixed left-1/2 top-4 z-[120] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-[#061a3a]/90 px-3 py-2 text-white shadow-2xl backdrop-blur-xl">
      <span className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-100 sm:inline-flex">
        <Presentation className="h-4 w-4 text-[#ffb375]" />
        Presentation Mode
      </span>

      <button
        type="button"
        onClick={handleFullscreen}
        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-black transition hover:bg-[#ff7415]"
      >
        <Maximize2 className="h-4 w-4" />
        Fullscreen
      </button>

      <button
        type="button"
        onClick={() => setPresentationMode(false)}
        className="inline-flex items-center gap-2 rounded-full bg-red-500 px-3 py-2 text-xs font-black transition hover:bg-red-600"
      >
        <X className="h-4 w-4" />
        Salir
      </button>
    </div>
  );
}

export function PresentationModeButton({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={
        enabled
          ? "inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-black text-white transition hover:bg-red-600"
          : "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white/90 backdrop-blur transition hover:bg-[#ff7415]"
      }
    >
      {enabled ? <Minimize2 className="h-4 w-4" /> : <Presentation className="h-4 w-4" />}
      {enabled ? "Salir presentación" : "Presentation Mode"}
    </button>
  );
}
