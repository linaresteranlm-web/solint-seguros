FASE 34 - People Analytics Dashboard Ejecutivo + Filtros

Copiar/reemplazar/agregar:

- src/lib/analytics/people-dashboard-engine.ts
- src/components/analytics/people-filter-bar.tsx
- src/components/analytics/people-ranking-card.tsx
- src/components/analytics/management-mode-card.tsx
- src/app/(dashboard)/analytics/people/page.tsx

Incluye:
- Filtros dinámicos por Sede, Cargo y Estado.
- KPIs recalculados según filtros.
- Modo Gerencia.
- Ranking por sede.
- Ranking por cargo.
- Distribución por estado.
- Nuevas métricas ejecutivas.
- Mantiene carga real de DATA GENERAL.

Después:

npm run build
git add .
git commit -m "Fase 34 People Analytics Dashboard filtros"
git push
