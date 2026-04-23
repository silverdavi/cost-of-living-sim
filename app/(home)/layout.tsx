import type { Metadata } from "next";
import "../globals.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const TARGET = `${BASE}/he/lifestyle/`;

export const metadata: Metadata = {
  title: "Cost of Living Simulator",
  description: "Denver vs Providence — ballpark family simulator",
};

export default function RootRedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta httpEquiv="refresh" content={`0; url=${TARGET}`} />
        <link rel="canonical" href={TARGET} />
      </head>
      <body className="min-h-screen bg-bg text-ink font-sans">{children}</body>
    </html>
  );
}
