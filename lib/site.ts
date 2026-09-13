export const SITE = {
  name: "Tendencia Top",
  tagline: "Guías de compra de lo que está en tendencia",
  url: "https://rovik-ia.github.io",
  description:
    "Comparativas y guías de compra independientes de los productos más buscados en España: hogar, cocina, bienestar y tecnología.",
  email: "inforovik.ia@gmail.com",
  locale: "es_ES",
};

// Identificador de afiliado de Amazon (ej. "tendenciatop-21").
// Se rellena con NEXT_PUBLIC_AMAZON_TAG al compilar; si está vacío los enlaces
// siguen funcionando pero sin atribución.
export const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "";

export function amazonSearchUrl(query: string): string {
  const base = `https://www.amazon.es/s?k=${encodeURIComponent(query)}`;
  return AMAZON_TAG ? `${base}&tag=${AMAZON_TAG}` : base;
}

export function amazonProductUrl(asin: string): string {
  const base = `https://www.amazon.es/dp/${asin}`;
  return AMAZON_TAG ? `${base}?tag=${AMAZON_TAG}` : base;
}

export const AFFILIATE_DISCLOSURE =
  "En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables.";

export const CATEGORIES: Record<string, { name: string; description: string }> = {
  hogar: {
    name: "Hogar",
    description: "Limpieza, descanso y todo lo que hace la casa más cómoda.",
  },
  clima: {
    name: "Clima",
    description: "Calor, frío, humedad y calidad del aire en casa.",
  },
  cocina: {
    name: "Cocina",
    description: "Pequeños electrodomésticos que se usan a diario.",
  },
  bienestar: {
    name: "Bienestar",
    description: "Recuperación, salud y cuidado personal.",
  },
  tecnologia: {
    name: "Tecnología",
    description: "Dispositivos con buena relación calidad-precio.",
  },
};
