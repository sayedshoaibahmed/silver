import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { MOTION_INIT_SCRIPT, MOTION_OK_ATTR, MOTION_OK_VALUE } from "./motion";

test("motion init script opts in only when reduced-motion is off", () => {
  assert.ok(MOTION_INIT_SCRIPT.includes("prefers-reduced-motion: reduce"));
  assert.ok(MOTION_INIT_SCRIPT.includes(MOTION_OK_ATTR));
  assert.ok(MOTION_INIT_SCRIPT.includes(MOTION_OK_VALUE));
});

test("hero entrance and reveals are gated on prefers-reduced-motion", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  assert.ok(css.includes("@media (prefers-reduced-motion: no-preference)"));
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"));
  assert.ok(css.includes(".hero-media"));
  assert.ok(css.includes(".hero-copy"));
  assert.ok(css.includes(".hero-parallax"));
  assert.ok(css.includes(".reveal.is-pending"));
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*hero-parallax/);
});

test("homepage hero does not delay the booking widget", () => {
  const hero = readFileSync(
    join(process.cwd(), "src/components/sections/hero-section.tsx"),
    "utf8",
  );
  // BookingWidget now lives in page.tsx, not inside the hero overlay.
  // The hero should NOT contain BookingWidget (would delay it behind a parallax layer).
  assert.doesNotMatch(hero, /<BookingWidget/);
  // Hero must not wrap its content in RevealOnScroll
  assert.doesNotMatch(hero, /RevealOnScroll/);
});

test("scroll reveals are homepage-only wrappers, not baked into sections", () => {
  const home = readFileSync(join(process.cwd(), "src/app/(public)/page.tsx"), "utf8");
  assert.ok(home.includes("RevealOnScroll"));
  assert.match(home, /RevealOnScroll>\s*\n\s*<RoomPricingSection/);
  assert.match(home, /RevealOnScroll>\s*\n\s*<FaqSection/);

  for (const file of [
    "src/components/sections/room-pricing-section.tsx",
    "src/components/sections/faq-section.tsx",
  ]) {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    assert.doesNotMatch(source, /RevealOnScroll/);
    assert.doesNotMatch(source, /hero-copy/);
  }
});

test("interaction tokens are defined once and scoped to the public site", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  assert.ok(css.includes("--ss-duration: 180ms"));
  assert.ok(css.includes("--ss-ease:"));
  assert.ok(css.includes("--ss-hover-scale: 1.02"));
  assert.ok(css.includes("--ss-press-scale: 0.98"));
  assert.ok(css.includes("--ss-card-lift:"));
  assert.ok(css.includes("--ss-image-zoom: 1.04"));
  assert.ok(css.includes("--ss-lightbox-duration: 250ms"));
  assert.ok(css.includes("--ss-hero-parallax-max: 96px"));
  assert.ok(css.includes(".public-site .ss-press"));
  assert.ok(css.includes(".public-site .ss-card-lift"));
  assert.ok(css.includes(".public-site .ss-link"));
  assert.ok(css.includes(".public-site .ss-image-zoom"));

  const admin = readFileSync(
    join(process.cwd(), "src/app/(admin)/admin/layout.tsx"),
    "utf8",
  );
  assert.ok(admin.includes("admin-shell"));
  assert.doesNotMatch(admin, /public-site/);
  assert.doesNotMatch(admin, /ss-card-lift/);

  const pub = readFileSync(join(process.cwd(), "src/app/(public)/layout.tsx"), "utf8");
  assert.ok(pub.includes("public-site"));
  assert.ok(pub.includes("PublicShell"));
});

