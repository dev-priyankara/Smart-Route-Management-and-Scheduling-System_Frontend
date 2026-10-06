"use client";

import { Brand } from "./Brand";
import { UsersRound, Play, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        <Brand footer />
        <nav className="footer-nav" aria-label="Footer navigation">
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#services">Services</a>
          <a href="#routes">Routes</a>
          <a href="#gallery">Gallery</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="footer-social" aria-label="Social media">
          <a href="https://www.facebook.com/" aria-label="Facebook"><UsersRound size={12} /></a>
          <a href="https://www.youtube.com/" aria-label="YouTube"><Play size={12} /></a>
          <a href="https://wa.me/94761234567" aria-label="WhatsApp"><MessageCircle size={12} /></a>
        </div>
        <small className="footer-copyright">© 2026 SRMSS. All rights reserved.</small>
      </div>
    </footer>
  );
}
