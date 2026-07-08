FASE 40.7 - Reportes CORPRISEG Corporate v4

Copiar/reemplazar:

1) src/lib/analytics/analytics-export-engine.ts
2) src/components/analytics/analytics-export-actions.tsx
3) public/images/README_CORPRISEG_LOGO.txt

Objetivo:
- Todos los reportes ejecutivos para gerencia/jefaturas salen con branding CORPRISEG.
- SOLINT aparece solo como elaborador técnico en el pie.

Pie de página:
Elaborado por SOLINT Business Suite © LC2026

Logo:
Colocar logo en:
public/images/corpriseg-logo.png

Validación:
1. CTRL + C
2. rmdir /s /q .next
3. npm run build
4. npm run dev
5. Abrir People Analytics.
6. Generar reporte.
7. Debe verse:
   - Portada CORPRISEG
   - Colores azul/naranja
   - Logo CORPRISEG si existe
   - Pie SOLINT Business Suite © LC2026
   - No debe verse SOLINT SEGUROS como marca del reporte.

Después:
git add .
git commit -m "Fase 40.7 Reportes CORPRISEG Corporate v4"
git push
