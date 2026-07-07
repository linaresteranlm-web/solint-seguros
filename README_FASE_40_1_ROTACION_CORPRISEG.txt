FASE 40.1 - Indicadores de Rotación Gerencial CORPRISEG

Copiar/reemplazar/agregar:

AGREGAR:
- src/lib/analytics/rotation-indicators-engine.ts
- src/lib/analytics/rotation-report-export.ts
- src/components/analytics/rotation-indicators-panel.tsx
- src/app/(dashboard)/analytics/rotacion/page.tsx

REEMPLAZAR:
- src/components/analytics/analytics-shell.tsx
- src/lib/app-version.ts
- src/components/layout/topbar.tsx
- src/components/layout/footer.tsx
- src/app/layout.tsx
- public/manifest.webmanifest
- src/components/analytics/motion-ui.tsx

Incluye:
- Nuevo módulo /analytics/rotacion.
- Indicadores de rotación enero-junio por defecto.
- Selector de año, mes inicial y mes final.
- Fórmula visible: Rotación = Ceses / Headcount promedio x 100.
- Headcount inicial, headcount final y headcount promedio mensual.
- Ingresos, ceses, rotación mensual y rotación acumulada.
- Rankings por sede/unidad, cargo, área y departamento.
- Hallazgos, conclusiones y recomendaciones automáticas.
- Exportación PDF gerencial con branding CORPRISEG y firma SOLINT Business Suite.
- Exportación Excel gerencial con hojas: Portada, Rotación Mensual, Rankings y Resumen Ejecutivo.
- Cambio de marca general del sistema a SOLINT Business Suite.
- SOLINT Seguros queda como módulo interno, no como nombre global.
- Corrección TypeScript en motion-ui.tsx.

IMPORTANTE SOBRE LOGO CORPRISEG:
- El PDF usa branding textual y colores CORPRISEG.
- Si luego tienes el logo oficial en PNG, colócalo en:
  public/images/corpriseg-logo.png
  y en la siguiente fase lo insertamos visualmente dentro del PDF/Excel.

Validado:
- npm run build compila correctamente.

Después:

npm run build
git add .
git commit -m "Fase 40.1 Indicadores Rotacion CORPRISEG"
git push
