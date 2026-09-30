# Rovik · Web de consultoría, marketing e IA

Web de captación de Rovik: consultoría de crecimiento, marketing y automatización con IA para empresas que
quieren escalar. Estética de interfaz HUD (rojo, oro y cian) con un núcleo 3D que se ensambla con el scroll
y un copiloto, **ROVIK.IA**, que escanea la empresa del visitante en siete preguntas.

- **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4**, exportación estática (`out/`).
- **three.js** solo para el núcleo 3D, cargado en diferido y únicamente con GPU real.
- Sin backend, sin cookies, sin terceros: el formulario y el informe de ROVIK.IA se envían por correo desde el
  programa del visitante.

## Comandos

```bash
npm install
npm run dev          # desarrollo en http://localhost:3000
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run build        # exporta a out/ y endurece (CSP por huella, cabeceras, security.txt)
npm test             # Playwright + axe en 375, 390, 768, 1024 y 1440 px (sirve out/) + pruebas unitarias
npm run test:ads     # compila con formulario y medición de prueba y verifica consentimiento, CSP y conversiones
node scripts/serve.mjs 4173   # servir out/ en local (HEADERS=1 añade las cabeceras de seguridad)
node scripts/preview/build-preview.mjs /ruta   # vista previa que funciona servida desde cualquier subruta
```

Renders e imágenes:

```bash
npm run render                 # renders del núcleo 3D a public/img (Chromium sin pantalla)
node scripts/render/og.mjs     # imagen para redes sociales public/og.jpg
node scripts/qa/shoot.mjs http://localhost:4173/ capturas top,protocolo+900 390,1440
```

## Formulario y medición (opcionales)

Por defecto la web no usa cookies ni servicios externos y el formulario abre el correo del visitante. Para campañas se
activan con variables de entorno en la plataforma de publicación (o en `site.config.json` → `form` y `tracking`):

| Variable | Para qué |
| --- | --- |
| `NEXT_PUBLIC_FORM_PROVIDER` | `formspree`, `web3forms` o `generic` (endpoint propio https) |
| `NEXT_PUBLIC_FORM_ENDPOINT` | URL del formulario (Formspree: `https://formspree.io/f/xxxx`) |
| `NEXT_PUBLIC_FORM_ACCESS_KEY` | Clave pública de Web3Forms |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` · `NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL` | Conversión «Envío de formulario» de Google Ads |
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4 |
| `NEXT_PUBLIC_META_PIXEL_ID` | Píxel de Meta |

Con medición activa aparece un aviso de cookies (aceptar y rechazar al mismo nivel) y no se carga nada de terceros hasta
aceptar. Las políticas de cookies y privacidad y la CSP se ajustan solas a lo que esté activo. Los valores mal formados se
ignoran con aviso al compilar. `npm run test:ads` compila con IDs de prueba y verifica todo esto.

Plan de campaña y kit de Google Ads: `marketing/PLAN-CAMPANAS.md` y `marketing/google-ads/`.

## Dónde se edita cada cosa

| Qué | Dónde |
| --- | --- |
| Dominio, correo, WhatsApp y datos legales del titular | `site.config.json` |
| Textos de todas las secciones (promesas comerciales incluidas) | `lib/content.ts` |
| Página de campaña para construcción (debe coincidir con los anuncios) | `lib/content-construccion.ts` |
| Calculadora de fugas | `lib/calculator.ts` |
| Envío de solicitudes y medición | `lib/lead.ts`, `lib/analytics.ts`, `scripts/integrations.mjs` |
| Preguntas, puntuación y plan del escáner ROVIK.IA | `lib/diagnosis.ts` |
| Escena 3D (piezas, materiales, fases de ensamblaje) | `lib/core/scene.ts` |
| Colores, tipografía y componentes base | `app/globals.css` |
| Secciones de la home | `components/sections/` |

## Publicación

La web es estática: sirve en cualquier alojamiento. Recomendado **Cloudflare Pages** (gratis, uso comercial,
aplica `out/_headers`) o **Netlify**. En Vercel se aplica `vercel.json` (el plan gratuito no admite uso comercial).

- Comando de compilación: `npm run build` · Carpeta de salida: `out`
- Con dominio propio: pon la URL en `site.config.json` (`"url": "https://tudominio.es"`).
- **GitHub Pages**: `.github/workflows/deploy.yml` publica al hacer push a `main`. Activa antes
  *Settings → Pages → Source: GitHub Actions*. La subruta (`/rovik-web`) se toma de `site.config.json`.
  GitHub Pages no permite cabeceras propias: la CSP va por `<meta>` y no hay `frame-ancestors` ni HSTS propio.

## Seguridad

- CSP estricta por página: `script-src 'self'` + huella SHA-256 de cada script en línea (`scripts/postbuild.mjs`).
- Cabeceras HSTS, `nosniff`, `X-Frame-Options`, `Permissions-Policy`, COOP/CORP y `frame-ancestors 'none'`
  en `_headers` y `vercel.json` (`scripts/security-headers.mjs`).
- Sin dependencias de terceros en tiempo de ejecución; fuentes autoalojadas por `next/font`.
- Entradas del formulario saneadas y codificadas; nada se inserta como HTML. JSON-LD escapado.
- Acciones de GitHub fijadas por huella de commit y Dependabot para npm y Actions.
- `/.well-known/security.txt` generado en cada compilación.

## Contenido pendiente de confirmar antes de publicar

- **Datos legales del titular** (razón social, NIF, domicilio) en `site.config.json`: la LSSI los exige.
- Compromisos publicados en `lib/content.ts` (sesión de 30 min, propuesta por escrito, «todo queda a tu nombre»).
- Los casos de clientes potenciales van anonimizados (nombres ficticios); los productos propios llevan su nombre.
