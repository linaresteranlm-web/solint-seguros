FASE 40.8 - PDF Engine CORPRISEG Estable

Copiar/reemplazar:

src/lib/analytics/analytics-export-engine.ts

Qué corrige:
- Elimina los errores de TypeScript por spread operator en colores.
- Mantiene branding CORPRISEG para reportes.
- Pie de página: Elaborado por SOLINT Business Suite © LC2026.
- PDF multipágina:
  1. Portada
  2. Indicadores principales
  3. Insights y recomendaciones
  4. Rankings
  5. Validación

Validación:
CTRL + C
rmdir /s /q .next
npm run build
npm run dev

Logo:
public/images/corpriseg-logo.png

Después:
git add .
git commit -m "Fase 40.8 PDF Engine CORPRISEG estable"
git push
