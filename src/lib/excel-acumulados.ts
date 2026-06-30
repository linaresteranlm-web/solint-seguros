import * as XLSX from "xlsx-js-style";

export type TipoAcumulado = "SCTR" | "VIDALEY";

export type ArchivoProcesado = {
  archivo: string;
  estado: "OK" | "ERROR" | "OMITIDO";
  mensaje: string;
  filasLeidas: number;
  filasAgregadas: number;
};

export type ResultadoAcumulado = {
  tipo: TipoAcumulado;
  totalArchivos: number;
  totalFilasLeidas: number;
  totalFilasAgregadas: number;
  totalDuplicados: number;
  dniDuplicados: string[];
  reporte: ArchivoProcesado[];
  workbook: XLSX.WorkBook;
};

const CONFIG = {
  SCTR: {
    hojaObjetivo: "Modelo de Trama",
    nombreSalida: "ACUMULADO_SCTR.xlsx",
    nombreHojaSalida: "Modelo de Trama",
  },
  VIDALEY: {
    hojaObjetivo: "Trabajadores",
    nombreSalida: "ACUMULADO_VIDALEY.xlsx",
    nombreHojaSalida: "Trabajadores",
  },
} as const;

const thinBorder = {
  top: { style: "thin", color: { rgb: "000000" } },
  bottom: { style: "thin", color: { rgb: "000000" } },
  left: { style: "thin", color: { rgb: "000000" } },
  right: { style: "thin", color: { rgb: "000000" } },
};

function normalizarTexto(valor: unknown): string {
  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function normalizarClave(valor: unknown): string {
  return normalizarTexto(valor).replace(/[^a-z0-9]/g, "");
}

function normalizarDni(valor: unknown): string {
  return String(valor ?? "")
    .replace(/\D/g, "")
    .trim();
}

function buscarHoja(workbook: XLSX.WorkBook, nombreEsperado: string): string | null {
  const objetivo = normalizarTexto(nombreEsperado);

  return (
    workbook.SheetNames.find((nombre) => normalizarTexto(nombre) === objetivo) ??
    workbook.SheetNames.find((nombre) => normalizarTexto(nombre).includes(objetivo)) ??
    null
  );
}

function puntuarColumnaDni(celda: unknown): number {
  const texto = normalizarTexto(celda);
  const clave = normalizarClave(celda);

  if (!texto && !clave) return 0;

  if (clave === "numdoc") return 140;
  if (clave === "documentodeidentidad") return 140;
  if (clave === "nroidentidad") return 140;
  if (clave === "dni") return 120;
  if (clave.includes("numdoc")) return 110;
  if (texto.includes("documento de identidad")) return 110;
  if (texto.includes("nro identidad")) return 110;
  if (texto.includes("dni")) return 100;

  if (clave === "tipdoc") return -100;
  if (clave === "tipodoc") return -100;
  if (texto.includes("tipo") && texto.includes("documento")) return -100;

  return 0;
}

function encontrarColumnaDni(cabecera: unknown[]): number {
  let mejorIndex = -1;
  let mejorPuntaje = 0;

  cabecera.forEach((celda, index) => {
    const puntaje = puntuarColumnaDni(celda);

    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejorIndex = index;
    }
  });

  return mejorPuntaje >= 80 ? mejorIndex : -1;
}

function encontrarFilaCabecera(filas: unknown[][]): number {
  const index = filas.findIndex((fila) => encontrarColumnaDni(fila) >= 0);
  return index >= 0 ? index : 0;
}

function eliminarFilasVacias(filas: unknown[][]): unknown[][] {
  return filas.filter((fila) =>
    fila.some((celda) => String(celda ?? "").trim() !== "")
  );
}

function normalizarFilaALargoCabecera(fila: unknown[], largoCabecera: number): unknown[] {
  const filaNormalizada = [...fila];

  while (filaNormalizada.length < largoCabecera) {
    filaNormalizada.push("");
  }

  return filaNormalizada.slice(0, largoCabecera);
}

function aplicarFormatoBasico(worksheet: XLSX.WorkSheet) {
  const range = XLSX.utils.decode_range(worksheet["!ref"] ?? "A1:A1");

  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const address = XLSX.utils.encode_cell({ r: row, c: col });

      if (!worksheet[address]) {
        worksheet[address] = { t: "s", v: "" };
      }

      worksheet[address].s = {
        border: thinBorder,
        alignment: {
          vertical: "center",
          horizontal: row === 0 ? "center" : "left",
          wrapText: true,
        },
        font: {
          bold: row === 0,
        },
      };
    }
  }

  worksheet["!zoom"] = 80;
}

