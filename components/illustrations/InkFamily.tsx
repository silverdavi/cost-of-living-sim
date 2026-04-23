"use client";

import { InkSvg, type InkProps } from "./Ink";

export function InkFamily({ className, delay }: InkProps) {
  return (
    <InkSvg
      className={className}
      delay={delay}
      paths={[
        { d: "M14 20 a5 5 0 1 0 0.1 0" },
        { d: "M14 26 L14 42 M8 32 L20 32 M14 42 L10 56 M14 42 L18 56" },
        { d: "M34 16 a5 5 0 1 0 0.1 0" },
        { d: "M34 22 L34 42 M28 30 L40 30 M34 42 L30 56 M34 42 L38 56" },
        { d: "M48 28 a3.5 3.5 0 1 0 0.1 0" },
        { d: "M48 33 L48 46 M44 38 L52 38 M48 46 L46 56 M48 46 L50 56" },
      ]}
    />
  );
}
