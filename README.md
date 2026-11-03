# Mobile Bank

Simulador de banca móvil con bienvenida, ingreso por PIN, inicio, productos y detalle de cuenta. Los saldos y datos mostrados son de demostración. No realiza operaciones bancarias reales.

La clave de acceso de demostración es `101380`. La validación ocurre en el navegador; no sustituye una autenticación real ni protege datos sensibles.

## Ejecutar en local

Requiere Node.js 24 o superior.

```bash
npm ci
npm run dev
```

Abrir <http://127.0.0.1:3000/>.

## Verificar

```bash
npm run lint
npm test
npm run build
```

## Publicación

Cada actualización de `main` ejecuta las verificaciones y publica `dist` en GitHub Pages mediante `.github/workflows/pages.yml`.
