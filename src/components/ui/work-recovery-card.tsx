"use client";

import { RotateCcw, Save, Trash2 } from "lucide-react";
import { ComparadorDraft, formatDraftDate } from "@/lib/work-draft-store";

export function WorkRecoveryCard({
  draft,
  onRestore,
  onClear,
}: {
  draft: ComparadorDraft | null;
  onRestore: () => void;
  onClear: () => void;
}) {
  if (!draft) return null;

  return (
    <section className="rounded-[1.7rem] border border-amber-200 bg-amber-50 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#ff7415]">
            <Save className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-700">
              Trabajo recuperable
            </p>
            <h2 className="mt-1 text-xl font-black text-[#04224a]">
              Hay una comparación guardada automáticamente
            </h2>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              Guardado: {formatDraftDate(draft.savedAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRestore}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#005eb8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff7415]"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar
          </button>

          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Limpiar
          </button>
        </div>
      </div>
    </section>
  );
}
