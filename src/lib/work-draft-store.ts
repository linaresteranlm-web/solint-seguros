"use client";

import { ResultadoComparacion, TablaGenerada } from "@/lib/excel-comparador";

const DRAFT_KEY = "solint_seguros_comparador_draft";

export type ComparadorDraft = {
  savedAt: string;
  resultado: ResultadoComparacion;
  tablaSctr: TablaGenerada;
  tablaVidaLey: TablaGenerada;
};

export function saveComparadorDraft(draft: Omit<ComparadorDraft, "savedAt">) {
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        ...draft,
        savedAt: new Date().toISOString(),
      })
    );
  } catch {
    // No bloquear el sistema si el navegador limita localStorage.
  }
}

export function getComparadorDraft(): ComparadorDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ComparadorDraft;
  } catch {
    return null;
  }
}

export function clearComparadorDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export function formatDraftDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
