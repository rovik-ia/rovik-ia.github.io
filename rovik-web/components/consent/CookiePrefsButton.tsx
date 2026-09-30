"use client";

import { openConsent } from "@/lib/analytics";

export default function CookiePrefsButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={openConsent} className={className}>
      Preferencias de cookies
    </button>
  );
}
