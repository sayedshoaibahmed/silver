import { ROOM_PATH } from "@/lib/business";

export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Room" },
  { href: "/location", label: "Location" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact / Book" },
] as const;

/**
 * Footer is the only nav in server-rendered HTML (the header menu mounts on
 * open), so every public sitemap page must be reachable from the footer:
 * these sections, `legalNav`, the brand link to `/`, or `FOOTER_CONTACT_PATH`.
 */
export const footerSections = [
  {
    title: "Your Stay",
    links: [
      { href: ROOM_PATH, label: "Deluxe AC Room" },
      { href: "/rooms", label: "Rooms overview" },
      { href: "/gallery", label: "Gallery" },
    ],
  },
  {
    title: "Plan Your Visit",
    links: [
      { href: "/location", label: "Location & directions" },
      { href: "/#faq", label: "FAQ" },
      { href: "/about", label: "About us" },
    ],
  },
] as const;

/** "Booking enquiry" link in the footer's Contact & Booking column. */
export const FOOTER_CONTACT_PATH = "/contact";

export const legalNav = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Booking terms" },
] as const;
