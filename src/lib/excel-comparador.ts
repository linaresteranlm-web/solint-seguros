import * as XLSX from "xlsx-js-style";
import { SCTR_GREEN_HEADERS as SCTR_GREEN_HEADERS_LIST } from "@/lib/trama-defaults";
import { getTramaSettings } from "@/lib/trama-settings";

export type FilaExcel = Array<string | number | Date | null>;

export type TablaGenerada = {
  nombreHoja: string;
  cabecera: string[];
  filas: FilaExcel[];
};

export type ResultadoComparacion = {
  totalGeneral: number;
  totalAcumuladoSctr: number;
  totalAcumuladoVidaLey: number;
  nuevosSctr: number;
  nuevosVidaLey: number;
  coincidenCantidades: boolean;
  tramaSctr: TablaGenerada;
  tramaVidaLey: TablaGenerada;
  workbookAcumuladoSctrActualizado: XLSX.WorkBook;
  workbookAcumuladoVidaLeyActualizado: XLSX.WorkBook;
  observaciones: string[];
};

type DatosHoja = {
  nombreHoja: string;
  cabecera: string[];
  filas: FilaExcel[];
  columnaDni: number;
};

const SCTR_HEADERS = [
  "Tipo Documento",
  "Documento de Identidad",
  "Apellido Paterno",
  "Apellido Materno",
  "Primer Nombre",
  "Segundo Nombre",
  "Fecha Nacimiento",
  "Sexo",
  "Nacionalidad",
  "Ocupación",
  "Departamento",
  "Provincia",
  "Distrito",
  "Direccion",
  "RUC",
  "Nivel Riesgo",
  "Mes de Planilla",
  "Moneda Sueldo",
  "Importe Sueldo",
  "Condicion",
  "Proy/Obra",
  "Tipo Producto",
  "Tipo Movimiento",
  "Fecha Inicio Vigencia",
  "Moneda Prima",
  "Codigo Asegurado",
];

const VIDALEY_HEADERS = [
  "TipDoc",
  "NumDoc",
  "ApePaterno",
  "ApeMaterno",
  "Nombres",
  "NombreCompleto",
  "Nacimiento",
  "Sueldo",
  "Ocupacion",
  "TipRiesgo",
  "LugarExposicion",
  "Sexo",
];

const SCTR_GREEN_HEADERS = new Set(SCTR_GREEN_HEADERS_LIST);

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

function limpiarTexto(valor: unknown): string {
  return String(valor ?? "").trim();
}

function obtenerSexo(valor: unknown): string {
  const texto = normalizarTexto(valor);

  if (texto.startsWith("masculino") || texto === "m") return "M";
  if (texto.startsWith("femenino") || texto === "f") return "F";

  return limpiarTexto(valor);
}

function obtenerTipoDocumentoVidaLey(valor: unknown): string {
  const texto = limpiarTexto(valor);

  if (texto === "01" || texto === "1" || texto.toUpperCase() === "DNI") {
    return "DNI";
  }

  return texto;
}

function obtenerTipoDocumentoSctr(valor: unknown): string {
  const texto = limpiarTexto(valor);

  if (texto === "01" || texto === "1" || texto.toUpperCase() === "DNI") {
    return "1";
  }

  return texto;
}

function dividirNombres(nombres: unknown) {
  const partes = limpiarTexto(nombres).split(/\s+/).filter(Boolean);

  return {
    primerNombre: partes[0] ?? "",
    segundoNombre: partes.slice(1).join(" "),
    nombresCompletos: partes.join(" "),
  };
}

function eliminarFilasVacias(filas: FilaExcel[]): FilaExcel[] {
  return filas.filter((fila) =>
    fila.some((celda) => String(celda ?? "").trim() !== "")
  );
}

function puntuarColumnaDni(celda: unknown): number {
  const texto = normalizarTexto(celda);
  const clave = normalizarClave(celda);

  if (!texto && !clave) return 0;

  if (clave === "nroidentidad") return 160;
  if (texto === "nro identidad") return 160;
  if (texto.includes("nro identidad")) return 155;

  if (clave === "numdoc") return 150;
  if (clave === "documentodeidentidad") return 150;

  if (clave === "dni") return 130;
  if (clave === "nrodoc") return 130;
  if (clave === "nrodocumento") return 130;
  if (clave === "numerodocumento") return 130;
  if (texto.includes("documento de identidad")) return 130;
  if (texto.includes("dni")) return 110;

  if (clave === "doc") return -100;
  if (clave === "tipdoc") return -100;
  if (clave === "tipodoc") return -100;
  if (texto.includes("tipo") && texto.includes("documento")) return -100;

  return 0;
}

