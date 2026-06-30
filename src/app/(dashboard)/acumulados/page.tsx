"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { EnterpriseCard } from "@/components/ui/enterprise-card";
import {
  descargarAcumulado,
  generarAcumulado,
  ResultadoAcumulado,
} from "@/lib/excel-acumulados";
import { addProcessHistory } from "@/lib/process-history";
import { showToast } from "@/lib/toast-store";

function formatoNumero(valor: number) {
  return new Intl.NumberFormat("es-PE").format(valor);
}

export default function AcumuladosPage() {
  const [archivosSctr, setArchivosSctr] = useState<File[]>([]);
  const [archivosVidaLey, setArchivosVidaLey] = useState<File[]>([]);

  const [resultadoSctr, setResultadoSctr] = useState<ResultadoAcumulado | null>(
    null
  );
  const [resultadoVidaLey, setResultadoVidaLey] =
    useState<ResultadoAcumulado | null>(null);

  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const totalArchivos = useMemo(
    () => archivosSctr.length + archivosVidaLey.length,
    [archivosSctr.length, archivosVidaLey.length]
  );

  async function handleGenerar() {
    setError("");
    setResultadoSctr(null);
    setResultadoVidaLey(null);

    if (archivosSctr.length === 0 && archivosVidaLey.length === 0) {
      setError("Selecciona al menos archivos SCTR o archivos VidaLey.");
      showToast({
        title: "No hay archivos seleccionados",
        description: "Carga archivos SCTR o VidaLey antes de generar acumulados.",
        variant: "warning",
      });
      return;
    }

    setProcesando(true);

    try {
      let sctr: ResultadoAcumulado | null = null;
      let vidaley: ResultadoAcumulado | null = null;

      if (archivosSctr.length > 0) {
        sctr = await generarAcumulado(archivosSctr, "SCTR");
        setResultadoSctr(sctr);
      }

      if (archivosVidaLey.length > 0) {
        vidaley = await generarAcumulado(archivosVidaLey, "VIDALEY");
        setResultadoVidaLey(vidaley);
      }

      addProcessHistory({
        type: "GENERAR_ACUMULADOS",
        title: "Generación de acumulados",
        description: "Se procesaron archivos SCTR y/o VidaLey.",
        status: "OK",
        metrics: {
          archivosSctr: archivosSctr.length,
          archivosVidaLey: archivosVidaLey.length,
          filasSctr: sctr?.totalFilasAgregadas ?? 0,
          filasVidaLey: vidaley?.totalFilasAgregadas ?? 0,
        },
      });

      showToast({
        title: "Acumulados generados",
        description: "El proceso terminó correctamente.",
        variant: "success",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      setError(message);

      addProcessHistory({
        type: "GENERAR_ACUMULADOS",
        title: "Error al generar acumulados",
        description: message,
        status: "ERROR",
      });

      showToast({
        title: "Error al generar acumulados",
        description: message,
        variant: "error",
      });
    } finally {
      setProcesando(false);
    }
  }

  function descargarResultado(resultado: ResultadoAcumulado) {
    descargarAcumulado(resultado);

    addProcessHistory({
      type: "DESCARGA_ARCHIVO",
      title: `Descarga acumulado ${resultado.tipo}`,
      description: `Se descargó el acumulado ${resultado.tipo}.`,
      status: "OK",
      metrics: {
        filas: resultado.totalFilasAgregadas,
      },
    });

    showToast({
      title: `Acumulado ${resultado.tipo} descargado`,
      description: "Archivo Excel generado correctamente.",
      variant: "success",
    });
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#005eb8] via-[#074a86] to-[#04224a] p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#ff7415]/20 blur-3xl" />
        <p className="relative text-sm font-black uppercase tracking-[0.3em] text-blue-100">
          Módulo 1
        </p>
        <h1 className="relative mt-4 text-4xl font-black">
          Generar acumulados
        </h1>
        <p className="relative mt-3 max-w-3xl text-sm leading-6 text-blue-100">
          Carga todos los archivos SCTR y VidaLey. El sistema buscará las hojas
          correctas, unirá la información, eliminará duplicados por DNI y
          generará los acumulados descargables.
        </p>
      </section>

      <EnterpriseCard>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#005eb8]">
              <FileSpreadsheet className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#04224a]">
                Carga masiva de Excel
              </h2>
              <p className="text-sm text-slate-500">
                SCTR: hoja “Modelo de Trama”. VidaLey: hoja “Trabajadores”.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm">
            <span className="font-black text-[#04224a]">
              {formatoNumero(totalArchivos)}
            </span>{" "}
            archivos seleccionados
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <UploadArea
            title="Archivos SCTR"
            description="Procesa la hoja Modelo de Trama."
            count={archivosSctr.length}
            onChange={setArchivosSctr}
          />

          <UploadArea
            title="Archivos VidaLey"
            description="Procesa la hoja Trabajadores."
            count={archivosVidaLey.length}
            onChange={setArchivosVidaLey}
          />
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleGenerar}
          disabled={procesando}
          className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-[#005eb8] px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#ff7415] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {procesando ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Procesando
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-5 w-5" />
              Generar acumulados
            </>
          )}
        </button>
      </EnterpriseCard>

      {(resultadoSctr || resultadoVidaLey) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {resultadoSctr && (
            <ResultadoCard
              titulo="Acumulado SCTR"
              descripcion="Resultado generado desde la hoja Modelo de Trama."
              resultado={resultadoSctr}
              onDownload={() => descargarResultado(resultadoSctr)}
            />
          )}

          {resultadoVidaLey && (
            <ResultadoCard
              titulo="Acumulado VidaLey"
              descripcion="Resultado generado desde la hoja Trabajadores."
              resultado={resultadoVidaLey}
              onDownload={() => descargarResultado(resultadoVidaLey)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function UploadArea({
  title,
  description,
  count,
  onChange,
}: {
  title: string;
  description: string;
  count: number;
  onChange: (files: File[]) => void;
}) {
  return (
    <label className="block rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-[#005eb8] hover:bg-blue-50/40">
      <div className="flex items-center gap-3">
        <UploadCloud className="h-6 w-6 text-[#005eb8]" />
        <span className="block text-sm font-black text-[#04224a]">
          {title}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>

      <input
        multiple
        type="file"
        accept=".xls,.xlsx"
        className="mt-4 block w-full text-sm"
        onChange={(event) => onChange(Array.from(event.target.files ?? []))}
      />

      <p className="mt-4 text-sm font-bold text-slate-700">
        Seleccionados: {formatoNumero(count)}
      </p>
    </label>
  );
}

function ResultadoCard({
  titulo,
  descripcion,
  resultado,
  onDownload,
}: {
  titulo: string;
  descripcion: string;
  resultado: ResultadoAcumulado;
  onDownload: () => void;
}) {
  const archivosConError = resultado.reporte.filter(
    (item) => item.estado !== "OK"
  );

  return (
    <EnterpriseCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            <h2 className="text-xl font-black text-[#04224a]">{titulo}</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">{descripcion}</p>
        </div>

        <button
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#04224a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#005eb8]"
        >
          <Download className="h-4 w-4" />
          Descargar
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Metric label="Archivos" value={resultado.totalArchivos} />
        <Metric label="Filas leídas" value={resultado.totalFilasLeidas} />
        <Metric label="Filas agregadas" value={resultado.totalFilasAgregadas} />
        <Metric label="Duplicados omitidos" value={resultado.totalDuplicados} />
      </div>

      {archivosConError.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-black text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            Archivos omitidos o con observación
          </p>

          <div className="mt-3 max-h-52 space-y-2 overflow-auto pr-2">
            {archivosConError.map((item) => (
              <div
                key={`${item.archivo}-${item.mensaje}`}
                className="rounded-xl bg-white p-3 text-xs text-slate-700"
              >
                <p className="font-black text-slate-950">{item.archivo}</p>
                <p className="mt-1">{item.mensaje}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </EnterpriseCard>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-[#04224a]">
        {formatoNumero(value)}
      </p>
    </div>
  );
}
