FASE 35 - Adaptador real DATA GENERAL Los Halcones

Copiar/reemplazar/agregar:

- src/lib/analytics/data-general-adapter.ts
- src/lib/analytics/excel-dataset-reader.ts
- src/lib/analytics/people-analytics-engine.ts
- src/lib/analytics/people-dashboard-engine.ts
- src/components/analytics/people-filter-bar.tsx
- src/app/(dashboard)/analytics/people/page.tsx

Incluye:
- Detección automática de cabecera real.
- Adaptación al formato DATA GENERAL real.
- Mapeo:
  Situación -> Estado
  Nro Identidad -> Documento
  Ape. Paterno + Ape. Materno + Nombres -> Nombres
  FecIng -> FechaIngreso
  Feccese -> FechaCese
  Descrip. Establecimiento -> Sede
  Area -> Área
  Cargo -> Cargo
  Descrip. Centro Costo -> ClienteUnidad
  Distrito/Provincia/Departamento -> ubicación
- Limpieza de DNI con caracteres extraños.
- Filtros por sede, área, cargo, estado, departamento y provincia.
- Rankings por sede, cargo, área y departamento.

Después:

npm run build
git add .
git commit -m "Fase 35 Adaptador DATA GENERAL real"
git push
