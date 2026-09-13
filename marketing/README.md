# Marketing de Tendencia Top

Todo lo de esta carpeta se genera desde las guías (`npx tsx scripts/export-articles.ts` → `python3 scripts/make_campaigns.py` → `python3 scripts/make_videos.py`).

## 0. Fotografías de la web (coste 0 €)

`scripts/fetch_photos.py` descarga una foto de Pexels por guía a `public/img/guias/<slug>.jpg` y guarda los créditos en `lib/photoCredits.json`. En el despliegue (GitHub Actions) se ejecuta con `--missing` usando el secreto `PEXELS_API_KEY`, así las guías nuevas de la rutina diaria salen con foto. Cada guía nueva debe llevar `photoQuery` (búsqueda en inglés).

## 1. Vídeos para redes (coste 0 €)

`marketing/videos/<slug>.mp4` (vertical 1080x1920, 45-60 s, ~10 MB) y `<slug>.txt` con el texto de la publicación, hashtags y créditos de los clips. Cada vídeo combina B-roll de Pexels, tarjetas de producto, subtítulos sincronizados frase a frase, barra de progreso y voz "Mónica (Mejorada)" de macOS. Generar: `~/venv/bin/python scripts/make_videos.py [slug]` (necesita `PEXELS_API_KEY` en `.env.local`).
Sube cada vídeo a TikTok, Instagram Reels y YouTube Shorts con el texto del `.txt`. Pon el enlace de la web en la bio de cada perfil.
Los vídeos no usan imágenes de Amazon ni música con derechos. La licencia de Pexels permite el uso comercial; los créditos van en el texto de cada publicación.

## 2. Google Ads (requiere inversión)

**Archivo:** `google-ads/tendencia-top-busqueda.csv` (importable en Google Ads Editor) y `google-ads/palabras-negativas.txt`.

Estructura: 1 campaña de Búsqueda "Tendencia Top · Búsqueda", 11 grupos (uno por guía), 10 palabras clave en concordancia de frase por grupo, 1 anuncio adaptable por grupo con 10 títulos y 4 descripciones, solo España e idioma español, puja "Maximizar clics" con CPC máximo 0,35 €.

**Presupuesto propuesto para la prueba:** 5 €/día durante 14 días = **70 €**. Con un CPC medio de 0,25-0,40 € son unos 175-280 clics. Con una tasa de clic a Amazon del 30-40 % y una conversión en Amazon del 5-8 %, la expectativa realista son 3-8 pedidos, con comisiones de 1 a 3 € cada uno. **Es decir: la prueba casi seguro pierde dinero.** Su utilidad es (a) saber qué guías convierten para reforzarlas con contenido, y (b) conseguir las 3 ventas que Amazon exige para aprobar la cuenta en los primeros 180 días.

Cómo activar (solo puede hacerlo el titular de la cuenta):
1. Crear cuenta en https://ads.google.com con método de pago (modo experto, sin campaña inteligente).
2. Instalar Google Ads Editor, iniciar sesión, "Cuenta → Importar → Desde archivo" y elegir el CSV. Revisar el mapeo de columnas, aceptar y "Publicar".
3. Añadir las palabras negativas a nivel de campaña (Palabras clave negativas → pegar el `.txt`).
4. Activar la campaña. Revisar a los 7 días: pausar grupos con CTR < 2 % y sin clics a Amazon.

Política: Google no permite anunciar "páginas puente" sin valor propio. Las guías tienen contenido original, criterios y comparativa, así que cumplen, pero no anuncies nunca con enlace directo a Amazon ni uses la palabra "Amazon" en los anuncios.

## 3. Meta Ads, Facebook e Instagram (requiere inversión)

**Archivo:** `meta-ads/campana-trafico.json`: 1 campaña de Tráfico, 11 conjuntos (uno por guía, España, 25-64 años, feed + reels + stories), 1 anuncio de vídeo por conjunto usando los vídeos de la carpeta `videos/`, con enlaces UTM a cada guía.

