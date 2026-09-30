import Hero from "@/components/sections/Hero";
import Leaks from "@/components/sections/Leaks";
import Protocol from "@/components/sections/Protocol";
import Modules from "@/components/sections/Modules";
import Assistant from "@/components/sections/Assistant";
import Cases from "@/components/sections/Cases";
import Protocols from "@/components/sections/Protocols";
import Faq from "@/components/sections/Faq";
import Contact from "@/components/sections/Contact";
import ScrollHud from "@/components/layout/ScrollHud";
import { homeGraph, jsonLd } from "@/lib/jsonld";

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(homeGraph()) }} />
      <ScrollHud />
      <Hero />
      <Leaks />
      <Protocol />
      <Modules />
      <Assistant />
      <Cases />
      <Protocols />
      <Faq />
      <Contact />
    </>
  );
}
