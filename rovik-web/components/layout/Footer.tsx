import Logo from "@/components/ui/Logo";
import { NAV, SITE, asset } from "@/lib/site";
import { INTEGRATIONS } from "@/lib/integrations";
import CookiePrefsButton from "@/components/consent/CookiePrefsButton";

export default function Footer() {
  const year = 2026;
  const home = asset("/");
  return (
    <footer className="relative border-t border-line bg-bg-2">
      <div className="shell grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-5 max-w-sm text-pretty text-fg-2">
            Consultoría de crecimiento, marketing y automatización con IA para empresas que quieren escalar con sistema.
          </p>
          <a href={`mailto:${SITE.email}`} className="link-hud mt-6 inline-block font-mono text-sm">
            {SITE.email}
          </a>
        </div>
        <nav aria-label="Secciones" className="md:col-span-3 md:col-start-7">
          <p className="hud-label mb-4 text-muted">Sistema</p>
          <ul className="space-y-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={`${home}${n.href}`} className="inline-block py-1.5 text-fg-2 transition-colors hover:text-fg">
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <a href={`${home}#contacto`} className="inline-block py-1.5 text-fg-2 transition-colors hover:text-fg">
                Contacto
              </a>
            </li>
          </ul>
        </nav>
        <nav aria-label="Legal" className="md:col-span-3">
          <p className="hud-label mb-4 text-muted">Legal</p>
          <ul className="space-y-1">
            <li>
              <a href={asset("/aviso-legal/")} className="inline-block py-1.5 text-fg-2 transition-colors hover:text-fg">
                Aviso legal
              </a>
            </li>
            <li>
              <a href={asset("/privacidad/")} className="inline-block py-1.5 text-fg-2 transition-colors hover:text-fg">
                Privacidad
              </a>
            </li>
            <li>
              <a href={asset("/cookies/")} className="inline-block py-1.5 text-fg-2 transition-colors hover:text-fg">
                Cookies
              </a>
            </li>
            {INTEGRATIONS.tracking.enabled && (
              <li>
                <CookiePrefsButton className="inline-block min-h-11 py-1.5 text-left text-fg-2 transition-colors hover:text-fg" />
              </li>
            )}
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="shell flex flex-col gap-2 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Rovik. Todos los derechos reservados.</p>
          <p className="hud-label">{INTEGRATIONS.tracking.enabled ? "Cookies solo con tu permiso" : "Sin cookies · Sin rastreadores"}</p>
        </div>
      </div>
      {/* Rótulo decorativo: SVG para que no cuente como texto (ni para lectores ni para contraste) */}
      <div aria-hidden="true" className="pointer-events-none select-none overflow-hidden">
        <svg viewBox="0 0 1000 190" className="-mb-[3%] block w-full" role="presentation" focusable="false">
          <text x="500" y="178" textAnchor="middle" className="display" fill="var(--bg-3)" fontSize="236" style={{ fontStretch: "125%" }}>
            ROVIK
          </text>
        </svg>
      </div>
    </footer>
  );
}
