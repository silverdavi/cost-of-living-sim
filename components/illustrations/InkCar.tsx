"use client";

import { InkSvg, type InkProps } from "./Ink";

export function InkCar({ className, delay }: InkProps) {
  return (
    <InkSvg
      className={className}
      delay={delay}
      paths={[
        { d: "M6 40 L12 28 L22 24 L42 24 L52 30 L58 34 L58 42 L6 42 Z" },
        { d: "M14 34 L22 28 L32 28 L32 34 Z" },
        { d: "M34 28 L44 28 L50 34 L34 34 Z" },
        { d: "M18 42 a4 4 0 1 0 0.1 0" },
        { d: "M46 42 a4 4 0 1 0 0.1 0" },
      ]}
    />
  );
}
