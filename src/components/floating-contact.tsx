"use client";

import { Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useBookingEnquiry } from "@/components/booking/enquiry-context";
import { buttonVariants } from "@/components/ui/button";
import { buildGenericWhatsAppEnquiryUrl } from "@/lib/booking/whatsapp-message";
import { DISPLAY_PHONE, TEL_URL } from "@/lib/business";
import { cn } from "@/lib/utils";

function WhatsAppMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M12.04 2C6.58 2 2.15 6.43 2.15 11.89c0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.89-4.43 9.89-9.89C21.94 6.43 17.5 2 12.04 2m5.83 14.01c-.25.7-1.22 1.28-2.01 1.45-.54.11-1.24.2-3.61-.78-3.03-1.24-4.98-4.29-5.13-4.49-.15-.2-1.24-1.65-1.24-3.15s.78-2.23 1.06-2.54c.25-.28.66-.41 1.06-.41.13 0 .24 0 .35.01.3.01.46.03.66.51.25.6.85 2.07.92 2.22.08.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.39-.44.53-.15.15-.3.31-.13.6.18.3.79 1.3 1.7 2.11 1.17 1.04 2.16 1.36 2.46 1.51.3.15.48.13.66-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.66-.15.28.1 1.75.83 2.05.98.3.15.5.23.57.35.08.13.08.73-.17 1.43" />
    </svg>
  );
}

export function FloatingContact() {
  const pathname = usePathname();
  const { widgetWhatsAppHref } = useBookingEnquiry();
  const [open, setOpen] = useState(false);
  const whatsappHref = widgetWhatsAppHref ?? buildGenericWhatsAppEnquiryUrl();

  useEffect(() => {
    const hero = document.querySelector("[data-ss-hero]");
    const cta = document.querySelector("[data-ss-booking-cta]");

    let heroBlocking = Boolean(hero);
    let ctaBlocking = false;

    const apply = () => {
      setOpen(!heroBlocking && !ctaBlocking);
    };

    const heroIo = new IntersectionObserver(
      ([entry]) => {
        heroBlocking = Boolean(hero) && entry.isIntersecting;
        apply();
      },
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" },
    );

    const ctaIo = new IntersectionObserver(
      ([entry]) => {
        ctaBlocking = Boolean(cta) && entry.isIntersecting;
        apply();
      },
      { threshold: 0 },
    );

    if (hero) heroIo.observe(hero);
    else heroBlocking = false;

    if (cta) ctaIo.observe(cta);
    apply();

    return () => {
      heroIo.disconnect();
      ctaIo.disconnect();
    };
  }, [pathname, widgetWhatsAppHref]);

  return (
    <div
      className={cn("ss-fab-cluster", open && "is-in")}
      aria-hidden={!open}
      {...(open ? {} : { inert: true })}
    >
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Silver Sand Beach Homestay"
        tabIndex={open ? 0 : -1}
        className={cn(
          buttonVariants({ variant: "whatsapp", size: "icon" }),
          "ss-fab ss-fab-pulse h-12 w-12 shadow-lg",
        )}
      >
        <WhatsAppMark className="h-5 w-5" />
      </a>
      <a
        href={TEL_URL}
        aria-label={`Call ${DISPLAY_PHONE}`}
        tabIndex={open ? 0 : -1}
        className={cn(
          buttonVariants({ variant: "default", size: "icon" }),
          "ss-fab h-12 w-12 shadow-lg",
        )}
      >
        <Phone className="h-5 w-5" strokeWidth={2} />
      </a>
    </div>
  );
}
