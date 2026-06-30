"use client";

import {
  CalendarDays,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { ResultadoComparacion } from "@/lib/excel-comparador";
import {
  createPdfBlobUrl,
  generateExecutiveReportPdf,
} from "@/lib/pdf-report-generator";

function formatoNumero(valor: number) {
  return new Intl.NumberFormat("es-PE").format(valor);
}

function fechaActual() {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date());
}

export function ExecutiveReport({
  userName,
  resultado,
  onGeneratePdf,
}: {
  userName: string;
  resultado: ResultadoComparacion;
  onGeneratePdf: () => void;
}) {
  async function handleGeneratePdf() {
    const pdf = await generateExecutiveReportPdf({
      userName,
      resultado,
    });

    const url = createPdfBlobUrl(pdf);
    window.open(url, "_blank", "noopener,noreferrer");
    onGeneratePdf();
  }

  async function handleDownloadPdf() {
    const pdf = await generateExecutiveReportPdf({
      userName,
      resultado,
    });

    pdf.save("REPORTE_EJECUTIVO_SOLINT.pdf");
  }

  const listedPeople = resultado.tramaSctr.filas.length;

  return (
    <section className="rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-br from-white to-blue-50 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
            Reporte Ejecutivo
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#04224a]">
            PDF ejecutivo premium
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Incluye resumen, estado, archivos generados y lista del personal nuevo detectado.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGeneratePdf}
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#04224a] px-6 py-4 text-sm font-black text-white transition hover:bg-[#ff7415]"
          >
            <ExternalLink className="h-5 w-5" />
            Generar PDF
          </button>

          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-[#04224a] transition hover:bg-blue-50 hover:text-[#005eb8]"
          >
            <Download className="h-5 w-5" />
            Descargar PDF
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-[#eef6ff] to-[#d8ecff] p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#005eb8]">
              Vista previa de datos
            </p>
            <h3 className="mt-2 text-xl font-black text-[#04224a]">
              Reporte Ejecutivo de Comparación
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              El PDF se abrirá en una nueva pestaña y mostrará también la lista de personal nuevo.
            </p>
          </div>

          <InfoItem icon={CalendarDays} label="Fecha de emisión" value={fechaActual()} />
          <InfoItem icon={UserRound} label="Usuario" value={userName} />
          <InfoItem
            icon={ShieldCheck}
            label="Estado"
            value={resultado.coincidenCantidades ? "Consistente" : "Con observación"}
          />
          <InfoItem
            icon={UsersRound}
            label="Personal nuevo listado"
            value={`${formatoNumero(listedPeople)} registros`}
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-5 flex items-center gap-3">
            <FileText className="h-6 w-6 text-[#005eb8]" />
            <h3 className="text-lg font-black text-[#04224a]">
              Contenido del PDF
            </h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <ReportMetric label="Total General" value={resultado.totalGeneral} />
            <ReportMetric label="Acum. SCTR" value={resultado.totalAcumuladoSctr} />
            <ReportMetric label="Acum. VidaLey" value={resultado.totalAcumuladoVidaLey} />
            <ReportMetric label="Nuevos SCTR" value={resultado.nuevosSctr} orange />
            <ReportMetric label="Nuevos VidaLey" value={resultado.nuevosVidaLey} orange />
            <ReportMetric label="Personal listado" value={listedPeople} orange />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="mt-0.5 h-5 w-5 shrink-0 text-[#005eb8]" />
              <p className="text-sm leading-6 text-slate-600">
                El PDF incluye logo SOLINT, datos de emisión, estado de consistencia,
                indicadores principales, archivos generados, observaciones y lista del personal nuevo detectado por la comparación.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#005eb8]" />
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-sm font-black text-[#04224a]">{value}</p>
      </div>
    </div>
  );
}

function ReportMetric({
  label,
  value,
  orange,
}: {
  label: string;
  value: number;
  orange?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p
        className={
          orange
            ? "mt-2 text-2xl font-black text-[#ff7415]"
            : "mt-2 text-2xl font-black text-[#04224a]"
        }
      >
        {formatoNumero(value)}
      </p>
    </div>
  );
}