**Presupuesto propuesto:** empezar con solo 3 conjuntos (los de mayor interés estacional: calefactores, freidoras de aire y robots aspiradores) a 3 €/día durante 10 días = **90 €**. Expectativa: CPC de 0,15-0,35 € en vídeo, unos 250-600 visitas. Misma advertencia que en Google: es una prueba de aprendizaje, no una máquina de beneficio.

Cómo activar:
1. Tener Business Manager con página de Facebook, cuenta publicitaria y método de pago.
2. Conectar el **MCP oficial de Meta Ads** (Meta lo aloja en `mcp.facebook.com/ads`, no hace falta instalar nada) desde https://claude.ai/customize/connectors → "Añadir conector personalizado" con esa URL e iniciar sesión con Meta. No se usan repositorios de terceros.
3. Pedir a Claude que cree la campaña a partir de `meta-ads/campana-trafico.json`. El MCP oficial crea todo en estado PAUSADO; se revisa y se activa desde el Administrador de anuncios.

## Reglas de Amazon Afiliados que afectan a la publicidad

- No pujar por la marca "Amazon" ni enviar anuncios directamente a Amazon.es.
- No usar imágenes de producto de Amazon fuera de sus herramientas oficiales.
- El aviso de afiliado debe estar visible en cada página (ya está) y en los vídeos (está en el cierre y en el texto de la publicación).

## 4. Aviso diario por Telegram y WhatsApp

`scripts/notify_whatsapp.py` lee el informe más reciente de `reports/` y envía un resumen por WhatsApp.
Lo dispara solo el workflow `.github/workflows/notificacion-diaria.yml` cada vez que la rutina diaria sube un informe nuevo.

Proveedores (se usa el primero configurado):
- **WhatsApp Cloud API de Meta** (oficial y gratuito con número de prueba): `WHATSAPP_PHONE`, `META_TOKEN`, `META_PHONE_ID`, y variable `META_TEMPLATE` (por defecto `informe_diario`). **Opción recomendada.**
- **CallMeBot** (gratuito pero de terceros): `WHATSAPP_PHONE` y `CALLMEBOT_APIKEY`. En septiembre de 2026 el bot estaba lleno y no admitía altas nuevas.
- **Twilio** (de pago, proveedor oficial): `WHATSAPP_PHONE`, `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM`.
- **Telegram** (ACTIVO desde el 14-09-2026): secretos `TELEGRAM_TOKEN` y `TELEGRAM_CHAT_ID`. Bot @Tendenciatop_informes_bot. Para obtener el chat_id: abrir el chat del bot, pulsar Empezar y ejecutar `python3 scripts/telegram_chat_id.py <TOKEN>`.

### Alta en WhatsApp Cloud API (la hace el titular de la cuenta de Meta)

1. En https://developers.facebook.com crear una app de tipo **Empresa** y añadir el producto **WhatsApp**.
2. En *WhatsApp → Configuración de la API*: Meta da un **número de prueba** gratuito. Añadir el móvil propio en *Para* y verificarlo con el código. El número de prueba permite enviar gratis hasta a 5 destinatarios.
3. Copiar el **Identificador del número de teléfono** (`META_PHONE_ID`).
4. Crear un **token permanente**: *Configuración del negocio → Usuarios del sistema → Añadir → rol Administrador → Generar token* con los permisos `whatsapp_business_messaging` y `whatsapp_business_management` (`META_TOKEN`). El token temporal de la pantalla de inicio caduca en 24 horas y no sirve.
5. En *Herramientas → Plantillas de mensajes*, crear una plantilla llamada `informe_diario`, categoría **Utilidad**, idioma **Español**, con este cuerpo exacto (5 variables):

```
Tendencia Top · {{1}}

Guía de hoy: {{2}}
Enlace: {{3}}

Total publicado: {{4}} guías
Ventas: {{5}}

Informe completo en el repositorio del proyecto.
```

6. Guardar `META_TOKEN`, `META_PHONE_ID` y `WHATSAPP_PHONE` como secretos del repositorio en *Settings → Secrets and variables → Actions*.

Prueba local sin enviar nada: `python3 scripts/notify_whatsapp.py --dry-run`
