"use client";

/**
 * Llaves centralizadas de almacenamiento local.
 *
 * Esta capa ayuda a preparar el sistema para una futura migración a backend.
 * En el futuro estas llaves pueden reemplazarse por endpoints de API:
 *
 * - GET /settings
 * - POST /settings
 * - GET /audit/history
 * - POST /audit/history/import
 */
export const SOLINT_STORAGE_KEYS = {
  user: "solint_user",
  processHistory: "solint_process_history",
  tramaSettings: "solint_trama_settings",
} as const;
