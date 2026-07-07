FASE 39.3 - Demo Mode + Fix MatheitoAssistant

Copiar/reemplazar/agregar:

- src/components/assistant/matheito-assistant.tsx
- src/lib/analytics/demo-people-dataset.ts
- src/components/analytics/people-empty-state.tsx
- src/app/(dashboard)/analytics/people/page.tsx

Incluye:
- Solución al error Module not found MatheitoAssistant.
- Botón flotante Matheito funcional.
- Demo Mode real.
- Dataset ficticio de People Analytics.
- Ideal para demos comerciales sin archivo Excel.

Después:

npm run build
git add .
git commit -m "Fase 39.3 Demo Mode y fix Matheito"
git push
