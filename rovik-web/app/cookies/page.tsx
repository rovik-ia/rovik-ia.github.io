import type { Metadata } from "next";
import LegalPage from "@/components/layout/LegalPage";
import CookiePrefsButton from "@/components/consent/CookiePrefsButton";
import { LEGAL_UPDATED } from "@/lib/legal";
import { INTEGRATIONS } from "@/lib/integrations";

export const metadata: Metadata = {
  title: "Cookies",
  description: INTEGRATIONS.tracking.enabled
    ? "Qué cookies usa esta web, para qué y cómo aceptarlas o rechazarlas."
    : "Este sitio no utiliza cookies ni tecnologías de seguimiento.",
  alternates: { canonical: "./" },
};

const t = INTEGRATIONS.tracking;

const ROWS = [
  ...(t.ga4
    ? [{ name: "_ga, _ga_*", owner: "Google (Google Analytics 4)", purpose: "Medir visitas y qué páginas y campañas funcionan", life: "Hasta 2 años" }]
    : []),
  ...(t.googleAds
    ? [
        { name: "_gcl_au", owner: "Google (Google Ads)", purpose: "Atribuir solicitudes de contacto a los anuncios que las generaron", life: "3 meses" },
        { name: "IDE, test_cookie", owner: "Google (doubleclick.net)", purpose: "Medición de conversiones publicitarias", life: "Hasta 13 meses" },
      ]
    : []),
  ...(t.metaPixel ? [{ name: "_fbp, fr", owner: "Meta (Facebook e Instagram)", purpose: "Medir y atribuir las campañas en Meta", life: "3 meses" }] : []),
];

export default function Page() {
  if (!t.enabled) {
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
  return (
    <LegalPage code="L-03" label="Legal" title="Cookies" updated={LEGAL_UPDATED}>
      <p>
        Esta web solo usa cookies de medición y publicidad <strong>si las aceptas</strong> en el aviso. Hasta entonces no se carga ningún script de
        terceros. Si las rechazas, la web funciona exactamente igual.
      </p>
      <h2>Cookies que se instalan si aceptas</h2>
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line-2 text-fg">
              <th scope="col" className="py-2 pr-4 font-semibold">Cookie</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Titular</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Finalidad</th>
              <th scope="col" className="py-2 font-semibold">Duración</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.name} className="border-b border-line align-top">
                <td className="py-2.5 pr-4 font-mono text-[0.85rem] text-fg">{r.name}</td>
                <td className="py-2.5 pr-4">{r.owner}</td>
                <td className="py-2.5 pr-4">{r.purpose}</td>
                <td className="py-2.5">{r.life}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Almacenamiento necesario</h2>
      <p>
        Guardamos en tu navegador tu elección sobre las cookies (clave <code>rovik-consent-v1</code>) durante 12 meses, para no preguntarte en cada
        visita. Es imprescindible para respetar tu decisión y no se comparte con nadie.
      </p>
      <h2>Cambiar tu elección</h2>
      <p>Puedes aceptar o retirar el consentimiento en cualquier momento:</p>
      <p>
        <CookiePrefsButton className="btn btn-ghost" />
      </p>
      <p>
        También puedes borrar las cookies desde la configuración de tu navegador. Más información sobre cómo usan los datos Google
        (policies.google.com/technologies/partner-sites) y Meta (facebook.com/privacy/policy).
      </p>
    </LegalPage>
  );
}
