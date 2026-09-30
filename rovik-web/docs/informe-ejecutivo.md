# Informe ejecutivo · Web de Rovik

Fecha: 30-09-2026 · Detalle técnico en `informe-tecnico.md` · Capturas en `capturas/`

## RESUMEN

La web de Rovik está construida, probada y endurecida. No es una plantilla: estética de interfaz HUD en rojo,
oro y cian, un **núcleo 3D propio que se ensambla con el scroll** siguiendo tu método (validar → vender →
repetir → automatizar → escalar) y **ROVIK.IA**, un copiloto al estilo JARVIS que escanea la empresa del
visitante en 7 preguntas y le devuelve un informe con fugas, módulo recomendado y plan de 30 días, listo para
enviártelo por correo.

- [HECHO] 129 pruebas automáticas superadas en 5 tamaños de pantalla. 0 vulnerabilidades. CSP estricta.
- [HECHO] Lighthouse: móvil 94–95 · escritorio 100 en rendimiento; 100 en accesibilidad, buenas prácticas y SEO.
- [HECHO] **Aún no está publicada**: GitHub no me deja crear repositorios desde esta sesión. El código está
  guardado en una rama; publicarla necesita 1 minuto tuyo (ver «Siguiente acción»).

## ANÁLISIS

**Objetivo real:** conseguir reuniones de diagnóstico con empresas que puedan pagar. La web es un medio.
**Problema real:** Rovik no tiene todavía prueba social (clientes con cifras, testimonios). Una web
espectacular sin prueba convierte poco.
**Restricción real:** tu tiempo y la falta de tráfico. Nadie llega a una web nueva sin un canal que la empuje.
**Suposiciones ocultas:** que el tráfico vendrá solo; que el tema Iron Man atrae a decisores (puede atraer más
curiosos que gerentes).

Evaluación de «publicar esta web como activo principal de captación»:

| Criterio | Nota | Base |
| --- | --- | --- |
| Mercado | 7/10 | [INFERENCIA] pymes españolas con presión para digitalizarse y usar IA |
| Demanda | 5/10 | [RIESGO] sin datos de búsquedas ni de leads propios |
| Velocidad | 9/10 | [HECHO] ya está hecha |
| Coste | 9/10 | [HECHO] alojamiento gratuito posible (Cloudflare Pages) |
| Escalabilidad | 7/10 | [HECHO] el escáner cualifica sin tu tiempo |
| Probabilidad | 5/10 | [OPINIÓN] sin tráfico ni prueba social, baja |
| **Total** | **42/60** | **Replantear**: la web está lista; el cuello de botella no es la web |

## LO QUE PROBABLEMENTE ESTÁS IGNORANDO

1. **Dispersión.** Tienes Tendencia Top (afiliación), ROVIK.IA (IA para constructoras), demos para estética,
   automoción y construcción, y ahora consultoría generalista. Son cinco frentes. La web vende a «cualquier pyme»
   porque el negocio aún no ha elegido. [OPINIÓN] El nicho con más activos es **construcción**: ya tienes
   producto (ROVIK.IA) y prototipo (albarán y fugas de horas).
2. **Marca registrada.** «Iron Man» y «JARVIS» son de Marvel/Disney. La web toma el lenguaje visual (rojo y oro,
   núcleo luminoso, interfaz HUD, copiloto por voz) sin usar nombres, imágenes ni el reactor original. [RIESGO]
   residual bajo; no los uses en anuncios ni en redes.
3. **El formulario abre el correo del visitante.** Es seguro y sin coste, pero hay gente sin programa de correo
   configurado: se pierden contactos. Conviene un formulario con servicio (Formspree, Web3Forms) o un enlace de
   agenda.
4. **Legal.** Sin razón social, NIF y domicilio el aviso legal incumple la LSSI.
5. **Dominio.** Con GitHub Pages saldría en `toptendencias.es/rovik-web/`: una consultora bajo el dominio de una
   web de afiliación resta credibilidad.

## DECISIÓN

- A · Conservador: publicar en GitHub Pages sin dominio y enlazarla desde LinkedIn y la firma de correo.
- **B · Equilibrado (recomendado):** dominio propio + Cloudflare Pages + formulario con servicio, y **20 mensajes
  directos por semana a constructoras** usando el escáner ROVIK.IA como gancho («mide en 60 segundos cuántas
  horas pierdes sin facturar»).
- C · Agresivo: lo anterior + Google Ads desde el día 1. Sin prueba social es quemar dinero.

Veredicto de negocio: **VALIDAR**. Lanza la web (coste casi cero), pero la validación se hace vendiendo a un
nicho, no esperando visitas.

## RIESGO PRINCIPAL

Publicar, no mover tráfico y concluir que «la web no funciona». La web no genera demanda: la convierte.

## SIGUIENTE ACCIÓN

**HOY**
1. Crea en GitHub un repositorio vacío llamado `rovik-web` (sin README) y dímelo: lo conecto y lo subo.
2. Rellena razón social, NIF y domicilio (o pásamelos) para `site.config.json`.

**ESTA SEMANA**
3. Dominio propio y publicación en Cloudflare Pages (gratis y permite uso comercial; aplica las cabeceras de seguridad).
4. Formulario con servicio o enlace de agenda.
5. 20 mensajes a constructoras con el enlace directo al escáner (`/#rovik-ia`).

**30 DÍAS**
6. Un cliente de pago en construcción y su caso con cifras reales (horas recuperadas, € facturados) en la web.

**MÉTRICA:** reuniones de diagnóstico por semana. Objetivo inicial: 2. No midas visitas.

## SI SOLO PUDIERAS HACER UNA COSA

Crear el repositorio vacío `rovik-web`. Es lo único que me impide dejar la web publicada, y sin publicar vale cero.
