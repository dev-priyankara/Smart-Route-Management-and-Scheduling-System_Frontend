"use client";

import { BusFront, Route as RouteIcon } from "lucide-react";

interface BrandProps {
  footer?: boolean;
}

export function Brand({ footer = false }: BrandProps) {
  return (
    <a className={`public-brand${footer ? " public-brand-footer" : ""}`} href="#home" aria-label="SRMSS home">
      <span className="public-brand-mark" aria-hidden="true">
        <span className="brand-orbit" />
        <BusFront className="brand-bus" size={footer ? 24 : 29} strokeWidth={2.4} />
        <RouteIcon className="brand-route" size={footer ? 12 : 14} strokeWidth={2.5} />
      </span>
      <span className="public-brand-copy">
        <strong>SRMSS</strong>
        <small>Smart Route Management and Scheduling System</small>
      </span>
    </a>
  );
}
