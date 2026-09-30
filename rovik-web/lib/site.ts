import config from "../site.config.json";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefija rutas de archivos de /public con la subruta de publicación. */
export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}

export const SITE = {
  name: "Rovik",
  url: config.url.replace(/\/$/, ""),
  email: config.email,
  whatsapp: config.whatsapp,
  legal: config.legal,
  locale: "es_ES",
  title: "Rovik · Consultoría de crecimiento, marketing e IA para escalar tu empresa",
  shortTitle: "Rovik · Sistema de escalado empresarial",
  description:
    "Consultoría estratégica, marketing de captación y automatización con IA en un solo sistema. Diagnosticamos dónde pierde tu empresa clientes, tiempo y margen, y montamos el sistema para escalar sin depender del fundador.",
} as const;

export const NAV = [
  { href: "#protocolo", label: "Protocolo", code: "02" },
  { href: "#modulos", label: "Módulos", code: "03" },
  { href: "#rovik-ia", label: "ROVIK.IA", code: "04" },
  { href: "#casos", label: "Casos", code: "05" },
  { href: "#faq", label: "FAQ", code: "07" },
] as const;

export function mailto(subject: string, body: string): string {
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
