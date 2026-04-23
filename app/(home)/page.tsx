"use client";

import { useEffect } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const TARGET = `${BASE}/he/family/`;

export default function RootRedirect() {
  useEffect(() => {
    window.location.replace(TARGET);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-10 text-center">
      <div className="space-y-4">
        <p className="text-ink/70">Redirecting…</p>
        <p>
          <a
            href={TARGET}
            className="underline decoration-accent decoration-2 underline-offset-4"
          >
            Continue to the simulator →
          </a>
        </p>
        <noscript>
          <p className="mt-6 text-sm text-muted">
            JavaScript is disabled — <a href={TARGET}>click here</a>.
          </p>
        </noscript>
      </div>
    </main>
  );
}
