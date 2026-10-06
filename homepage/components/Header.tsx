"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Headset, Menu, Moon, Sun, X, BusFront } from "lucide-react";
import { Brand } from "./Brand";
import { useTheme } from "@/components/theme-provider";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  return (
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
        <a className="public-phone" href="tel:+94761234567">
          <span><Headset size={17} /></span>
          <span><b>+94 76 123 4567</b><small>Call for bookings</small></span>
        </a>
        <button
          className="public-theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon size={17} /> : <Sun size={18} />}
        </button>
        <Link className="public-book-button" href="/login">
          <BusFront size={16} /> Login
        </Link>
        <button
          className="public-menu-button"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}

