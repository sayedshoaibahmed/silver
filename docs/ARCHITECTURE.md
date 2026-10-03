# Architecture

Silver Sand Beach Homestay — `silversandhomestay.com`.

This file holds the stack recommendation (section B), the system design (section C), the sitemap (section D), and a short map of the admin pricing flow (full end-to-end in `DATABASE.md`).

**Non-negotiables**

- Occupancy prices and extra-bed rate are **never** hardcoded in the frontend.
- The owner’s admin panel is the **only** editor for those numbers.
- Everything else is static in the codebase.
- No CMS, no PMS, no OTA sync.

---

## B. Recommended tech stack

### What the stack must do well

| Need                       | Why it matters here                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| SEO                        | Primary acquisition is Google for “homestay in Murudeshwar” and close variants. SSR/SSG and clean HTML beat a client-only SPA. |
| Load speed                 | Mobile visitors on coastal 4G; photos will dominate weight.                                                                    |
| Tiny dynamic surface       | One room type, a handful of INR fields, one editor.                                                                            |
| Secure admin               | One owner, one login, money-adjacent numbers.                                                                                  |
| Low operating cost         | A single homestay, not a SaaS.                                                                                                 |
| Second developer in Cursor | TypeScript + a boring folder layout, documented in this repo.                                                                  |

### Option 1 — Next.js App Router + Postgres (recommended)

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Data:** Postgres (Neon or equivalent serverless). Drizzle ORM.
- **Auth:** Auth.js (Auth.js / NextAuth) credentials provider, one user, database session.
- **Hosting:** Vercel (site + Route Handlers) + Neon.

**Fit:** Server Components fetch prices on the server so the public HTML can include the current rate without shipping a CMS. `revalidatePath` / `revalidateTag` after admin save keeps pages fresh. Metadata API, `sitemap.ts`, JSON-LD are first-class. Cursor and a second JS/TS developer can work without a new language.

**Cost:** Hobby/Pro Vercel + Neon free/launch tier is enough. No WordPress hosting tax.

**Risk:** Next.js moves fast; pin the version and do not adopt experimental APIs without a changelog note.

### Option 2 — Astro (static) + a tiny API

- **Frontend:** Astro, mostly `.astro` pages, island for the booking widget.
- **Data:** Cloudflare D1 or Neon, Hono worker for `GET/PATCH /pricing` and admin.

**Fit:** Excellent default HTML/CSS performance and a smaller JS diet. SEO is strong.

**Cost:** Cloudflare is cheap.

**Why not first:** Two runtimes (static site + worker), two dashboards, and auth on a Worker is more glue. A second developer must learn Astro islands _and_ the API project. The booking widget is interactive enough that you still need a serious client island — the “static site” win shrinks.

### Option 3 — WordPress + ACF (rejected for this brief)

Custom post types and a tariff plugin would make prices editable.

**Why not:** The brief forbids a CMS. WordPress is a CMS whether or not you lock the rest of the admin. Plugin/PHP attack surface, slower default pages, and a second developer in Cursor is weaker than a TypeScript repo.

### Decision

**Pick Option 1: Next.js App Router + TypeScript + Tailwind + shadcn/ui + Postgres (Neon) + Drizzle + Auth.js + Vercel.**

Justification against the brief’s criteria:

- **SEO:** SSR/SSG, metadata, sitemap, structured data without a separate prerender pipeline.
- **Load speed:** Server-rendered booking numbers; images via `next/image`; shadcn does not require a heavy runtime kit. Keep JS to the widget, not the whole page.
- **Simple dynamic pricing only:** One `GET` and one authenticated `PATCH`. No headless CMS.
- **Secure admin auth:** Session cookies, no public signup, `robots.txt` + `noindex` on `/admin`. Three enforcement layers: edge middleware (JWT verify), server component `auth()` check, PATCH route `auth()` check. In-memory rate limit + constant-time bcrypt. JWT sessions because Auth.js Credentials cannot use the DB adapter — documented in CHANGELOG.
- **Low operating cost:** Two managed services, both with free/low tiers.
- **Cursor / second developer:** One language, App Router conventions, docs in `/docs`. shadcn is the primitive library (Button, Input, Dialog, Form, Table, Calendar) — do not add a second component kit.

