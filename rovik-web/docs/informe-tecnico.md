# Informe técnico · Web de Rovik

Fecha: 30-09-2026 · Versión: 1.0 · Alcance: `rovik-web` (home, aviso legal, privacidad, cookies, 404)

## 1. Qué se ha construido

| Pieza | Detalle |
| --- | --- |
| Stack | Next.js 16.3.8 (App Router, exportación estática) · React 19.2 · TypeScript estricto · Tailwind CSS 4 · three.js 0.186 |
| Home | Hero · Fugas · Protocolo (núcleo 3D que se ensambla con el scroll) · Módulos · Copiloto ROVIK.IA · Archivo de casos (galería horizontal) · Reglas · FAQ · Contacto |
| ROVIK.IA | Escáner de 7 preguntas en el navegador: puntúa 4 sistemas, recomienda módulo, genera plan de 30 días y lo envía por correo. Voz opcional (síntesis del navegador). Sin red ni almacenamiento |
| Imágenes | Renders 3D propios (hero, 5 fases, 4 módulos, imagen social) y capturas reales de 5 proyectos (anonimizadas las de terceros) |
| Páginas legales | Aviso legal (LSSI), privacidad (RGPD) y cookies (sin cookies) |

Capturas: `docs/capturas/`.

## 2. Verificación ejecutada

| Comprobación | Resultado |
| --- | --- |
| ESLint | 0 errores, 0 avisos |
| TypeScript (`tsc --noEmit`) | 0 errores |
| Compilación de producción | OK · 7 páginas estáticas |
| Playwright (375 · 390 · 768 · 1024 · 1440 px) | **129 superadas**, 0 fallidas (16 omitidas a propósito: pruebas que solo aplican a un tamaño) |
| `npm audit` | **0 vulnerabilidades** |
| Compilación con subruta `/rovik-web` (GitHub Pages) | OK · canónicas, OG, iconos y 3D sin errores |

Qué cubren las pruebas (`tests/site.spec.ts`):

- Carga de las 4 páginas sin errores de consola, sin 404 y **sin violaciones de CSP**, recorriendo toda la página.
- CSP por huella en cada página, sin `unsafe-inline`/`unsafe-eval` en scripts.
- El núcleo 3D se monta bajo la CSP estricta (hero y protocolo) y, sin GPU, se sirven imágenes estáticas.
- Sin desbordamiento horizontal en ningún tamaño; objetivos táctiles ≥ 44 px en móvil.
- **Accesibilidad WCAG 2.1 AA con axe: 0 violaciones** en las 4 páginas y 5 tamaños.
- Un único `h1` y jerarquía de encabezados sin saltos; enlace «Saltar al contenido».
- Movimiento reducido: sin lienzo 3D, con imágenes estáticas.
- Escáner ROVIK.IA completo con ratón y **solo con teclado**; foco gestionado; informe y `mailto` correctos.
- Formulario: validación, foco al primer error, `aria-invalid`, preparación del correo y neutralización de caracteres de control.
- Pestañas de módulos con flechas, Inicio y Fin; menú móvil a pantalla completa con foco atrapado y cierre con Escape.
- SEO: metadatos, canónica, Open Graph, Twitter, JSON-LD, `robots.txt`, `sitemap.xml`, `alt` en imágenes, anclas internas válidas y 404 propia.

## 3. Rendimiento (Lighthouse 12, servidor con compresión como en producción)

| Perfil | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Móvil (4G lenta simulada, CPU ×4) | **94–95** | **100** | **100** | **100** | 2,7 s | 120–160 ms | 0 |
| Escritorio | **100** | **100** | **100** | **100** | 0,7 s | 0 ms | 0 |

- JS inicial: 193 KB gzip (React + Next). three.js (148 KB gzip) se descarga **después** de la primera pintura, en tiempo ocioso y solo si hay GPU real.
- El LCP móvil es simulado; el observado en local es 0,2 s. Para bajar de 2,5 s en simulación, el siguiente paso sería reducir la fuente del titular (Archivo variable, 90 KB).
- **Nota honesta sobre la medición**: el laboratorio de Lighthouse no tiene GPU. La web detecta el renderizado por software y sirve las imágenes estáticas, así que Lighthouse mide esa ruta. En un móvil real con GPU se carga el 3D en diferido (compilación de shaders en paralelo, resolución limitada a 1,5×, solo se renderiza mientras es visible). Recomendado: medir en campo (Search Console → Core Web Vitals) tras publicar.

## 4. Seguridad

### Controles implementados

