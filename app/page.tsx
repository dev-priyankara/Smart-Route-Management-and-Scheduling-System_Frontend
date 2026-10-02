"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bus,
  CalendarDays,
  Check,
  Clock3,
  Fuel,
  Gauge,
  MapPin,
  Menu,
  MoonStar,
  Route,
  SunMedium,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const navigation = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Operations", href: "#operations" },
  { label: "Analytics", href: "#analytics" },
  { label: "About", href: "#about" },
];

const features = [
  { number: "01", title: "Route Planning", description: "Create, modify and manage routes with start points, end points, intermediary stops and distance information.", href: "#route-planning", icon: Route, tag: "Routes" },
  { number: "02", title: "Schedule Management", description: "Manage daily, weekly and monthly timetables while identifying conflicts and supporting adjustments.", href: "#schedule-management", icon: CalendarDays, tag: "Schedules" },
  { number: "03", title: "Depot Management", description: "Monitor active routes, available buses, assigned drivers, trip status and vehicle utilization centrally.", href: "#operations", icon: Gauge, tag: "Operations" },
  { number: "04", title: "Fuel & Maintenance", description: "Record fuel consumption and maintenance activities to support timely servicing and resource management.", href: "#fleet", icon: Fuel, tag: "Fleet care" },
  { number: "05", title: "Drivers & Vehicles", description: "Maintain driver information, license validity, working hours, vehicle capacity, mileage and service history.", href: "#people", icon: Bus, tag: "Resources" },
  { number: "06", title: "Reports & Analytics", description: "Review trip completion, route performance, fuel consumption and operational trends through clear reports.", href: "#analytics", icon: BarChart3, tag: "Insights" },
];

const steps = [
  { title: "Plan routes", copy: "Manage start points, destinations, stops, distance and service type.", icon: Route },
  { title: "Assign resources", copy: "Assign available buses and drivers to planned routes.", icon: Bus },
  { title: "Create schedules", copy: "Build timetables and identify conflicting schedule entries.", icon: CalendarDays },
  { title: "Monitor & analyze", copy: "Review trip status, utilization, fuel, maintenance and reports.", icon: BarChart3 },
];

const tripRows = [
  { route: "Colombo – Kandy", bus: "NP-2201", time: "06:45", status: "On Time" },
  { route: "Kandy – Matale", bus: "KA-3324", time: "07:15", status: "Delayed" },
  { route: "Galle – Matara", bus: "GL-1188", time: "08:30", status: "In Progress" },
];

function Brand() {
  return (
    <a className="brand" href="#home" aria-label="SRMSS homepage">
      <span className="brand-mark"><Route size={22} strokeWidth={2.2} /></span>
      <span className="brand-copy"><strong>SRMSS</strong><small>Smart Route Management<br />&amp; Scheduling System</small></span>
    </a>
  );
}

function ThemeButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="theme-button" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
      {theme === "light" ? <MoonStar size={18} /> : <SunMedium size={18} />}
    </button>
  );
}

