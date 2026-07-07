FASE 38.3 - Historical Snapshot Manager

Copiar/reemplazar/agregar:

- src/lib/analytics/snapshot-history-engine.ts
- src/components/analytics/snapshot-history-panel.tsx
- src/app/(dashboard)/analytics/comparador/page.tsx
- src/components/analytics/local-trend-panel.tsx
- src/app/(dashboard)/analytics/people/page.tsx

Incluye:
- Historial local de snapshots.
- Guardar snapshot actual.
- Exportar snapshot JSON.
- Eliminar snapshot.
- Limpiar historial.
- Comparador histórico entre dos snapshots.
- Variaciones ejecutivas.
- Heatmap histórico.
- Módulo /analytics/comparador operativo.
- Integración en People Analytics.

Después:

npm run build
git add .
git commit -m "Fase 38.3 Historical Snapshot Manager"
git push
