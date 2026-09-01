import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CANONICAL_SITE_URL,
  normalizeSiteOrigin,
  resolveSiteUrl,
} from "./business";

test("normalizeSiteOrigin strips trailing slashes", () => {
  assert.equal(
    normalizeSiteOrigin("https://silver-one-gray.vercel.app/"),
    "https://silver-one-gray.vercel.app",
  );
  assert.equal(
    normalizeSiteOrigin("https://silversandhomestay.com"),
    "https://silversandhomestay.com",
  );
});

test("resolveSiteUrl forces canonical apex on Vercel production", () => {
  assert.equal(
    resolveSiteUrl("production", "https://silver-one-gray.vercel.app/"),
    CANONICAL_SITE_URL,
  );
  assert.equal(
    resolveSiteUrl("production", "https://silversandhomestay.com/"),
    CANONICAL_SITE_URL,
  );
});

test("resolveSiteUrl never publishes *.vercel.app as the SEO origin", () => {
  assert.equal(
    resolveSiteUrl("preview", "https://silver-one-gray.vercel.app/"),
    CANONICAL_SITE_URL,
  );
  assert.equal(
    resolveSiteUrl("", "https://silver-one-gray.vercel.app"),
    CANONICAL_SITE_URL,
  );
});

test("resolveSiteUrl allows localhost overrides without trailing slash", () => {
  // Pass "" (not undefined) so default params do not re-read process.env.
  assert.equal(
    resolveSiteUrl("", "http://localhost:43123/"),
    "http://localhost:43123",
  );
  assert.equal(resolveSiteUrl("", ""), CANONICAL_SITE_URL);
  assert.equal(resolveSiteUrl("", "   "), CANONICAL_SITE_URL);
});
