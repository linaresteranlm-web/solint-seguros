export type AuditStatus = "OK" | "ADVERTENCIA" | "ERROR" | "PENDIENTE";

export type AuditItem = {
  label: string;
  description: string;
  status: AuditStatus;
};

export type AuditResult = {
  title: string;
  items: AuditItem[];
};

export function buildFileAudit(params: {
  generalFile: File | null;
  acumuladoSctrFile: File | null;
  acumuladoVidaLeyFile: File | null;
  resultado?: {
    totalGeneral: number;
    totalAcumuladoSctr: number;
    totalAcumuladoVidaLey: number;
    nuevosSctr: number;
    nuevosVidaLey: number;
    coincidenCantidades: boolean;
  } | null;
}): AuditResult {
  const items: AuditItem[] = [
    {
      label: "Archivo General",
      description: params.generalFile
        ? params.generalFile.name
        : "Pendiente de cargar archivo General.",
      status: params.generalFile ? "OK" : "PENDIENTE",
    },
    {
      label: "Acumulado SCTR",
      description: params.acumuladoSctrFile
        ? params.acumuladoSctrFile.name
        : "Pendiente de cargar acumulado SCTR.",
      status: params.acumuladoSctrFile ? "OK" : "PENDIENTE",
    },
    {
      label: "Acumulado VidaLey",
      description: params.acumuladoVidaLeyFile
        ? params.acumuladoVidaLeyFile.name
        : "Pendiente de cargar acumulado VidaLey.",
      status: params.acumuladoVidaLeyFile ? "OK" : "PENDIENTE",
    },
  ];

  if (params.resultado) {
    items.push(
      {
        label: "Total General",
        description: `${params.resultado.totalGeneral.toLocaleString("es-PE")} trabajadores detectados.`,
        status: params.resultado.totalGeneral > 0 ? "OK" : "ADVERTENCIA",
      },
      {
        label: "Nuevos SCTR",
        description: `${params.resultado.nuevosSctr.toLocaleString("es-PE")} trabajadores nuevos para SCTR.`,
        status: "OK",
      },
      {
        label: "Nuevos VidaLey",
        description: `${params.resultado.nuevosVidaLey.toLocaleString("es-PE")} trabajadores nuevos para VidaLey.`,
        status: "OK",
      },
      {
        label: "Consistencia SCTR vs VidaLey",
        description: params.resultado.coincidenCantidades
          ? "Las cantidades coinciden correctamente."
          : "Las cantidades no coinciden. Se recomienda revisar antes de enviar.",
        status: params.resultado.coincidenCantidades ? "OK" : "ADVERTENCIA",
      }
    );
  }

  return {
    title: "Auditor inteligente de archivos",
    items,
  };
}