function encontrarColumnaDni(cabecera: FilaExcel): number {
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

function encontrarFilaCabecera(filas: FilaExcel[]): number {
  const index = filas.findIndex((fila) => encontrarColumnaDni(fila) >= 0);
  return index >= 0 ? index : 0;
}

function buscarHojaPreferida(
  workbook: XLSX.WorkBook,
  nombresPreferidos: string[]
): string {
  for (const nombrePreferido of nombresPreferidos) {
    const objetivo = normalizarTexto(nombrePreferido);

    const exacta = workbook.SheetNames.find(
      (nombre) => normalizarTexto(nombre) === objetivo
    );

    if (exacta) return exacta;

    const parcial = workbook.SheetNames.find((nombre) =>
      normalizarTexto(nombre).includes(objetivo)
    );

    if (parcial) return parcial;
  }

  return workbook.SheetNames[0];
}

async function leerWorkbook(file: File): Promise<XLSX.WorkBook> {
  const buffer = await file.arrayBuffer();

  return XLSX.read(buffer, {
    type: "array",
    cellDates: true,
  });
}

async function leerDatosHoja(
  file: File,
  nombresPreferidos: string[]
): Promise<DatosHoja> {
  const workbook = await leerWorkbook(file);
  const nombreHoja = buscarHojaPreferida(workbook, nombresPreferidos);
  const worksheet = workbook.Sheets[nombreHoja];

  const filasOriginales = XLSX.utils.sheet_to_json<FilaExcel>(worksheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  const filasLimpias = eliminarFilasVacias(filasOriginales);
  const filaCabeceraIndex = encontrarFilaCabecera(filasLimpias);
  const cabecera = filasLimpias[filaCabeceraIndex].map((x) => limpiarTexto(x));
  const columnaDni = encontrarColumnaDni(cabecera);

  if (columnaDni < 0) {
    throw new Error(
      `No se pudo identificar la columna de documento en ${file.name}. En General debe ser "Nro Identidad".`
    );
  }

  const filas = filasLimpias.slice(filaCabeceraIndex + 1).filter((fila) => {
    const dni = normalizarDni(fila[columnaDni]);
    return Boolean(dni);
  });

  return {
    nombreHoja,
    cabecera,
    filas,
    columnaDni,
  };
}

function crearIndiceCabecera(cabecera: string[]) {
  const map = new Map<string, number>();

  cabecera.forEach((columna, index) => {
    map.set(normalizarClave(columna), index);
  });

  return map;
}

function getByHeader(
  fila: FilaExcel,
  index: Map<string, number>,
  posibles: string[]
): string | number | Date | null {
  for (const nombre of posibles) {
    const idx = index.get(normalizarClave(nombre));

    if (idx !== undefined) {
      return fila[idx] ?? "";
    }
  }

  return "";
}

function crearSetDni(datos: DatosHoja): Set<string> {
  const set = new Set<string>();

  for (const fila of datos.filas) {
    const dni = normalizarDni(fila[datos.columnaDni]);
    if (dni) set.add(dni);
  }

  return set;
}

function obtenerNuevosDesdeGeneral(
  general: DatosHoja,
  acumulado: DatosHoja
): FilaExcel[] {
  const dniAcumulado = crearSetDni(acumulado);
  const nuevos: FilaExcel[] = [];
  const dniNuevos = new Set<string>();

  for (const filaGeneral of general.filas) {
    const dni = normalizarDni(filaGeneral[general.columnaDni]);

    if (!dni) continue;
    if (dniAcumulado.has(dni)) continue;
    if (dniNuevos.has(dni)) continue;

    dniNuevos.add(dni);
    nuevos.push(filaGeneral);
  }

  return nuevos;
}

function mapGeneralToSctr(fila: FilaExcel, cabeceraGeneral: string[]): FilaExcel {
  const settings = getTramaSettings();
  const index = crearIndiceCabecera(cabeceraGeneral);
  const nombres = dividirNombres(getByHeader(fila, index, ["Nombres"]));

  return SCTR_HEADERS.map((header) => {
    switch (normalizarClave(header)) {
      case "tipodocumento":
        return obtenerTipoDocumentoSctr(getByHeader(fila, index, ["Doc"]));
      case "documentodeidentidad":
        return normalizarDni(getByHeader(fila, index, ["Nro Identidad"]));
      case "apellidopaterno":
        return limpiarTexto(getByHeader(fila, index, ["Ape. Paterno"]));
      case "apellidomaterno":
        return limpiarTexto(getByHeader(fila, index, ["Ape. Materno"]));
      case "primernombre":
        return nombres.primerNombre;
      case "segundonombre":
        return nombres.segundoNombre;
      case "fechanacimiento":
        return limpiarTexto(getByHeader(fila, index, ["Fec.Nacim.", "Fecha Nacimiento"]));
      case "sexo":
        return obtenerSexo(getByHeader(fila, index, ["Sexo"]));
      case "nivelriesgo":
        return settings.sctr.nivelRiesgo;
      case "mesdeplanilla":
        return settings.sctr.mesPlanilla;
      case "monedasueldo":
        return settings.sctr.monedaSueldo;
      case "importesueldo":
        return settings.sctr.importeSueldo;
      default:
        return "";
    }
  });
}

function mapGeneralToVidaLey(
  fila: FilaExcel,
  cabeceraGeneral: string[]
): FilaExcel {
  const settings = getTramaSettings();
  const index = crearIndiceCabecera(cabeceraGeneral);
  const nombres = dividirNombres(getByHeader(fila, index, ["Nombres"]));

  return VIDALEY_HEADERS.map((header) => {
    switch (normalizarClave(header)) {
      case "tipdoc":
        return obtenerTipoDocumentoVidaLey(getByHeader(fila, index, ["Doc"]));
      case "numdoc":
        return normalizarDni(getByHeader(fila, index, ["Nro Identidad"]));
      case "apepaterno":
        return limpiarTexto(getByHeader(fila, index, ["Ape. Paterno"]));
      case "apematerno":
        return limpiarTexto(getByHeader(fila, index, ["Ape. Materno"]));
      case "nombres":
        return nombres.nombresCompletos;
      case "nombrecompleto":
        return "";
      case "nacimiento":
        return limpiarTexto(getByHeader(fila, index, ["Fec.Nacim.", "Fecha Nacimiento"]));
      case "sueldo":
        return settings.vidaley.sueldo;
      case "ocupacion":
        return settings.vidaley.ocupacion;
      case "tipriesgo":
        return settings.vidaley.tipRiesgo;
      case "lugarexposicion":
        return settings.vidaley.lugarExposicion;
      case "sexo":
        return obtenerSexo(getByHeader(fila, index, ["Sexo"]));
      default:
        return "";
    }
  });
}

function mapFilaTramaToAcumulado(
  filaTrama: FilaExcel,
  cabeceraTrama: string[],
  cabeceraAcumulado: string[]
): FilaExcel {
  const indexTrama = crearIndiceCabecera(cabeceraTrama);

  return cabeceraAcumulado.map((headerAcumulado) => {
    const idx = indexTrama.get(normalizarClave(headerAcumulado));

    if (idx !== undefined) {
      return filaTrama[idx] ?? "";
    }

    return "";
  });
}

function normalizarFilaALargoCabecera(fila: FilaExcel, largo: number): FilaExcel {
  const nuevaFila = [...fila];

  while (nuevaFila.length < largo) {
    nuevaFila.push("");
  }

  return nuevaFila.slice(0, largo);
}

function esColumnaImporteDecimal(header: string): boolean {
  const clave = normalizarClave(header);

  return clave === "sueldo" || clave === "importesueldo";
}

function esColumnaMonedaEntera(header: string): boolean {
  const clave = normalizarClave(header);

  return clave === "monedasueldo";
}

function convertirNumeroExcel(valor: unknown): number | null {
  const texto = String(valor ?? "").trim();

  if (!texto) return null;

  const limpio = texto.replace(/,/g, "");
  const numero = Number(limpio);

  return Number.isFinite(numero) ? numero : null;
}

function aplicarFormatoHoja(
  worksheet: XLSX.WorkSheet,
  cabecera: string[],
  filas: FilaExcel[],
  options?: {
    sctrGreenHeaders?: boolean;
  }
) {
  const range = XLSX.utils.decode_range(worksheet["!ref"] ?? "A1:A1");

  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const address = XLSX.utils.encode_cell({ r: row, c: col });

      if (!worksheet[address]) {
        worksheet[address] = { t: "s", v: "" };
      }

      const header = cabecera[col] ?? "";
      const isHeader = row === 0;
      const isGreenHeader =
        isHeader && options?.sctrGreenHeaders && SCTR_GREEN_HEADERS.has(header);

      if (!isHeader && esColumnaImporteDecimal(header)) {
        const numero = convertirNumeroExcel(worksheet[address].v);

        if (numero !== null) {
          worksheet[address].t = "n";
          worksheet[address].v = numero;
          worksheet[address].z = "#,##0.00";
        }
      }

      if (!isHeader && esColumnaMonedaEntera(header)) {
        const numero = convertirNumeroExcel(worksheet[address].v);

        if (numero !== null) {
          worksheet[address].t = "n";
          worksheet[address].v = numero;
          worksheet[address].z = "0";
        }
      }

      worksheet[address].s = {
        border: thinBorder,
        alignment: {
          vertical: "center",
          horizontal: isHeader ? "center" : "left",
          wrapText: true,
        },
        font: {
          bold: isHeader,
          color: { rgb: "000000" },
        },
        fill: isHeader
          ? {
              fgColor: {
                rgb: isGreenHeader ? "00FF00" : "FFFFFF",
              },
            }
          : undefined,
      };
    }
  }

  worksheet["!cols"] = cabecera.map((header, index) => {
    const maxContent = Math.max(
      header.length,
      ...filas.map((fila) => String(fila[index] ?? "").length)
    );

    return {
      wch: Math.min(Math.max(maxContent + 3, 12), 34),
    };
  });

  worksheet["!rows"] = [{ hpt: 32 }];
  worksheet["!zoom"] = 80;
}

