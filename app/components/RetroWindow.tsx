"use client";

import type { CSSProperties, ReactNode } from "react";

type Variant = "default" | "dark" | "fire";

interface RetroWindowProps {
  title: string;
  variant?: Variant;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  headerRight?: ReactNode;
}

export function RetroWindow({
  title,
  variant = "default",
  className = "",
  style,
  children,
  headerRight,
}: RetroWindowProps) {
  const titlebarClass = [
    "retro-titlebar",
    variant === "dark" ? "retro-titlebar--dark" : "",
    variant === "fire" ? "retro-titlebar--fire" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`retro-window ${className}`} style={style}>
      <div className={titlebarClass}>
        {/* Traffic lights */}
        <div className="traffic-lights">
          <span className="traffic-light tl-red" />
          <span className="traffic-light tl-yellow" />
          <span className="traffic-light tl-green" />
        </div>

        {/* Title */}
        <span className="retro-title-text">{title}</span>

        {/* Right slot — keeps title centred */}
        <div style={{ minWidth: "56px", display: "flex", justifyContent: "flex-end" }}>
          {headerRight ?? null}
        </div>
      </div>

      {children}
    </div>
  );
}
