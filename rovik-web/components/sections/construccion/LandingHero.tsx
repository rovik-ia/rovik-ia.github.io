import Arrow from "@/components/ui/Arrow";
import { C_HERO } from "@/lib/content-construccion";
import { asset } from "@/lib/site";

export default function LandingHero() {
  return (
    <section id="inicio" aria-labelledby="c-hero-title" className="blueprint relative isolate overflow-hidden pt-[var(--header-h)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_60%_at_80%_45%,rgb(127_231_255/0.08),transparent_70%)]"
      />
      <div className="shell grid items-center gap-10 pb-16 pt-10 lg:min-h-[calc(92svh-var(--header-h))] lg:grid-cols-12 lg:gap-6 lg:py-14">
        <div className="lg:col-span-6">
          <p className="hud-label flex items-center gap-3 text-muted">
            <span className="h-1.5 w-1.5 bg-red" aria-hidden="true" />
            {C_HERO.eyebrow}
          </p>
          <h1 id="c-hero-title" className="display mt-6 text-[clamp(2.3rem,9.6vw,3.2rem)] sm:text-[clamp(3.2rem,7vw,4.4rem)] lg:text-[3.7rem] xl:text-[4.2rem]">
            <span className="block">{C_HERO.title[0]}</span>
            <span className="block text-red-hi">{C_HERO.title[1]}</span>
            <span className="block">{C_HERO.title[2]}</span>
          </h1>
          <p className="mt-7 max-w-[36rem] text-pretty text-[1.06rem] leading-relaxed text-fg-2 sm:text-lg">{C_HERO.lead}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#calculadora" className="btn btn-primary">
              Calcular mis fugas
              <Arrow />
            </a>
            <a href="#contacto" className="btn btn-ghost">
              Solicitar diagnóstico
            </a>
          </div>
          <ul className="hud-label mt-7 flex flex-wrap gap-x-5 gap-y-2 text-muted" aria-label="Qué incluye el albarán digital">
            {C_HERO.facts.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span aria-hidden="true" className="text-cyan">
                  ◆
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <figure className="lg:col-span-6">
          <div className="hud-frame relative aspect-[16/10] overflow-hidden border border-line-2 bg-bg-2 [--hud-corner:var(--cyan)]">
            <img
              src={asset("/img/caso-albaran-800.webp")}
              srcSet={`${asset("/img/caso-albaran-800.webp")} 800w, ${asset("/img/caso-albaran-1400.webp")} 1400w`}
              sizes="(min-width: 1024px) 45vw, 100vw"
              alt="Dos pantallas del albarán digital: el parte del día con la cuadrilla y el control de horas pagadas sin albarán en euros"
              width={1400}
              height={875}
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
            <p className="hud-label absolute left-3 top-3 bg-bg/85 px-2 py-1 text-cyan" aria-hidden="true">
              Albarán digital · Prototipo funcional
            </p>
          </div>
          <figcaption className="mt-3 text-sm text-muted">Pantallas reales del prototipo con datos de ejemplo.</figcaption>
        </figure>
      </div>
    </section>
  );
}
