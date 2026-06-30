FASE 29 ACTUALIZADA - PWA Enterprise + Branding SOLINT SEGUROS

Copiar/reemplazar/agregar:

- public/manifest.webmanifest
- public/sw.js
- src/app/layout.tsx
- src/components/ui/pwa-register.tsx
- src/components/ui/pwa-install-card.tsx
- src/app/(dashboard)/layout.tsx
- src/app/(auth)/login/page.tsx
- src/components/layout/topbar.tsx
- src/components/layout/footer.tsx

Cambios principales:
- Nombre de app: SOLINT SEGUROS.
- App instalada en Windows/Android: SOLINT SEGUROS.
- Título de pestaña: SOLINT SEGUROS.
- Login actualizado.
- Topbar actualizado.
- Footer actualizado.
- Manifest PWA actualizado.
- Banner de instalación actualizado.
- Firma: Powered by SOLINT Business Systems.

IMPORTANTE:
Verifica que existan:

- public/images/solint-business-systems.png
- public/images/solint-business-systems-c.png
- public/favicon.ico

Después:

npm run build
npm run dev

Para subir a GitHub/Netlify:

git add .
git commit -m "Fase 29 branding SOLINT SEGUROS PWA"
git push
