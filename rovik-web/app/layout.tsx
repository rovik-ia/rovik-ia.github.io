import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE, asset } from "@/lib/site";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RevealObserver from "@/components/ui/RevealObserver";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "700"],
  display: "swap",
  // Solo etiquetas pequeñas: no compite con la fuente del titular en la carga inicial
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url + "/"),
  title: { default: SITE.title, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    title: SITE.shortTitle,
    description: SITE.description,
    url: "./",
    images: [{ url: "og.jpg", width: 1200, height: 630, alt: "Rovik: sistema de escalado empresarial" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.shortTitle,
    description: SITE.description,
    images: ["og.jpg"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: asset("/icon.svg"), type: "image/svg+xml" }],
    apple: [{ url: asset("/apple-icon.png"), sizes: "180x180" }],
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${archivo.variable} ${mono.variable} no-js`}>
      <body className="min-h-dvh flex flex-col">
        <a href="#contenido" className="sr-only-focusable fixed left-4 top-3 z-[100] bg-cyan px-4 py-3 font-mono text-sm font-bold text-bg">
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
        <RevealObserver />
      </body>
    </html>
  );
}
