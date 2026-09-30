import type { Metadata } from "next";
import LandingHero from "@/components/sections/construccion/LandingHero";
import LeakCalculator from "@/components/sections/construccion/LeakCalculator";
import Solutions from "@/components/sections/construccion/Solutions";
import Proof from "@/components/sections/construccion/Proof";
import Steps from "@/components/sections/construccion/Steps";
import Faq from "@/components/sections/Faq";
import Contact from "@/components/sections/Contact";
import { C_CONTACT, C_FAQ, C_META } from "@/lib/content-construccion";
import { constructionGraph, jsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: C_META.title,
  description: C_META.description,
  alternates: { canonical: "./" },
  openGraph: { title: `${C_META.title} · Rovik`, description: C_META.description, url: "./" },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(constructionGraph(C_FAQ.items, C_META.title, C_META.description)) }} />
      <LandingHero />
      <LeakCalculator />
      <Solutions />
      <Proof />
      <Steps />
      <Faq data={C_FAQ} />
      <Contact origin="constructoras" code={C_CONTACT.code} label={C_CONTACT.label} title={C_CONTACT.title} lead={C_CONTACT.lead} placeholder={C_CONTACT.placeholder} />
    </>
  );
}
