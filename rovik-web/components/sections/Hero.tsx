import CoreCanvas from "@/components/core/CoreCanvas";
import Arrow from "@/components/ui/Arrow";
import { HERO } from "@/lib/content";
import { asset } from "@/lib/site";

const CALLOUT_POS = [
  "left-[7%] top-[12%]",
  "right-[0%] top-[20%]",
  "right-[2%] bottom-[16%]",
  "left-[0%] bottom-[22%]",
];

export default function Hero() {
  return (
    <section id="inicio" aria-labelledby="hero-title" className="blueprint relative isolate overflow-hidden pt-[var(--header-h)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_78%_52%,rgb(200_16_46/0.16),transparent_70%)]"
      />
      <div className="shell relative grid items-center gap-y-6 pb-8 pt-10 lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-12 lg:gap-x-6 lg:py-10">
        <div className="relative z-10 lg:col-span-7">
          <p className="hud-label flex items-center gap-3 text-muted">
            <span className="h-1.5 w-1.5 bg-red" aria-hidden="true" />
            {HERO.eyebrow}
          </p>
          <h1 id="hero-title" className="display mt-6 text-[clamp(2.65rem,11.4vw,3.6rem)] text-fg sm:text-[clamp(3.6rem,8.4vw,5.1rem)] lg:text-[4.3rem] xl:text-[5.1rem] 2xl:text-[6rem]">
            <span className="block">{HERO.title[0]}</span>
            <span className="block text-red-hi">{HERO.title[1]}</span>
            <span className="block">{HERO.title[2]}</span>
          </h1>
          <p className="mt-7 max-w-[38rem] text-pretty text-[1.06rem] leading-relaxed text-fg-2 sm:text-lg">{HERO.lead}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={HERO.primary.href} className="btn btn-primary">
              {HERO.primary.label}
              <Arrow />
            </a>
            <a href={HERO.secondary.href} className="btn btn-ghost">
              {HERO.secondary.label}
            </a>
          </div>
          <ul className="hud-label mt-6 flex flex-wrap gap-x-5 gap-y-2 text-muted" aria-label="Cómo funciona el escáner">
            {HERO.micro.map((m) => (
              <li key={m} className="flex items-center gap-2">
                <span aria-hidden="true" className="text-cyan">
                  ◆
                </span>
                {m}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative -mx-[var(--gutter)] lg:col-span-5 lg:mx-0">
          <div className="relative mx-auto aspect-square w-full max-w-[34rem] lg:absolute lg:left-1/2 lg:top-1/2 lg:w-full lg:max-w-[44rem] xl:w-[112%] lg:-translate-x-1/2 lg:-translate-y-1/2">
            <CoreCanvas
              mode="hero"
              className="absolute inset-0"
              fallback={
                <picture>
                  <source
                    type="image/webp"
                    srcSet={`${asset("/img/core-hero-560.webp")} 560w, ${asset("/img/core-hero-900.webp")} 900w, ${asset("/img/core-hero-1400.webp")} 1400w`}
                    sizes="(min-width: 1024px) 46rem, 100vw"
                  />
                  <img
                    src={asset("/img/core-hero-900.webp")}
                    alt=""
                    width={900}
                    height={900}
                    decoding="async"
                    fetchPriority="low"
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                </picture>
              }
            />
            <ul aria-hidden="true" className="pointer-events-none absolute inset-0 hidden sm:block lg:hidden xl:block">
              {HERO.callouts.map((c, i) => (
                <li key={c.code} className={`absolute ${CALLOUT_POS[i]} reveal`} style={{ ["--delay" as string]: `${900 + i * 160}ms` }}>
                  <span className="hud-frame block border border-line-2/70 bg-bg/70 px-3 py-2 [--hud-corner:var(--cyan)]">
                    <span className="hud-label block text-cyan">
                      {c.code} · {c.label}
                    </span>
                    <span className="mt-0.5 block text-[0.8rem] text-fg-2">{c.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {/* Reserva de alto en escritorio para el núcleo posicionado en absoluto */}
          <div className="hidden lg:block lg:aspect-square" />
        </div>
      </div>

      <div className="shell relative z-10 pb-8 lg:pb-10">
        <div className="flex flex-col gap-5 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl text-pretty text-[0.95rem] text-fg-2">{HERO.audience}</p>
          <a href="#fugas" className="hud-label group flex min-h-11 shrink-0 items-center gap-3 text-muted transition-colors hover:text-fg">
            <span className="relative block h-8 w-px overflow-hidden bg-line-2" aria-hidden="true">
              <span className="absolute inset-x-0 top-0 h-3 bg-red-hi motion-safe:animate-[drop_1.8s_ease-in-out_infinite]" />
            </span>
            Iniciar escaneo
          </a>
        </div>
      </div>
    </section>
  );
}
