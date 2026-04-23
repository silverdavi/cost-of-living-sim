"use client";

import { InkSvg, type InkProps } from "./Ink";

export function InkWallet({ className, delay }: InkProps) {
  return (
    <InkSvg
      className={className}
      delay={delay}
      paths={[
        { d: "M10 20 L44 16 L44 22 L52 22 L52 48 L10 48 Z" },
        { d: "M44 16 L44 22" },
        { d: "M52 28 L44 28 L44 38 L52 38" },
        { d: "M47 33 L49 33" },
      ]}
    />
  );
}
