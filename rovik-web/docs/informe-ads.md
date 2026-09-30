# Informe · ¿Pueden las campañas de Ads traer clientes a Rovik?

Fecha: 30-09-2026 · Versión 2 de la web · Detalle del plan en `marketing/PLAN-CAMPANAS.md`

## RESUMEN

- **Con la web de la versión 1: no.** [OPINIÓN] Habría sido pagar clics sin poder medirlos ni convertirlos bien.
- **Con la versión 2: se puede validar**, con presupuesto acotado y un solo nicho. No garantizo clientes.
  Garantizo que sabrás en 30 días si Ads funciona o no, con datos y no con intuición.
- Cambios hechos:
  - formulario real conectable a un servicio;
  - medición de conversiones solo con consentimiento;
  - página de campaña para construcción con calculadora de fugas;
  - escáner conectado al formulario;
  - botón de contacto fijo en el móvil;
  - kit de Google Ads listo para importar.

## ANÁLISIS

### Por qué la versión 1 no estaba lista para Ads

| Fallo | Consecuencia en una campaña | Corregido en la v2 |
| --- | --- | --- |
| Sin medición de conversiones | Google no sabe qué clic trae contactos: no optimiza y tú no sabes qué palabra funciona | Google Ads, GA4 y Meta bajo consentimiento; la conversión se registra solo cuando el servicio confirma la solicitud |
| Formulario que abre el correo del visitante | En el móvil, sin correo configurado, el contacto se pierde. Tampoco hay conversión fiable | Envío directo a Formspree o Web3Forms, con el correo como respaldo si falla |
| Mensaje para «cualquier pyme» | Palabras clave caras y visitas con poca intención | Página `/constructoras/` con una sola promesa: horas y albaranes |
| Sin página de aterrizaje | El anuncio promete una cosa y la home habla de todo | Misma promesa en anuncio y página; cabecera sin menú que distraiga |
| Sin forma de saber de qué campaña viene cada contacto | No se puede calcular el coste por cliente | La solicitud lleva `utm_*` y `gclid` |

### Evaluación: «prueba de 30 días en Google Ads para construcción»

| Criterio | Nota | Base |
| --- | --- | --- |
| Mercado | 7/10 | [INFERENCIA] Muchas subcontratas y constructoras siguen con partes en papel |
| Demanda | 5/10 | [RIESGO] No hay datos de volumen de búsqueda: hay que verificarlo en el Planificador de palabras clave |
| Velocidad | 9/10 | [HECHO] La página, la medición y los anuncios están hechos |
| Coste | 8/10 | [HECHO] Tope de 450–600 € y criterios de corte definidos |
| Escalabilidad | 7/10 | [INFERENCIA] Si funciona, se escala subiendo presupuesto en el mismo nicho |
| Probabilidad | 5/10 | [OPINIÓN] Sin testimonios ni casos con cifras, la conversión será modesta |
| **Total** | **41/60** | **Replantear → validar barato.** No es una apuesta para meter mucho dinero |

## LO QUE PROBABLEMENTE ESTÁS IGNORANDO

1. **Ads amplifica; no crea.** Si la oferta no convence cara a cara, Ads solo acelera la pérdida.
2. **Sin dominio propio no hay campaña.** Google evalúa la página de destino, y `toptendencias.es/rovik-web` no transmite confianza.
3. **El ticket manda.** Sin precio no hay forma de saber cuánto se puede pagar por cliente. Con ≈ 500 € por cliente
   (supuesto del plan), necesitas al menos 1.500 € de margen el primer año por cliente.
4. **La prueba social pesa más que el diseño.** El primer caso real con cifras («X horas recuperadas en la obra Y») subirá la
   conversión más que cualquier ajuste visual.
5. **«Piloto en una obra» es una oferta nueva** que he propuesto en la página. [RIESGO] Confírmala o dime cómo quieres llamarla.

## DECISIÓN

- A · Conservador: no hacer Ads; solo prospección directa con el enlace a la calculadora.
- **B · Equilibrado (recomendado):** prueba de 30 días en Google Search (450–600 €) **y**, en paralelo, 20 mensajes por
  semana a subcontratas con el mismo enlace.
- C · Agresivo: Google + Meta + LinkedIn desde el primer día. Diluye el presupuesto y no deja aprender nada.

Veredicto: **VALIDAR** con B.

## RIESGO PRINCIPAL

Lanzar la campaña sin los requisitos del plan (dominio, datos legales, formulario con servicio y conversión) y juzgar Ads
con datos que no existen.

## SIGUIENTE ACCIÓN

**HOY**
1. Crea una cuenta gratuita en Formspree o Web3Forms y pásame el endpoint o la clave.
2. Crea la acción de conversión «Envío de formulario» en Google Ads y pásame el `AW-…` y la etiqueta.

**ESTA SEMANA**
3. Dominio y publicación. Importar las palabras clave, las negativas y el anuncio de `marketing/google-ads/`.

**30 DÍAS**
4. Decidir con los criterios del plan: seguir, corregir o cancelar.

**MÉTRICA:** coste por reunión de diagnóstico. Los clics y las impresiones no sirven para decidir.

## SI SOLO PUDIERAS HACER UNA COSA

Mandar hoy el enlace `/constructoras/#calculadora` a 10 subcontratas que conozcas. Es gratis, y te dirá en una semana si
la promesa interesa antes de pagar un solo clic.
