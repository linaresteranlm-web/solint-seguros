import jsPDF from "jspdf";
import { ResultadoComparacion, TablaGenerada } from "@/lib/excel-comparador";

type PersonalNuevo = {
  dni: string;
  nombres: string;
  fechaNacimiento: string;
  sexo: string;
};

function formatoNumero(valor: number) {
  return new Intl.NumberFormat("es-PE").format(valor);
}

function fechaActual() {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date());
}

async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function findHeaderIndex(headers: string[], names: string[]) {
  const normalizedNames = names.map(normalizeHeader);

  return headers.findIndex((header) =>
    normalizedNames.includes(normalizeHeader(header))
  );
}

function getCell(row: unknown[], index: number) {
  if (index < 0) return "";

  return String(row[index] ?? "").trim();
}

function buildPersonalNuevoFromSctr(tabla: TablaGenerada): PersonalNuevo[] {
  const dniIndex = findHeaderIndex(tabla.cabecera, ["Documento de Identidad"]);
  const apePaternoIndex = findHeaderIndex(tabla.cabecera, ["Apellido Paterno"]);
  const apeMaternoIndex = findHeaderIndex(tabla.cabecera, ["Apellido Materno"]);
  const primerNombreIndex = findHeaderIndex(tabla.cabecera, ["Primer Nombre"]);
  const segundoNombreIndex = findHeaderIndex(tabla.cabecera, ["Segundo Nombre"]);
  const nacimientoIndex = findHeaderIndex(tabla.cabecera, ["Fecha Nacimiento"]);
  const sexoIndex = findHeaderIndex(tabla.cabecera, ["Sexo"]);

  return tabla.filas.map((row) => {
    const nombres = [
      getCell(row, apePaternoIndex),
      getCell(row, apeMaternoIndex),
      getCell(row, primerNombreIndex),
      getCell(row, segundoNombreIndex),
    ]
      .filter(Boolean)
      .join(" ");

    return {
      dni: getCell(row, dniIndex),
      nombres,
      fechaNacimiento: getCell(row, nacimientoIndex),
      sexo: getCell(row, sexoIndex),
    };
  });
}

function addFooter(pdf: jsPDF, pageWidth: number, pageHeight: number) {
  pdf.setFillColor(4, 34, 74);
  pdf.roundedRect(10, pageHeight - 18, pageWidth - 20, 11, 3, 3, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("SOLINT Business Systems", 16, pageHeight - 11);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.text(
    "Documento generado automáticamente. Validar la trama editable antes del envío final.",
    66,
    pageHeight - 11
  );
}

function addSectionTitle(pdf: jsPDF, title: string, x: number, y: number) {
  pdf.setTextColor(4, 34, 74);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text(title, x, y);

  pdf.setDrawColor(255, 116, 21);
  pdf.setLineWidth(0.8);
  pdf.line(x, y + 3, x + 36, y + 3);
}

function addPersonalTable(params: {
  pdf: jsPDF;
  personal: PersonalNuevo[];
  startY: number;
  pageWidth: number;
  pageHeight: number;
}) {
  const { pdf, personal, startY, pageWidth, pageHeight } = params;

  const rowsPerPage = 18;
  const totalPages = Math.max(Math.ceil(personal.length / rowsPerPage), 1);

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    const currentRows = personal.slice(
      pageIndex * rowsPerPage,
      pageIndex * rowsPerPage + rowsPerPage
    );

    let y = pageIndex === 0 ? startY : 18;

    if (pageIndex > 0) {
      pdf.setFillColor(244, 247, 251);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      addSectionTitle(
        pdf,
        `Personal nuevo detectado - continuación ${pageIndex + 1}`,
        10,
        y
      );

      y += 10;
    }

    pdf.setFillColor(4, 34, 74);
    pdf.roundedRect(10, y, pageWidth - 20, 10, 3, 3, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.text("#", 15, y + 6.5);
    pdf.text("DNI", 25, y + 6.5);
    pdf.text("APELLIDOS Y NOMBRES", 58, y + 6.5);
    pdf.text("F. NACIMIENTO", 190, y + 6.5);
    pdf.text("SEXO", 245, y + 6.5);

    y += 10;

    if (currentRows.length === 0) {
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(10, y, pageWidth - 20, 14, 3, 3, "F");
      pdf.setDrawColor(220, 226, 235);
      pdf.roundedRect(10, y, pageWidth - 20, 14, 3, 3, "S");

      pdf.setTextColor(80, 92, 110);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.text("No se detectó personal nuevo para listar.", 15, y + 9);
    }

    currentRows.forEach((person, rowIndex) => {
      const absoluteIndex = pageIndex * rowsPerPage + rowIndex + 1;
      const rowY = y + rowIndex * 7.3;

      pdf.setFillColor(rowIndex % 2 === 0 ? 255 : 248, rowIndex % 2 === 0 ? 255 : 250, rowIndex % 2 === 0 ? 255 : 252);
      pdf.rect(10, rowY, pageWidth - 20, 7.3, "F");
      pdf.setDrawColor(226, 232, 240);
      pdf.line(10, rowY + 7.3, pageWidth - 10, rowY + 7.3);

      pdf.setTextColor(15, 23, 42);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);

      pdf.text(String(absoluteIndex), 15, rowY + 5);
      pdf.text(person.dni || "-", 25, rowY + 5);

      const name = person.nombres || "-";
      const clippedName =
        name.length > 62 ? `${name.slice(0, 62).trim()}...` : name;

      pdf.text(clippedName, 58, rowY + 5);
      pdf.text(person.fechaNacimiento || "-", 190, rowY + 5);
      pdf.text(person.sexo || "-", 245, rowY + 5);
    });

    addFooter(pdf, pageWidth, pageHeight);
  }
}

