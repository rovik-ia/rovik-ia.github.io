"use client";

import { useEffect, useState } from "react";
import { INTEGRATIONS } from "@/lib/integrations";
import { CONSENT_EVENT, readConsent, saveConsent, startTracking } from "@/lib/analytics";
import { asset } from "@/lib/site";

/**
 * Aviso de cookies. Solo existe si hay medición configurada; hasta que el visitante acepta
 * no se carga ningún script ni se envía nada a terceros. Rechazar es tan fácil como aceptar.
 */
export default function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const enabled = INTEGRATIONS.tracking.enabled;

  useEffect(() => {
    if (!enabled) return;
    const saved = readConsent();
    if (saved === "granted") startTracking();
    // Mostrar el aviso depende del almacenamiento del navegador: solo se sabe en cliente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else if (saved === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_EVENT, reopen);
  }, [enabled]);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-consent-open", open);
  }, [open]);

  if (!enabled || !open) return null;

  const decide = (granted: boolean) => {
    saveConsent(granted ? "granted" : "denied");
    setOpen(false);
    if (granted) startTracking();
    else if (window.__rovikTracking) window.location.reload(); // retirar el permiso detiene las etiquetas ya cargadas
  };

  return (
    <section
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-line-2 bg-bg-2 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-12px_32px_rgb(0_0_0/0.45)]"
    >
      <div className="shell flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="max-w-3xl">
          <p className="hud-label text-cyan">Cookies de medición</p>
          <p className="mt-1.5 text-pretty text-sm text-fg-2">
            Si nos dejas, usamos cookies de Google{INTEGRATIONS.tracking.metaPixel ? " y Meta" : ""} para saber qué anuncios traen clientes. Sin ellas la web funciona
            igual.{" "}
            <a href={asset("/cookies/")} className="link-hud">
              Más información
            </a>
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-3 md:flex">
          <button type="button" onClick={() => decide(false)} className="btn btn-ghost !min-h-12 !px-5">
            Rechazar
          </button>
          <button type="button" onClick={() => decide(true)} className="btn btn-primary !min-h-12 !px-5">
            Aceptar
          </button>
        </div>
      </div>
    </section>
  );
}
