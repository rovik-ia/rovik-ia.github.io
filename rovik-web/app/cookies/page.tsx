import type { Metadata } from "next";
import LegalPage from "@/components/layout/LegalPage";
import { LEGAL_UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Este sitio no utiliza cookies ni tecnologías de seguimiento.",
  alternates: { canonical: "./" },
};

export default function Page() {
  return (
    <LegalPage code="L-03" label="Legal" title="Cookies" updated={LEGAL_UPDATED}>
      <p>
        <strong>Este sitio no utiliza cookies</strong>, ni propias ni de terceros, ni otras tecnologías de seguimiento como píxeles, huellas del
        navegador o almacenamiento local con fines analíticos o publicitarios. Por eso no te mostramos ningún aviso de consentimiento.
      </p>
      <h2>¿Y si esto cambia?</h2>
      <p>
        Si en el futuro incorporamos alguna herramienta que use cookies no necesarias, actualizaremos esta página y te pediremos el consentimiento
        antes de activarla, tal como exige el artículo 22.2 de la LSSI-CE.
      </p>
    </LegalPage>
  );
}
