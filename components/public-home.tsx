"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Armchair,
  BarChart3,
  BusFront,
  CalendarDays,
  Clock3,
  Headset,
  MapPin,
  MessageCircle,
  Menu,
  Moon,
  Navigation,
  Play,
  Route as RouteIcon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  UsersRound,
  X,
} from "lucide-react";
import { routeData } from "@/lib/mock-data";
import { useTheme } from "@/components/theme-provider";

const destinations = ["Colombo", "Kandy", "Galle", "Matara", "Matale", "Negombo", "Kurunegala", "Puttalam"];

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

const assurances = [
  { title: "Safe & Reliable", detail: "Your safety is our priority", icon: ShieldCheck },
  { title: "Comfortable Seats", detail: "Relax and enjoy your journey", icon: Armchair },
  { title: "On-Time Service", detail: "We value your time", icon: Clock3 },
  { title: "Wide Coverage", detail: "Across Sri Lanka", icon: MapPin },
  { title: "24/7 Support", detail: "We’re here to help", icon: Headset },
];

const galleryItems = [
  { className: "gallery-coach", title: "Modern coach services", alt: "A modern public coach ready for service" },
  { className: "gallery-journey", title: "Journeys across Sri Lanka", alt: "A coach travelling along a scenic route" },
  { className: "gallery-network", title: "Connected service corridors", alt: "A public transport coach serving a city route" },
];

function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <a className={`public-brand${footer ? " public-brand-footer" : ""}`} href="#home" aria-label="SRMSS home">
      <span className="public-brand-mark" aria-hidden="true"><span className="brand-orbit" /><BusFront className="brand-bus" size={footer ? 24 : 29} strokeWidth={2.4} /><RouteIcon className="brand-route" size={footer ? 12 : 14} strokeWidth={2.5} /></span>
      <span className="public-brand-copy">
        <strong>SRMSS</strong>
        <small>Smart Route Management and Scheduling System</small>
      </span>
    </a>
  );
}

