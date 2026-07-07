"use client";

import { AnalyticsDataset } from "@/lib/analytics/types";

const sedes = [
  "SANTA ELENA - LURÍN",
  "SANTA ELENA - CHANCAY",
  "TEXTIL NUEVO MUNDO",
  "PESQUERA PERUVIAN",
  "ASTILLERO ANDESA",
];

const cargos = [
  "AGENTE DE SEGURIDAD",
  "SUPERVISOR",
  "OPERADOR",
  "ASISTENTE RRHH",
  "COORDINADOR",
  "JEFE DE GRUPO",
];

const areas = ["OPERACIONES", "RRHH", "ADMINISTRACIÓN", "LOGÍSTICA"];
const departamentos = ["LIMA", "CALLAO", "PIURA", "JUNÍN", "LAMBAYEQUE"];
const provincias = ["LIMA", "CALLAO", "PAITA", "HUANCAYO", "CHICLAYO"];
const distritos = ["LURÍN", "CHANCAY", "CALLAO", "PAITA", "HUANCAYO"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateBack(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function birthDate(index: number) {
  const year = 1975 + (index % 25);
  const month = (index % 12) + 1;
  const day = (index % 27) + 1;

  return `${pad(day)}/${pad(month)}/${year}`;
}

export function buildDemoPeopleDataset(): AnalyticsDataset {
  const rows = Array.from({ length: 180 }).map((_, index) => {
    const isExit = index % 17 === 0;
    const sede = sedes[index % sedes.length];
    const cargo = cargos[index % cargos.length];
    const area = areas[index % areas.length];

    return {
      "Situación": isExit ? "BAJA" : "ACTIVO",
      Codigo: `C${String(index + 1).padStart(5, "0")}`,
      "Ape. Paterno": `APELLIDO${index + 1}`,
      "Ape. Materno": `MATERNO${index + 1}`,
      Nombres: `COLABORADOR ${index + 1}`,
      Doc: "DNI",
      "Nro Identidad": `${70000000 + index}`,
      Sexo: index % 3 === 0 ? "F" : "M",
      FecIng: dateBack(30 + index * 11),
      Feccese: isExit ? dateBack(index % 25) : "",
      "Fec.Nacim.": birthDate(index),
      "Descrip. Establecimiento": sede,
      Area: area,
      Cargo: cargo,
      "Centro Costo": `CC-${1000 + (index % 12)}`,
      "Descrip. Centro Costo": sede,
      Distrito: distritos[index % distritos.length],
      Provincia: provincias[index % provincias.length],
      Departamento: departamentos[index % departamentos.length],
      Supervisor: `SUPERVISOR ${index % 8}`,
    };
  });

  return {
    id: crypto.randomUUID(),
    domain: "people",
    name: "DEMO_DATA_GENERAL_SOLINT.xlsx",
    rows,
    columns: [
      "Situación",
      "Codigo",
      "Ape. Paterno",
      "Ape. Materno",
      "Nombres",
      "Doc",
      "Nro Identidad",
      "Sexo",
      "FecIng",
      "Feccese",
      "Fec.Nacim.",
      "Descrip. Establecimiento",
      "Area",
      "Cargo",
      "Centro Costo",
      "Descrip. Centro Costo",
      "Distrito",
      "Provincia",
      "Departamento",
      "Supervisor",
    ],
    createdAt: new Date().toISOString(),
  };
}