function crearWorkbookDesdeTabla(
  tabla: TablaGenerada,
  options?: {
    sctrGreenHeaders?: boolean;
  }
): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  const data = [
    tabla.cabecera,
    ...tabla.filas.map((fila) =>
      normalizarFilaALargoCabecera(fila, tabla.cabecera.length)
    ),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  aplicarFormatoHoja(worksheet, tabla.cabecera, tabla.filas, options);

  XLSX.utils.book_append_sheet(workbook, worksheet, tabla.nombreHoja);

  return workbook;
}

function crearWorkbookAcumuladoActualizado(
  nombreHoja: string,
  cabeceraAcumulado: string[],
  filasAcumuladoOriginal: FilaExcel[],
  filasNuevasMapeadas: FilaExcel[],
  resumen: FilaExcel[],
  options?: {
    sctrGreenHeaders?: boolean;
  }
): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  const filasFinales = [
    ...filasAcumuladoOriginal.map((fila) =>
      normalizarFilaALargoCabecera(fila, cabeceraAcumulado.length)
    ),
    ...filasNuevasMapeadas.map((fila) =>
      normalizarFilaALargoCabecera(fila, cabeceraAcumulado.length)
    ),
  ];

  const hojaPrincipal = XLSX.utils.aoa_to_sheet([
    cabeceraAcumulado,
    ...filasFinales,
  ]);

  aplicarFormatoHoja(hojaPrincipal, cabeceraAcumulado, filasFinales, options);

  XLSX.utils.book_append_sheet(workbook, hojaPrincipal, nombreHoja);

  const hojaResumen = XLSX.utils.aoa_to_sheet(resumen);
  XLSX.utils.book_append_sheet(workbook, hojaResumen, "Resumen");

  return workbook;
}

