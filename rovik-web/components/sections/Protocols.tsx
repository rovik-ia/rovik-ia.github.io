import SectionLabel from "@/components/ui/SectionLabel";
import { PROTOCOLS } from "@/lib/content";

export default function Protocols() {
  return (
    <section id="protocolos" aria-labelledby="protocolos-title" className="blueprint relative border-t border-line bg-bg-2 py-24 lg:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-4">
          <SectionLabel code={PROTOCOLS.code} label={PROTOCOLS.label} tone="red" className="reveal" />
          <h2 id="protocolos-title" className="display reveal mt-6 text-balance text-[2.2rem] leading-[0.95] sm:text-6xl lg:text-[3.6rem]">
            {PROTOCOLS.title}
          </h2>
        </div>
        <ol className="grid border-t border-line-2 sm:grid-cols-2 lg:col-span-8">
          {PROTOCOLS.items.map((p, i) => (
            <li
              key={p.title}
              className={`reveal border-b border-line-2 py-8 sm:py-10 ${i % 2 === 0 ? "sm:border-r sm:pr-8" : "sm:pl-8"}`}
              style={{ ["--delay" as string]: `${i * 80}ms` }}
            >
              <p className="hud-num text-sm text-red-text">R-0{i + 1}</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-fg">{p.title}</h3>
              <p className="mt-3 max-w-sm text-pretty text-fg-2">{p.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