function SectionHeading({ eyebrow, title, copy, align = "left" }: { eyebrow: string; title: string; copy?: string; align?: "left" | "center" }) {
  return (
    <div className={`section-heading ${align === "center" ? "section-heading-center" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

function MiniRouteMap() {
  return (
    <div className="map-visual" aria-label="Illustration of a route between Colombo, Kurunegala and Kandy">
      <div className="map-grid" />
      <svg className="map-path" viewBox="0 0 440 220" role="img" aria-label="Route line connecting three stops">
        <path className="map-path-shadow" d="M52 166 C104 158 97 104 168 119 S242 166 278 111 S332 52 389 60" />
        <path className="map-path-line" d="M52 166 C104 158 97 104 168 119 S242 166 278 111 S332 52 389 60" />
      </svg>
      <span className="map-stop stop-one"><i />Colombo</span>
      <span className="map-stop stop-two"><i />Kurunegala</span>
      <span className="map-stop stop-three"><i />Kandy</span>
      <span className="map-distance">142 km <small>Express</small></span>
      <span className="map-legend"><b /> Planned route</span>
    </div>
  );
}

function DashboardPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`dashboard-preview ${compact ? "dashboard-preview-compact" : ""}`}>
      <div className="preview-topbar">
        <div className="preview-brand"><span className="preview-mark"><Route size={15} /></span><span><b>SRMSS</b><small>Depot operations</small></span></div>
        <span className="preview-date">Operations overview <span>Today</span></span>
        <div className="preview-avatar">AD</div>
      </div>
      <div className="preview-title"><div><small>FRIDAY, OCTOBER 02</small><h3>Daily overview</h3></div><span className="preview-live"><i /> System overview</span></div>
      <div className="preview-metrics">
        {[
          { label: "Total routes", value: "18", icon: Route },
          { label: "Active buses", value: "25", icon: Bus },
          { label: "Drivers on duty", value: "42", icon: UsersRound },
          { label: "On-time rate", value: "92.4%", icon: Gauge },
        ].map(({ label, value, icon: Icon }) => <div className="preview-metric" key={label}><span><Icon size={14} /></span><small>{label}</small><b>{value}</b></div>)}
      </div>
      <div className="preview-content">
        <div className="preview-trips">
          <div className="preview-panel-heading"><b>Today&apos;s trips</b><a href="#operations">View all <ArrowUpRight size={12} /></a></div>
          {tripRows.map((trip) => <div className="preview-trip" key={trip.route}><div className="trip-route-dot" /><div className="trip-main"><b>{trip.route}</b><small>{trip.bus} <span>·</span> {trip.time}</small></div><span className={`trip-status status-${trip.status.toLowerCase().replaceAll(" ", "-")}`}>{trip.status}</span></div>)}
        </div>
        <div className="preview-utilization"><div className="preview-panel-heading"><b>Vehicle utilization</b><span>Fleet</span></div><div className="utilization-chart"><div className="utilization-ring"><strong>78%</strong><small>in service</small></div></div><div className="utilization-legend"><span><i />In service</span><span><i />Available</span><span><i />Maintenance</span></div></div>
      </div>
      <div className="preview-footer"><span><i /> Route coordination</span><span>Updated just now</span></div>
    </div>
  );
}

export function LegacyHomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => setCompact(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  return (
    <main className="landing-page" id="home">
      <header className={`landing-header ${compact ? "header-compact" : ""}`}>
        <div className="nav-inner">
          <Brand />
          <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`} aria-label="Main navigation">
            {navigation.map((item) => <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
            <div className="mobile-nav-actions"><ThemeButton /><Link className="button button-outline" href="/login" onClick={() => setMenuOpen(false)}>Sign In</Link></div>
          </nav>
          <div className="nav-actions"><ThemeButton /><Link className="nav-signin" href="/login">Sign In</Link><Link className="button button-primary nav-dashboard" href="/dashboard">Open Dashboard <ArrowUpRight size={15} /></Link></div>
          <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
        </div>
      </header>

      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-photo" role="img" aria-label="Public bus travelling on a Sri Lankan road" />
        <div className="hero-shade" />
        <div className="hero-inner page-width">
          <div className="hero-copy">
            <span className="hero-kicker"><i /> Smart public transport operations</span>
            <h1 id="hero-title"><span className="hero-line">Smarter routes.</span><span className="hero-line hero-highlight">Better scheduling.</span><span className="hero-line">Efficient depots.</span></h1>
            <p>One centralized platform for public transport route planning, schedules, fleet operations and depot performance.</p>
            <div className="hero-actions"><Link className="button button-primary button-large" href="/dashboard">Explore SRMSS <ArrowRight size={17} /></Link><Link className="button button-hero-outline button-large" href="/login">Sign In</Link></div>
            <div className="hero-footnote"><span className="hero-check"><Check size={13} /></span>Designed for centralized depot operations and resource optimization</div>
          </div>
          <div className="hero-product"><DashboardPreview /><div className="float-note float-on-time"><span className="float-icon float-green"><Check size={15} /></span><span><small>Trip status</small><b>On Time</b></span></div><div className="float-note float-route"><span className="float-icon"><Route size={15} /></span><span><small>Active route</small><b>Colombo – Kandy</b></span></div></div>
        </div>
        <a className="hero-scroll" href="#intro"><span /> Scroll to explore</a>
      </section>

      <section className="intro-strip" id="intro" aria-label="SRMSS platform capabilities">
        <div className="page-width intro-items">
          {[{ label: "Centralized", detail: "Digital depot management" }, { label: "Coordinated", detail: "Routes & schedules" }, { label: "Efficient", detail: "Resource utilization" }, { label: "Data-led", detail: "Operational analytics" }].map((item, index) => <div className="intro-item" key={item.label}><span className="intro-index">0{index + 1}</span><span><b>{item.label}</b><small>{item.detail}</small></span></div>)}
        </div>
      </section>

      <section className="about-section section-pad" id="about">
        <div className="page-width about-grid">
          <div className="about-copy"><span className="eyebrow">About SRMSS</span><h2>A centralized approach to public transport depot operations.</h2><p>Public transport depots coordinate buses, drivers and routes connecting cities, towns and rural areas. Manual records and spreadsheets can make assignments, scheduling and operational monitoring difficult.</p><p>SRMSS brings these workflows into one digital platform, helping depot teams organize activity and see operations more clearly.</p><Link className="text-link" href="/dashboard">Explore the platform <ArrowRight size={16} /></Link></div>
          <div className="about-visual"><div className="about-visual-head"><span className="eyebrow">Depot control</span><span className="status-pill"><i /> Overview</span></div><div className="about-visual-main"><div className="about-route-list"><div className="about-route-row"><span className="about-route-icon"><Route size={16} /></span><span><b>Route management</b><small>Route details &amp; stops</small></span><ArrowUpRight size={15} /></div><div className="about-route-row"><span className="about-route-icon"><CalendarDays size={16} /></span><span><b>Schedule coordination</b><small>Timetables &amp; assignments</small></span><ArrowUpRight size={15} /></div><div className="about-route-row"><span className="about-route-icon"><Bus size={16} /></span><span><b>Fleet status</b><small>Available and assigned vehicles</small></span><ArrowUpRight size={15} /></div></div><div className="about-side-stat"><span className="mini-label">Today&apos;s overview</span><div className="about-donut"><span>Depot<br />view</span></div><div className="about-legend"><i /> Operational monitoring</div></div></div><div className="about-bottom"><span><Activity size={15} /> Operational visibility</span><span>SRMSS dashboard</span></div></div>
        </div>
      </section>

      <section className="features-section section-pad" id="features">
        <div className="page-width"><SectionHeading eyebrow="Core system modules" title="Everything the depot needs. In one digital platform." copy="Connected tools for the daily work of planning routes, coordinating services and managing depot resources." align="center" />
          <div className="feature-grid">{features.map(({ number, title, description, href, icon: Icon, tag }) => <a className="feature-card" href={href} key={number}><div className="feature-card-top"><span className="feature-icon"><Icon size={20} /></span><span className="feature-number">{number}</span></div><span className="feature-tag">{tag}</span><h3>{title}</h3><p>{description}</p><span className="feature-link">View details <ArrowUpRight size={15} /></span></a>)}</div>
        </div>
      </section>

      <section className="workflow-section section-pad">
        <div className="page-width"><SectionHeading eyebrow="How SRMSS works" title="From route plan to operational insight." copy="A clear workflow connects the essential steps of depot operations." align="center" /><div className="workflow-grid">{steps.map(({ title, copy, icon: Icon }, index) => <div className="workflow-step" key={title}><div className="workflow-icon"><Icon size={21} /><span>0{index + 1}</span></div><h3>{title}</h3><p>{copy}</p></div>)}</div></div>
      </section>

      <section className="showcase-section section-pad" id="route-planning">
        <div className="page-width showcase-grid"><div className="showcase-visual route-card"><div className="showcase-topline"><span><MapPin size={16} /> Route details</span><span className="status-pill"><i /> Active</span></div><div className="route-summary"><small>ROUTE 001 · EXPRESS SERVICE</small><h3>Colombo – Kandy</h3><div className="route-endpoints"><span><i />Colombo Fort</span><span className="route-end-line" /><span><i />Kandy Depot</span></div></div><MiniRouteMap /><div className="route-detail-grid"><div><small>Distance</small><b>142 km</b></div><div><small>Intermediate stops</small><b>3 stops</b></div><div><small>Assigned bus</small><b>NP-2201</b></div><div><small>Assigned driver</small><b>N. Perera</b></div></div></div><div className="showcase-copy"><span className="eyebrow">01 / Route planning</span><h2>Plan routes with greater clarity.</h2><p>Manage route details and resource assignments through a centralized interface with visual route mapping.</p><ul className="check-list"><li><Check size={15} /> Manage route details</li><li><Check size={15} /> Add intermediary stops</li><li><Check size={15} /> Assign buses and drivers</li><li><Check size={15} /> Review route mapping and distance</li></ul><Link className="text-link" href="/routes/planning">Open route planning <ArrowRight size={16} /></Link></div></div>
      </section>

      <section className="schedule-section section-pad" id="schedule-management">
        <div className="page-width showcase-grid showcase-grid-reverse"><div className="showcase-copy"><span className="eyebrow">02 / Schedule management</span><h2>Coordinate schedules efficiently.</h2><p>Create daily, weekly and monthly timetables while identifying conflicts and making operational adjustments when required.</p><ul className="check-list"><li><Check size={15} /> Organize trip timetables</li><li><Check size={15} /> Review assigned buses and drivers</li><li><Check size={15} /> Identify schedule conflicts</li><li><Check size={15} /> Adjust operational schedules</li></ul><Link className="text-link" href="/schedules">Manage schedules <ArrowRight size={16} /></Link></div><div className="showcase-visual calendar-card"><div className="calendar-head"><div><small>WEEKLY SCHEDULE</small><h3>October 05 – 11, 2026</h3></div><span className="calendar-switch">Week <span>⌄</span></span></div><div className="calendar-days"><span>MON<small>05</small></span><span>TUE<small>06</small></span><span className="calendar-today">WED<small>07</small></span><span>THU<small>08</small></span><span>FRI<small>09</small></span></div><div className="calendar-events"><div className="calendar-event event-blue"><b>Colombo – Kandy</b><small>06:45 – 10:25 · NP-2201</small></div><div className="calendar-event event-cyan"><b>Galle – Matara</b><small>08:30 – 10:10 · GL-1188</small></div><div className="calendar-event event-warning"><b>Kandy – Matale</b><small>07:15 – 08:20 · KA-3324</small></div></div><div className="conflict-alert"><span>!</span><div><b>Schedule conflict detected</b><small>Review the assigned vehicle timetable</small></div><ArrowUpRight size={15} /></div></div></div>
      </section>

      <section className="operations-section section-pad" id="operations">
        <div className="page-width"><div className="operations-intro"><div><span className="eyebrow">03 / Depot management</span><h2>A clear view of depot operations.</h2></div><p>Monitor routes, trips and fleet status from a centralized operations overview.</p></div><div className="operations-dashboard"><div className="operations-sidebar"><div className="operations-logo"><span><Route size={17} /></span>SRMSS</div><span className="side-active"><Gauge size={15} /> Overview</span><span><Route size={15} /> Routes</span><span><CalendarDays size={15} /> Schedules</span><span><Bus size={15} /> Fleet</span><span><BarChart3 size={15} /> Reports</span><div className="side-bottom"><span className="side-user">AD</span><span><b>Depot admin</b><small>Operations team</small></span></div></div><div className="operations-main"><div className="operations-top"><div><small>FRIDAY, OCTOBER 02</small><h3>Depot overview</h3></div><span>All services <span>⌄</span></span></div><div className="ops-kpis">{[{ label: "Active routes", value: "18", icon: Route }, { label: "Active buses", value: "25", icon: Bus }, { label: "Drivers on duty", value: "42", icon: UsersRound }, { label: "Delayed trips", value: "03", icon: Clock3 }].map(({ label, value, icon: Icon }) => <div className="ops-kpi" key={label}><span><Icon size={15} /></span><small>{label}</small><b>{value}</b></div>)}</div><div className="ops-lower"><div className="ops-trip-panel"><div className="ops-panel-title"><b>Trip status</b><a href="#analytics">View report <ArrowRight size={12} /></a></div>{tripRows.map((trip) => <div className="ops-trip-row" key={trip.route}><span className="ops-trip-icon"><Bus size={14} /></span><span><b>{trip.route}</b><small>{trip.bus} · {trip.time}</small></span><em className={`trip-status status-${trip.status.toLowerCase().replaceAll(" ", "-")}`}>{trip.status}</em></div>)}</div><div className="ops-fleet-panel"><div className="ops-panel-title"><b>Fleet overview</b><span>Today</span></div><div className="fleet-bar-label"><span>Vehicle utilization</span><b>78%</b></div><div className="fleet-track"><i /></div><div className="fleet-breakdown"><span><i />In service <b>25</b></span><span><i />Available <b>05</b></span><span><i />Maintenance <b>02</b></span></div></div></div></div></div></div>
      </section>

      <section className="fleet-section section-pad" id="fleet">
        <div className="page-width"><SectionHeading eyebrow="04 / Fuel & maintenance" title="Keep fleet records in view." copy="Bring vehicle status, fuel records and maintenance activity into the same depot workflow." align="center" /><div className="fleet-cards"><article className="fleet-card"><div className="fleet-card-head"><span className="fleet-card-icon"><Bus size={20} /></span><span className="mini-label">Vehicle status</span></div><div className="fleet-bus-art"><Bus size={74} strokeWidth={1.15} /></div><h3>Bus NP-2201</h3><p>Registration CAB-1456</p><div className="fleet-status-line"><span>Current status</span><b className="status-text-green"><i /> In Service</b></div><div className="fleet-status-line"><span>Seating capacity</span><b>44 seats</b></div></article><article className="fleet-card"><div className="fleet-card-head"><span className="fleet-card-icon"><Fuel size={20} /></span><span className="mini-label">Fuel record</span></div><div className="fuel-amount">120 <small>L</small></div><p>Recorded fuel consumption</p><div className="fuel-bars" aria-label="Sample fuel log visualization">{[35, 52, 44, 68, 54, 83, 60, 74, 55, 92, 69, 80].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="fuel-foot"><span>Sample log</span><span>Fuel monitoring</span></div></article><article className="fleet-card"><div className="fleet-card-head"><span className="fleet-card-icon"><Wrench size={20} /></span><span className="mini-label">Maintenance status</span></div><div className="maintenance-list"><div><span className="maintenance-dot dot-blue" /><span><b>Scheduled</b><small>Routine service</small></span><span className="maintenance-date">Oct 08</span></div><div><span className="maintenance-dot dot-green" /><span><b>Completed</b><small>Brake inspection</small></span><span className="maintenance-date">Sep 30</span></div><div><span className="maintenance-dot dot-amber" /><span><b>Overdue</b><small>Engine check</small></span><span className="maintenance-date">Review</span></div></div><Link className="text-link fleet-card-link" href="/fuel-maintenance">View maintenance <ArrowRight size={15} /></Link></article></div></div>
      </section>

      <section className="people-section section-pad" id="people">
        <div className="page-width people-grid"><div className="people-copy"><span className="eyebrow">05 / Drivers &amp; vehicles</span><h2>Manage drivers and vehicles with better visibility.</h2><p>Maintain organized digital records for drivers and vehicles across depot operations, including assignment and service details.</p><Link className="text-link" href="/drivers">Manage depot resources <ArrowRight size={16} /></Link></div><div className="people-cards"><article className="person-card"><div className="person-card-top"><span className="person-avatar">NP</span><span className="person-state"><i /> On Duty</span></div><small className="mini-label">Driver profile</small><h3>N. Perera</h3><div className="person-data"><span>License number</span><b>B1234567</b></div><div className="person-data"><span>Assigned route</span><b>Colombo – Kandy</b></div><div className="person-data"><span>Working hours</span><b>06:00 – 14:00</b></div></article><article className="vehicle-card"><div className="vehicle-card-top"><span className="fleet-card-icon"><Bus size={20} /></span><span className="person-state"><i /> In Service</span></div><small className="mini-label">Vehicle record</small><h3>NP-2201</h3><div className="person-data"><span>Registration</span><b>CAB-1456</b></div><div className="person-data"><span>Seating capacity</span><b>44 seats</b></div><div className="person-data"><span>Mileage</span><b>182,450 km</b></div></article></div></div>
      </section>

      <section className="analytics-section section-pad" id="analytics">
        <div className="page-width"><div className="analytics-heading"><div><span className="eyebrow">06 / Reports &amp; analytics</span><h2>Turn operational data into clear insights.</h2><p>Review route performance, fuel consumption, utilization and trip completion.</p></div><div className="period-switch" aria-label="Report period"><button type="button">Weekly</button><button type="button" className="period-active">Monthly</button></div></div><div className="analytics-dashboard"><div className="analytics-main-chart"><div className="chart-card-head"><div><b>Route performance</b><small>Trip completion by route</small></div><span className="chart-filter">Monthly <span>⌄</span></span></div><div className="chart-legend"><span><i />Scheduled trips</span><span><i />Completed trips</span></div><div className="performance-chart" aria-label="Bar chart comparing scheduled and completed trips"><div className="chart-y-axis"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="chart-bars">{[{ label: "Col–Kan", one: 82, two: 68 }, { label: "Kan–Mat", one: 66, two: 54 }, { label: "Gal–Mat", one: 76, two: 66 }, { label: "Neg–Col", one: 92, two: 78 }, { label: "Kur–Put", one: 60, two: 49 }, { label: "Mat–Bad", one: 72, two: 62 }].map((bar) => <div className="chart-bar-group" key={bar.label}><div><i style={{ height: `${bar.one}%` }} /><i style={{ height: `${bar.two}%` }} /></div><small>{bar.label}</small></div>)}</div></div></div><div className="analytics-side"><div className="analytics-small-card"><div className="chart-card-head"><div><b>Fuel consumption</b><small>Recorded usage trend</small></div><Fuel size={17} /></div><div className="fuel-sparkline"><svg viewBox="0 0 240 62" role="img" aria-label="Fuel consumption trend line"><path d="M3 47 C22 42 21 22 42 29 S70 50 88 35 S112 18 131 28 S156 41 173 21 S205 30 237 8" /></svg></div><div className="sparkline-labels"><span>Week 1</span><span>Week 4</span></div></div><div className="analytics-small-card utilization-small"><div className="chart-card-head"><div><b>Vehicle utilization</b><small>Fleet overview</small></div><Bus size={17} /></div><div className="utilization-progress"><span>In service</span><b>78%</b></div><div className="fleet-track"><i /></div><div className="utilization-progress muted-progress"><span>Available / maintenance</span><b>22%</b></div></div></div><div className="analytics-report"><span className="report-icon"><BarChart3 size={18} /></span><span><b>Trip completion summary</b><small>Report preview · Scheduled and completed trips by route</small></span><Link href="/reports" aria-label="Open reports"><ArrowUpRight size={18} /></Link></div></div></div>
      </section>

      <section className="efficiency-section section-pad">
        <div className="page-width efficiency-grid"><div className="efficiency-visual"><div className="efficiency-ring"><div><Gauge size={26} /><b>Resource<br />overview</b></div></div><div className="efficiency-label efficiency-bus"><Bus size={16} /><span>Existing buses</span></div><div className="efficiency-label efficiency-driver"><UsersRound size={16} /><span>Driver allocation</span></div><div className="efficiency-label efficiency-route"><Route size={16} /><span>Route planning</span></div></div><div className="efficiency-copy"><span className="eyebrow">Resource efficiency</span><h2>Optimize existing resources. Support sustainable operations.</h2><p>SRMSS promotes better use of existing buses, drivers and operational resources through centralized route planning, scheduling, fuel monitoring and maintenance tracking.</p><div className="efficiency-tags"><span><Check size={14} /> Coordinated assignments</span><span><Check size={14} /> Fuel and service records</span></div></div></div>
      </section>

      <section className="final-cta"><div className="cta-orbit cta-orbit-one" /><div className="cta-orbit cta-orbit-two" /><div className="page-width cta-inner"><span className="eyebrow">SRMSS · Depot operations</span><h2>Bring smarter depot operations into one platform.</h2><p>Explore a centralized frontend experience for route planning, scheduling, fleet visibility, maintenance tracking and operational analytics.</p><div className="cta-actions"><Link className="button button-primary button-large" href="/dashboard">Open SRMSS Dashboard <ArrowRight size={17} /></Link><Link className="button button-cta-outline button-large" href="/login">Sign In</Link></div></div></section>

      <footer className="site-footer"><div className="page-width footer-main"><div className="footer-brand"><Brand /><p>Smart Route Management<br />and Scheduling System</p></div><div className="footer-column"><b>Navigation</b><a href="#home">Home</a><a href="#features">Features</a><a href="#operations">Operations</a><a href="#analytics">Analytics</a></div><div className="footer-column"><b>System</b><Link href="/login">Sign In</Link><Link href="/dashboard">Dashboard</Link><Link href="/settings">Settings</Link></div><div className="footer-note"><span><span className="footer-dot" /> Public transport depot platform</span><small>Routes · Schedules · Fleet · Analytics</small></div></div><div className="page-width footer-bottom"><span>© 2026 SRMSS. Smart Route Management and Scheduling System.</span><a href="#home">Back to top ↑</a></div></footer>
    </main>
  );
}

export { default } from "@/components/public-home";
