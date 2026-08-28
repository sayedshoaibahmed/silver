import Link from "next/link";
import { MapPin, Phone, MessageCircle } from "lucide-react";

import { Container } from "@/components/layout/container";
import {
  BUSINESS_NAME,
  DISPLAY_PHONE,
  FULL_ADDRESS,
  GOOGLE_MAPS_PLACE_URL,
  TEL_URL,
  WHATSAPP_URL,
  INSTAGRAM_URL,
} from "@/lib/business";
import { footerNav } from "@/lib/navigation";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-mangrove text-sand scheme-dark">
      <Container className="grid gap-6 py-8 max-md:pr-[4.75rem] md:grid-cols-3 md:gap-8 md:py-16 lg:gap-16">
        {/* 1. Property Information */}
        <div className="flex flex-col gap-3 md:gap-4">
          <p className="font-serif text-xl font-semibold text-gold md:text-2xl">
            {BUSINESS_NAME}
          </p>
          <p className="text-sm leading-relaxed text-sand/80">
            Comfortable, peaceful stay near Murdeshwar Beach —
            perfect for families, couples and travellers.
          </p>
          <a
            href={GOOGLE_MAPS_PLACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-start gap-2.5 text-sm text-sand/80 transition-colors group hover:text-gold md:mt-2 md:gap-3"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold transition-colors group-hover:text-gold-hover" />
            <span className="leading-relaxed">
              {FULL_ADDRESS}{" "}
              <span className="ml-1 inline-block font-medium text-gold transition-colors group-hover:text-gold-hover">
                Get Directions &rarr;
              </span>
            </span>
          </a>
        </div>

        {/* 2–3. Quick Links + Contact — side by side on mobile; third column on desktop */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-6 border-t border-white/10 pt-6 md:contents md:border-0 md:pt-0">
          <div className="flex flex-col gap-3 border-r border-white/10 pr-4 md:gap-4 md:border-r-0 md:px-4 md:pr-4">
            <p className="font-serif text-base font-medium text-gold md:text-lg">
              Quick Links
            </p>
            <nav className="flex flex-col gap-2 text-sm md:grid md:grid-cols-2 md:gap-x-4 md:gap-y-3">
              {footerNav.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sand/80 transition-colors hover:text-gold"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-3 pl-1 md:gap-4 md:pl-0">
            <p className="font-serif text-base font-medium text-gold md:text-lg">
              Contact & Booking
            </p>
            <div className="flex flex-col gap-2.5 text-sm md:gap-3">
              <a
                href={TEL_URL}
                className="group flex items-center gap-2.5 text-sand/80 transition-colors hover:text-gold md:gap-3"
              >
                <Phone className="h-4 w-4 shrink-0 text-gold transition-colors group-hover:text-gold-hover" />
                <span className="min-w-0 break-words">Call: {DISPLAY_PHONE}</span>
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 text-sand/80 transition-colors hover:text-gold md:gap-3"
              >
                <MessageCircle className="h-4 w-4 shrink-0 text-gold transition-colors group-hover:text-gold-hover" />
                <span className="min-w-0 break-words">WhatsApp: {DISPLAY_PHONE}</span>
              </a>
              {INSTAGRAM_URL ? (
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 text-sand/80 transition-colors hover:text-gold md:gap-3"
                >
                  <InstagramIcon className="h-4 w-4 shrink-0 text-gold transition-colors group-hover:text-gold-hover" />
                  <span>Instagram</span>
                </a>
              ) : (
                <span
                  className="flex items-center gap-2.5 text-sand/50 md:gap-3"
                  title="Coming soon"
                >
                  <InstagramIcon className="h-4 w-4 shrink-0 text-gold/50" />
                  <span>Instagram</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-black/20 py-4 md:py-6">
        <Container className="max-md:pr-[4.75rem]">
          <p className="text-center text-xs leading-relaxed text-balance text-sand/40">
            © {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
