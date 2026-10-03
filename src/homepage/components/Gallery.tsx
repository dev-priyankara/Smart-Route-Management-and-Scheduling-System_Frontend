"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const galleryItems = [
  { className: "gallery-coach", title: "Modern coach services", alt: "A modern public coach ready for service" },
  { className: "gallery-journey", title: "Journeys across Sri Lanka", alt: "A coach travelling along a scenic route" },
  { className: "gallery-network", title: "Connected service corridors", alt: "A public transport coach serving a city route" },
];

export function Gallery() {
  return (
    <section className="public-gallery public-reveal" id="gallery">
      <div className="public-gallery-inner">
        <div className="public-section-heading">
          <div>
            <span className="public-eyebrow"><i /> Gallery</span>
            <h2>Journeys connected by better planning</h2>
            <p>From city services to long-distance corridors, SRMSS helps depot teams coordinate the moving parts.</p>
          </div>
          <Link className="section-action" href="/routes">Explore the network <ArrowRight size={15} /></Link>
        </div>
        <div className="gallery-grid">
          {galleryItems.map((item) => (
            <article className={`gallery-tile ${item.className}`} aria-label={item.alt} key={item.title}>
              <span>{item.title}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}