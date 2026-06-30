"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  X,
  Download,
  FileSpreadsheet,
  Filter,
  Gauge,
  Loader2,
  Printer,
  Play,
  Search,
  ShieldCheck,
  UploadCloud,
  UsersRound,
  Zap,
} from "lucide-react";
import { EnterpriseCard } from "@/components/ui/enterprise-card";
import {
  compararYGenerarArchivos,
  crearWorkbookEditable,
  descargarWorkbook,
  ResultadoComparacion,
  TablaGenerada,
} from "@/lib/excel-comparador";
import { addProcessHistory } from "@/lib/process-history";
import { buildFileAudit } from "@/lib/auditor";
import { AuditPanel } from "@/components/ui/audit-panel";
import { ExportCenterCard } from "@/components/ui/export-center-card";
import { downloadWorkbooksAsZip } from "@/lib/export-center";
import { validateGeneratedTable } from "@/lib/trama-validator";
import { ValidationPanel } from "@/components/ui/validation-panel";
import { ExecutiveReport } from "@/components/ui/executive-report";
import { generateExecutiveReportPdf } from "@/lib/pdf-report-generator";
import { showToast } from "@/lib/toast-store";
import { ProcessStepper, ProcessStep } from "@/components/ui/process-stepper";

function formatoNumero(valor: number) {
  return new Intl.NumberFormat("es-PE").format(valor);
}

type TablaActiva = "SCTR" | "VIDALEY";

