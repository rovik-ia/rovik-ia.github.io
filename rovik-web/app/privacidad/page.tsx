import type { Metadata } from "next";
import LegalPage from "@/components/layout/LegalPage";
import { holderLines, LEGAL_UPDATED } from "@/lib/legal";
import { SITE } from "@/lib/site";
import { INTEGRATIONS } from "@/lib/integrations";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo trata Rovik los datos personales: qué recogemos, para qué y cómo ejercer tus derechos.",
  alternates: { canonical: "./" },
};

export default function Page() {
  return (
    <LegalPage code="L-02" label="Legal" title="Privacidad" updated={LEGAL_UPDATED}>
      <p>
        Esta política explica cómo se tratan los datos personales en este sitio, conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica
        3/2018 (LOPDGDD).
      </p>
      <h2>Responsable del tratamiento</h2>
      <ul>
        {holderLines().map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <h2>Qué datos recogemos y cómo</h2>
      <p>
        <strong>Este sitio web no tiene base de datos propia.</strong>{" "}
        {INTEGRATIONS.tracking.enabled
          ? "Solo usa cookies de medición y publicidad si las aceptas (ver la política de cookies)."
          : "No usa cookies ni herramientas de analítica o publicidad, y no carga recursos de terceros."}
      </p>
      <ul>
        {INTEGRATIONS.form.enabled ? (
          <li>
            <strong>Formulario de contacto:</strong> los datos que escribes (nombre, correo, empresa, teléfono si lo das y tu mensaje), junto con el
            origen de la visita si llegas desde un anuncio, se envían a un servicio de formularios que actúa como encargado del tratamiento y nos
            los reenvía por correo. Puede estar ubicado fuera del Espacio Económico Europeo; en ese caso la transferencia se ampara en las
            garantías del RGPD (decisión de adecuación o cláusulas contractuales tipo).
          </li>
        ) : (
          <li>
            <strong>Formulario de contacto:</strong> al enviarlo se abre tu programa de correo con el mensaje preparado. Los datos solo nos llegan si
            decides enviar ese correo; hasta entonces no salen de tu dispositivo.
          </li>
        )}
        <li>
          <strong>Escáner ROVIK.IA:</strong> funciona íntegramente en tu navegador. Tus respuestas no se envían ni se guardan; al recargar la página
          desaparecen. Solo nos llegan si eliges enviarnos el informe por correo.
        </li>
        <li>
          <strong>Correo electrónico:</strong> si nos escribes a {SITE.email}, tratamos tu nombre, dirección de correo y la información que incluyas.
        </li>
      </ul>
      {INTEGRATIONS.tracking.enabled && (
        <>
          <h2>Medición y publicidad</h2>
          <p>
            Si aceptas las cookies, Google{INTEGRATIONS.tracking.metaPixel ? " y Meta" : ""} reciben datos de navegación (páginas vistas, origen de la
            visita y si has enviado una solicitud) para medir qué campañas funcionan. Nunca enviamos tu nombre, correo ni el contenido de tus
            mensajes. La base jurídica es tu consentimiento, que puedes retirar en cualquier momento desde la política de cookies.
          </p>
        </>
      )}
      <h2>Finalidad y base jurídica</h2>
      <p>
        Usamos los datos que nos envías para responder a tu solicitud y, si lo pides, preparar una propuesta. La base jurídica es tu consentimiento
        y la aplicación de medidas precontractuales a petición tuya (art. 6.1.a y 6.1.b RGPD). No usamos tus datos para enviarte publicidad sin tu
        permiso.
      </p>
      <h2>Conservación</h2>
      <p>
        Conservamos la correspondencia mientras dure la relación y, después, durante los plazos legales aplicables. Si no llegamos a colaborar,
        la eliminamos cuando nos lo pidas o, como máximo, al año del último contacto.
      </p>
      <h2>Destinatarios</h2>
      <p>
        No cedemos datos a terceros salvo obligación legal. El correo se gestiona con un proveedor de servicios de correo electrónico que actúa
        como encargado del tratamiento.
      </p>
      <h2>Tus derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a {SITE.email}. Si
        consideras que no hemos atendido correctamente tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos
        (www.aepd.es).
      </p>
    </LegalPage>
  );
}
