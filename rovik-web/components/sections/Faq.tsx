import SectionLabel from "@/components/ui/SectionLabel";
import { FAQ } from "@/lib/content";

export default function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative border-t border-line bg-bg py-24 lg:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-4">
          <SectionLabel code={FAQ.code} label={FAQ.label} className="reveal" />
          <h2 id="faq-title" className="display reveal mt-6 text-balance text-[2.2rem] leading-[0.95] sm:text-6xl lg:text-[3.6rem]">
            {FAQ.title}
          </h2>
          <p className="reveal mt-6 max-w-xs text-fg-2">
            ¿Otra duda? Pregúntanos en el formulario de abajo y te contestamos por correo.
          </p>
        </div>
        <div className="border-t border-line-2 lg:col-span-8">
          {FAQ.items.map((f) => (
            <details key={f.q} className="group border-b border-line-2">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-lg font-medium text-fg transition-colors hover:text-gold sm:text-xl [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden="true" className="relative h-4 w-4 shrink-0">
                  <span className="absolute left-0 top-1/2 h-[2px] w-4 -translate-y-1/2 bg-red" />
                  <span className="absolute left-1/2 top-0 h-4 w-[2px] -translate-x-1/2 bg-red transition-transform duration-300 group-open:scale-y-0" />
                </span>
              </summary>
              <p className="max-w-2xl pb-7 pr-10 text-pretty text-fg-2">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