function crearResumenComparacion({
  tipo,
  totalGeneral,
  totalAcumulado,
  totalNuevos,
  hojaGeneral,
  hojaAcumulado,
}: {
  tipo: "SCTR" | "VIDALEY";
  totalGeneral: number;
  totalAcumulado: number;
  totalNuevos: number;
  hojaGeneral: string;
  hojaAcumulado: string;
}): FilaExcel[] {
  return [
    ["RESUMEN", ""],
    ["Tipo", tipo],
    ["Columna comparada en General", "Nro Identidad"],
    ["Hoja General", hojaGeneral],
    ["Hoja Acumulado", hojaAcumulado],
    ["Total General", totalGeneral],
    ["Total Acumulado", totalAcumulado],
    ["Nuevos detectados", totalNuevos],
  ];
}

export async function compararYGenerarArchivos(params: {
  generalFile: File;
  acumuladoSctrFile: File;
  acumuladoVidaLeyFile: File;
}): Promise<ResultadoComparacion> {
  const general = await leerDatosHoja(params.generalFile, [
    "General",
    "Hoja1",
    "Trabajadores",
    "Modelo de Trama",
  ]);

  const acumuladoSctr = await leerDatosHoja(params.acumuladoSctrFile, [
    "Modelo de Trama",
    "Acumulado SCTR",
    "SCTR",
  ]);

  const acumuladoVidaLey = await leerDatosHoja(params.acumuladoVidaLeyFile, [
    "Trabajadores",
    "Acumulado VidaLey",
    "VidaLey",
  ]);

  const nuevosSctrGeneral = obtenerNuevosDesdeGeneral(general, acumuladoSctr);
  const nuevosVidaLeyGeneral = obtenerNuevosDesdeGeneral(general, acumuladoVidaLey);

  const filasTramaSctr = nuevosSctrGeneral.map((fila) =>
    mapGeneralToSctr(fila, general.cabecera)
  );

  const filasTramaVidaLey = nuevosVidaLeyGeneral.map((fila) =>
    mapGeneralToVidaLey(fila, general.cabecera)
  );

  const nuevasFilasSctrParaAcumulado = filasTramaSctr.map((fila) =>
    mapFilaTramaToAcumulado(fila, SCTR_HEADERS, acumuladoSctr.cabecera)
  );

  const nuevasFilasVidaLeyParaAcumulado = filasTramaVidaLey.map((fila) =>
    mapFilaTramaToAcumulado(fila, VIDALEY_HEADERS, acumuladoVidaLey.cabecera)
  );

  const resumenSctr = crearResumenComparacion({
    tipo: "SCTR",
    totalGeneral: general.filas.length,
    totalAcumulado: acumuladoSctr.filas.length,
    totalNuevos: filasTramaSctr.length,
    hojaGeneral: general.nombreHoja,
    hojaAcumulado: acumuladoSctr.nombreHoja,
  });

  const resumenVidaLey = crearResumenComparacion({
    tipo: "VIDALEY",
    totalGeneral: general.filas.length,
    totalAcumulado: acumuladoVidaLey.filas.length,
    totalNuevos: filasTramaVidaLey.length,
    hojaGeneral: general.nombreHoja,
    hojaAcumulado: acumuladoVidaLey.nombreHoja,
  });

  const observaciones: string[] = [];

  if (filasTramaSctr.length !== filasTramaVidaLey.length) {
    observaciones.push(
      "La cantidad de nuevos SCTR y nuevos VidaLey no coincide. Revisar diferencias antes de enviar tramas."
    );
  }

  return {
    totalGeneral: general.filas.length,
    totalAcumuladoSctr: acumuladoSctr.filas.length,
    totalAcumuladoVidaLey: acumuladoVidaLey.filas.length,
    nuevosSctr: filasTramaSctr.length,
    nuevosVidaLey: filasTramaVidaLey.length,
    coincidenCantidades: filasTramaSctr.length === filasTramaVidaLey.length,
    observaciones,
    tramaSctr: {
      nombreHoja: "Modelo de Trama",
      cabecera: SCTR_HEADERS,
      filas: filasTramaSctr,
    },
    tramaVidaLey: {
      nombreHoja: "Trabajadores",
      cabecera: VIDALEY_HEADERS,
      filas: filasTramaVidaLey,
    },
    workbookAcumuladoSctrActualizado: crearWorkbookAcumuladoActualizado(
      acumuladoSctr.nombreHoja,
      acumuladoSctr.cabecera,
      acumuladoSctr.filas,
      nuevasFilasSctrParaAcumulado,
      resumenSctr,
      { sctrGreenHeaders: true }
    ),
    workbookAcumuladoVidaLeyActualizado: crearWorkbookAcumuladoActualizado(
      acumuladoVidaLey.nombreHoja,
      acumuladoVidaLey.cabecera,
      acumuladoVidaLey.filas,
      nuevasFilasVidaLeyParaAcumulado,
      resumenVidaLey
    ),
  };
}

export function crearWorkbookEditable(
  tabla: TablaGenerada,
  tipo?: "SCTR" | "VIDALEY"
): XLSX.WorkBook {
  return crearWorkbookDesdeTabla(tabla, {
    sctrGreenHeaders: tipo === "SCTR",
  });
}

export function descargarWorkbook(workbook: XLSX.WorkBook, nombreArchivo: string) {
  XLSX.writeFile(workbook, nombreArchivo, {
    compression: true,
  });
}
