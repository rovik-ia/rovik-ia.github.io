// Cabeceras HTTP de seguridad comunes a todas las plataformas que las admiten (Vercel, Netlify,
// Cloudflare Pages). GitHub Pages no permite cabeceras propias: allí se aplica la CSP por <meta>.
export const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  // Refuerzo de la CSP de cada página (la de <meta> no admite frame-ancestors)
  "Content-Security-Policy": "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
};