Do not add Prisma _and_ Drizzle, Redux, a hotel booking SaaS, or a visual page builder.

---

## C. Full architecture

### Context diagram

```
Guest (mobile/desktop)
    │
    ▼
Next.js (Vercel)  ── static pages, images, JSON-LD
    │
    ├── Server Components ── SELECT occupancy_prices
    ├── Booking widget (client) ── GET /api/pricing  ── live estimate
    └── WhatsApp / tel: links (no booking write to our DB)
            │
Owner ──► /admin (noindex)
            │  Auth.js credentials + DB session
            ▼
         PATCH /api/admin/pricing
            │
            ▼
         Postgres (Neon)
            └── price_audit_log
```

Guests never create records. A WhatsApp click is the “booking”. That is intentional: the owner already works on +91 99862 22892; we do not build a second inbox.

### Frontend

- **App Router** under `src/app/`.
- **Route groups:** `(public)` for marketing pages; `(admin)` for `/admin`.
- **Booking widget:** client component. Inputs: name (optional), occupancy dropdown for each room type (published tiers 2/3/4/6/8), quantity stepper, extra beds, check-in and check-out date pickers (check-out after check-in), phone (optional). Output: nights × (quantity × occupancy rate + extra beds × extra-bed rate), summed across lines. Rates come from `GET /api/pricing` only. Copy: “\*Estimate only, subject to availability.”
- **Primary CTA:** one prominent button, label **Check Availability on WhatsApp**, `https://wa.me/919986222892?text=...` prefilled with the enquiry (room, occupancy, dates, estimate, name/phone if given).
- **Secondary CTA:** **Call us** → `tel:+919986222892`.
- **Add another room type:** extra enquiry lines so a second type can be added later without a rewrite. v1 catalog is still one Deluxe AC Room. Quantity is an enquiry count, not live remaining rooms (unit count still unknown).
- Prices displayed on the room page and in the widget come from the same fetch, never from a constant in the component file.

Inspiration from `dandeliinn.com` (concept only): room/guest control, date range, live estimated total, single WhatsApp availability CTA. Do not copy layout, palette, lodge features, or Dandeli sightseeing.

### Backend / API

Keep the API surface small.

| Method  | Path                 | Auth          | Purpose                                                                                |
| ------- | -------------------- | ------------- | -------------------------------------------------------------------------------------- |
| `GET`   | `/api/pricing`       | public        | Current room, occupancy rates, extra-bed rate, currency, `updatedAt`                   |
| `GET`   | `/api/reviews`       | public        | Google Place reviews (server-fetched; key never exposed). Empty/503 if unset or fail   |
| `PATCH` | `/api/admin/pricing` | admin session | Replace occupancy rates + extra-bed rate; write audit rows; `revalidateTag('pricing')` |
| `POST`  | `/api/auth/*`        | Auth.js       | Login / logout                                                                         |

No `POST /api/bookings`. Optional later: a server log of WhatsApp clicks (date, occupancy) — not required for v1.

Validate with Zod: occupancy keys must be exactly `{2,3,4,6,8}`; rates positive integers (paise or whole INR — **use integer INR rupees**, not floats); extra-bed ≥ 0.

### Database

Postgres. Schema in `DATABASE.md`. One `rooms` row for Deluxe AC. Child `occupancy_prices`. `admin_users`. `price_audit_log`.

No tables for pages, media, menus, guests, or invoices.

### Auth (implemented)

- **One owner account**, created by seed or CLI, not a register form.
- **Auth.js Credentials** + bcrypt password hash. Constant-time compare even for missing emails.
- **JWT sessions** in httpOnly, SameSite=Lax cookie; **Secure** when `AUTH_URL` is https or `VERCEL_ENV=production`. DB sessions require the adapter which does not work with Credentials — documented in CHANGELOG.
- **Rate limit:** 5 failed attempts per email in 15 min (in-process Map; bcrypt cost is the primary defense in serverless).
- 2FA optional v1; HTTPS mandatory (Vercel default).
- **Preview:** `/admin` and `/api/admin/*` are disabled when `VERCEL_ENV=preview` (override only with `ALLOW_ADMIN_ON_PREVIEW=true` and a non-production database). Production rejects the local-dev password and the CI `AUTH_SECRET` placeholder.
- Env: `AUTH_SECRET`, `AUTH_URL` (production https origin), `DATABASE_URL`, `ADMIN_EMAIL` / `ADMIN_PASSWORD` (seed only), `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID`, `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY`. Never `NEXT_PUBLIC_` for prices or the Places **server** key.

