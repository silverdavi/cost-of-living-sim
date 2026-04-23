"use client";

import { InkSvg, type InkProps } from "./Ink";

export function InkCoin({ className, delay }: InkProps) {
  return (
    <InkSvg
      className={className}
      delay={delay}
      paths={[
        { d: "M32 12 a20 20 0 1 0 0.1 0" },
        { d: "M32 20 a12 12 0 1 0 0.1 0" },
        { d: "M28 32 L36 32 M32 28 L32 36" },
      ]}
    />
  );
}
