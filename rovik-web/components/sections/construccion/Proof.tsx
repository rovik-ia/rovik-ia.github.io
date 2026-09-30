import SectionLabel from "@/components/ui/SectionLabel";
import { C_PROOF } from "@/lib/content-construccion";
import { CASES } from "@/lib/content";
import { asset } from "@/lib/site";

export default function Proof() {
  const items = CASES.items.filter((c) => C_PROOF.ids.includes(c.id));
  return (
    <section id="pruebas" aria-labelledby="proof-title" className="relative border-t border-line bg-bg-2 py-20 lg:py-28">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-7">
            <SectionLabel code={C_PROOF.code} label={C_PROOF.label} className="reveal" />
            <h2 id="proof-title" className="display reveal mt-6 text-balance text-[1.95rem] leading-[0.95] min-[400px]:text-[2.2rem] sm:text-5xl lg:text-[3.4rem]">
              {C_PROOF.title}
            </h2>
          </div>
          <p className="reveal self-end text-pretty text-lg text-fg-2 lg:col-span-4 lg:col-start-9">{C_PROOF.lead}</p>
        </div>
        <ul className="mt-12 grid gap-10 md:grid-cols-2 md:gap-6">
          {items.map((c) => (
            <li key={c.id} className="reveal">
              <article>
                <div className="hud-frame relative aspect-[16/10] overflow-hidden border border-line-2 bg-bg [--hud-corner:var(--red)]">
                  <img
                    src={asset(`/img/${c.image}-800.webp`)}
                    srcSet={`${asset(`/img/${c.image}-800.webp`)} 800w, ${asset(`/img/${c.image}-1400.webp`)} 1400w`}
                    sizes="(min-width: 768px) 45vw, 100vw"
                    alt={c.alt}
                    width={1400}
                    height={875}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">{c.title}</h3>
                  <p className="hud-label border border-gold/50 px-2.5 py-1 text-gold">{c.kind}</p>
                </div>
                <p className="mt-3 text-pretty text-fg-2">{c.text}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
