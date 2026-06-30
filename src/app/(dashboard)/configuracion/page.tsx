"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Save, Settings, ShieldCheck } from "lucide-react";
import { ModulePage } from "@/components/ui/module-page";
import { EnterpriseCard } from "@/components/ui/enterprise-card";
import {
  SCTR_BLANK_HEADERS,
  SCTR_GREEN_HEADERS,
} from "@/lib/trama-defaults";
import {
  DEFAULT_TRAMA_SETTINGS,
  getTramaSettings,
  resetTramaSettings,
  saveTramaSettings,
  TramaSettings,
} from "@/lib/trama-settings";
import { addProcessHistory } from "@/lib/process-history";
import { SystemBackupCard } from "@/components/ui/system-backup-card";

export default function ConfiguracionPage() {
  const [settings, setSettings] = useState<TramaSettings>(
    DEFAULT_TRAMA_SETTINGS
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getTramaSettings());
  }, []);

  function updateSctr<K extends keyof TramaSettings["sctr"]>(
    key: K,
    value: string
  ) {
    setSaved(false);
    setSettings((current) => ({
      ...current,
      sctr: {
        ...current.sctr,
        [key]: value,
      },
    }));
  }

  function updateVidaLey<K extends keyof TramaSettings["vidaley"]>(
    key: K,
    value: string
  ) {
    setSaved(false);
    setSettings((current) => ({
      ...current,
      vidaley: {
        ...current.vidaley,
        [key]: value,
      },
    }));
  }

  function handleSave() {
    saveTramaSettings(settings);
    setSaved(true);

    addProcessHistory({
      type: "DESCARGA_ARCHIVO",
      title: "Configuración actualizada",
      description: "Se actualizaron los valores por defecto de tramas.",
      status: "OK",
      metrics: {
        parametros: 8,
      },
    });
  }

  function handleReset() {
    resetTramaSettings();
    setSettings(DEFAULT_TRAMA_SETTINGS);
    setSaved(false);

    addProcessHistory({
      type: "DESCARGA_ARCHIVO",
      title: "Configuración restaurada",
      description: "Se restauraron los valores por defecto originales.",
      status: "OK",
    });
  }

  return (
    <ModulePage
      eyebrow="Parámetros"
      title="Configuración"
      description="Centro de parámetros del ERP. Estos valores se aplican automáticamente al generar nuevas tramas."
      icon={<Settings className="h-10 w-10" />}
    >
      <div className="flex flex-col gap-3 rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black text-[#04224a]">
            Configuración editable
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Los cambios se guardan localmente en este navegador.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-[#04224a] transition hover:bg-slate-100"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar
          </button>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#005eb8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff7415]"
          >
            <Save className="h-4 w-4" />
            Guardar cambios
          </button>
        </div>
      </div>

      {saved && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-700">
          Configuración guardada correctamente.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <EnterpriseCard>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#005eb8]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#04224a]">
                Valores por defecto SCTR
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Se aplican automáticamente en nuevas tramas SCTR.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ConfigInput
              label="Nivel Riesgo"
              value={settings.sctr.nivelRiesgo}
              onChange={(value) => updateSctr("nivelRiesgo", value)}
            />
            <ConfigInput
              label="Mes de Planilla"
              value={settings.sctr.mesPlanilla}
              placeholder="Vacío"
              onChange={(value) => updateSctr("mesPlanilla", value)}
            />
            <ConfigInput
              label="Moneda Sueldo"
              value={settings.sctr.monedaSueldo}
              onChange={(value) => updateSctr("monedaSueldo", value)}
            />
            <ConfigInput
              label="Importe Sueldo"
              value={settings.sctr.importeSueldo}
              onChange={(value) => updateSctr("importeSueldo", value)}
            />
          </div>
        </EnterpriseCard>

        <EnterpriseCard>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#ff7415]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#04224a]">
                Valores por defecto VidaLey
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Se aplican automáticamente en nuevas tramas VidaLey.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ConfigInput
              label="Sueldo"
              value={settings.vidaley.sueldo}
              onChange={(value) => updateVidaLey("sueldo", value)}
            />
            <ConfigInput
              label="Ocupación"
              value={settings.vidaley.ocupacion}
              onChange={(value) => updateVidaLey("ocupacion", value)}
            />
            <ConfigInput
              label="Tipo Riesgo"
              value={settings.vidaley.tipRiesgo}
              onChange={(value) => updateVidaLey("tipRiesgo", value)}
            />
            <ConfigInput
              label="Lugar Exposición"
              value={settings.vidaley.lugarExposicion}
              onChange={(value) => updateVidaLey("lugarExposicion", value)}
            />
          </div>
        </EnterpriseCard>
      </div>

      <SystemBackupCard />

      <div className="grid gap-6 xl:grid-cols-2">
        <EnterpriseCard>
          <h2 className="text-xl font-black text-[#04224a]">
            Cabeceras verdes SCTR
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Columnas resaltadas en verde al exportar.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {SCTR_GREEN_HEADERS.map((item) => (
              <span
                key={item}
                className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700"
              >
                {item}
              </span>
            ))}
          </div>
        </EnterpriseCard>

        <EnterpriseCard>
          <h2 className="text-xl font-black text-[#04224a]">
            Columnas SCTR en blanco
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Por ahora estas columnas se dejan vacías.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {SCTR_BLANK_HEADERS.map((item) => (
              <span
                key={item}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600"
              >
                {item}
              </span>
            ))}
          </div>
        </EnterpriseCard>
      </div>
    </ModulePage>
  );
}

function ConfigInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
        {label}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-[#04224a] focus:border-[#005eb8]"
      />
    </label>
  );
}
