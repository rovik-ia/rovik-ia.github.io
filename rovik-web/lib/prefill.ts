// Pasa un texto al formulario de contacto (desde el escáner o la calculadora) y lleva al visitante a él.
export const PREFILL_EVENT = "rovik:prefill";

export interface Prefill {
  mensaje: string;
  origen: string;
}

export function prefillContact(detail: Prefill) {
  window.dispatchEvent(new CustomEvent<Prefill>(PREFILL_EVENT, { detail }));
  const target = document.getElementById("contacto");
  if (target) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
}
