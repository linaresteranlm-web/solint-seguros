"use client";

export type TramaSettings = {
  sctr: {
    nivelRiesgo: string;
    mesPlanilla: string;
    monedaSueldo: string;
    importeSueldo: string;
  };
  vidaley: {
    sueldo: string;
    ocupacion: string;
    tipRiesgo: string;
    lugarExposicion: string;
  };
};

export const DEFAULT_TRAMA_SETTINGS: TramaSettings = {
  sctr: {
    nivelRiesgo: "1",
    mesPlanilla: "",
    monedaSueldo: "1",
    importeSueldo: "1130.00",
  },
  vidaley: {
    sueldo: "1,130.00",
    ocupacion: "OBRERO",
    tipRiesgo: "OBREROS",
    lugarExposicion: "130101",
  },
};

const STORAGE_KEY = "solint_trama_settings";

export function getTramaSettings(): TramaSettings {
  if (typeof window === "undefined") return DEFAULT_TRAMA_SETTINGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return DEFAULT_TRAMA_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<TramaSettings>;

    return {
      sctr: {
        ...DEFAULT_TRAMA_SETTINGS.sctr,
        ...(parsed.sctr ?? {}),
      },
      vidaley: {
        ...DEFAULT_TRAMA_SETTINGS.vidaley,
        ...(parsed.vidaley ?? {}),
      },
    };
  } catch {
    return DEFAULT_TRAMA_SETTINGS;
  }
}

export function saveTramaSettings(settings: TramaSettings) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function resetTramaSettings() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEY);
}

export function formatSettingsForAudit(settings: TramaSettings) {
  return [
    `SCTR Nivel Riesgo: ${settings.sctr.nivelRiesgo || "vacío"}`,
    `SCTR Moneda Sueldo: ${settings.sctr.monedaSueldo || "vacío"}`,
    `SCTR Importe Sueldo: ${settings.sctr.importeSueldo || "vacío"}`,
    `VidaLey Sueldo: ${settings.vidaley.sueldo || "vacío"}`,
    `VidaLey Ocupación: ${settings.vidaley.ocupacion || "vacío"}`,
  ];
}
