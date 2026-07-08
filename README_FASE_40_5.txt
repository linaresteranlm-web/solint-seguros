FASE 40.5 - PDF People Analytics Real Fix + validación build

Copiar/reemplazar:

1) src/lib/analytics/analytics-export-engine.ts
2) src/components/analytics/motion-ui.tsx

Qué corrige:
- El PDF de People Analytics deja de salir como una sola página apretada.
- Se reemplaza el motor antiguo que decía SOLINT Analytics / SOLINT SEGUROS.
- Nuevo PDF multipágina:
  1. Portada ejecutiva.
  2. Indicadores principales.
  3. Insights y recomendaciones.
  4. Rankings ejecutivos.
  5. Validación y calidad de datos.
- Branding general: SOLINT Business Suite.
- Módulo: People Analytics.
- Corrige error TypeScript en AnimatedCounter de motion-ui.tsx.

IMPORTANTE:
Si el PDF se sigue viendo igual, significa que el archivo src/lib/analytics/analytics-export-engine.ts no fue reemplazado en tu proyecto o el servidor dev sigue con caché.

Cómo validar:

1. Detén el servidor:
   CTRL + C

2. Limpia caché de Next:
   rmdir /s /q .next

3. Ejecuta:
   npm run build

4. Si compila, ejecuta:
   npm run dev

5. Entra a People Analytics, carga DATA GENERAL o Demo Mode.

6. Click en Generar PDF.

Debe abrirse un PDF de varias páginas. En la portada debe decir:
- Reporte Ejecutivo
- People Analytics
- Preparado por SOLINT Business Suite

Ya NO debe decir SOLINT SEGUROS en el recuadro naranja del PDF general.

Después:

git add .
git commit -m "Fase 40.5 PDF People Analytics Real Fix"
git push
