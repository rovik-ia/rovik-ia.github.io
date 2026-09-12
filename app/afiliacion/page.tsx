import type { Metadata } from "next";
import { SITE } from "@/lib/site";
export const metadata: Metadata = { title: "Aviso de afiliación" };
export default function Page() {
  return (
    <article className="prose max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight mb-6">Aviso de afiliación</h1>
      <p>En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables.</p>
      <p>{SITE.name} participa en el Programa de Afiliados de Amazon EU, un programa de publicidad para afiliados diseñado para ofrecer a sitios web un modo de obtener comisiones por publicidad, publicitando e incluyendo enlaces a Amazon.es.</p>
      <p>Qué significa para ti: cuando haces clic en un enlace a Amazon desde esta web y compras algo, recibimos un pequeño porcentaje de la venta. El precio que pagas es exactamente el mismo. Esto nos permite mantener el sitio sin publicidad invasiva.</p>
      <p>Qué no cambia: la selección de productos y el orden de las guías se decide por criterios editoriales. Un producto no sube puestos por pagar más comisión.</p>
      <p>Los precios y la disponibilidad que se muestran son orientativos y pueden variar. La información definitiva es la que aparece en Amazon.es en el momento de la compra.</p>
    </article>
  );
}
