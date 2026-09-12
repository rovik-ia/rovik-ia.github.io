export type Product = {
  name: string;
  badge?: string; // "Mejor calidad-precio", "Más vendido", etc.
  priceRange: string; // "60-90 €"
  summary: string;
  pros: string[];
  cons: string[];
  idealFor: string;
  searchQuery: string; // consulta que se usa para el enlace a Amazon
  asin?: string; // si se conoce, enlace directo al producto
  imageQuery?: string; // búsqueda en inglés para la imagen ilustrativa (Pexels)
};

export type Faq = { q: string; a: string };

export type Article = {
  slug: string;
  title: string;
  description: string;
  category: keyof typeof import("./site").CATEGORIES;
  date: string; // YYYY-MM-DD
  updated?: string;
  readingMinutes: number;
  photoQuery?: string; // búsqueda en inglés para la foto de cabecera (Pexels)
  intro: string[];
  quickPick: { label: string; product: string }[];
  criteria: { title: string; text: string }[];
  products: Product[];
  buyingTips: string[];
  faq: Faq[];
  conclusion: string;
};
