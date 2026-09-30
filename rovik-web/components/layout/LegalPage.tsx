import SectionLabel from "@/components/ui/SectionLabel";

interface Props {
  code: string;
  label: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}

export default function LegalPage({ code, label, title, updated, children }: Props) {
  return (
    <article className="blueprint border-b border-line pb-24 pt-[calc(var(--header-h)+4rem)] lg:pt-[calc(var(--header-h)+6rem)]">
      <div className="shell-narrow">
        <SectionLabel code={code} label={label} />
        <h1 className="display mt-6 text-[2.4rem] sm:text-6xl">{title}</h1>
        <p className="hud-label mt-5 text-muted">Última actualización: {updated}</p>
        <div className="prose-hud mt-10">{children}</div>
      </div>
    </article>
  );
}