Forgot-password: v1 — SSH/dashboard reset hash. Do not build email recovery without a transactional mailer.

### Admin (implemented)

URL: `/admin` and `/admin/login`.

Screens:

1. **Login** — email + password, design-system `Label`/`Alert`, generic error, rate-limited.
2. **Dashboard** — one card, "Deluxe AC Room", inline inputs for each tier + extra bed; Published badge, last-saved IST timestamp; Save Changes (disabled until dirty); Sign out. Prices loaded server-side (bypasses `is_published`).
3. **Save** — `PATCH /api/admin/pricing` → Zod → DB transaction → `revalidateTag("pricing", "max")`. Success: "Live on the public site."

No WYSIWYG, no image upload, no "pages".

### Caching

- Tag public pricing reads with `pricing`.
- After PATCH, `revalidateTag('pricing')` so Home and Room update without a rebuild.
- Do not ISR-cache prices for hours; a homestay owner expects the new rate on the next refresh.
- Google Place reviews (`getGoogleReviews`) are tagged `google-reviews` and revalidated every **24 hours** to limit Places API cost. Home RSC and `GET /api/reviews` share that cache. The API key stays in `GOOGLE_PLACES_API_KEY` (server-only).

### Google Places reviews (homepage)

- **API:** Places API (New) Place Details — `GET https://places.googleapis.com/v1/places/{GOOGLE_PLACE_ID}` with `X-Goog-FieldMask: reviews` only.
- **Env:** `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID` (see `.env.example`). Never `NEXT_PUBLIC_*` for the key.
- **Display:** author name (and profile link/photo when Google returns them), star rating as returned, review text as returned, `relativePublishTimeDescription`, link to the review on Google Maps when `googleMapsUri` is present. Cap is **5** reviews; fewer is fine. Section omitted if unset/failed/empty.
- **Attribution:** “Powered by Google” near the list; ordering notice (relevance) in section copy. Do **not** invent `AggregateRating` / `Review` JSON-LD from this feed unless product policy changes.
- **UI:** `ReviewsSection` on Home only (`src/components/sections/reviews-section.tsx`).

### Google Maps Embed (location map)

- **API:** Maps Embed API iframe — `https://www.google.com/maps/embed/v1/place?key=…&q=place_id:{GOOGLE_PLACE_ID}` (mode=place). No JavaScript Maps SDK.
- **Env:** `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` (public by design). Restrict HTTP referrers in Cloud Console. Prefer a separate key from the Places server key.
- **UI:** `MapSection` on Home and `/location` — 16:9, `loading="lazy"`. If the embed key is missing, show a Google Maps place link fallback (no dashed placeholder).
- **Static NAP / geo:** street address + lat/lng live in `src/lib/business.ts` / `docs/BUSINESS_INFO.md` and feed footer + `lodgingBusinessJsonLd` (`PostalAddress` + `GeoCoordinates`).

### Deployment

Operational runbook (env vars, DNS, Neon strings, second-developer redeploy): **`DEPLOYMENT.md`**.

| Piece   | Where                                                                                                                                                      |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App     | Vercel **Hobby**, git-connected. Functions region **`sin1`** (`vercel.json`) — next to Neon, not the US default `iad1`                                     |
| DB      | Neon **Free**, region **`aws-ap-southeast-1` (Singapore)**. Neon does not offer Mumbai (`aws-ap-south-1`) as of this writing. Pooled URI in `DATABASE_URL` |
| Domain  | `www.silversandhomestay.com` (canonical) + apex 308 → `www` on Vercel; TLS is Vercel default                                                                          |
| Backups | Neon point-in-time (Free window is short); do not store prices only in Vercel’s ephemeral FS                                                               |
| Env     | Vercel project settings, never committed. Names and Production vs Preview split: `.env.example` + `DEPLOYMENT.md`                                          |

