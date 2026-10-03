"use client";

import Link from "next/link";
import { Route as RouteIcon, ArrowRight } from "lucide-react";
import { routeData } from "@/lib/mock-data";

export function RoutesSection() {
  return (
    <section className="public-routes public-reveal" id="routes">
      <div className="public-routes-inner">
        <div className="public-section-heading">
          <div>
            <span className="public-eyebrow"><i /> Route Network</span>
            <h2>Explore service corridors</h2>
            <p>Sample active and planned routes managed in SRMSS.</p>
          </div>
          <Link className="section-action" href="/routes">View all routes <ArrowRight size={15} /></Link>
        </div>
        <div className="route-highlights">
          {routeData.slice(0, 3).map((route) => (
            <article className="route-highlight public-reveal" key={route.id}>
              <span className="route-highlight-icon"><RouteIcon size={19} /></span>
              <span className="route-service-type">{route.serviceType} service</span>
              <h3>{route.name}</h3>
              <div className="route-endpoints"><span>{route.start}</span><i /><span>{route.end}</span></div>
              <p>{route.distance} km <span>·</span> {route.stops.length} intermediate stops</p>
              <Link href="/routes/planning">Open route planner <ArrowRight size={13} /></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}