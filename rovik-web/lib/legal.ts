import { SITE } from "./site";

/** Datos del titular. Si faltan en site.config.json se muestran solo los disponibles. */
export function holderLines(): string[] {
  const l = SITE.legal;
  return [
    `Titular: ${l.holder || "Rovik"}`,
    l.nif ? `NIF: ${l.nif}` : "",
    l.address ? `Domicilio: ${l.address}` : "",
    `Correo electrónico: ${SITE.email}`,
  ].filter(Boolean);
}

export const LEGAL_UPDATED = "30 de septiembre de 2026";
