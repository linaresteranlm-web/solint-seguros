FASE 40.9 - Reporte CORPRISEG v5 con página específica de Rotación

Copiar/reemplazar:

src/lib/analytics/analytics-export-engine.ts

Incluye:
- Mantiene PDF CORPRISEG estable.
- Agrega página específica: Indicadores de Rotación.
- Fórmula visible:
  Rotación = Ceses del periodo / Headcount promedio del periodo × 100
- Detecta automáticamente KPIs de rotación, ceses, ingresos y headcount.
- Agrega lectura ejecutiva.
- Mantiene pie:
  Elaborado por SOLINT Business Suite © LC2026

Validación:
CTRL + C
rmdir /s /q .next
npm run build
npm run dev

Luego:
1. Abrir People Analytics.
2. Cargar DATA GENERAL o Demo Mode.
3. Generar Reporte CORPRISEG.
4. Debe tener 6 páginas:
   - Portada
   - Indicadores principales
   - Indicadores de rotación
   - Insights y recomendaciones
   - Rankings
   - Validación

Después:
git add .
git commit -m "Fase 40.9 Reporte CORPRISEG rotacion v5"
git push
