import type { NextConfig } from "next";

// BASE_PATH permite publicar en una subruta (p. ej. GitHub Pages de proyecto: "/rovik-web").
// Con dominio propio o Vercel se deja vacío.
const basePath = (process.env.BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: basePath || undefined,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