export default function ComparadorPage() {
  const [generalFile, setGeneralFile] = useState<File | null>(null);
  const [acumuladoSctrFile, setAcumuladoSctrFile] = useState<File | null>(null);
  const [acumuladoVidaLeyFile, setAcumuladoVidaLeyFile] = useState<File | null>(
    null
  );

  const [resultado, setResultado] = useState<ResultadoComparacion | null>(null);
  const [tablaSctr, setTablaSctr] = useState<TablaGenerada | null>(null);
  const [tablaVidaLey, setTablaVidaLey] = useState<TablaGenerada | null>(null);

  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [tablaActiva, setTablaActiva] = useState<TablaActiva>("SCTR");
  const [currentUser, setCurrentUser] = useState("Sistema");

  useEffect(() => {
    const raw = localStorage.getItem("solint_user");

    if (raw) {
      try {
        const user = JSON.parse(raw);
        setCurrentUser(user?.name ?? user?.username ?? "Sistema");
      } catch {
        setCurrentUser("Sistema");
      }
    }
  }, []);

  const archivosSeleccionados = useMemo(() => {
    return [generalFile, acumuladoSctrFile, acumuladoVidaLeyFile].filter(Boolean)
      .length;
  }, [generalFile, acumuladoSctrFile, acumuladoVidaLeyFile]);

  const audit = useMemo(
    () =>
      buildFileAudit({
        generalFile,
        acumuladoSctrFile,
        acumuladoVidaLeyFile,
        resultado,
      }),
    [generalFile, acumuladoSctrFile, acumuladoVidaLeyFile, resultado]
  );

  const processSteps: ProcessStep[] = useMemo(() => {
    const filesReady = archivosSeleccionados === 3;
    const processed = Boolean(resultado);
    const reviewed = Boolean(tablaSctr || tablaVidaLey);

    return [
      {
        label: "Cargar",
        description: "Seleccionar General, SCTR y VidaLey.",
        status: filesReady ? "done" : "active",
      },
      {
        label: "Auditar",
        description: "Validar archivos y consistencia inicial.",
        status: !filesReady ? "pending" : processed ? "done" : "active",
      },
      {
        label: "Procesar",
        description: "Comparar por Nro Identidad y generar tramas.",
        status: !filesReady ? "pending" : processed ? "done" : "active",
      },
      {
        label: "Revisar",
        description: "Editar y validar el grid antes de exportar.",
        status: !processed ? "pending" : reviewed ? "active" : "pending",
      },
      {
        label: "Exportar",
        description: "Descargar Excel, ZIP o reporte ejecutivo.",
        status: processed ? "active" : "pending",
      },
    ];
  }, [archivosSeleccionados, resultado, tablaSctr, tablaVidaLey]);

  async function handleComparar() {
    setError("");
    setResultado(null);
    setTablaSctr(null);
    setTablaVidaLey(null);

    if (!generalFile || !acumuladoSctrFile || !acumuladoVidaLeyFile) {
      setError(
        "Debes seleccionar los 3 archivos: General, Acumulado SCTR y Acumulado VidaLey."
      );
      showToast({
        title: "Archivos incompletos",
        description: "Carga General, Acumulado SCTR y Acumulado VidaLey antes de procesar.",
        variant: "warning",
      });
      return;
    }

    setProcesando(true);

    try {
      const respuesta = await compararYGenerarArchivos({
        generalFile,
        acumuladoSctrFile,
        acumuladoVidaLeyFile,
      });

      setResultado(respuesta);
      setTablaSctr(respuesta.tramaSctr);
      setTablaVidaLey(respuesta.tramaVidaLey);

      addProcessHistory({
        type: "COMPARAR_TRAMAS",
        title: "Comparación General vs acumulados",
        description: "Se generaron tramas SCTR y VidaLey y acumulados actualizados.",
        status: respuesta.coincidenCantidades ? "OK" : "ADVERTENCIA",
        metrics: {
          totalGeneral: respuesta.totalGeneral,
          nuevosSctr: respuesta.nuevosSctr,
          nuevosVidaLey: respuesta.nuevosVidaLey,
        },
      });

      showToast({
        title: "Comparación completada",
        description: `SCTR: ${respuesta.nuevosSctr} nuevos. VidaLey: ${respuesta.nuevosVidaLey} nuevos.`,
        variant: respuesta.coincidenCantidades ? "success" : "warning",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      setError(message);

      addProcessHistory({
        type: "COMPARAR_TRAMAS",
        title: "Error en comparación",
        description: message,
        status: "ERROR",
      });

      showToast({
        title: "Error en comparación",
        description: message,
        variant: "error",
      });
    } finally {
      setProcesando(false);
    }
  }

  const tablaActual = tablaActiva === "SCTR" ? tablaSctr : tablaVidaLey;

  const validationResult = useMemo(() => {
    if (!tablaActual) return null;

    return validateGeneratedTable(tablaActual, tablaActiva);
  }, [tablaActual, tablaActiva]);

  function updateCell(rowIndex: number, colIndex: number, value: string) {
    const updater = (tabla: TablaGenerada | null): TablaGenerada | null => {
      if (!tabla) return tabla;

      return {
        ...tabla,
        filas: tabla.filas.map((fila, index) => {
          if (index !== rowIndex) return fila;

          const nuevaFila = [...fila];
          nuevaFila[colIndex] = value;
          return nuevaFila;
        }),
      };
    };

    if (tablaActiva === "SCTR") {
      setTablaSctr(updater);
    } else {
      setTablaVidaLey(updater);
    }
  }

  function descargarTramaActiva() {
    if (!tablaActual) return;

    if (validationResult && validationResult.errors > 0) {
      showToast({
        title: "Trama con errores",
        description: "Matheito recomienda corregir las validaciones antes de exportar.",
        variant: "warning",
      });
    }

    const workbook = crearWorkbookEditable(tablaActual, tablaActiva);

    const nombreArchivo =
      tablaActiva === "SCTR" ? "TRAMA_SCTR.xlsx" : "TRAMA_VIDALEY.xlsx";

    descargarWorkbook(workbook, nombreArchivo);

    addProcessHistory({
      type: "DESCARGA_ARCHIVO",
      title: `Descarga ${nombreArchivo}`,
      description: `Se descargó la trama editable ${tablaActiva}.`,
      status: "OK",
      metrics: {
        registros: tablaActual.filas.length,
      },
    });

    showToast({
      title: "Trama descargada",
      description: nombreArchivo,
      variant: "success",
    });
  }

  function descargarTramaSctr() {
    if (!tablaSctr) return;

    const workbook = crearWorkbookEditable(tablaSctr, "SCTR");
    descargarWorkbook(workbook, "TRAMA_SCTR.xlsx");

    addProcessHistory({
      type: "DESCARGA_ARCHIVO",
      title: "Descarga TRAMA_SCTR.xlsx",
      description: "Se descargó la trama SCTR desde Export Center.",
      status: "OK",
      metrics: {
        registros: tablaSctr.filas.length,
      },
    });
  }

  function descargarTramaVidaLey() {
    if (!tablaVidaLey) return;

    const workbook = crearWorkbookEditable(tablaVidaLey, "VIDALEY");
    descargarWorkbook(workbook, "TRAMA_VIDALEY.xlsx");

    addProcessHistory({
      type: "DESCARGA_ARCHIVO",
      title: "Descarga TRAMA_VIDALEY.xlsx",
      description: "Se descargó la trama VidaLey desde Export Center.",
      status: "OK",
      metrics: {
        registros: tablaVidaLey.filas.length,
      },
    });
  }

  function descargarAcumuladoSctrActualizado() {
    if (!resultado) return;

    descargarWorkbook(
      resultado.workbookAcumuladoSctrActualizado,
      "ACUMULADO_SCTR_ACTUALIZADO.xlsx"
    );

    addProcessHistory({
      type: "DESCARGA_ARCHIVO",
      title: "Descarga acumulado SCTR actualizado",
      description: "Se descargó el acumulado SCTR actualizado.",
      status: "OK",
      metrics: {
        nuevosSctr: resultado.nuevosSctr,
      },
    });
  }

  function descargarAcumuladoVidaLeyActualizado() {
    if (!resultado) return;

    descargarWorkbook(
      resultado.workbookAcumuladoVidaLeyActualizado,
      "ACUMULADO_VIDALEY_ACTUALIZADO.xlsx"
    );

    addProcessHistory({
      type: "DESCARGA_ARCHIVO",
      title: "Descarga acumulado VidaLey actualizado",
      description: "Se descargó el acumulado VidaLey actualizado.",
      status: "OK",
      metrics: {
        nuevosVidaLey: resultado.nuevosVidaLey,
      },
    });
  }

  function generarReporteEjecutivo() {
    if (!resultado) return;

    addProcessHistory({
      type: "DESCARGA_ARCHIVO",
      title: "PDF ejecutivo generado",
      description: "Se generó el PDF ejecutivo en una nueva pestaña.",
      status: "OK",
      metrics: {
        totalGeneral: resultado.totalGeneral,
        nuevosSctr: resultado.nuevosSctr,
        nuevosVidaLey: resultado.nuevosVidaLey,
      },
    });

    showToast({
      title: "PDF ejecutivo generado",
      description: "El reporte se abrirá en una nueva pestaña.",
      variant: "success",
    });
  }

  async function descargarTodoZip() {
    if (!resultado || !tablaSctr || !tablaVidaLey) return;

    const sctrValidation = validateGeneratedTable(tablaSctr, "SCTR");
    const vidaLeyValidation = validateGeneratedTable(tablaVidaLey, "VIDALEY");

    if (sctrValidation.errors > 0 || vidaLeyValidation.errors > 0) {
      showToast({
        title: "Paquete con observaciones",
        description: "Existen validaciones pendientes. El ZIP se generará, pero revisa el panel de validaciones.",
        variant: "warning",
      });
    }

    const workbookTramaSctr = crearWorkbookEditable(tablaSctr, "SCTR");
    const workbookTramaVidaLey = crearWorkbookEditable(tablaVidaLey, "VIDALEY");

    const pdf = await generateExecutiveReportPdf({
      userName: currentUser,
      resultado,
    });

    const pdfArrayBuffer = pdf.output("arraybuffer");

    await downloadWorkbooksAsZip(
      [
        {
          name: "TRAMA_SCTR.xlsx",
          workbook: workbookTramaSctr,
        },
        {
          name: "TRAMA_VIDALEY.xlsx",
          workbook: workbookTramaVidaLey,
        },
        {
          name: "ACUMULADO_SCTR_ACTUALIZADO.xlsx",
          workbook: resultado.workbookAcumuladoSctrActualizado,
        },
        {
          name: "ACUMULADO_VIDALEY_ACTUALIZADO.xlsx",
          workbook: resultado.workbookAcumuladoVidaLeyActualizado,
        },
      ],
      "SOLINT_PAQUETE_FINAL_TRAMAS_ACUMULADOS_REPORTE.zip",
      [
        {
          name: "REPORTE_EJECUTIVO_SOLINT.pdf",
          content: pdfArrayBuffer,
        },
      ]
    );

    addProcessHistory({
      type: "DESCARGA_ARCHIVO",
      title: "Descarga paquete final ZIP + PDF",
      description: "Se descargó el paquete final con tramas, acumulados y reporte ejecutivo PDF.",
      status: "OK",
      metrics: {
        archivos: 5,
        nuevosSctr: resultado.nuevosSctr,
        nuevosVidaLey: resultado.nuevosVidaLey,
      },
    });

    showToast({
      title: "Paquete final generado",
      description: "ZIP con tramas, acumulados y reporte ejecutivo PDF.",
      variant: "success",
    });
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-black tracking-tight text-[#061a3a]">
          Comparador y Generación de Tramas
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          La comparación se realiza con la columna <b>G - Nro Identidad</b> del
          archivo General contra SCTR y VidaLey.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <UploadCard
          step="1"
          title="Archivo General"
          description="Debe contener la columna G: Nro Identidad."
          file={generalFile}
          onChange={setGeneralFile}
        />

        <UploadCard
          step="2"
          title="Acumulado SCTR"
          description="Se compara contra Documento de Identidad."
          file={acumuladoSctrFile}
          onChange={setAcumuladoSctrFile}
          orange
        />

        <UploadCard
          step="3"
          title="Acumulado VidaLey"
          description="Se compara contra NumDoc."
          file={acumuladoVidaLeyFile}
          onChange={setAcumuladoVidaLeyFile}
        />
      </div>

      <ProcessStepper steps={processSteps} />

      <AuditPanel audit={audit} />

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <EnterpriseCard className="py-5">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Metric icon={UsersRound} value={resultado?.totalGeneral ?? 0} label="Total en General" />
            <Metric icon={CheckCircle2} value={resultado?.totalAcumuladoSctr ?? 0} label="Ya en SCTR" green />
            <Metric icon={Zap} value={resultado?.nuevosSctr ?? 0} label="Nuevos para SCTR" orange />
            <Metric icon={ShieldCheck} value={resultado?.totalAcumuladoVidaLey ?? 0} label="Ya en VidaLey" />
            <Metric icon={Zap} value={resultado?.nuevosVidaLey ?? 0} label="Nuevos para VidaLey" orange />
          </div>

          <button
            onClick={handleComparar}
            disabled={procesando || archivosSeleccionados < 3}
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#005eb8] px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#034d92] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {procesando ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Procesando
              </>
            ) : (
              <>
                <Play className="h-5 w-5 fill-white" />
                Procesar Comparación
              </>
            )}
          </button>
        </div>
      </EnterpriseCard>

      {resultado?.observaciones.length ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          {resultado.observaciones[0]}
        </div>
      ) : null}

      {resultado && (
        <DifferenceCenter
          totalGeneral={resultado.totalGeneral}
          totalAcumuladoSctr={resultado.totalAcumuladoSctr}
          totalAcumuladoVidaLey={resultado.totalAcumuladoVidaLey}
          nuevosSctr={resultado.nuevosSctr}
          nuevosVidaLey={resultado.nuevosVidaLey}
          coincidenCantidades={resultado.coincidenCantidades}
        />
      )}

      <EnterpriseCard className="p-0">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 pt-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-7">
            <button
              onClick={() => setTablaActiva("SCTR")}
              className={
                tablaActiva === "SCTR"
                  ? "border-b-4 border-[#ff7415] px-2 pb-5 text-sm font-black uppercase text-[#ff7415]"
                  : "px-2 pb-5 text-sm font-black uppercase text-slate-500 hover:text-[#005eb8]"
              }
            >
              Trama SCTR
            </button>

            <button
              onClick={() => setTablaActiva("VIDALEY")}
              className={
                tablaActiva === "VIDALEY"
                  ? "border-b-4 border-[#ff7415] px-2 pb-5 text-sm font-black uppercase text-[#ff7415]"
                  : "px-2 pb-5 text-sm font-black uppercase text-slate-500 hover:text-[#005eb8]"
              }
            >
              Trama VidaLey
            </button>
          </div>

          <div className="flex items-center gap-3 pb-5">
            <span className="rounded-xl bg-orange-50 px-4 py-2 text-sm font-bold text-[#ff7415]">
              {tablaActual
                ? `${formatoNumero(tablaActual.filas.length)} registros`
                : "Sin procesar"}
            </span>

            <button
              onClick={descargarTramaActiva}
              disabled={!tablaActual}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#005eb8] px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#034d92] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Exportar Excel
            </button>
          </div>
        </div>

        <EditableTable tabla={tablaActual} onCellChange={updateCell} />
      </EnterpriseCard>

      {validationResult && (
        <ValidationPanel result={validationResult} tipo={tablaActiva} />
      )}

      <ExportCenterCard
        disabled={!resultado || !tablaSctr || !tablaVidaLey}
        onDownloadZip={descargarTodoZip}
        onDownloadSctr={descargarTramaSctr}
        onDownloadVidaLey={descargarTramaVidaLey}
        onDownloadAcumSctr={descargarAcumuladoSctrActualizado}
        onDownloadAcumVidaLey={descargarAcumuladoVidaLeyActualizado}
      />

      {resultado && (
        <ExecutiveReport
          userName={currentUser}
          resultado={resultado}
          onGeneratePdf={generarReporteEjecutivo}
        />
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
        <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff7415] text-white">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black uppercase text-[#ff7415]">
              Importante
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Las columnas que no existen en General quedan en blanco por ahora.
              Luego pueden configurarse desde el módulo Configuración.
            </p>
          </div>
        </div>

        <button
          onClick={descargarTramaActiva}
          disabled={!tablaActual}
          className="inline-flex min-w-80 items-center justify-center gap-3 rounded-2xl bg-[#005eb8] px-8 py-5 text-base font-black text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#034d92] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-6 w-6" />
          Descargar {tablaActiva === "SCTR" ? "Trama SCTR" : "Trama VidaLey"}
        </button>
      </div>
    </div>
  );
}

function UploadCard({
  step,
  title,
  description,
  file,
  onChange,
  orange,
}: {
  step: string;
  title: string;
  description: string;
  file: File | null;
  onChange: (file: File | null) => void;
  orange?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");

  function isExcelFile(nextFile: File) {
    const name = nextFile.name.toLowerCase();

    return name.endsWith(".xlsx") || name.endsWith(".xls");
  }

  function selectFile(nextFile: File | null) {
    setLocalError("");

    if (!nextFile) {
      onChange(null);
      return;
    }

    if (!isExcelFile(nextFile)) {
      setLocalError("Solo se permiten archivos Excel .xls o .xlsx.");
      onChange(null);
      return;
    }

    onChange(nextFile);
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);

    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    selectFile(droppedFile);
  }

  return (
    <label
      onDragEnter={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragging(false);
      }}
      onDrop={handleDrop}
      className={
        dragging
          ? "relative z-10 block min-h-56 cursor-pointer rounded-[1.7rem] border-2 border-dashed border-[#ff7415] bg-orange-50 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition"
          : file
            ? "relative z-10 block min-h-56 cursor-pointer rounded-[1.7rem] border border-emerald-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition hover:border-[#005eb8] hover:shadow-xl"
            : "relative z-10 block min-h-56 cursor-pointer rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition hover:border-[#005eb8] hover:bg-blue-50/30 hover:shadow-xl"
      }
    >
      <input
        type="file"
        accept=".xls,.xlsx"
        className="hidden"
        onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
      />

      <div className="flex items-start gap-4">
        <div
          className={
            orange
              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff7415] text-sm font-black text-white shadow-lg shadow-orange-900/20"
              : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#005eb8] text-sm font-black text-white shadow-lg shadow-blue-900/20"
          }
        >
          {step}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black uppercase text-[#005eb8]">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>

          <div className="mt-6 flex items-center gap-4">
            <div
              className={
                file
                  ? "flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"
                  : dragging
                    ? "flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-[#ff7415]"
                    : "flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"
              }
            >
              <FileSpreadsheet className="h-9 w-9" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[#061a3a]">
                {file?.name ??
                  (dragging
                    ? "Suelta el archivo aquí"
                    : "Seleccionar archivo Excel")}
              </p>
              <p
                className={
                  file
                    ? "mt-1 text-sm font-bold text-emerald-600"
                    : dragging
                      ? "mt-1 text-sm font-bold text-[#ff7415]"
                      : "mt-1 text-sm font-bold text-emerald-600"
                }
              >
                {file
                  ? "Archivo listo"
                  : dragging
                    ? "Carga por arrastre activa"
                    : "Pendiente de carga"}
              </p>
              {file && (
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>

          {localError && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-black text-red-700">
              {localError}
            </div>
          )}

          <p className="mt-5 text-xs leading-5 text-slate-500">
            Haz click en la tarjeta, usa el botón o arrastra tu archivo Excel.
          </p>
        </div>

        {file && (
          <div className="flex flex-col items-end gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Check className="h-4 w-4" />
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onChange(null);
                setLocalError("");
              }}
              className="relative z-20 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
            >
              <X className="h-3.5 w-3.5" />
              Quitar
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 right-6 z-10 rounded-xl border border-[#005eb8] bg-white px-5 py-3 text-sm font-black text-[#005eb8] transition group-hover:bg-[#005eb8] group-hover:text-white">
        {file ? "Cambiar Archivo" : "Cargar Archivo"}
      </div>
    </label>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
  green,
  orange,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  green?: boolean;
  orange?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 border-slate-200 xl:border-r xl:pr-4 last:border-r-0">
      <div
        className={
          green
            ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"
            : orange
              ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#ff7415]"
              : "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#005eb8]"
        }
      >
        <Icon className="h-7 w-7" />
      </div>

      <div>
        <p className="text-2xl font-black text-[#061a3a]">
          {formatoNumero(value)}
        </p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function DifferenceCenter({
  totalGeneral,
  totalAcumuladoSctr,
  totalAcumuladoVidaLey,
  nuevosSctr,
  nuevosVidaLey,
  coincidenCantidades,
}: {
  totalGeneral: number;
  totalAcumuladoSctr: number;
  totalAcumuladoVidaLey: number;
  nuevosSctr: number;
  nuevosVidaLey: number;
  coincidenCantidades: boolean;
}) {
  const diferenciaSctr = Math.max(totalGeneral - totalAcumuladoSctr, 0);
  const diferenciaVidaLey = Math.max(totalGeneral - totalAcumuladoVidaLey, 0);

  return (
    <section className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200 bg-gradient-to-br from-white to-blue-50 p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#005eb8]">
              <Gauge className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
                Centro de Diferencias
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#04224a]">
                General vs Acumulados
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Vista ejecutiva para validar consistencia antes de exportar.
              </p>
            </div>
          </div>

          <div
            className={
              coincidenCantidades
                ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700"
                : "rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-black text-amber-700"
            }
          >
            {coincidenCantidades
              ? "SCTR y VidaLey coinciden"
              : "Diferencia entre SCTR y VidaLey"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-5">
        <DiffMetric label="General" value={totalGeneral} />
        <DiffMetric label="Acum. SCTR" value={totalAcumuladoSctr} />
        <DiffMetric label="Acum. VidaLey" value={totalAcumuladoVidaLey} />
        <DiffMetric label="Nuevos SCTR" value={nuevosSctr} orange />
        <DiffMetric label="Nuevos VidaLey" value={nuevosVidaLey} orange />
      </div>

      <div className="grid gap-4 border-t border-slate-200 bg-slate-50 p-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Diferencia teórica SCTR
          </p>
          <p className="mt-3 text-3xl font-black text-[#04224a]">
            {formatoNumero(diferenciaSctr)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            General menos acumulado SCTR.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Diferencia teórica VidaLey
          </p>
          <p className="mt-3 text-3xl font-black text-[#04224a]">
            {formatoNumero(diferenciaVidaLey)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            General menos acumulado VidaLey.
          </p>
        </div>
      </div>
    </section>
  );
}

function DiffMetric({
  label,
  value,
  orange,
}: {
  label: string;
  value: number;
  orange?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p
        className={
          orange
            ? "mt-3 text-3xl font-black text-[#ff7415]"
            : "mt-3 text-3xl font-black text-[#04224a]"
        }
      >
        {formatoNumero(value)}
      </p>
    </div>
  );
}

function EditableTable({
  tabla,
  onCellChange,
}: {
  tabla: TablaGenerada | null;
  onCellChange: (rowIndex: number, colIndex: number, value: string) => void;
}) {
  const [query, setQuery] = useState("");

  if (!tabla) {
    return (
      <div className="flex min-h-80 items-center justify-center p-10 text-center">
        <div>
          <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-sm font-black text-slate-700">
            Primero procesa la comparación.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Aquí aparecerá la trama editable respetando las columnas del modelo.
          </p>
        </div>
      </div>
    );
  }

  const normalizedQuery = query.trim().toLowerCase();

  const visibleRows = tabla.filas
    .map((fila, originalIndex) => ({ fila, originalIndex }))
    .filter(({ fila }) => {
      if (!normalizedQuery) return true;

      return fila.some((cell) =>
        String(cell ?? "").toLowerCase().includes(normalizedQuery)
      );
    });

  return (
    <div>
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por DNI, nombre, apellido, fecha, sexo..."
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
            />
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-[#04224a]">
            <Filter className="h-4 w-4 text-[#005eb8]" />
            {formatoNumero(visibleRows.length)} visibles
          </div>

          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-[#005eb8]">
            Total: {formatoNumero(tabla.filas.length)}
          </div>
        </div>
      </div>

      <div className="solint-scrollbar max-h-[560px] overflow-auto">
        <table className="min-w-max border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#052b5b] text-white">
              <th className="w-14 border-r border-white/20 px-3 py-4">
                #
              </th>
              {tabla.cabecera.map((header) => (
                <th
                  key={header}
                  className="min-w-44 border-r border-white/20 px-3 py-4 text-left text-xs font-black"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {visibleRows.map(({ fila, originalIndex }, visibleIndex) => (
              <tr key={originalIndex} className="border-b border-slate-200">
                <td className="bg-white px-4 py-3 text-center text-slate-500">
                  {visibleIndex + 1}
                </td>
                {tabla.cabecera.map((_, colIndex) => (
                  <td key={`${originalIndex}-${colIndex}`} className="bg-white px-2 py-2">
                    <input
                      value={String(fila[colIndex] ?? "")}
                      onChange={(event) =>
                        onCellChange(originalIndex, colIndex, event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#005eb8]"
                    />
                  </td>
                ))}
              </tr>
            ))}

            {visibleRows.length === 0 && (
              <tr>
                <td
                  colSpan={tabla.cabecera.length + 1}
                  className="bg-white px-4 py-12 text-center text-sm font-bold text-slate-500"
                >
                  No hay resultados para la búsqueda actual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-600">
          Mostrando{" "}
          <span className="font-black text-[#061a3a]">
            {formatoNumero(visibleRows.length)}
          </span>{" "}
          de{" "}
          <span className="font-black text-[#061a3a]">
            {formatoNumero(tabla.filas.length)}
          </span>{" "}
          registros
        </div>

        <div className="text-sm font-bold text-slate-500">
          Hoja: {tabla.nombreHoja}
        </div>
      </div>
    </div>
  );
}
