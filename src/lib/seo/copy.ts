/**
 * Unique title tags and meta descriptions — one intent per URL.
 * Titles (except home) are completed by the root layout template:
 * `%s | Silver Sand Beach Homestay`.
 */

import { BUSINESS_NAME, DISPLAY_PHONE, ROOM_NAME, ROOM_PATH } from "@/lib/business";

export type PageSeoCopy = {
  title: string;
  description: string;
  path: string;
  /** Home uses an absolute title so the brand is not duplicated by the template. */
  absoluteTitle?: string;
};

export const PAGE_SEO = {
  home: {
    title: "Homestay in Murudeshwar",
    absoluteTitle: `Beachside Homestay in Murudeshwar | ${BUSINESS_NAME}`,
    description: `Beachside homestay in Murudeshwar, Karnataka, next to the beach. Rated 4.9 by 43 Google guests. AC room for 2–8 guests. Book on WhatsApp at ${DISPLAY_PHONE}.`,
    path: "/",
  },
  rooms: {
    title: "Rooms in Murudeshwar",
    description: `One room at ${BUSINESS_NAME}: the ${ROOM_NAME}, air-conditioned, priced by how many guests share it (2, 3, 4, 6, or 8). Book dates on WhatsApp.`,
    path: "/rooms",
  },
  room: {
    title: `${ROOM_NAME} — occupancy pricing`,
    description: `The ${ROOM_NAME} at ${BUSINESS_NAME}, Murudeshwar. Air-conditioned, with a bathroom. Nightly rate for 2–8 guests sharing. Extra beds up to eight guests. GST included.`,
    path: ROOM_PATH,
  },
  gallery: {
    title: "Photos — Silver Sand Beach Homestay",
    description: `Photographs of the Deluxe AC Room at ${BUSINESS_NAME}, Murudeshwar, by occupancy. Exterior and bathroom photos will be added when we have them.`,
    path: "/gallery",
  },
  about: {
    title: "About Silver Sand Beach Homestay",
    description: `${BUSINESS_NAME} is a family-run homestay in Murudeshwar with one Deluxe AC Room. Book on WhatsApp with the host — no booking site in between.`,
    path: "/about",
  },
  location: {
    title: "Getting to Murudeshwar",
    description: `${BUSINESS_NAME} at 1, Naveen Beach Rd, Murdeshwar, Mavalli, Karnataka 581350, 1 km from Murudeshwar bus stand. Murdeshwar Railway Station is on the Konkan Railway.`,
    path: "/location",
  },
  contact: {
    title: "Phone and WhatsApp",
    description: `Contact ${BUSINESS_NAME}: WhatsApp or call ${DISPLAY_PHONE}. Send your dates and group size — the host confirms availability directly.`,
    path: "/contact",
  },
  privacy: {
    title: "Privacy Policy",
    description: `How ${BUSINESS_NAME} uses your phone number and WhatsApp messages when you enquire about a stay in Murudeshwar. We do not sell your data.`,
    path: "/privacy",
  },
  terms: {
    title: "Booking terms",
    description: `Booking terms for ${BUSINESS_NAME}: WhatsApp or phone confirmation, ${ROOM_NAME} (air-conditioned, bathroom available), check-in 11:00 AM, non-cancellable bookings, no meals included. Rates include GST. Valid ID required at check-in.`,
    path: "/terms",
  },
  notFound: {
    title: "Page not found",
    description: `That page is not on ${BUSINESS_NAME}. Return to the homestay in Murudeshwar, or WhatsApp us about your dates.`,
    path: "/404",
  },
} as const satisfies Record<string, PageSeoCopy>;
