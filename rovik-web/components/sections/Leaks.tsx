import SectionLabel from "@/components/ui/SectionLabel";
import Arrow from "@/components/ui/Arrow";
import { LEAKS } from "@/lib/content";

export default function Leaks() {
  return (
    <section id="fugas" aria-labelledby="fugas-title" className="relative border-t border-line bg-bg py-24 lg:py-36">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-6">
        <div className="self-start lg:sticky lg:top-[calc(var(--header-h)+3rem)] lg:col-span-5">
          <SectionLabel code={LEAKS.code} label={LEAKS.label} tone="red" className="reveal" />
          <h2 id="fugas-title" className="display-md reveal mt-6 text-balance text-[2.15rem] sm:text-5xl lg:text-[3.4rem]">
            {LEAKS.title}
          </h2>
          <p className="reveal mt-6 max-w-md text-pretty text-lg text-fg-2">{LEAKS.lead}</p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <ol className="border-t border-line-2">
            {LEAKS.items.map((item, i) => (
              <li key={item.code} className="reveal scanline border-b border-line-2" style={{ ["--delay" as string]: `${i * 90}ms` }}>
                <article className="grid gap-x-5 gap-y-3 py-8 sm:grid-cols-[8.5rem_1fr] sm:py-10">
                  <p className="hud-label flex items-center gap-2 self-start text-alert sm:pt-2.5">
                    <span className="relative flex h-2 w-2" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-alert opacity-60 motion-safe:animate-[pulse-ring_1.8s_ease-out_infinite]" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-alert" />
                    </span>
                    {item.code}
                  </p>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight text-fg sm:text-[1.7rem]">{item.title}</h3>
                    <p className="mt-2 max-w-lg text-pretty text-fg-2">{item.text}</p>
                  </div>
                </article>
              </li>
            ))}
          </ol>
          <div className="reveal mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-sm text-pretty font-medium text-fg">{LEAKS.close}</p>
            <a href="#rovik-ia" className="btn btn-ghost shrink-0">
              Medir mis fugas
              <Arrow />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