- **CSP estricta por página** (`scripts/postbuild.mjs`): `default-src 'self'`; `script-src 'self'` + huella SHA-256 de cada script en línea (14); `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-src 'none'`; `worker-src 'none'`; `upgrade-insecure-requests`.
- **Cabeceras HTTP** para Cloudflare Pages/Netlify (`out/_headers`) y Vercel (`vercel.json`): HSTS con preload, `nosniff`, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `Permissions-Policy` restrictiva, COOP y CORP.
- **Superficie mínima**: sin backend, sin base de datos, sin cookies, sin analítica, sin scripts ni fuentes de terceros (fuentes autoalojadas).
- **Entradas**: el formulario limita longitudes, elimina caracteres de control y codifica todo con `encodeURIComponent`; nada se inserta como HTML (React escapa). JSON-LD serializado con `<` escapado.
- **Dependencias**: Next.js actualizado a 16.3.8 (la 16.3.5 tiene la vulnerabilidad crítica GHSA-vcvr-r3jv-pc5j). `npm audit`: 0.
- **Cadena de suministro**: acciones de GitHub fijadas por huella de commit, permisos mínimos por workflow, Dependabot para npm y Actions, `npm ci` con lockfile, auditoría en CI.
- **Sin mapas de código** en producción; sin secretos en el repositorio (`.env*` ignorado).
- `/.well-known/security.txt` (RFC 9116) generado en cada compilación.

### Hallazgos residuales

| Nivel | Hallazgo | Acción |
| --- | --- | --- |
| ALTO | Faltan razón social, NIF y domicilio del titular: la LSSI los exige en el aviso legal | Rellenar `legal` en `site.config.json` antes de publicar |
| MEDIO | En GitHub Pages no se pueden enviar cabeceras: sin HSTS propio ni `frame-ancestors` (la CSP va por `<meta>`) | Publicar en Cloudflare Pages o Netlify, que aplican `_headers` |
| MEDIO | Con GitHub Pages la web saldría en `toptendencias.es/rovik-web/` (la cuenta tiene ese dominio en su sitio principal) | Dominio propio para Rovik |
| BAJO | `style-src 'unsafe-inline'` (React usa atributos `style`) | Riesgo bajo: no permite ejecutar scripts |
| BAJO | El correo de contacto es visible para robots de spam | Ya es público en otras webs; valorar un alias dedicado |
| INFO | El repo `rovik-ia.github.io` (Tendencia Top) usa Next 16.3.5 con el aviso crítico citado | Actualizar a 16.3.8. En exportación estática no hay servidor que explotar, pero conviene cerrarlo |

## 5. SEO

- Título y descripción específicos, canónica, Open Graph y Twitter con imagen 1200×630 propia, `lang="es"`.
- JSON-LD: `ProfessionalService` (con catálogo de los 4 servicios), `WebSite` y `FAQPage`.
- `robots.txt`, `sitemap.xml`, jerarquía de encabezados limpia, `alt` descriptivos, 404 propia.
- Siguiente paso (tras validar demanda): una página por vertical con intención de búsqueda real (p. ej. «digitalizar partes de obra», «control de horas en construcción») y ficha de Google Business Profile.

## 6. Accesibilidad

WCAG 2.1 AA sin violaciones (axe) · navegación completa por teclado · foco visible cian · enlace para saltar al
contenido · pestañas ARIA con flechas · menú con foco atrapado · `role="log"` en ROVIK.IA con anuncio del texto
completo (no letra a letra) · `prefers-reduced-motion` respetado (sin 3D ni animaciones) · contraste mínimo 4,5:1
en texto pequeño (rojo específico para texto: `--red-text`).

## 7. Errores encontrados y corregidos durante la revisión

1. Las clases propias (`.btn`, `img/svg { display:block }`) pisaban utilidades de Tailwind: el menú móvil desaparecía → movidas a `@layer`.
2. Desbordamiento horizontal a 375/390 px por palabras largas en tipografía expandida → tamaños por tramo y `min-w-0`.
3. El lienzo 3D medía 0 px por clases de posición contradictorias → contenedor corregido.
4. El menú móvil quedaba recortado a 64 px porque `backdrop-filter` en la cabecera crea un bloque contenedor → eliminado y prueba reforzada.
5. Contraste insuficiente del rojo en etiquetas pequeñas → token `--red-text`.
6. Objetivos táctiles < 44 px → corregidos.
7. WebGL por software congelaba el hilo principal (TBT 3,7 s) → detección de GPU real y compilación asíncrona.
8. Solape del titular con el núcleo a 1024–1280 px → escala tipográfica por tramo.
9. Una matrícula con la marca de un tercero en una captura → desenfocada.

## 8. Contenido que debes confirmar

| Dónde | Qué |
| --- | --- |
| `site.config.json` | Dominio definitivo, WhatsApp (opcional), razón social, NIF, domicilio |
| `lib/content.ts` | Compromisos publicados: sesión de diagnóstico de 30 min por videollamada, propuesta por escrito con precio y métrica, «todo queda a tu nombre» |
| `lib/content.ts` → casos | Dos casos son propuestas/prototipos para empresas que no son clientes: van anonimizados y etiquetados como tales |
| Imágenes | Sustituir capturas por resultados reales en cuanto haya clientes que lo autoricen |
