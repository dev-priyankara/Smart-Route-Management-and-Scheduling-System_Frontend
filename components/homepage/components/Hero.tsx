"use client";

import { useState } from "react";
import { MapPin, CalendarDays, UsersRound, Search } from "lucide-react";
import { destinations } from "@/constants/homepage";
import { useRouter } from "next/navigation";
import { Brand } from "./Brand";

export function Hero() {
  const router = useRouter();
  const [from, setFrom] = useState("Colombo");
  const [to, setTo] = useState("Kandy");
  const [travelDate, setTravelDate] = useState("");
  const [passengers, setPassengers] = useState("1");

  const searchRoutes = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams({ from, to, passengers });
    if (travelDate) params.set("date", travelDate);
    router.push(`/routes/planning?${params.toString()}`);
  };

  return (
    <section className="public-hero" aria-labelledby="public-hero-title">
      <div className="public-hero-image" role="img" aria-label="A modern coach travelling through Sri Lanka" />
      <div className="public-hero-shade" />
      <div className="public-hero-inner">
        <div className="public-hero-brand"><Brand /><span>Smarter Routes&nbsp; · &nbsp;Better Schedules&nbsp; · &nbsp;A Connected Journey</span></div>
        <h1 id="public-hero-title">Efficient Public Transport Management <em>for a Better Tomorrow</em></h1>
        <p>SRMSS helps transport depots manage routes, schedules, vehicles and operations, ensuring safe, reliable and on-time service for everyone.</p>
        <form className="trip-search" id="trip-search" onSubmit={searchRoutes}>
          <label className="trip-field"><MapPin size={19} /><span><small>From</small><select aria-label="Departure city" value={from} onChange={(event) => setFrom(event.target.value)}>{destinations.map((city: string) => <option key={city}>{city}</option>)}</select></span></label>
          <label className="trip-field"><MapPin size={19} /><span><small>To</small><select aria-label="Destination city" value={to} onChange={(event) => setTo(event.target.value)}>{destinations.map((city: string) => <option key={city}>{city}</option>)}</select></span></label>
          <label className="trip-field trip-date-field"><CalendarDays size={19} /><span><small>Travel Date</small><input aria-label="Travel date" type="date" value={travelDate} onChange={(event) => setTravelDate(event.target.value)} /></span></label>
          <label className="trip-field trip-passenger-field"><UsersRound size={19} /><span><small>Passengers</small><select aria-label="Passengers" value={passengers} onChange={(event) => setPassengers(event.target.value)}>{[1, 2, 3, 4, 5, 6].map((count: number) => <option value={count} key={count}>{count} {count === 1 ? "Passenger" : "Passengers"}</option>)}</select></span></label>
          <button className="trip-submit" type="submit"><Search size={16} /> Search Buses</button>
        </form>
      </div>
    </section>
  );
}