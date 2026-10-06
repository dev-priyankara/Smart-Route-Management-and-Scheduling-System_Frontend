"use client";

import Link from "next/link";
import { Headset, MessageCircle, MapPin, ArrowRight } from "lucide-react";

export function Contact() {
  return (
    <section className="public-contact public-reveal" id="contact">
      <div className="public-contact-inner">
        <div className="contact-copy">
          <span className="public-eyebrow"><i /> Contact</span>
          <h2>Talk to our transport support team.</h2>
          <p>For route enquiries, booking assistance or SRMSS information, contact our team. We&apos;re ready to help you plan your next step.</p>
          <Link className="contact-book-button" href="/login#register">Book Now <ArrowRight size={15} /></Link>
        </div>
        <div className="contact-details">
          <a href="tel:+94761234567"><span className="contact-icon"><Headset size={19} /></span><span><small>Call for bookings</small><b>+94 76 123 4567</b></span><ArrowRight size={15} /></a>
          <a href="https://wa.me/94761234567"><span className="contact-icon"><MessageCircle size={19} /></span><span><small>Message our team</small><b>WhatsApp support</b></span><ArrowRight size={15} /></a>
          <div><span className="contact-icon"><MapPin size={19} /></span><span><small>Service area</small><b>Across Sri Lanka</b></span></div>
        </div>
      </div>
    </section>
  );
}
