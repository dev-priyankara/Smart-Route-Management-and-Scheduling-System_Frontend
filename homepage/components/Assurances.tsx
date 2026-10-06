"use client";

import { ShieldCheck, Armchair, Clock3, MapPin, Headset } from "lucide-react";

const assurances = [
  { title: "Safe & Reliable", detail: "Your safety is our priority", icon: ShieldCheck },
  { title: "Comfortable Seats", detail: "Relax and enjoy your journey", icon: Armchair },
  { title: "On-Time Service", detail: "We value your time", icon: Clock3 },
  { title: "Wide Coverage", detail: "Across Sri Lanka", icon: MapPin },
  { title: "24/7 Support", detail: "We're here to help", icon: Headset },
];

export function Assurances() {
  return (
    <section className="public-assurances" aria-label="Our service commitments">
      <div className="public-assurances-inner">
        {assurances.map(({ title, detail, icon: Icon }) => (
          <div className="assurance-item" key={title}>
            <span className="assurance-icon"><Icon size={23} /></span>
            <span><b>{title}</b><small>{detail}</small></span>
          </div>
        ))}
      </div>
    </section>
  );
}
