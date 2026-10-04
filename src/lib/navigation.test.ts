import assert from "node:assert/strict";
import { test } from "node:test";

import sitemap from "../app/sitemap";
import { SITE_URL } from "./business";
import { FOOTER_CONTACT_PATH, footerSections, legalNav } from "./navigation";

test("every sitemap page is linked from the server-rendered footer", () => {
  const linked = new Set<string>([
    "/", // brand name links home
    FOOTER_CONTACT_PATH,
    ...footerSections.flatMap((section) => section.links.map((link) => link.href)),
    ...legalNav.map((link) => link.href),
  ]);
  for (const entry of sitemap()) {
    const path = entry.url.slice(SITE_URL.length) || "/";
    assert.ok(linked.has(path), `${path} is in the sitemap but not in the footer`);
  }
});

test("footer link groups stay short enough to sit side by side on mobile", () => {
  for (const section of footerSections) {
    assert.ok(section.links.length <= 4, `${section.title} has too many links`);
  }
});
