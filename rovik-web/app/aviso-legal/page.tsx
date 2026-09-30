import type { Metadata } from "next";
import LegalPage from "@/components/layout/LegalPage";
import { holderLines, LEGAL_UPDATED } from "@/lib/legal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Información legal del sitio web de Rovik conforme a la LSSI-CE.",
  alternates: { canonical: "./" },
};

export default function Page() {
  return (
    <LegalPage code="L-01" label="Legal" title="Aviso legal" updated={LEGAL_UPDATED}>
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se
        facilitan los datos identificativos del responsable de este sitio web:
      </p>
      <ul>
        {holderLines().map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <h2>Objeto</h2>
      <p>
        Este sitio presenta los servicios de consultoría de crecimiento, marketing y automatización con inteligencia artificial de {SITE.name}. La
        información publicada tiene carácter informativo y no constituye una oferta vinculante: cada proyecto se formaliza mediante una propuesta
        por escrito.
      </p>
      <h2>Escáner ROVIK.IA</h2>
      <p>
        El escáner de la página de inicio es una herramienta orientativa que funciona íntegramente en el navegador del usuario. Sus resultados son
        una aproximación automática basada en las respuestas facilitadas y no sustituyen a un análisis profesional.
      </p>
      <h2>Propiedad intelectual e industrial</h2>
      <p>
        Los textos, diseños, imágenes, código y demás elementos de este sitio son titularidad de {SITE.name} o se usan con autorización, y están
        protegidos por la normativa de propiedad intelectual e industrial. No se permite su reproducción total o parcial sin autorización
        expresa. Las imágenes del núcleo 3D son renders originales creados para este sitio.
      </p>
      <h2>Responsabilidad</h2>
      <p>
        {SITE.name} procura que la información sea exacta y esté actualizada, pero no garantiza la ausencia de errores ni se responsabiliza de las
        decisiones tomadas únicamente a partir del contenido de este sitio.
      </p>
      <h2>Legislación aplicable</h2>
      <p>Este aviso legal se rige por la legislación española.</p>
    </LegalPage>
  );
}
