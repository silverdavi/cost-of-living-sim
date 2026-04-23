"use client";

import { useEffect } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function LocaleRedirect({ locale }: { locale: string }) {
  const target = `${BASE}/${locale}/family/`;
  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <main className="min-h-screen flex items-center justify-center p-10 text-center">
      <div className="space-y-4">
        <p className="text-ink/70">Redirecting…</p>
        <p>
          <a
            href={target}
            className="underline decoration-accent decoration-2 underline-offset-4"
          >
            Continue →
          </a>
        </p>
      </div>
    </main>
  );
}
