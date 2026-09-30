import SectionLabel from "@/components/ui/SectionLabel";
import { C_SOLUTIONS } from "@/lib/content-construccion";

export default function Solutions() {
  return (
    <section id="solucion" aria-labelledby="sol-title" className="relative border-t border-line bg-bg py-20 lg:py-28">
      <div className="shell">
        <SectionLabel code={C_SOLUTIONS.code} label={C_SOLUTIONS.label} className="reveal" />
        <h2 id="sol-title" className="display reveal mt-6 max-w-4xl text-balance text-[2.2rem] leading-[0.95] sm:text-5xl lg:text-[3.6rem]">
          {C_SOLUTIONS.title}
        </h2>
        <ol className="mt-12 border-t border-line-2 lg:mt-16">
          {C_SOLUTIONS.items.map((it, i) => (
            <li key={it.name} className="reveal grid gap-4 border-b border-line-2 py-8 lg:grid-cols-12 lg:gap-6 lg:py-10" style={{ ["--delay" as string]: `${i * 80}ms` }}>
              <div className="lg:col-span-5">
                <p className="hud-label flex items-center gap-2 text-alert">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-alert" />
                  Fuga 0{i + 1}
                </p>
                <p className="mt-2 text-pretty text-xl text-fg-2">{it.pain}</p>
              </div>
              <div className="lg:col-span-6 lg:col-start-7">
                <h3 className="text-2xl font-semibold tracking-tight text-fg">
                  <span aria-hidden="true" className="mr-2 text-gold">
                    →
                  </span>
                  {it.name}
                </h3>
                <p className="mt-2 max-w-xl text-pretty text-fg-2">{it.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
