import SectionLabel from "@/components/ui/SectionLabel";
import { C_STEPS } from "@/lib/content-construccion";

export default function Steps() {
  return (
    <section id="como" aria-labelledby="steps-title" className="blueprint relative border-t border-line bg-bg py-20 lg:py-28">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-4">
          <SectionLabel code={C_STEPS.code} label={C_STEPS.label} tone="red" className="reveal" />
          <h2 id="steps-title" className="display reveal mt-6 text-balance text-[2.2rem] leading-[0.95] sm:text-5xl lg:text-[3.2rem]">
            {C_STEPS.title}
          </h2>
        </div>
        <ol className="grid border-t border-line-2 md:grid-cols-3 lg:col-span-8">
          {C_STEPS.items.map((s, i) => (
            <li
              key={s.title}
              className={`reveal border-b border-line-2 py-8 md:border-b-0 md:py-10 ${i > 0 ? "md:border-l md:pl-6" : ""} ${i < 2 ? "md:pr-6" : ""}`}
              style={{ ["--delay" as string]: `${i * 90}ms` }}
            >
              <p className="hud-num text-sm text-gold">Paso 0{i + 1}</p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-fg">{s.title}</h3>
              <p className="mt-2 text-pretty text-fg-2">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
