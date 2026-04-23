"use client";

import { InkSvg, type InkProps } from "./Ink";

export function InkSchool({ className, delay }: InkProps) {
  return (
    <InkSvg
      className={className}
      delay={delay}
      paths={[
        { d: "M8 52 L32 28 L56 52" },
        { d: "M14 48 L14 56 L50 56 L50 48" },
        { d: "M24 56 L24 44 L40 44 L40 56" },
        { d: "M32 28 L32 18" },
        { d: "M32 18 L42 18 L42 24 L32 24" },
        { d: "M20 37 L28 37 M36 37 L44 37" },
      ]}
    />
  );
}
