# Tendencia Top · estado del proyecto

Última actualización: 14 de septiembre de 2026.

## Qué es

Web de guías de compra en español que gana comisiones con el programa de Afiliados de Amazon.es.
Publica sola una guía nueva cada día, genera un vídeo vertical de esa guía y avisa por Telegram.
Coste de funcionamiento: 0 €.

## Accesos

| Recurso | Dirección |
|---|---|
| Web | https://rovik-ia.github.io |
| Buscador de productos | https://rovik-ia.github.io/productos/ |
| Repositorio | https://github.com/rovik-ia/rovik-ia.github.io |
| Rutina diaria | https://claude.ai/code/routines/trig_01Mxz721FS9HeETi65eaTQav |
| Panel de Amazon | https://afiliados.amazon.es/home/reports |
| Bot de Telegram | @Tendenciatop_informes_bot |
| Código en el Mac | `~/tendencias-web` |
| Vídeos en el Mac | `~/Desktop/TendenciaTop-videos` |

Identificador de afiliado: `tendenciato0a-21`.

## El día automático (funciona con el ordenador apagado)

| Hora | Qué pasa | Dónde se ejecuta |
|---|---|---|
| 06:00 | Investiga tendencias y escribe la guía del día con 5 productos, más el informe diario | Anthropic |
| 06:03 | Descarga las imágenes de la guía, las fija en el repositorio y despliega la web | GitHub |
| 06:05 | Genera el vídeo vertical de 45 s y lo publica como archivo público | GitHub |
| 06:06 | Envía el vídeo y el resumen del día a Telegram | GitHub |

## Cifras actuales

| Concepto | Valor |
|---|---|
| Guías publicadas | 12 |
| Categorías | 5 (Hogar, Clima, Cocina, Bienestar, Tecnología) |
| Productos con enlace de afiliado e imagen | 60 |
| Vídeos generados | 12 |
| Informes diarios | 2 |
| Accesibilidad y SEO (Lighthouse móvil) | 100 / 100 |
| Rendimiento (Lighthouse móvil) | 69 a 80 |
| Coste mensual | 0 € |

## Caminos hasta Amazon

El enlace de afiliado es lo que genera el dinero, así que la web está organizada para llegar a él
en el menor número de pasos posible.

| Desde | Pasos hasta Amazon | Botones de compra en la página |
|---|---|---|
| Portada | 1 clic | 6 |
| Buscador `/productos/` | 1 clic, con búsqueda por texto y categoría | 60 |
| Cualquier guía | 1 clic, la tabla va antes del análisis | 11 |
| Móvil, en cualquier guía | 1 toque en la barra fija inferior | siempre visible |

## Piezas técnicas

**Workflows de GitHub Actions**

- `deploy.yml`: compila y publica la web en cada push. Descarga las imágenes que falten.
- `video-diario.yml`: se dispara con cada guía nueva. Fija imágenes, genera el vídeo, lo sube
  a un release, publica en YouTube e Instagram y lo manda por Telegram.
- `notificacion-diaria.yml`: se dispara con cada informe nuevo y manda el resumen a Telegram.

**Scripts**

- `scripts/make_videos.py`: vídeo vertical con voz neuronal, subtítulos y B-roll de Pexels.
- `scripts/fetch_photos.py`: fotos de cabecera y de cada producto, con créditos.
- `scripts/notify_whatsapp.py`: resumen diario. Admite Telegram, WhatsApp de Meta, Twilio y CallMeBot.
- `scripts/send_video_telegram.py`: envía el vídeo por Telegram.
- `scripts/publish_youtube.py` y `scripts/youtube_oauth.py`: subida a YouTube Shorts.
- `scripts/publish_instagram.py`: publicación de Reels.
- `scripts/social_common.py`: textos y enlaces con parámetros de campaña por red.
- `scripts/make_campaigns.py`: campañas de Google Ads y Meta Ads, sin activar.

**Secretos configurados**: `PEXELS_API_KEY`, `TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID`.

## Canales

| Canal | Estado |
|---|---|
| Web y guías | Funcionando y verificado |
| Telegram (informe y vídeo) | Funcionando y verificado |
| YouTube Shorts | Código listo y probado. Faltan credenciales |
| Instagram Reels | Código listo y probado. Faltan credenciales |
| Google Ads | Campaña preparada. Sin activar, requiere inversión |
| Meta Ads | Plan preparado. Sin activar, requiere inversión |

## Pendiente

**Del usuario**

1. Alta de YouTube: proyecto en Google Cloud con YouTube Data API v3, pantalla de consentimiento
   **publicada en producción** (si se queda en Pruebas el permiso caduca cada 7 días), credencial
   de tipo Aplicación de escritorio y ejecutar una vez
   `~/venv/bin/python scripts/youtube_oauth.py CLIENT_ID CLIENT_SECRET`.
2. Alta de Instagram: cuenta Empresa o Creador vinculada a una página de Facebook, app en Meta con
   Instagram Graph API y token de larga duración. Poner la dirección de la web en la biografía.
3. Conseguir 3 ventas antes de marzo de 2027 o Amazon cierra la cuenta de afiliado.
4. Dar de alta la web en Google Search Console y en Bing Webmaster Tools.
5. Guardar el CSV del panel de Amazon en `reports/ventas/AAAA-MM-DD.csv` para ver ventas en el informe.

**Mejoras propuestas y no hechas**

- Analítica sin cookies con Cloudflare Web Analytics, para dejar de ir a ciegas.
- Dominio propio, unos 10 € al año.
- Tarea semanal que actualice la guía más antigua.
- Conectar la API de productos de Amazon cuando aprueben la cuenta, para precios e imágenes oficiales.
- Segunda red de afiliación para no depender solo de Amazon.

## Cómo comprobar que sigue vivo

Si una mañana no llega el mensaje de Telegram, mirar en este orden: la rutina en claude.ai, la pestaña
Actions del repositorio y el saldo del plan de Claude. Las tres causas habituales son rutina desactivada,
un workflow en rojo o crédito agotado.
