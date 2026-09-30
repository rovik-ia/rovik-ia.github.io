import { FAQ, MODULES } from "./content";
import { SITE } from "./site";

/** Serializa JSON-LD escapando "<" para que ningún texto pueda cerrar la etiqueta script. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function homeGraph() {
  const url = SITE.url + "/";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${url}#organizacion`,
        name: SITE.name,
        url,
        email: SITE.email,
        description: SITE.description,
        areaServed: { "@type": "Country", name: "España" },
        knowsLanguage: "es",
        logo: `${SITE.url}/icon.svg`,
        image: `${SITE.url}/og.jpg`,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Módulos Rovik",
          itemListElement: MODULES.items.map((m) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: m.service, description: m.text },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${url}#web`,
        url,
        name: SITE.name,
        inLanguage: "es-ES",
        publisher: { "@id": `${url}#organizacion` },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: FAQ.items.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

export function constructionGraph(items: { q: string; a: string }[], name: string, description: string) {
  const url = `${SITE.url}/constructoras/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#servicio`,
        name,
        description,
        serviceType: "Digitalización de partes y albaranes de obra y control de horas",
        areaServed: { "@type": "Country", name: "España" },
        audience: { "@type": "BusinessAudience", audienceType: "Constructoras y subcontratas" },
        provider: { "@id": `${SITE.url}/#organizacion` },
        url,
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };
}
