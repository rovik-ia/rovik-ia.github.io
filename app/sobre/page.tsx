import type { Metadata } from "next";
import { SITE } from "@/lib/site";
export const metadata: Metadata = { title: "Sobre nosotros" };
export default function Page() {
  return (
    <article className="prose max-w-3xl mx-auto container pt-10">
      <h1 className="text-3xl font-extrabold tracking-tight mb-6">Sobre nosotros</h1>
      <p>{SITE.name} es un proyecto editorial independiente que publica guías de compra en español de los productos más buscados en hogar, cocina, bienestar y tecnología.</p>
      <p>Cada guía se escribe a partir de fichas técnicas, análisis independientes y experiencia de uso publicada, y se resume en lo que de verdad cambia la decisión: consumo, ruido, mantenimiento, durabilidad y coste real. Revisamos las guías periódicamente y señalamos la fecha de la última actualización en cada una.</p>
      <p>No aceptamos pagos de marcas por aparecer ni por posicionarse. La web se financia con enlaces de afiliación: si compras a través de uno de ellos, podemos recibir una comisión sin coste adicional para ti.</p>
      <p>Contacto: {SITE.email}</p>
    </article>
  );
}