export default function PublicHome() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [from, setFrom] = useState("Colombo");
  const [to, setTo] = useState("Kandy");
  const [travelDate, setTravelDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -24px 0px" });
    document.querySelectorAll(".public-reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const searchRoutes = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams({ from, to, passengers });
    if (travelDate) params.set("date", travelDate);
    router.push(`/routes/planning?${params.toString()}`);
  };

  return (
    <main className="public-home" id="home">
      <header className="public-header">
        <div className="public-header-inner">
          <Brand />
          <nav className={`public-nav${menuOpen ? " public-nav-open" : ""}`} aria-label="Main navigation">
            <a className="public-nav-active" href="#home" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About Us</a>
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#routes" onClick={() => setMenuOpen(false)}>Routes</a>
            <a href="#gallery" onClick={() => setMenuOpen(false)}>Gallery</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>
          <a className="public-phone" href="tel:+94761234567"><span><Headset size={17} /></span><span><b>+94 76 123 4567</b><small>Call for bookings</small></span></a>
          <button className="public-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>{theme === "light" ? <Moon size={17} /> : <Sun size={18} />}</button>
          <Link className="public-book-button" href="/login#register"><BusFront size={16} /> Book Now</Link>
          <button className="public-menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <section className="public-hero" aria-labelledby="public-hero-title">
        <div className="public-hero-image" role="img" aria-label="A modern coach travelling through Sri Lanka" />
        <div className="public-hero-shade" />
        <div className="public-hero-inner">
          <div className="public-hero-brand"><Brand /><span>Smarter Routes&nbsp; · &nbsp;Better Schedules&nbsp; · &nbsp;A Connected Journey</span></div>
          <h1 id="public-hero-title">Efficient Public Transport Management <em>for a Better Tomorrow</em></h1>
          <p>SRMSS helps transport depots manage routes, schedules, vehicles and operations, ensuring safe, reliable and on-time service for everyone.</p>
          <form className="trip-search" id="trip-search" onSubmit={searchRoutes}>
            <label className="trip-field"><MapPin size={19} /><span><small>From</small><select aria-label="Departure city" value={from} onChange={(event) => setFrom(event.target.value)}>{destinations.map((city) => <option key={city}>{city}</option>)}</select></span></label>
            <label className="trip-field"><MapPin size={19} /><span><small>To</small><select aria-label="Destination city" value={to} onChange={(event) => setTo(event.target.value)}>{destinations.map((city) => <option key={city}>{city}</option>)}</select></span></label>
            <label className="trip-field trip-date-field"><CalendarDays size={19} /><span><small>Travel Date</small><input aria-label="Travel date" type="date" value={travelDate} onChange={(event) => setTravelDate(event.target.value)} /></span></label>
            <label className="trip-field trip-passenger-field"><UsersRound size={19} /><span><small>Passengers</small><select aria-label="Passengers" value={passengers} onChange={(event) => setPassengers(event.target.value)}>{[1, 2, 3, 4, 5, 6].map((count) => <option value={count} key={count}>{count} {count === 1 ? "Passenger" : "Passengers"}</option>)}</select></span></label>
            <button className="trip-submit" type="submit"><Search size={16} /> Search Buses</button>
          </form>
        </div>
      </section>

      <section className="public-assurances" aria-label="Our service commitments">
        <div className="public-assurances-inner">{assurances.map(({ title, detail, icon: Icon }) => <div className="assurance-item" key={title}><span className="assurance-icon"><Icon size={23} /></span><span><b>{title}</b><small>{detail}</small></span></div>)}</div>
      </section>

      <section className="public-about public-reveal" id="about">
        <div className="public-about-inner">
          <div className="about-photo" role="img" aria-label="A coach on a scenic Sri Lankan highway" />
          <div className="about-copy"><span className="public-eyebrow"><i /> About SRMSS</span><h2>Connecting People, Places and Possibilities</h2><p>SRMSS brings route planning, schedules, vehicle records and depot operations into one place. Teams can coordinate daily services, track trip status and review the information needed to keep transport moving.</p><p>Built around Sri Lankan service corridors, the system supports safer, more reliable journeys through clearer planning and better resource coordination.</p><Link className="about-learn-more" href="/dashboard">Explore the Dashboard <Navigation size={15} /></Link></div>
          <div className="services-panel" id="services"><h2><i /> Our Services</h2><div className="services-grid">{services.map(({ title, detail, href, icon: Icon }) => <Link className="service-link" href={href} key={title}><span><Icon size={17} /></span><span className="service-copy"><b>{title}</b><small>{detail}</small></span></Link>)}</div></div>
        </div>
      </section>

      <section className="public-routes public-reveal" id="routes">
        <div className="public-routes-inner">
          <div className="public-section-heading"><div><span className="public-eyebrow"><i /> Route Network</span><h2>Explore service corridors</h2><p>Sample active and planned routes managed in SRMSS.</p></div><Link className="section-action" href="/routes">View all routes <ArrowRight size={15} /></Link></div>
          <div className="route-highlights">{routeData.slice(0, 3).map((route) => <article className="route-highlight public-reveal" key={route.id}><span className="route-highlight-icon"><RouteIcon size={19} /></span><span className="route-service-type">{route.serviceType} service</span><h3>{route.name}</h3><div className="route-endpoints"><span>{route.start}</span><i /><span>{route.end}</span></div><p>{route.distance} km <span>·</span> {route.stops.length} intermediate stops</p><Link href="/routes/planning">Open route planner <ArrowRight size={13} /></Link></article>)}</div>
        </div>
      </section>

      <section className="public-gallery public-reveal" id="gallery">
        <div className="public-gallery-inner"><div className="public-section-heading"><div><span className="public-eyebrow"><i /> Gallery</span><h2>Journeys connected by better planning</h2><p>From city services to long-distance corridors, SRMSS helps depot teams coordinate the moving parts.</p></div><Link className="section-action" href="/routes">Explore the network <ArrowRight size={15} /></Link></div><div className="gallery-grid">{galleryItems.map((item) => <article className={`gallery-tile ${item.className}`} aria-label={item.alt} key={item.title}><span>{item.title}</span></article>)}</div></div>
      </section>

      <section className="public-contact public-reveal" id="contact">
        <div className="public-contact-inner"><div className="contact-copy"><span className="public-eyebrow"><i /> Contact</span><h2>Talk to our transport support team.</h2><p>For route enquiries, booking assistance or SRMSS information, contact our team. We’re ready to help you plan your next step.</p><Link className="contact-book-button" href="/login#register">Book Now <ArrowRight size={15} /></Link></div><div className="contact-details"><a href="tel:+94761234567"><span className="contact-icon"><Headset size={19} /></span><span><small>Call for bookings</small><b>+94 76 123 4567</b></span><ArrowRight size={15} /></a><a href="https://wa.me/94761234567"><span className="contact-icon"><MessageCircle size={19} /></span><span><small>Message our team</small><b>WhatsApp support</b></span><ArrowRight size={15} /></a><div><span className="contact-icon"><MapPin size={19} /></span><span><small>Service area</small><b>Across Sri Lanka</b></span></div></div></div>
      </section>

      <footer className="public-footer">
        <div className="public-footer-inner"><Brand footer /><nav className="footer-nav" aria-label="Footer navigation"><a href="#home">Home</a><a href="#about">About Us</a><a href="#services">Services</a><a href="#routes">Routes</a><a href="#gallery">Gallery</a><a href="#contact">Contact</a></nav><div className="footer-social" aria-label="Social media"><a href="https://www.facebook.com/" aria-label="Facebook"><UsersRound size={12} /></a><a href="https://www.youtube.com/" aria-label="YouTube"><Play size={12} /></a><a href="https://wa.me/94761234567" aria-label="WhatsApp"><MessageCircle size={12} /></a></div><small className="footer-copyright">© 2026 SRMSS. All rights reserved.</small></div>
      </footer>
    </main>
  );
}