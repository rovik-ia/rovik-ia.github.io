import type { Metadata } from "next";
import LegalPage from "@/components/layout/LegalPage";
import { holderLines, LEGAL_UPDATED } from "@/lib/legal";
import { SITE } from "@/lib/site";

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
        <strong>Este sitio web no almacena datos personales.</strong> No tiene base de datos, no usa cookies ni herramientas de analítica o
        publicidad, y no carga recursos de terceros.
      </p>
      <ul>
        <li>
          <strong>Formulario de contacto:</strong> al enviarlo se abre tu programa de correo con el mensaje preparado. Los datos solo nos llegan si
          decides enviar ese correo; hasta entonces no salen de tu dispositivo.
        </li>
        <li>
          <strong>Escáner ROVIK.IA:</strong> funciona íntegramente en tu navegador. Tus respuestas no se envían ni se guardan; al recargar la página
          desaparecen. Solo nos llegan si eliges enviarnos el informe por correo.
        </li>
        <li>
          <strong>Correo electrónico:</strong> si nos escribes a {SITE.email}, tratamos tu nombre, dirección de correo y la información que incluyas.
        </li>
      </ul>
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
