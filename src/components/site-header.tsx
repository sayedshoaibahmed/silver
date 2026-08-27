"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/theme-toggle";
import { BUSINESS_NAME } from "@/lib/business";
import { mainNav } from "@/lib/navigation";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur-sm">
        <Container className="flex items-center justify-between gap-4 py-4">
          <Link href="/" className="font-serif text-lg font-semibold text-mangrove-fg">
            {BUSINESS_NAME}
          </Link>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink hover:bg-line/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
              aria-expanded={isOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-surface/95 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-line px-4 py-4 md:px-8">
            <span className="font-serif text-lg font-semibold text-mangrove-fg">
              {BUSINESS_NAME}
            </span>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink hover:bg-line/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-1 flex-col items-center justify-center gap-8 overflow-y-auto p-4 text-center">
            {mainNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-2xl font-medium text-ink transition-colors hover:text-mangrove-fg"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
