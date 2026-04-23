"use client";

import { InkSvg, type InkProps } from "./Ink";

export function InkHeart({ className, delay }: InkProps) {
  return (
    <InkSvg
      className={className}
      delay={delay}
      paths={[
        {
          d: "M32 52 C 18 42, 10 32, 14 22 C 18 14, 28 14, 32 22 C 36 14, 46 14, 50 22 C 54 32, 46 42, 32 52 Z",
        },
        { d: "M14 32 L24 32 M28 32 L32 32 M36 32 L40 32 M44 32 L50 32" },
        { d: "M32 32 L30 28 L34 34 L32 30" },
      ]}
    />
  );
}
