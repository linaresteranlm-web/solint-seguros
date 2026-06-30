import {
  Download,
  FileArchive,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
} from "lucide-react";

export function ExportCenterCard({
  disabled,
  onDownloadZip,
  onDownloadSctr,
  onDownloadVidaLey,
  onDownloadAcumSctr,
  onDownloadAcumVidaLey,
}: {
  disabled: boolean;
  onDownloadZip: () => void;
  onDownloadSctr: () => void;
  onDownloadVidaLey: () => void;
  onDownloadAcumSctr: () => void;
  onDownloadAcumVidaLey: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200 bg-gradient-to-br from-[#04224a] to-[#005eb8] p-6 text-white">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#ffb375]">
              <FileArchive className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black">Export Center</h2>
              <p className="mt-1 text-sm leading-6 text-blue-100">
                Descarga individual o paquete final con Excel y Reporte Ejecutivo PDF.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white">
            Paquete final: 5 archivos
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 xl:grid-cols-[1fr_auto]">
        <div className="grid gap-3 md:grid-cols-2">
          <ExportButton
            label="Trama SCTR"
            onClick={onDownloadSctr}
            disabled={disabled}
          />
          <ExportButton
            label="Trama VidaLey"
            onClick={onDownloadVidaLey}
            disabled={disabled}
          />
          <ExportButton
            label="Acumulado SCTR actualizado"
            onClick={onDownloadAcumSctr}
            disabled={disabled}
          />
          <ExportButton
            label="Acumulado VidaLey actualizado"
            onClick={onDownloadAcumVidaLey}
            disabled={disabled}
          />
        </div>

        <button
          onClick={onDownloadZip}
          disabled={disabled}
          className="inline-flex min-w-80 flex-col items-center justify-center gap-2 rounded-2xl bg-[#ff7415] px-6 py-5 text-base font-black text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#04224a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-3">
            <FileArchive className="h-6 w-6" />
            Descargar ZIP Final
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-orange-50">
            <FileText className="h-4 w-4" />
            Incluye Reporte Ejecutivo PDF
          </span>
        </button>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex items-start gap-3 text-sm text-slate-600">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#005eb8]" />
          <p>
            El paquete final incluye tramas, acumulados actualizados y reporte ejecutivo PDF.
            Revise el grid editable antes de exportar.
          </p>
        </div>
      </div>
    </section>
  );
}

function ExportButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm font-black text-[#04224a] transition hover:border-[#005eb8] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="inline-flex items-center gap-3">
        <FileSpreadsheet className="h-5 w-5 text-[#005eb8]" />
        {label}
      </span>
      <Download className="h-4 w-4 text-slate-400" />
    </button>
  );
}
