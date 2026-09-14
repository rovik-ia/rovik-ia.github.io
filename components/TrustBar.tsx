/** Datos verificables del proyecto. Nada de cifras inventadas ni reseñas falsas. */
export default function TrustBar({
  guias,
  productos,
  actualizado,
}: {
  guias: number;
  productos: number;
  actualizado: string;
}) {
  const puntos = [
    ["Sin patrocinios", "Ninguna marca paga por aparecer"],
    [`${guias} guías`, `${productos} productos analizados`],
    ["Actualizado", actualizado],
    ["Precio sin cambios", "La comisión la paga Amazon, no tú"],
  ];
  return (
    <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 mt-10 max-w-3xl">
      {puntos.map(([t, d]) => (
        <li key={t} className="flex gap-2.5">
          <svg viewBox="0 0 20 20" aria-hidden className="w-5 h-5 mt-0.5 shrink-0 fill-orange-300">
            <path d="M10 0a10 10 0 1 0 0 20A10 10 0 0 0 10 0Zm4.7 7.3-5.4 5.4a1 1 0 0 1-1.4 0L5.3 10.1A1 1 0 1 1 6.7 8.7l1.9 1.9 4.7-4.7a1 1 0 0 1 1.4 1.4Z" />
          </svg>
          <span>
            <span className="block font-bold text-white text-sm leading-tight">{t}</span>
            <span className="block text-white/65 text-sm leading-snug">{d}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
