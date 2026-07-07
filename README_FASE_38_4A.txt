FASE 38.4A - Presentation Mode + Fullscreen

Copiar/reemplazar/agregar:

- src/lib/analytics/presentation-mode-store.ts
- src/components/analytics/presentation-toolbar.tsx
- src/components/analytics/analytics-shell.tsx
- src/components/layout/topbar.tsx
- src/components/layout/sidebar.tsx
- src/components/layout/footer.tsx
- src/components/analytics/executive-command-center.tsx
- src/app/(dashboard)/analytics/people/page.tsx

Incluye:
- Presentation Mode funcional.
- Fullscreen API.
- Oculta sidebar/topbar/footer.
- Oculta filtros, carga y módulos operativos en presentación.
- Matheito Presenter dentro del Command Center.
- Marca de agua SOLINT Business Systems.
- Toolbar flotante para salir de presentación.
- Preparado para animaciones premium 38.4B.

Después:

npm run build
git add .
git commit -m "Fase 38.4A Presentation Mode Fullscreen"
git push
