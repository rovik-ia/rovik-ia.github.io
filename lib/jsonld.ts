/**
 * Serializa datos estructurados para <script type="application/ld+json"> sin riesgo de XSS.
 * JSON.stringify no escapa "</script>": si un texto de una guía lo contuviera, rompería la etiqueta
 * y permitiría inyectar HTML. Se escapan <, >, & y los separadores de línea U+2028 y U+2029.
 */
const SEP_LINEA = new RegExp("\\u2028", "g");
const SEP_PARRAFO = new RegExp("\\u2029", "g");

export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(SEP_LINEA, "\\u2028")
    .replace(SEP_PARRAFO, "\\u2029");
}
