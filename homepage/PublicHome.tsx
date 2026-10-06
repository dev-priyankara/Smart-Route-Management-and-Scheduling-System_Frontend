"use client";

import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Assurances } from "./components/Assurances";
import { About } from "./components/About";
import { RoutesSection } from "./components/RoutesSection";
import { Gallery } from "./components/Gallery";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { PageLoader } from "./components/PageLoader";

export default function PublicHome() {
  // Show loader until page is fully painted + brief brand moment
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Intersection observer for reveal animations
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px -24px 0px" },
      );
      document.querySelectorAll(".public-reveal").forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Wait for fonts + first paint, then hide loader
    // requestAnimationFrame ensures we're post-paint
    const minDelay = 1400; // minimum brand display time (ms)
    const start = Date.now();

    const hide = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minDelay - elapsed);
      setTimeout(() => setLoading(false), remaining);
    };

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide, { once: true });
      return () => window.removeEventListener("load", hide);
    }
  }, []);

  return (
    <>
      {/* Loader — visible until page is ready */}
      {loading && <PageLoader />}

      {/* Main page content — hidden under loader, fades in after */}
      <main
        className={`public-home homepage-content${loading ? " sr-only" : ""}`}
        id="home"
        aria-hidden={loading}
      >
        <Header />
        <Hero />
        <Assurances />
        <About />
        <RoutesSection />
        <Gallery />
        <Contact />
        <Footer />
      </main>
    </>
  );
}