function crearHojaResumen(resultado: Omit<ResultadoAcumulado, "workbook">): XLSX.WorkSheet {
  const data = [
    ["RESUMEN", ""],
    ["Tipo", resultado.tipo],
    ["Total archivos", resultado.totalArchivos],
    ["Total filas leídas", resultado.totalFilasLeidas],
    ["Total filas agregadas", resultado.totalFilasAgregadas],
    ["Total duplicados omitidos", resultado.totalDuplicados],
    [],
    ["DETALLE POR ARCHIVO"],
    ["Archivo", "Estado", "Mensaje", "Filas leídas", "Filas agregadas"],
    ...resultado.reporte.map((item) => [
      item.archivo,
      item.estado,
      item.mensaje,
      item.filasLeidas,
      item.filasAgregadas,
    ]),
    [],
    ["DNI DUPLICADOS OMITIDOS"],
    ["DNI"],
    ...resultado.dniDuplicados.map((dni) => [dni]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  aplicarFormatoBasico(worksheet);
  return worksheet;
}

export async function generarAcumulado(
  archivos: File[],
  tipo: TipoAcumulado
): Promise<ResultadoAcumulado> {
  const config = CONFIG[tipo];

  const acumulado: unknown[][] = [];
  const reporte: ArchivoProcesado[] = [];
  const dniRegistrados = new Set<string>();
  const dniDuplicados = new Set<string>();

  let cabeceraPrincipal: unknown[] | null = null;
  let totalFilasLeidas = 0;
  let totalFilasAgregadas = 0;

  for (const archivo of archivos) {
    try {
      const buffer = await archivo.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true,
      });

      const nombreHoja = buscarHoja(workbook, config.hojaObjetivo);

      if (!nombreHoja) {
        reporte.push({
          archivo: archivo.name,
          estado: "OMITIDO",
          mensaje: `No se encontró la hoja "${config.hojaObjetivo}".`,
          filasLeidas: 0,
          filasAgregadas: 0,
        });
        continue;
      }

      const worksheet = workbook.Sheets[nombreHoja];

      const filasOriginales = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
        header: 1,
        defval: "",
        raw: false,
      });

      const filas = eliminarFilasVacias(filasOriginales);

      if (filas.length === 0) {
        reporte.push({
          archivo: archivo.name,
          estado: "OMITIDO",
          mensaje: "La hoja está vacía.",
          filasLeidas: 0,
          filasAgregadas: 0,
        });
        continue;
      }

      const filaCabeceraIndex = encontrarFilaCabecera(filas);
      const cabecera = filas[filaCabeceraIndex];
      const columnaDni = encontrarColumnaDni(cabecera);

      if (columnaDni < 0) {
        reporte.push({
          archivo: archivo.name,
          estado: "ERROR",
          mensaje:
            "No se pudo identificar la columna DNI. Se esperaba NumDoc, Nro Identidad o Documento de Identidad.",
          filasLeidas: 0,
          filasAgregadas: 0,
        });
        continue;
      }

      if (!cabeceraPrincipal) {
        cabeceraPrincipal = cabecera;
        acumulado.push(cabeceraPrincipal);
      }

      const filasData = filas.slice(filaCabeceraIndex + 1);
      let filasLeidasArchivo = 0;
      let filasAgregadasArchivo = 0;

      for (const fila of filasData) {
        const dni = normalizarDni(fila[columnaDni]);

        if (!dni) {
          continue;
        }

        filasLeidasArchivo++;
        totalFilasLeidas++;

        if (dniRegistrados.has(dni)) {
          dniDuplicados.add(dni);
          continue;
        }

        dniRegistrados.add(dni);

        const filaNormalizada = normalizarFilaALargoCabecera(
          fila,
          cabeceraPrincipal.length
        );

        acumulado.push(filaNormalizada);
        filasAgregadasArchivo++;
        totalFilasAgregadas++;
      }

      reporte.push({
        archivo: archivo.name,
        estado: "OK",
        mensaje: `Procesado desde hoja "${nombreHoja}". Columna DNI detectada: "${String(
          cabecera[columnaDni] ?? ""
        )}".`,
        filasLeidas: filasLeidasArchivo,
        filasAgregadas: filasAgregadasArchivo,
      });
    } catch (error) {
      reporte.push({
        archivo: archivo.name,
        estado: "ERROR",
        mensaje: error instanceof Error ? error.message : "Error desconocido.",
        filasLeidas: 0,
        filasAgregadas: 0,
      });
    }
  }

  if (!cabeceraPrincipal) {
    throw new Error(
      `No se pudo generar el acumulado ${tipo}. Ningún archivo válido fue procesado.`
    );
  }

  const workbookSalida = XLSX.utils.book_new();
  const hojaAcumulado = XLSX.utils.aoa_to_sheet(acumulado);
  aplicarFormatoBasico(hojaAcumulado);

  XLSX.utils.book_append_sheet(
    workbookSalida,
    hojaAcumulado,
    config.nombreHojaSalida
  );

  const resultadoSinWorkbook = {
    tipo,
    totalArchivos: archivos.length,
    totalFilasLeidas,
    totalFilasAgregadas,
    totalDuplicados: dniDuplicados.size,
    dniDuplicados: Array.from(dniDuplicados),
    reporte,
  };

  XLSX.utils.book_append_sheet(
    workbookSalida,
    crearHojaResumen(resultadoSinWorkbook),
    "Resumen"
  );

  return {
    ...resultadoSinWorkbook,
    workbook: workbookSalida,
  };
}

export function descargarAcumulado(resultado: ResultadoAcumulado) {
  const config = CONFIG[resultado.tipo];

  XLSX.writeFile(resultado.workbook, config.nombreSalida, {
    compression: true,
  });
}
