# Plan de prueba en Google Ads · Construcción

Objetivo: **validar en 30 días si Google Ads trae reuniones de diagnóstico a un coste que el negocio aguante.**
No es una campaña de marca ni de alcance. Una sola promesa, un solo nicho, una sola página.

## 0. Requisitos antes de gastar un euro

| # | Requisito | Por qué | Estado |
| --- | --- | --- | --- |
| 1 | Dominio propio publicado (p. ej. `rovik.es`) | Google revisa la página de destino; un subdominio de otra web resta confianza y calidad | Pendiente |
| 2 | Datos legales (razón social, NIF, domicilio) en `site.config.json` | La LSSI los exige y Google puede rechazar anuncios de webs sin identificación | Pendiente |
| 3 | Formulario con servicio (Formspree o Web3Forms) | Sin él, el formulario abre el correo del visitante y no hay conversión que medir | Preparado, falta la cuenta |
| 4 | Acción de conversión en Google Ads («Envío de formulario») con su ID `AW-…` y etiqueta | Sin conversión, Google no puede optimizar y tú no sabes qué palabra trae clientes | Preparado, faltan los IDs |
| 5 | Ticket medio decidido | Sin precio no se puede calcular cuánto se puede pagar por cliente | Pendiente |

### Cómo activar formulario y medición (10 minutos)

En la plataforma de publicación (Cloudflare Pages, Netlify o Vercel) añade estas variables de entorno y vuelve a publicar.
También pueden ir en `site.config.json`, pero así no quedan en el repositorio.

```
NEXT_PUBLIC_FORM_PROVIDER=formspree            # o web3forms
NEXT_PUBLIC_FORM_ENDPOINT=https://formspree.io/f/XXXXXXXX
# NEXT_PUBLIC_FORM_ACCESS_KEY=…                # solo Web3Forms (clave pública del formulario)
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL=XXXXXXXXXXX  # etiqueta de la acción «Envío de formulario»
# NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX              # opcional
# NEXT_PUBLIC_META_PIXEL_ID=…                  # opcional, no necesario para esta prueba
```

Al activarlas, la web muestra sola el aviso de cookies, actualiza las políticas de cookies y privacidad, amplía la
CSP solo con esos dominios y registra la conversión únicamente cuando el servicio confirma que la solicitud ha
llegado. Nunca envía nombre, correo ni mensaje a Google o Meta.

## 1. Estructura

- **Campaña**: `Obra · Horas y albaranes` · Red de Búsqueda (sin Display ni socios) · España · español.
- **Puja**: empezar con «Maximizar clics» con CPC máximo de 3 € las 2 primeras semanas; pasar a «Maximizar conversiones»
  cuando haya al menos 10–15 conversiones.
- **Grupos de anuncios** (`google-ads/palabras-clave.csv`): Partes de trabajo · Albaranes digitales · Control de horas.
- **Negativas** (`google-ads/negativas.txt`): plantillas, gratis, empleo y **fichaje/registro de jornada** (otra intención de búsqueda).
- **Anuncio adaptable** (`google-ads/anuncios-rsa.csv`): 15 títulos y 4 descripciones, validados por `npm run test:unit`.
- **Página de destino**: `/constructoras/`. El mensaje del anuncio y el de la página coinciden: partes, albaranes y horas sin cobrar.
- **Extensiones**: enlaces a `#calculadora` («Calcula tus fugas») y `#contacto` («Pide el diagnóstico»); texto destacado
  «Funciona sin cobertura» · «Piloto en una obra real».
- **Plantilla de seguimiento** (a nivel de cuenta):
  `{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={_campaign}&utm_term={keyword}&utm_content={creative}`
  con el parámetro personalizado `_campaign = obra-horas`. El formulario adjunta estos datos y el `gclid` a cada solicitud.

## 2. Presupuesto y cuentas de la prueba

Presupuesto propuesto: **15–20 €/día durante 30 días (450–600 €).** [OPINIÓN]

Los datos siguientes son **supuestos para decidir, no previsiones**: se sustituyen por los reales a los 7 días.

| Concepto | Supuesto | Resultado con 500 € |
| --- | --- | --- |
| CPC medio | 2,50 € [INFERENCIA, verificar en el Planificador de palabras clave] | 200 clics |
| Conversión de la página | 5 % | 10 solicitudes |
| Solicitud → reunión | 40 % | 4 reuniones |
| Reunión → cliente | 25 % | 1 cliente |
| **Coste por cliente** | | **≈ 500 €** |

Regla de viabilidad: la prueba tiene sentido si el **margen del primer año de un cliente es al menos 3 veces** el coste por cliente.

## 3. Criterios de decisión

| Momento | Señal | Decisión |
| --- | --- | --- |
| Día 7 | CTR < 3 % | Cambiar títulos: el anuncio no conecta con la búsqueda |
| 100 clics | 0 solicitudes | Parar. El problema es la oferta o la página, no el presupuesto |
| 200 clics | Coste por solicitud > 80 € | Recortar palabras caras, reforzar negativas, probar otra promesa |
| Día 30 | ≥ 2 reuniones y 1 propuesta | Mantener y pasar a «Maximizar conversiones» |
| Día 30 | 0 reuniones | Cancelar Ads y volver a prospección directa |

Revisión semanal (15 minutos): términos de búsqueda → nuevas negativas · coste por solicitud · solicitudes que se convierten en reunión.

## 4. Lo que no conviene hacer todavía

- **Meta Ads o LinkedIn Ads** para esta oferta: el jefe de obra no está buscando en Instagram. Meta solo para *remarketing*, y
  requiere ampliar el consentimiento (personalización de anuncios), que hoy está desactivado.
- **Campañas de «consultoría para pymes»**: palabras caras, intención difusa y competencia de agencias con reseñas.
- **Más grupos o más nichos** antes de tener 10 conversiones en este.

## 5. En paralelo (lo que más probabilidad tiene de traer el primer cliente)

Ads valida demanda, pero el primer cliente suele salir antes por venta directa: **20 mensajes por semana** a subcontratas y
constructoras con el enlace `/constructoras/#calculadora` y una frase: «¿Sabes cuántas horas pagas en obra y no facturas? Te lo
calculo en un minuto».
