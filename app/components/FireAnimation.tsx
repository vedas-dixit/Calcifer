"use client";

import dynamic from "next/dynamic";
import type { CSSProperties } from "react";
import fireData from "@/public/fire/Fire.json";

/* Avoid SSR — Lottie touches window/document */
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface FireAnimationProps {
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
}

export function FireAnimation({
  width = 80,
  height = 80,
  className = "",
  style,
}: FireAnimationProps) {
  return (
    <div
      className={className}
      style={{ width, height, flexShrink: 0, ...style }}
    >
      <Lottie
        animationData={fireData}
        loop
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
