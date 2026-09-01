/**
 * Confirmed business constants — see docs/BUSINESS_INFO.md.
 * Not owner-editable from admin in v1.
 */
export const BUSINESS_NAME = "Silver Sand Beach Homestay";
export const BUSINESS_PLACE = "Murudeshwar, Karnataka, India";
export const SITE_HOST = "silversandhomestay.com";
/** Canonical apex — sitemap, robots, production canonicals/OG/JSON-LD. */
export const CANONICAL_SITE_URL = `https://${SITE_HOST}`;

/** Strip whitespace and trailing slashes so `${origin}/path` never becomes `//path`. */
export function normalizeSiteOrigin(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/**
 * Absolute site origin for SEO (canonicals, OG, JSON-LD, sitemap, robots).
 *
 * Always prefer the apex domain when the env is missing, is Production, or
 * points at a `*.vercel.app` deployment host (with or without a trailing
 * slash). Localhost / custom non-Vercel overrides still work for local OG.
 */
export function resolveSiteUrl(
  vercelEnv: string | undefined = process.env.VERCEL_ENV,
  publicSiteUrl: string | undefined = process.env.NEXT_PUBLIC_SITE_URL,
): string {
  if (vercelEnv === "production") {
    return CANONICAL_SITE_URL;
  }
  if (!publicSiteUrl?.trim()) {
    return CANONICAL_SITE_URL;
  }

  const normalized = normalizeSiteOrigin(publicSiteUrl);
  try {
    const host = new URL(normalized).hostname;
    if (
      host === SITE_HOST ||
      host === `www.${SITE_HOST}` ||
      host.endsWith(".vercel.app")
    ) {
      return CANONICAL_SITE_URL;
    }
  } catch {
    return CANONICAL_SITE_URL;
  }

  return normalized;
}

export const SITE_URL = resolveSiteUrl();

export const DISPLAY_PHONE = "+91 99862 22892";
export const PHONE_E164 = "+919986222892";
export const WHATSAPP_E164 = "919986222892";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_E164}`;
export const TEL_URL = `tel:${PHONE_E164}`;
export const INSTAGRAM_URL = ""; // Add Instagram URL here when available

export const ROOM_SLUG = "deluxe-ac";
export const ROOM_PATH = "/rooms/deluxe-ac-room";
export const ROOM_NAME = "Deluxe AC Room";

export const OCCUPANCY_TIERS = [2, 3, 4, 6, 8] as const;
export type OccupancyTier = (typeof OCCUPANCY_TIERS)[number];

/** Confirmed cap: occupancy + extra beds cannot exceed this (BUSINESS_INFO.md). */
export const MAX_TOTAL_GUESTS = 8;

/** Listed occupancy and extra-bed rates include GST (owner, 25 August 2026). */
export const RATES_INCLUDE_GST = true;

/** A bathroom is available with the Deluxe AC Room (owner, 25 August 2026). */
export const BATHROOM_AVAILABLE = true;

/** Valid guest ID is required at check-in (owner, 25 August 2026). */
export const GUEST_ID_REQUIRED = true;

/**
 * Owner-confirmed landmark only. Do not invent beach, temple, or railway distances.
 */
export const LANDMARK_BUS_STAND = "1 km from Murudeshwar bus stand";

/** Google Business / Maps Place ID — reviews + Embed API. */
export const GOOGLE_PLACE_ID = "ChIJz7O6_zJHvDsRPrgj4nB9eiE";

/**
 * Postal address from Google Maps for the Place ID above
 * (owner-confirmed via Place ID, 25 August 2026).
 */
export const STREET_ADDRESS = "1, Naveen Beach Rd";
export const ADDRESS_LOCALITY = "Mavalli";
export const ADDRESS_SUBLOCALITY = "Murdeshwar";
export const ADDRESS_REGION = "Karnataka";
export const POSTAL_CODE = "581350";
export const ADDRESS_COUNTRY = "IN";
export const FULL_ADDRESS =
  "1, Naveen Beach Rd, Murdeshwar, Mavalli, Karnataka 581350, India";

/** WGS84 from the Google Maps place pin for GOOGLE_PLACE_ID. */
export const GEO_LATITUDE = 14.1007798;
export const GEO_LONGITUDE = 74.4874894;
export const GOOGLE_MAPS_PLACE_URL = "https://maps.app.goo.gl/8YD4RiHJrZKKVNmf9?g_st=ac";

/**
 * Maps Embed API iframe src (mode=place). Key is public by design —
 * restrict HTTP referrers in Google Cloud Console.
 */
export function googleMapsEmbedSrc(): string | null {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY?.trim();
  if (!key) return null;
  const placeId = process.env.GOOGLE_PLACE_ID?.trim() || GOOGLE_PLACE_ID;
  const params = new URLSearchParams({
    key,
    q: `place_id:${placeId}`,
  });
  return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
}
