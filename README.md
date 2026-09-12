# Tendencia Top

Web de guías de compra (afiliación Amazon.es) generada con Next.js en modo estático y publicada en GitHub Pages.

- Guías: `lib/articles/*.ts` (una por archivo, registradas en `lib/articles/index.ts`).
- Etiqueta de afiliado: variable de repositorio `AMAZON_TAG` (Settings → Secrets and variables → Actions → Variables). Sin ella los enlaces funcionan sin atribución.
- Despliegue: cada push a `main` compila y publica vía `.github/workflows/deploy.yml`.

```bash
npm run dev    # desarrollo
npm run build  # genera ./out
```