test("gold contact FAB pulses slowly, hides vs booking CTA, and respects reduced motion", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  assert.ok(css.includes("--ss-fab-pulse: 2.8s"));
  assert.ok(css.includes(".ss-fab-cluster"));
  assert.ok(css.includes("ss-fab-pulse"));
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*ss-fab-pulse/);
  assert.match(css, /prefers-reduced-motion:\s*no-preference[\s\S]*ss-fab-pulse/);

  const fab = readFileSync(
    join(process.cwd(), "src/components/floating-contact.tsx"),
    "utf8",
  );
  assert.ok(fab.includes('variant: "gold"'));
  assert.ok(fab.includes("TEL_URL"));
  assert.ok(fab.includes("buildGenericWhatsAppEnquiryUrl"));
  assert.ok(fab.includes("widgetWhatsAppHref"));
  assert.ok(fab.includes("[data-ss-booking-cta]"));
  assert.ok(fab.includes("[data-ss-hero]"));

  const widget = readFileSync(
    join(process.cwd(), "src/components/booking/booking-widget-form.tsx"),
    "utf8",
  );
  assert.ok(widget.includes("data-ss-booking-cta"));
  assert.ok(widget.includes("setWidgetWhatsAppHref"));

  const admin = readFileSync(
    join(process.cwd(), "src/app/(admin)/admin/layout.tsx"),
    "utf8",
  );
  assert.doesNotMatch(admin, /FloatingContact|PublicShell/);
});

test("photo caption overlay uses mangrove tokens, hover reveal, and reduced-motion opacity", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  assert.ok(css.includes(".ss-photo-caption"));
  assert.ok(css.includes("var(--mangrove-deep)"));
  assert.ok(css.includes("var(--ss-duration)"));
  assert.match(css, /hover:\s*hover[\s\S]*pointer:\s*fine[\s\S]*ss-photo-caption/);
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*ss-photo-caption/);

  const occupancy = readFileSync(
    join(process.cwd(), "src/components/marketing/occupancy-room-image.tsx"),
    "utf8",
  );
  assert.ok(occupancy.includes("PhotoRevealCaption"));
  assert.ok(occupancy.includes("PhotoLightboxTrigger"));
  assert.ok(occupancy.includes("formatInr"));
  assert.ok(occupancy.includes("nightlyRateInr"));
  assert.doesNotMatch(occupancy, /₹|2000|2500/);

  const photos = readFileSync(
    join(process.cwd(), "src/components/sections/photos-section.tsx"),
    "utf8",
  );
  assert.ok(photos.includes("getPublicPricing"));
  assert.ok(photos.includes("nightlyRateInr"));

  const attractions = readFileSync(
    join(process.cwd(), "src/components/marketing/attraction-place-image.tsx"),
    "utf8",
  );
  assert.ok(attractions.includes("PhotoRevealCaption"));
  assert.ok(attractions.includes("PhotoLightboxTrigger"));
  assert.ok(attractions.includes("label"));
});

test("photo lightbox open/close is 250ms, reduced-motion instant, and not a npm lightbox", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  assert.ok(css.includes("--ss-lightbox-duration: 250ms"));
  assert.ok(css.includes(".ss-lightbox"));
  assert.match(css, /prefers-reduced-motion:\s*no-preference[\s\S]*ss-lightbox-in/);
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*ss-lightbox/);

  const photos = readFileSync(
    join(process.cwd(), "src/components/sections/photos-section.tsx"),
    "utf8",
  );
  assert.ok(photos.includes("RoomPhotoGallery"));

  const nearby = readFileSync(
    join(process.cwd(), "src/components/sections/nearby-attractions-section.tsx"),
    "utf8",
  );
  assert.ok(nearby.includes("AttractionPhotoGallery"));
  assert.doesNotMatch(nearby, /RoomPhotoGallery/);
});

test("section bands alternate existing sand tokens without a wave SVG", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  assert.ok(css.includes("--space-section: 5.5rem"));
  assert.ok(css.includes("--space-section-fade: 2.75rem"));
  assert.ok(css.includes(".ss-band-canvas"));
  assert.ok(css.includes(".ss-band-wash"));
  assert.doesNotMatch(css, /<svg/);

  const home = readFileSync(join(process.cwd(), "src/app/(public)/page.tsx"), "utf8");
  assert.ok(home.includes('band="canvas"'));
  assert.ok(home.includes('band="wash"'));
});
