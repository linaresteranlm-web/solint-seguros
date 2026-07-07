"use client";

import { useEffect, useState } from "react";
import { Bot, MessageCircle, Sparkles, X } from "lucide-react";
import {
  getPresentationMode,
  subscribePresentationMode,
} from "@/lib/analytics/presentation-mode-store";

export function MatheitoAssistant() {
  const [open, setOpen] = useState(false);
  const [presentation, setPresentation] = useState(false);

  useEffect(() => {
    setPresentation(getPresentationMode());

    return subscribePresentationMode((nextState) => {
      setPresentation(nextState.enabled);
    });
  }, []);

  if (presentation) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-4 w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-2xl">
          <div className="bg-gradient-to-br from-[#04224a] to-[#005eb8] p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#ffb375]">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-black">Matheito</p>
                  <p className="text-xs font-bold text-blue-100">
                    Asistente SOLINT
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3 p-5">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Hola, soy Matheito. Puedo ayudarte a interpretar el análisis, revisar
              alertas, generar tramas y preparar reportes ejecutivos.
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-700">
              En People Analytics revisa mi panel <b>Matheito Live AI</b> para ver
              una lectura ejecutiva automática.
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-[#04224a] to-[#005eb8] px-5 py-4 text-white shadow-2xl transition hover:scale-[1.03]"
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#04224a]">
          <Bot className="h-6 w-6" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff7415]">
            <Sparkles className="h-2.5 w-2.5 text-white" />
          </span>
        </span>
        <span className="text-sm font-black">Matheito</span>
        <MessageCircle className="h-5 w-5 opacity-80" />
      </button>
    </div>
  );
}
