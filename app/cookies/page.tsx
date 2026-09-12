import type { Metadata } from "next";
import { SITE } from "@/lib/site";
export const metadata: Metadata = { title: "Política de cookies" };
export default function Page() {
  return (
    <article className="prose max-w-3xl mx-auto container pt-10">
      <h1 className="text-3xl font-extrabold tracking-tight mb-6">Política de cookies</h1>
      <p>Este sitio no instala cookies propias de seguimiento ni de publicidad y no utiliza herramientas de analítica que requieran consentimiento. Por eso no verás un banner de cookies.</p>
      <p>Las cookies técnicas estrictamente necesarias para servir la página, si las hubiera, están exentas de consentimiento conforme al artículo 22.2 de la LSSI-CE.</p>
      <p>Al hacer clic en un enlace hacia Amazon.es abandonas este sitio, y Amazon podrá instalar sus propias cookies conforme a su política. Puedes gestionarlas desde la configuración de tu navegador.</p>
      <p>Si en el futuro incorporamos analítica o publicidad, actualizaremos esta página y solicitaremos el consentimiento correspondiente antes de activar ninguna cookie no esencial.</p>
    </article>
  );
}
