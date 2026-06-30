"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  DatabaseBackup,
  Download,
  RotateCcw,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import {
  clearLocalSystemData,
  downloadSystemBackup,
  getBackupStats,
  readBackupFile,
  restoreSystemBackup,
} from "@/lib/system-backup";
import { showToast } from "@/lib/toast-store";
import { addProcessHistory } from "@/lib/process-history";

export function SystemBackupCard() {
  const [historyCount, setHistoryCount] = useState(0);
  const [hasSettings, setHasSettings] = useState(false);
  const [restoring, setRestoring] = useState(false);

  function refreshStats() {
    const stats = getBackupStats();

    setHistoryCount(stats.historyCount);
    setHasSettings(stats.hasSettings);
  }

  useEffect(() => {
    refreshStats();
  }, []);

  function handleDownloadBackup() {
    downloadSystemBackup();

    addProcessHistory({
      type: "DESCARGA_ARCHIVO",
      title: "Backup del sistema exportado",
      description: "Se descargó un backup JSON con configuración e historial.",
      status: "OK",
      metrics: {
        historial: historyCount,
        configuracion: hasSettings ? "personalizada" : "default",
      },
    });

    showToast({
      title: "Backup generado",
      description: "Se descargó el archivo JSON de respaldo SOLINT.",
      variant: "success",
    });
  }

  async function handleRestore(file: File | null) {
    if (!file) return;

    setRestoring(true);

    try {
      const backup = await readBackupFile(file);
      restoreSystemBackup(backup);
      refreshStats();

      addProcessHistory({
        type: "DESCARGA_ARCHIVO",
        title: "Backup del sistema restaurado",
        description: "Se restauró configuración e historial desde archivo JSON.",
        status: "OK",
        metrics: {
          historial: backup.data.processHistory?.length ?? 0,
        },
      });

      showToast({
        title: "Backup restaurado",
        description: "La configuración e historial fueron restaurados.",
        variant: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo restaurar backup.";

      showToast({
        title: "Error al restaurar",
        description: message,
        variant: "error",
      });
    } finally {
      setRestoring(false);
    }
  }

  function handleClearLocalData() {
    clearLocalSystemData();
    refreshStats();

    addProcessHistory({
      type: "DESCARGA_ARCHIVO",
      title: "Datos locales limpiados",
      description: "Se limpiaron configuración e historial local.",
      status: "ADVERTENCIA",
    });

    showToast({
      title: "Datos locales limpiados",
      description: "Se restauró el sistema a parámetros locales iniciales.",
      variant: "warning",
    });
  }

  return (
    <section className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200 bg-gradient-to-br from-[#04224a] to-[#005eb8] p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#ffb375]">
            <DatabaseBackup className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-100">
              Backup & Restore
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Respaldo del sistema local
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">
              Exporta o restaura configuración e historial. Ideal antes de
              cambiar de navegador, limpiar datos o preparar una migración SaaS.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 xl:grid-cols-[1fr_auto]">
        <div className="grid gap-4 md:grid-cols-2">
          <StatusBox
            label="Registros de historial"
            value={String(historyCount)}
          />
          <StatusBox
            label="Configuración"
            value={hasSettings ? "Personalizada" : "Por defecto"}
          />
        </div>

        <div className="flex flex-col gap-3 xl:w-80">
          <button
            onClick={handleDownloadBackup}
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#005eb8] px-5 py-4 text-sm font-black text-white transition hover:bg-[#ff7415]"
          >
            <Download className="h-5 w-5" />
            Exportar backup JSON
          </button>

          <label className="inline-flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-black text-[#04224a] transition hover:bg-blue-50 hover:text-[#005eb8]">
            <UploadCloud className="h-5 w-5" />
            {restoring ? "Restaurando..." : "Importar backup JSON"}
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(event) =>
                handleRestore(event.target.files?.[0] ?? null)
              }
            />
          </label>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-6">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#ff7415]" />
            <p className="text-sm leading-6 text-slate-600">
              Matheito recomienda exportar un backup antes de limpiar datos
              locales. Este sistema aún no usa base de datos; por eso el
              respaldo local es importante.
            </p>
          </div>

          <button
            onClick={handleClearLocalData}
            className="inline-flex items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-black text-red-600 transition hover:bg-red-100"
          >
            <RotateCcw className="h-5 w-5" />
            Limpiar datos locales
          </button>
        </div>
      </div>
    </section>
  );
}

function StatusBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
        <ShieldCheck className="h-6 w-6" />
      </div>

      <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-[#04224a]">{value}</p>
    </div>
  );
}
