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
    <footer className="mt-auto bg-mangrove text-sand scheme-dark border-t border-white/10">
      <Container className="grid gap-12 py-16 md:grid-cols-3 md:gap-8 lg:gap-16">
        
        {/* 1. Property Information */}
        <div className="flex flex-col gap-4">
          <p className="font-serif text-2xl font-semibold text-gold">
            {BUSINESS_NAME}
          </p>
          <p className="text-sm text-sand/80 leading-relaxed">
            Comfortable, peaceful stay near Murdeshwar Beach —
            perfect for families, couples and travellers.
          </p>
          <a
            href={GOOGLE_MAPS_PLACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-start gap-3 text-sm text-sand/80 hover:text-gold transition-colors group"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold group-hover:text-gold-hover transition-colors" />
            <span className="leading-relaxed">
              {FULL_ADDRESS}{" "}
              <span className="ml-1 inline-block font-medium text-gold group-hover:text-gold-hover transition-colors">
                Get Directions &rarr;
              </span>
            </span>
          </a>
        </div>

        {/* 2. Quick Links */}
        <div className="flex flex-col gap-4 md:px-4">
          <p className="font-serif text-lg font-medium text-gold">
            Quick Links
          </p>
          <nav className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {footerNav.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-sand/80 hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 3. Contact & Booking */}
        <div className="flex flex-col gap-4">
          <p className="font-serif text-lg font-medium text-gold">
            Contact & Booking
          </p>
          <div className="flex flex-col gap-3 text-sm">
            <a 
              href={TEL_URL} 
              className="flex items-center gap-3 text-sand/80 hover:text-gold transition-colors group"
            >
              <Phone className="h-4 w-4 shrink-0 text-gold group-hover:text-gold-hover transition-colors" />
              <span>Call: {DISPLAY_PHONE}</span>
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sand/80 hover:text-gold transition-colors group"
            >
              <MessageCircle className="h-4 w-4 shrink-0 text-gold group-hover:text-gold-hover transition-colors" />
              <span>WhatsApp: {DISPLAY_PHONE}</span>
            </a>
            {INSTAGRAM_URL ? (
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sand/80 hover:text-gold transition-colors group"
              >
                <InstagramIcon className="h-4 w-4 shrink-0 text-gold group-hover:text-gold-hover transition-colors" />
                <span>Instagram</span>
              </a>
            ) : (
              <span className="flex items-center gap-3 text-sand/50" title="Coming soon">
                <InstagramIcon className="h-4 w-4 shrink-0 text-gold/50" />
                <span>Instagram</span>
              </span>
            )}
          </div>
        </div>

      </Container>
      
      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-black/20 py-6">
        <Container>
          <p className="text-center text-xs text-sand/40">
            © {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
