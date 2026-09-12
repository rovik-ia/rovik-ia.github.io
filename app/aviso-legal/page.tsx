import type { Metadata } from "next";
import { SITE } from "@/lib/site";
export const metadata: Metadata = { title: "Aviso legal" };
export default function Page() {
  return (
    <article className="prose max-w-3xl mx-auto container pt-10">
      <h1 className="text-3xl font-extrabold tracking-tight mb-6">Aviso legal</h1>
      <p>En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de que este sitio web es un proyecto editorial de carácter informativo. Titular: el responsable del sitio, con dirección de contacto {SITE.email}.</p>
      <h2>Objeto</h2>
      <p>La web publica guías de compra y comparativas de productos. No vende productos ni interviene en las transacciones, que se realizan en la tienda de destino bajo sus propias condiciones.</p>
      <h2>Propiedad intelectual</h2>
      <p>Los textos y elementos propios de este sitio están protegidos por la legislación de propiedad intelectual. Las marcas y nombres de productos citados pertenecen a sus respectivos titulares y se usan únicamente con fines identificativos.</p>
      <h2>Exclusión de responsabilidad</h2>
      <p>La información se ofrece de buena fe y se revisa periódicamente, pero puede contener errores o quedar desactualizada. Las especificaciones, precios y disponibilidad definitivos son los que muestre el vendedor. El uso de la información es responsabilidad exclusiva del usuario.</p>
      <h2>Enlaces externos</h2>
      <p>Este sitio contiene enlaces a sitios de terceros, incluidos enlaces de afiliación. No controlamos el contenido de esos sitios ni nos hacemos responsables del mismo.</p>
    </article>
  );
}