export async function generateExecutiveReportPdf(params: {
  userName: string;
  resultado: ResultadoComparacion;
}) {
  const { userName, resultado } = params;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const logoBase64 = await imageUrlToBase64("/images/solint-business-systems.png");
  const personalNuevo = buildPersonalNuevoFromSctr(resultado.tramaSctr);

  pdf.setFillColor(244, 247, 251);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Header premium sin barra lateral azul.
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(10, 8, pageWidth - 20, 46, 6, 6, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(10, 8, pageWidth - 20, 46, 6, 6, "S");

  if (logoBase64) {
    pdf.addImage(logoBase64, "PNG", 18, 15, 56, 24, undefined, "FAST");
  } else {
    pdf.setTextColor(0, 94, 184);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("SOLINT", 22, 29);
  }

  pdf.setTextColor(4, 34, 74);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(21);
  pdf.text("Reporte Ejecutivo de Comparación", 88, 24);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(80, 92, 110);
  pdf.text(
    "SCTR & VidaLey Manager Enterprise · Tramas, acumulados y personal nuevo detectado",
    88,
    33
  );

  pdf.setTextColor(0, 94, 184);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("SOLINT BUSINESS SYSTEMS", 88, 43);

  const estadoX = pageWidth - 75;
  pdf.setFillColor(
    resultado.coincidenCantidades ? 236 : 255,
    resultado.coincidenCantidades ? 253 : 247,
    resultado.coincidenCantidades ? 245 : 237
  );
  pdf.roundedRect(estadoX, 17, 54, 24, 5, 5, "F");
  pdf.setDrawColor(
    resultado.coincidenCantidades ? 16 : 245,
    resultado.coincidenCantidades ? 185 : 158,
    resultado.coincidenCantidades ? 129 : 11
  );
  pdf.roundedRect(estadoX, 17, 54, 24, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(
    resultado.coincidenCantidades ? 4 : 146,
    resultado.coincidenCantidades ? 120 : 64,
    resultado.coincidenCantidades ? 87 : 14
  );
  pdf.text("ESTADO DEL PROCESO", estadoX + 6, 26);

  pdf.setFontSize(11);
  pdf.text(
    resultado.coincidenCantidades ? "CONSISTENTE" : "OBSERVAR",
    estadoX + 27,
    36,
    { align: "center" }
  );

  // Metadata.
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(10, 60, pageWidth - 20, 22, 5, 5, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(10, 60, pageWidth - 20, 22, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(0, 94, 184);
  pdf.text("FECHA DE EMISIÓN", 18, 69);
  pdf.text("USUARIO", 112, 69);
  pdf.text("SISTEMA", 188, 69);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(4, 34, 74);
  pdf.text(fechaActual(), 18, 76);
  pdf.text(userName, 112, 76);
  pdf.text("SOLINT Business Systems v2", 188, 76);

  const cards = [
    ["Total General", resultado.totalGeneral, false],
    ["Acum. SCTR", resultado.totalAcumuladoSctr, false],
    ["Acum. VidaLey", resultado.totalAcumuladoVidaLey, false],
    ["Nuevos SCTR", resultado.nuevosSctr, true],
    ["Nuevos VidaLey", resultado.nuevosVidaLey, true],
  ] as const;

  const cardY = 92;
  const cardW = 50.8;
  const gap = 5;

  cards.forEach(([label, value, orange], index) => {
    const x = 10 + index * (cardW + gap);

    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(x, cardY, cardW, 33, 5, 5, "F");
    pdf.setDrawColor(220, 226, 235);
    pdf.roundedRect(x, cardY, cardW, 33, 5, 5, "S");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(110, 123, 145);
    pdf.text(label.toUpperCase(), x + 5, cardY + 9);

    pdf.setFontSize(20);
    if (orange) {
      pdf.setTextColor(255, 116, 21);
    } else {
      pdf.setTextColor(4, 34, 74);
    }
    pdf.text(formatoNumero(value), x + 5, cardY + 24);
  });

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(10, 134, 132, 34, 5, 5, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(10, 134, 132, 34, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(4, 34, 74);
  pdf.text("Archivos generados", 18, 146);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(80, 92, 110);
  [
    "TRAMA_SCTR.xlsx",
    "TRAMA_VIDALEY.xlsx",
    "ACUMULADO_SCTR_ACTUALIZADO.xlsx",
    "ACUMULADO_VIDALEY_ACTUALIZADO.xlsx",
    "REPORTE_EJECUTIVO_SOLINT.pdf",
  ].forEach((item, index) => {
    pdf.text(`• ${item}`, 18, 154 + index * 4.7);
  });

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(152, 134, pageWidth - 162, 34, 5, 5, "F");
  pdf.setDrawColor(220, 226, 235);
  pdf.roundedRect(152, 134, pageWidth - 162, 34, 5, 5, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(4, 34, 74);
  pdf.text("Observaciones", 160, 146);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(80, 92, 110);

  const observations =
    resultado.observaciones.length > 0
      ? resultado.observaciones
      : [
          "No se registraron observaciones críticas. Las cantidades de nuevos SCTR y VidaLey coinciden.",
        ];

  let obsY = 154;
  observations.slice(0, 3).forEach((item) => {
    const lines = pdf.splitTextToSize(`• ${item}`, pageWidth - 180);
    pdf.text(lines, 160, obsY);
    obsY += lines.length * 4.7 + 2;
  });

  addSectionTitle(pdf, "Personal nuevo detectado", 10, 181);
  addPersonalTable({
    pdf,
    personal: personalNuevo,
    startY: 187,
    pageWidth,
    pageHeight,
  });

  return pdf;
}

export function createPdfBlobUrl(pdf: jsPDF) {
  const blob = pdf.output("blob");
  return URL.createObjectURL(blob);
}
