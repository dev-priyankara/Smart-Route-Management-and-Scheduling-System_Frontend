"use client";

import Link from "next/link";
import { Navigation, BusFront, CalendarDays, MapPin, UsersRound, Settings, BarChart3, Headset } from "lucide-react";

const services = [
  { title: "Route Management", detail: "Stops, corridors and service types", href: "/routes", icon: BusFront },
  { title: "Live Tracking", detail: "Trip status from the depot dashboard", href: "/dashboard", icon: MapPin },
  { title: "Scheduling & Timetables", detail: "Coordinate departures and assignments", href: "/schedules", icon: CalendarDays },
  { title: "Depot Operations", detail: "Keep daily services in view", href: "/depot-management", icon: UsersRound },
  { title: "Fleet Management", detail: "Vehicle records and availability", href: "/buses", icon: BusFront },
  { title: "Maintenance Management", detail: "Service and fuel records", href: "/fuel-maintenance", icon: Settings },
  { title: "Reports & Analytics", detail: "Review operational performance", href: "/reports", icon: BarChart3 },
  { title: "Customer Support", detail: "Call our booking support line", href: "tel:+94761234567", icon: Headset },
];

export function About() {
  return (
    <section className="public-about public-reveal" id="about">
      <div className="public-about-inner">
        <div className="about-photo" role="img" aria-label="A coach on a scenic Sri Lankan highway" />
        <div className="about-copy">
          <span className="public-eyebrow"><i /> About SRMSS</span>
          <h2>Connecting People, Places and Possibilities</h2>
          <p>SRMSS brings route planning, schedules, vehicle records and depot operations into one place. Teams can coordinate daily services, track trip status and review the information needed to keep transport moving.</p>
          <p>Built around Sri Lankan service corridors, the system supports safer, more reliable journeys through clearer planning and better resource coordination.</p>
          <Link className="about-learn-more" href="/dashboard">Explore the Dashboard <Navigation size={15} /></Link>
        </div>
        <div className="services-panel" id="services">
          <h2><i /> Our Services</h2>
          <div className="services-grid">
            {services.map(({ title, detail, href, icon: Icon }) => (
              <Link className="service-link" href={href} key={title}>
                <span><Icon size={17} /></span>
                <span className="service-copy"><b>{title}</b><small>{detail}</small></span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
