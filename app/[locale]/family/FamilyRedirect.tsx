"use client";

import { useEffect } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function FamilyRedirect({ locale }: { locale: string }) {
  const target = `${BASE}/${locale}/lifestyle/`;
  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <main className="flex min-h-[40vh] items-center justify-center p-10 text-center">
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
