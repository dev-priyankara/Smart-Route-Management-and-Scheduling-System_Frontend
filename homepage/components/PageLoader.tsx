"use client";

import { BusFront, Route as RouteIcon } from "lucide-react";

/**
 * PageLoader — shown while the homepage is mounting.
 * Displays the SRMSS brand logo + skeleton placeholders
 * that mirror the real page layout (header, hero, sections).
 */
export function PageLoader() {
  return (
    <div className="page-loader" aria-label="Loading SRMSS" role="status">
      {/* ── Brand / Logo ── */}
      <div className="page-loader-brand">
        <span className="page-loader-mark" aria-hidden="true">
          <span className="page-loader-orbit" />
          <BusFront size={32} strokeWidth={2.3} className="page-loader-bus" />
          <RouteIcon size={15} strokeWidth={2.5} className="page-loader-route" />
        </span>
        <span className="page-loader-copy">
          <strong>SRMSS</strong>
          <small>Smart Route Management and Scheduling System</small>
        </span>
      </div>

      {/* ── Skeleton layout ── */}
      <div className="page-loader-skeleton">

        {/* Fake navbar */}
        <div className="skeleton-nav">
          <div className="sk sk-wide" />
          <div className="sk-nav-links">
            <div className="sk sk-short" />
            <div className="sk sk-short" />
            <div className="sk sk-short" />
            <div className="sk sk-short" />
          </div>
          <div className="sk sk-btn" />
        </div>

        {/* Fake hero */}
        <div className="skeleton-hero">
          <div className="sk sk-hero-title" />
          <div className="sk sk-hero-sub" />
          <div className="sk sk-hero-sub sk-hero-sub--short" />
          <div className="skeleton-hero-actions">
            <div className="sk sk-btn sk-btn--lg" />
            <div className="sk sk-btn sk-btn--lg sk-btn--ghost" />
          </div>
        </div>

        {/* Fake strip */}
        <div className="skeleton-strip">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="sk sk-strip-item" />
          ))}
        </div>

        {/* Fake cards row */}
        <div className="skeleton-cards">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="sk sk-card-icon" />
              <div className="sk sk-card-title" />
              <div className="sk sk-card-line" />
              <div className="sk sk-card-line sk-card-line--short" />
            </div>
          ))}
        </div>

      </div>

      {/* ── Loading indicator ── */}
      <div className="page-loader-bar" aria-hidden="true">
        <div className="page-loader-bar-fill" />
      </div>
    </div>
  );
}

