FASE 40.6 - Export Center v3 + Validación visible del PDF

Copiar/reemplazar:

1) src/lib/analytics/analytics-export-engine.ts
2) src/components/analytics/analytics-export-actions.tsx

Qué mejora:
- El panel de exportación ahora muestra claramente "PDF Engine v3 Multipágina".
- Los botones indican "Abrir PDF Ejecutivo v3" y "Descargar PDF v3".
- Si ves estos textos en pantalla, significa que el componente nuevo sí fue aplicado.
- Incluye nuevamente el motor de PDF multipágina para evitar que el proyecto siga usando el motor antiguo.

Cómo validar:

1. Detén el servidor:
   CTRL + C

2. Limpia caché:
   rmdir /s /q .next

3. Ejecuta:
   npm run build

4. Ejecuta:
   npm run dev

5. Abre People Analytics, carga DATA GENERAL o Demo Mode.

6. Baja hasta Export Center.
   Debe decir:
   - PDF Engine v3 Multipágina
   - Abrir PDF Ejecutivo v3
   - Descargar PDF v3

7. Genera el PDF.
   Debe salir:
   - Portada azul.
   - SOLINT Business Suite.
   - People Analytics.
   - Varias páginas.
   - NO debe salir el recuadro naranja que dice SOLINT SEGUROS.

Si todavía aparece el PDF antiguo:
- No se reemplazó src/lib/analytics/analytics-export-engine.ts
- O no se reemplazó src/components/analytics/analytics-export-actions.tsx
- O Next sigue con caché activa.

Después:

git add .
git commit -m "Fase 40.6 Export Center v3 validacion"
git push