Preview deployments: admin is **disabled** when `VERCEL_ENV=preview` (middleware + `authorize()` + PATCH). Use a separate Neon branch if you must test admin on Preview (`ALLOW_ADMIN_ON_PREVIEW=true`). Production Vercel env: set `AUTH_SECRET` (≥32 chars), `AUTH_URL=https://www.silversandhomestay.com`, `DATABASE_URL` (production Neon pooled), and seed `ADMIN_EMAIL` / `ADMIN_PASSWORD` that are not the local-dev placeholders.

### Observability (minimal)

- Vercel logs for 5xx and auth failures.
- Do not install a full APM in v1.

### What we explicitly do not architect

Channel manager, Stripe/Razorpay checkout, guest CRM, multi-language CMS, AI chat, Google Hotel Center feed. Direct WhatsApp is the product.

---

## D. Sitemap

No thin doorway pages. A URL earns its keep with distinct intent and facts we actually have.

### Must-have (v1)

| URL                     | Intent                                                    | Notes                                                                                  |
| ----------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `/`                     | “Homestay in Murudeshwar” — choose this stay, start dates | Hero, proof we can legally show, booking widget, WhatsApp + call, honest location line |
| `/rooms/deluxe-ac-room` | Evaluate the one room                                     | Layout, occupancy pricing (from DB), extra bed, photos, widget                         |
| `/contact`              | Call / WhatsApp / later map                               | NAP once address exists                                                                |
| `/privacy`              | Trust / WhatsApp prefill                                  | Short, real                                                                            |
| `/terms`                | House rules we actually have                              | Do not paste a hotel TOS template                                                      |

`/rooms` is a listing page (one type). `/rooms/deluxe-ac` 301s to `/rooms/deluxe-ac-room`.

### Recommended (v1.1, after facts exist)

| URL            | Intent                                         | Distinct from Home?                                        |
| -------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| `/about`       | Who hosts, what “homestay” means here          | Yes — people and house, not rates                          |
| `/murudeshwar` | Plan the trip, how to reach **this** pin       | Yes — transport + local orientation. Not a Wikipedia dump. |
| `/faq`         | Objections: parking, food, check-in, extra bed | Only Qs we can answer                                      |

### Future SEO / content (only with unique substance)

| URL                                | Opportunity                                                                    | Guardrail                                                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `/rooms-in-murudeshwar`            | User SERP for **“rooms in murudeshwar”** showed OTAs, not local homestay sites | Write as _our_ rooms in Murudeshwar + how occupancy pricing works + when to pick 4 vs 6 vs 8. Do **not** scrape a city-wide hotel list.      |
| `/homestay-near-murudeshwar-beach` | Matches a stated target keyword                                                | **Blocked** until beach distance is known. Then it must add beach-specific practicality (sand, parking, walk vs auto), not a duplicate Home. |
| `/family-homestay-murudeshwar`     | 6/8 occupancy is a real differentiator if the room actually sleeps that many   | Blocked until layout is confirmed.                                                                                                           |
| `/how-to-reach-murudeshwar`        | Can merge with `/murudeshwar` if thin                                          | Do not split until there is enough unique text.                                                                                              |

**Do not create:** `/affordable-homestay-in-murudeshwar`, `/best-homestay-in-murudeshwar`, `/homestay-in-murdeshwar` (spelling variant) as separate pages. Those are title/H1/FAQ jobs on existing URLs, plus `hreflang` is irrelevant (one language). Spelling variants belong in body copy and GBP, not extra routes.

### Out of sitemap

- `/admin`, `/admin/*` — `noindex`, omit from `sitemap.ts`
- `/style-guide` — internal design reference, `noindex`
- API routes

### Internal linking (minimum)

See `SEO_STRATEGY.md` for the full map. Architecture rule: every public page can reach the booking widget or `/rooms/deluxe-ac-room` in one click; footer NAP + WhatsApp on all public pages.

---

## Admin pricing flow (index)

Owner → Login → Dashboard → Edit price → DB → public site.

Detailed sequence, validation, audit, and failure modes: **`DATABASE.md`**.

Implementation rule: the public widget may cache in memory for a few seconds; it must not ship a fallback constant like `const RATE_2 = 2000`.
