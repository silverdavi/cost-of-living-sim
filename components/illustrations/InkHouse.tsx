"use client";

import { InkSvg, type InkProps } from "./Ink";

export function InkHouse({ className, delay }: InkProps) {
  return (
    <InkSvg
      className={className}
      delay={delay}
      paths={[
        { d: "M10 34 L32 14 L54 34" },
        { d: "M16 31 L16 54 L48 54 L48 31" },
        { d: "M27 54 L27 42 L37 42 L37 54" },
        { d: "M41 36 L46 36 L46 41 L41 41 Z" },
        { d: "M32 14 L32 8" },
      ]}
    />
  );
}
