"use client";

import { InkSvg, type InkProps } from "./Ink";

export function InkCart({ className, delay }: InkProps) {
  return (
    <InkSvg
      className={className}
      delay={delay}
      paths={[
        { d: "M8 16 L14 16 L20 42 L50 42 L54 22 L18 22" },
        { d: "M24 50 a3 3 0 1 0 0.1 0" },
        { d: "M44 50 a3 3 0 1 0 0.1 0" },
        { d: "M28 28 L30 36 M36 28 L38 36 M44 28 L46 36" },
      ]}
    />
  );
}
