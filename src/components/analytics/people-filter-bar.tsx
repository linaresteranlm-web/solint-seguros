"use client";

import { Filter, RotateCcw } from "lucide-react";
import {
  EMPTY_PEOPLE_FILTERS,
  PeopleFilters,
  uniqueValues,
} from "@/lib/analytics/people-dashboard-engine";
import { AnalyticsDataset } from "@/lib/analytics/types";

export function PeopleFilterBar({
  dataset,
  filters,
  onChange,
}: {
  dataset: AnalyticsDataset;
  filters: PeopleFilters;
  onChange: (filters: PeopleFilters) => void;
}) {
  const sedes = uniqueValues(dataset, "Sede");
  const areas = uniqueValues(dataset, "Area");
  const cargos = uniqueValues(dataset, "Cargo");
  const estados = uniqueValues(dataset, "Estado");
  const departamentos = uniqueValues(dataset, "Departamento");
  const provincias = uniqueValues(dataset, "Provincia");

  function update<K extends keyof PeopleFilters>(key: K, value: string) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <section className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="grid gap-4 xl:grid-cols-[auto_1fr_auto] xl:items-end">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#005eb8]">
            <Filter className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#005eb8]">
              Filtros dinámicos
            </p>
            <h2 className="mt-1 text-xl font-black text-[#04224a]">
              DATA GENERAL
            </h2>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <FilterSelect label="Sede" value={filters.sede} options={sedes} onChange={(value) => update("sede", value)} />
          <FilterSelect label="Área" value={filters.area} options={areas} onChange={(value) => update("area", value)} />
          <FilterSelect label="Cargo" value={filters.cargo} options={cargos} onChange={(value) => update("cargo", value)} />
          <FilterSelect label="Estado" value={filters.estado} options={estados} onChange={(value) => update("estado", value)} />
          <FilterSelect label="Departamento" value={filters.departamento} options={departamentos} onChange={(value) => update("departamento", value)} />
          <FilterSelect label="Provincia" value={filters.provincia} options={provincias} onChange={(value) => update("provincia", value)} />
        </div>

        <button
          type="button"
          onClick={() => onChange(EMPTY_PEOPLE_FILTERS)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-[#04224a] transition hover:bg-blue-50 hover:text-[#005eb8]"
        >
          <RotateCcw className="h-4 w-4" />
          Limpiar
        </button>
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-[#04224a] transition focus:border-[#005eb8]"
      >
        <option value="TODOS">Todos</option>
        {options.map((option) => (
          <option key={`${label}-${option}`} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
