import type { Metadata } from "next";
import { SITE } from "@/lib/site";
export const metadata: Metadata = { title: "Política de privacidad" };
export default function Page() {
  return (
    <article className="prose max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight mb-6">Política de privacidad</h1>
      <p>Esta política describe cómo tratamos los datos personales conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 (LOPDGDD).</p>
      <h2>Responsable</h2>
      <p>El responsable del sitio, con contacto en {SITE.email}.</p>
      <h2>Qué datos tratamos</h2>
      <p>Este sitio no tiene formularios de registro ni de comentarios y no recopila datos personales de forma directa. Si nos escribes por correo electrónico, trataremos tu dirección y el contenido del mensaje únicamente para responderte, con base en tu consentimiento y en nuestro interés legítimo de atender consultas.</p>
      <h2>Servicios de terceros</h2>
      <p>El sitio se aloja en GitHub Pages, cuyo proveedor puede registrar datos técnicos de conexión (como la dirección IP) por motivos de seguridad. Los enlaces a Amazon.es incluyen un identificador de afiliado que permite a Amazon atribuir la visita; Amazon trata esos datos según su propia política de privacidad.</p>
      <h2>Derechos</h2>
      <p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a {SITE.email}. También puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).</p>
    </article>
  );
}
