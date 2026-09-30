<!-- BEGIN:nextjs-agent-rules -->
# Next.js 16

Esta versión de Next.js tiene cambios incompatibles con versiones anteriores. Antes de escribir código,
lee la guía correspondiente en `node_modules/next/dist/docs/` y respeta los avisos de obsolescencia.
<!-- END:nextjs-agent-rules -->

# Tendencia Top (toptendencias.es)

- Web estática (`output: "export"`) publicada en GitHub Pages con `.github/workflows/deploy.yml`.
- Guías en `lib/articles/*.ts`, una por archivo y registradas en `lib/articles/index.ts`.
- El dominio se lee de `site.config.json`; no lo escribas a mano en el código ni en los scripts.
- Etiqueta de afiliado: variable de repositorio `AMAZON_TAG`. El despliegue falla si falta.
- `scripts/postbuild.py` añade la CSP por huella a cada página: no metas scripts en línea sin pasar por él.
- Repositorio público: nada de ventas, claves ni datos personales (`reports/ventas/` y `ESTADO.md` están ignorados).
- Antes de subir: `npm run lint`, `npx tsc --noEmit` y `npm run build`.
