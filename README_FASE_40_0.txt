FASE 40.0 - Matheito Copilot Local AI Platform

Esta fase fue preparada sobre el proyecto real que subiste.

Copiar/reemplazar/agregar:

- src/lib/analytics/matheito-copilot-engine.ts
- src/components/assistant/matheito-assistant.tsx
- src/app/(dashboard)/analytics/people/page.tsx
- src/components/analytics/motion-ui.tsx

Incluye:
- Matheito Copilot con chat funcional.
- Preguntas inteligentes sobre el último análisis cargado.
- Contexto local guardado en localStorage.
- Respuestas sin IA externa todavía.
- Resumen ejecutivo automático.
- Preguntas sobre rotación, sedes, cargos, áreas, riesgos, recomendaciones, Health Score, Executive Score y diversidad.
- Historial local de conversación.
- Botón para limpiar chat.
- Corrección TypeScript en AnimatedCounter de motion-ui.tsx.

Validación realizada:
- npm run build ejecutado correctamente sobre el proyecto real.

Después de copiar los archivos:

npm run build
git add .
git commit -m "Fase 40.0 Matheito Copilot Local"
git push
