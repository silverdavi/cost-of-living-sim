"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface InkProps {
  className?: string;
  delay?: number;
}

interface PathData {
  d: string;
  width?: number;
}

export function InkSvg({
  viewBox = "0 0 64 64",
  paths,
  className,
  delay = 0,
}: {
  viewBox?: string;
  paths: PathData[];
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox={viewBox} className={className} aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths.map((p, i) => (
          <motion.path
            key={i}
            d={p.d}
            strokeWidth={p.width ?? 1.6}
            initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 1.1,
              ease: "easeOut",
              delay: reduce ? 0 : delay + i * 0.12,
            }}
          />
        ))}
      </g>
    </svg>
  );
}
