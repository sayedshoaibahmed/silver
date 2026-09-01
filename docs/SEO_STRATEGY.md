# SEO strategy

Primary topic: **homestay in Murudeshwar**. SEO is a day-one constraint, not a plugin to add after launch.

This file folds in:

- **E.** Topics, intent, local SEO, technical checklist, schema, internal links, Google Business Profile
- **F.** Competitor analysis using the named frameworks against the named competitors, from pages observed **24 August 2026**

**What this file does not contain:** keyword volumes, difficulty scores, backlink counts, traffic mix, or ranking positions. Those were not in the brief. They are a later **Ahrefs / Semrush / Google Search Console** pass. Reasoning below is from (1) the user’s SERP competitor list, (2) what those sites actually put on the page, (3) standard local-SEO practice.

**Research note:** No separate attachment files were in the repo. Frameworks applied: category/positioning claims; pricing transparency (public / partial / hidden); CTA hierarchy; content depth on homestay/room URLs; comparison/alternative pages; on-page quality (title/H1, uniqueness, thin/lorem, E-E-A-T, photos/policies); “adopt / don’t copy / differentiate.”

---

## What's live (25 August 2026)

Implemented in the Next.js app. Canonical room URL is **`/rooms/deluxe-ac-room`** (`/rooms/deluxe-ac` 301s there). Do not invent ratings, street address, geo, breakfast, or amenities in schema when they are still missing.

| Item                                | Live?                 | Notes                                                                                                                                                                                                                                        |
| ----------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unique `<title>` + meta description | Yes                   | Copy in `src/lib/seo/copy.ts`. Home uses an absolute title so the brand is not doubled.                                                                                                                                                      |
| Canonical URLs                      | Yes                   | Self-canonicals via `pageMetadata()`. `SITE_URL` / `metadataBase` resolve to apex `https://silversandhomestay.com` on Production and whenever `NEXT_PUBLIC_SITE_URL` is missing or `*.vercel.app` (trailing slash stripped). Localhost overrides allowed. **www vs apex redirect is DNS**, not this repo. |
| Open Graph + Twitter                | Yes                   | Per-page `og:title` / `og:description` / `og:url` / `og:locale=en_IN`. Twitter `summary_large_image`. Image is a **branded wordmark card** (`src/app/opengraph-image.tsx`), not a fake villa photo. Swap for an owner photo when one exists. |
| XML sitemap                         | Yes                   | `src/app/sitemap.ts` — `/`, `/rooms`, `/rooms/deluxe-ac-room`, `/gallery`, `/about`, `/location`, `/contact`, `/privacy`, `/terms`. Omits `/admin`, `/api/*`, `/style-guide`. Production `<loc>` hosts are always the apex.                                                                |
| `robots.txt`                        | Yes                   | `src/app/robots.ts` — allow `/`; disallow `/admin`, `/api/`, `/style-guide`; `Sitemap: https://silversandhomestay.com/sitemap.xml` on Production.                                                                                                                                        |
| `noindex`                           | Yes                   | Admin layout + dashboard; `/style-guide`; 404 (`index: false`, `follow: true`).                                                                                                                                                              |
| `lang="en-IN"`                      | Yes                   | Root `<html>`.                                                                                                                                                                                                                               |
| Image alt text                      | Yes                   | Every `PhotoFrame` requires `alt` (empty frames use `role="img"` + `aria-label`). No property `<img>` yet.                                                                                                                                   |
| One H1 per public page              | Yes                   | Home: “Homestay in Murudeshwar”. Room: “Deluxe AC Room”. Inner pages: `PageHeader` H1. `CardTitle` defaults to **h3**; booking widget title is **h2** (“Book your stay”). `/style-guide` has extra specimen H1s and is `noindex`.            |
| Breadcrumbs                         | Yes                   | Visible trail + `BreadcrumbList` JSON-LD on inner public pages (not Home).                                                                                                                                                                   |
| JSON-LD (known fields only)         | Yes                   | See schema table below for what is **emitted vs withheld**.                                                                                                                                                                                  |
| Crawlable `tel:` / `wa.me`          | Yes                   | Header, footer, `ContactCta`, booking widget — real `<a href>`, not click-only JS.                                                                                                                                                           |
| 404                                 | Yes                   | `src/app/not-found.tsx` — H1, Home, WhatsApp, Call.                                                                                                                                                                                          |
| Keyword meta                        | Not used              | No `keywords` stuffing.                                                                                                                                                                                                                      |
| HTTPS / Core Web Vitals photos      | Deploy / owner photos | HTTPS is the host. No third-party hotel chat widgets. Compress real photos when they land.                                                                                                                                                   |
| Hindi / Kannada                     | Not v1                |                                                                                                                                                                                                                                              |

### JSON-LD actually emitted

| Type                              | Where                                                                           | Fields we output                                                                                                                                                                                   | Withheld on purpose                                              |
| --------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `WebSite`                         | Public layout                                                                   | `name`, `url`, `inLanguage`                                                                                                                                                                        | `SearchAction` (no on-site search)                               |
| `LodgingBusiness`                 | Public layout                                                                   | `name`, `url`, `telephone`, `currenciesAccepted`, `areaServed` (City: Murudeshwar), full `PostalAddress` (street, locality, region, PIN, country), `GeoCoordinates`, `containsPlace` → `HotelRoom` | `image`, `AggregateRating`, `Review`, `BedAndBreakfast`, `Hotel` |
| `HotelRoom`                       | Nested on the business                                                          | `name`, `url`, `occupancy` min 2 / max 8, bathroom `amenityFeature`                                                                                                                                | Bed count, photos, other amenities                               |
| `Offer`                           | On the room, **only if** `getPublicPricing()` returns published occupancy rates | `price`, `priceCurrency` (INR), `unitText: NIGHT`, `priceSpecification.valueAddedTaxIncluded` (GST included) per occupancy + extra bed when `extraBedRateInr > 0`                                  | Entire `Offer` graph while the room is unpublished               |
| `priceRange` on `LodgingBusiness` | Same gate as `Offer`                                                            | Min–max of published occupancy nightly rates                                                                                                                                                       | While unpublished                                                |
| `FAQPage`                         | Home                                                                            | Answered Qs only: how to book, room types, GST included, bathroom, ID, bus-stand distance, extra bed **only when rates are published**                                                             | Unanswered owner questions (omitted, not `TodoNotice`)           |
| `BreadcrumbList`                  | Inner pages                                                                     | Home → … → current URL                                                                                                                                                                             | Duplicate “Home / Home”                                          |

Builders: `src/lib/seo/json-ld.ts`. Guardrail test: `src/lib/seo/json-ld.test.ts`.

---

## E. Strategy

### Primary topic

**Homestay in Murudeshwar** (and the obvious close spellings Murdeshwar / Murudeshwara in _body_ copy, not as extra URLs).

Search intent: a traveller (often family or small group) wants a **non-hotel stay** near the temple/beach, compares cleanliness, location, and price, then messages or calls. Google also shows **OTAs and Google Travel** for the same queries — those are distribution competitors, not homestay peers.

### Realistic secondary topics

Only topics we can support with **one Deluxe AC Room** and **owner-confirmed facts**.

| Topic                                    | Intent                                 | Where it lives                                   | Guardrail                                                                                                         |
| ---------------------------------------- | -------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Rooms in Murudeshwar                     | Find a bookable room without an OTA    | Future `/rooms-in-murudeshwar` + room page       | User SERP: **no direct homestay sites**, only big OTAs — real gap. Page must be _our_ room, not a fake directory. |
| Homestay near Murudeshwar beach          | Proximity                              | Home + possible dedicated URL                    | **Blocked** until distance is known. Name alone is not evidence.                                                  |
| Affordable homestay in Murudeshwar       | Budget / value                         | Home + widget transparency                       | Do not claim “affordable” until occupancy rates exist and we can say for whom (2 vs 8).                           |
| Best homestay in Murudeshwar             | Superlative / roundup                  | Do **not** make a “best of” page about ourselves | Earn it via GBP + reviews; `murudeshwar.co.in` already owns a roundup URL.                                        |
| Family / group occupancy (6–8 sharing)   | Groups who do not want two hotel rooms | Room page                                        | Blocked on bed layout.                                                                                            |
| How to reach Murudeshwar (from this pin) | Planning                               | `/murudeshwar`                                   | Useful only with a real address.                                                                                  |
| Temple stay / darshan base               | Pilgrim                                | Home section + FAQ                               | Do not pretend to be a yatri nivas (that is Kamath’s hotel brand).                                                |

Not realistic as our topics unless the owner actually offers them: scuba packages, vehicle rental, multi-destination Western Ghats inventory (`sahyadristays.com`), hillside villa + EV charging (Coastal Pearl).

### Search intent per must-have URL

| URL                     | Query families                                    | Intent            | Success                                      |
| ----------------------- | ------------------------------------------------- | ----------------- | -------------------------------------------- |
| `/`                     | homestay in Murudeshwar; homestay Murdeshwar      | Choose a stay     | Widget used; WhatsApp click                  |
| `/rooms/deluxe-ac-room` | deluxe AC room Murudeshwar; occupancy / extra bed | Evaluate the room | Understand 2/3/4/6/8 + extra bed ₹ (from DB) |
| `/contact`              | Silver Sand Beach Homestay number / WhatsApp      | Contact           | Call or WhatsApp                             |
| `/privacy` `/terms`     | (few searches)                                    | Trust             | Compliance                                   |

Recommended URLs: see `ARCHITECTURE.md` sitemap. Title tags should match intent, one H1 per page, no four URLs targeting “best homestay”.

### Local SEO plan

1. **NAP consistency** — Name, Address, Phone identical on the site, WhatsApp Business about, GBP, and any directory we still allow. Phone is known; address is not.
2. **Google Business Profile** — this will do more for “homestay in Murudeshwar” than a tenth blog post. See GBP section below.
3. **Categories** — Primary: Homestay (or Bed & breakfast / Lodge only if GBP forces a match — prefer Homestay). Do not set Hotel if we are positioning against hotels.
4. **Geo** — `LodgingBusiness` + `GeoCoordinates` only after a pin.
5. **Reviews** — Ask real guests to review on **Google**, not a testimonial slider of invented names. Link to GBP from the site.
6. **Inbound mentions** — `murudeshwar.co.in` already publishes “Homestay in Murudeshwar: 8 Best Family Stays”. Silver Sand is **not** in that table (observed 24 Aug 2026). Outreach to be listed is a local-SEO task; building a clone roundup of competitors is not.
7. **OTAs** — They win “rooms in Murudeshwar”. We do not beat Booking.com on that query with a thin page. We beat them by ranking a **useful independent page** and by GBP. Keep OTA listings accurate so Google Travel does not show a conflicting address — then push “book on WhatsApp for this week’s occupancy rate”.

Unknown until GSC/Ahrefs: whether we have any existing queries, crawl errors, or brand searches.

### Technical SEO checklist (v1)

- [x] Unique `<title>` and meta description per URL — `src/lib/seo/copy.ts`
- [x] One H1; H2s for widget (“Book your stay”), location, FAQ
- [x] Canonical self-references; `www` vs apex decided at DNS (pick one, redirect the other) — code assumes **apex** `silversandhomestay.com`
- [x] `sitemap.ts` — public URLs only
- [x] `robots.txt` — allow public; disallow `/admin`; sitemap URL
- [x] `noindex` on admin and `/style-guide`
- [x] Open Graph + Twitter card; wordmark OG image until we have a real photo
- [x] `lang="en-IN"`
- [x] JSON-LD (types below) with **only known** fields
- [ ] Core Web Vitals: image compression, no hotel-chat third parties in v1 — no third-party chat; compress when owner photos land
- [x] `tel:` and `https://wa.me/919986222892` crawlable links (not click-only JS)
- [x] 404 page with path back to Home / WhatsApp
- [ ] HTTPS — host/DNS (not this repo)
- [x] No `keyword` meta stuffing
- [x] Hindi/Kannada: not v1 unless the owner writes it (machine-translated pages are thin)

### Schema types that actually fit a homestay

Use [schema.org](https://schema.org) types that match a **single lodging house**, not a hotel chain.

| Type                                                | Use?                                            | How                                                                                                                                                                  |
| --------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LodgingBusiness`                                   | Yes                                             | Main entity. **Live:** `name`, `telephone`, `url`, locality-only `PostalAddress` (Murudeshwar / Karnataka / IN). `address` street + `geo` + `image` only when known. |
| `BedAndBreakfast`                                   | Optional instead of or as `additionalType`      | Only if breakfast is actually offered. **Unknown — do not use until meals are confirmed.**                                                                           |
| `Accommodation` (or `HotelRoom` as the room’s type) | Yes                                             | The Deluxe AC Room: `occupancy`, `name`. `HotelRoom` is the schema.org room type; it does **not** make the business a Hotel.                                         |
| `Offer`                                             | Yes                                             | Each occupancy rate from the **database** (`price`, `priceCurrency: INR`, `unitText` night). Update when admin saves.                                                |
| `GeoCoordinates` / `PostalAddress`                  | Yes, when known                                 | Never placeholder pins.                                                                                                                                              |
| `FAQPage`                                           | Yes, if `/faq` or Home FAQ is real Q&A          |                                                                                                                                                                      |
| `BreadcrumbList`                                    | Yes                                             | Home → Room                                                                                                                                                          |
| `WebSite`                                           | Yes                                             | `name` + `url`. Skip `SearchAction` (no on-site search).                                                                                                             |
| `AggregateRating` / `Review`                        | Only with genuine, attributable reviews         | **No fake 4.9 stars.** Prefer linking GBP.                                                                                                                           |
| `Hotel`                                             | **No**                                          | Wrong category; fights our “homestay” SERP.                                                                                                                          |
| `VacationRental`                                    | No unless the whole house is let as one product | Brief is a room type with sharing occupancies.                                                                                                                       |
| `TouristTrip` / scuba `Product`                     | No unless we sell those                         | Leave to `murudeshwar.co.in`.                                                                                                                                        |

`priceRange` on `LodgingBusiness`: set only after occupancy rates exist (e.g. `₹X–₹Y` from min/max occupancy).

### Internal linking map

```
/  --primary-->  /rooms/deluxe-ac-room  --widget-->  wa.me
|                    |
+-- /contact         +-- /contact
+-- /location
+-- /about
+-- /gallery
+-- /murudeshwar (later)
+-- /faq (later — Home FAQ is live)
+-- /rooms-in-murudeshwar (later) --back--> /rooms/deluxe-ac-room

Footer on all public pages: Home, Rooms, Gallery, About, Location, Contact, WhatsApp, Call, Privacy, Terms
```

Rules:

- The phrase “Deluxe AC Room” on Home links to `/rooms/deluxe-ac-room`.
- “Homestay in Murudeshwar” does not spawn a second Home.
- Future beach page links to Home + Room + map, not to a cluster of synonyms.
- Admin never linked from the public footer.

### Google Business Profile plan

**Unknown:** whether a GBP already exists for this name (OTA mirrors suggest Google may already store a place). Owner must search Google for the exact trading name and claim it.

When claimed or created:

| Field              | Plan                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| Name               | Silver Sand Beach Homestay (match the site `<title>` brand)                                      |
| Category           | Homestay (primary). Secondary only if true (Lodging, Guest house).                               |
| Phone              | +91 99862 22892                                                                                  |
| Website            | https://silversandhomestay.com                                                                   |
| Appointment / chat | WhatsApp to the same number                                                                      |
| Address + pin      | Owner-confirmed only                                                                             |
| Hours              | Check-in window once known; do not copy Amani’s 6am–10pm from another property                   |
| Photos             | Same real set as the site                                                                        |
| Products / rooms   | Deluxe AC Room; occupancy note in description                                                    |
| Description        | Homestay in Murudeshwar, Deluxe AC, occupancy pricing, book on WhatsApp — no “best in Karnataka” |
| Q&A                | Seed real answers (parking, extra bed ₹500/person once confirmed per night)                      |
| Reviews            | Reply as the host; never buy reviews                                                             |
| Google Travel      | Will pull from GBP + OTAs. Accurate NAP reduces duplicate listings                               |

GBP work is **not** in the Next.js repo but it is in the SEO job. Track it in `TASKS.md` Phase 3.

---

## F. Competitor analysis

Observed 24 August 2026. No ranking numbers.

### How to read the user’s SERP set

| User’s named player                                | What they actually are (observable)                                                                                                                             |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kamath Home Stay — kamathhomestay.com              | Local homestay site; also funnels to **Kamath Yatri Nivas** (hotel/lodge)                                                                                       |
| Coastal Pearl Home Stay — coastalpearlhomestay.com | Local homestay; hillside Mavalli; OTA-heavy proof                                                                                                               |
| Amani Home Stay — amanibeachhomestay.com           | `.com` **failed** (timeout / HTTP 500). Live site: **amanibeachhomestay.in** (Yanolja/eZee-style hotel template). Naveen Beach Road.                            |
| Sahyadri Beach Front Homestay / sahyadristays.com  | **Two businesses.** `sahyadristays.com` = Western Ghats stay marketplace. Murudeshwar beachfront homestay = **Nestle Sahyadri**, site `beachstaymurudeshwar.in` |
| Agora.com / Google Travel                          | User note. Observable aggregator on these properties: **Agoda**, plus Google Travel / Hotels. Agora.com not independently confirmed.                            |
| murudeshwar.co.in                                  | Local agency + directory + **blog roundup** of homestays                                                                                                        |
| MakeMyTrip, Goibibo, EaseMyTrip, Booking.com       | OTAs; dominate “rooms in Murudeshwar” per user                                                                                                                  |

### Direct competitors — scorecard

#### Kamath Home Stay — kamathhomestay.com

| Lens                      | Observation                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Category claim            | Title: “Best Home stay in Murdeshwara”. Hero: “A LUXURY EXPERIENCE”. Body: “unique country house” in a “serene temple place”, **beyond** the beach belt, beach is a **3-minute complimentary drive**. Also promotes **Kamath Yatri Nivas** as a hotel (Wi-Fi, travel desk, 24h room service). Mixed homestay vs hotel brand. |
| Pricing transparency      | **Hidden** on the homepage. No occupancy table. Third-party pages for _Yatri Nivas_ show starting rates; that is a different product.                                                                                                                                                                                        |
| CTA hierarchy             | Phone **+91-9739934770** (“planning a Trip to Beach side Call”); WhatsApp control present; Yatri Nivas “Book Now” to another site. No date-range estimate widget.                                                                                                                                                            |
| Content depth (home/room) | Thin. Kitchen / Get-together / 4 Bed Rooms as labels. Empty-looking stat counters (years, employees, visitors). Duplicate breadcrumb “Home / Home”. Reviews on-page appear to praise **Yatri Nivas**, which blurs proof.                                                                                                     |
| Comparison pages          | None observed.                                                                                                                                                                                                                                                                                                               |
| On-page quality           | Keyword in title (“Best Home stay”). Weak E-E-A-T (unnamed host, mixed properties). Spelling “costumers”. Not a technical disaster, but not a content competitor.                                                                                                                                                            |

#### Coastal Pearl Homestay — coastalpearlhomestay.com

| Lens                 | Observation                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Category claim       | “Best Luxury Homestays In Uttara Kannada”, “Registered & Approved Homestay in murudeshwar”, hillside open views (sunrise/sunset, hills), **near** temple and Idagunji — not “on the beach”. Rooms: Deluxe, Suite (living + sit-out), 2BHK villa / family block.                                                                                                                                       |
| Pricing transparency | **Partial.** Homepage has Adults/Children + “Check Now” (no public total in the fetched HTML). **Tariff page exists:** Deluxe from Rs. 2899/-, Premium from Rs. 4199/-, Family Block from Rs. 6499/- (`/tariff.php`). “Starting from” = not occupancy-transparent. `murudeshwar.co.in` quotes **different, lower** ranges (₹1,200–1,800) — third-party, not treated as Coastal Pearl’s official rate. |
| CTA hierarchy        | Inventory-style check widget first; awards (Airbnb Superhost, Booking.com, Tripadvisor, MMT) as proof; places to visit. Phone not as dominant as Kamath in the fetched home HTML.                                                                                                                                                                                                                     |
| Content depth        | Room blurbs + long amenity list (Wi-Fi, parking, EV charging, kitchen, caretakers…). Places to visit with some distances (e.g. Sharavathi 32 km).                                                                                                                                                                                                                                                     |
| Comparison pages     | None on their domain. They **win** comparison by being the **#1 named stay** on murudeshwar.co.in’s roundup.                                                                                                                                                                                                                                                                                          |
| On-page quality      | **Lorem in facilities:** “On no twenty spring of in esteem spirit likely estate.” Typos (Coocking, hote water, Faimly). Reviews read like generic hotel templates (one mentions booking under 21). Stronger **distribution** (OTAs, GBP-class awards) than on-page writing.                                                                                                                           |

#### Amani Beach Homestay — amanibeachhomestay.com / .in

| Lens                 | Observation                                                                                                                                                                                                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Category claim       | `.in` homepage: “best homestay in Murdeshwar”, also **“5 STAR ACCOMMODATION”**, sea/beach views, 2 BHK & 1 BHK, group stays, suites. Address: **Naveen Beach Rd, Murdeshwar, 581350**. Booking.com/MMT list many unit types (deluxe double, family, 12-pax group, dorm-like).                        |
| Pricing transparency | **Hidden** on the official `.in` home (arrival/departure fields, no rupee table). OTAs show prices after dates.                                                                                                                                                                                      |
| CTA hierarchy        | Date picker; “Try Our Luxury Accommodations”; “Book Now”; footer “Why book direct?” (late checkout, pay at check-in, best rate). Phone +91 74069 03665. WhatsApp not the single primary CTA on the fetched home. `.com` was **down** — technical reliability is a real differentiator if we stay up. |
| Content depth        | Template sections; **placeholder literary English** (“A wonderful serenity has taken possession of my entire soul…”). Guest quotes mention beach-opposite location and family of 3. Room-type depth lives on **OTAs**, not the marketing site.                                                       |
| Comparison pages     | None observed.                                                                                                                                                                                                                                                                                       |
| On-page quality      | Hotel-CMS chrome (Yanolja Cloud / eZee). Weak unique content. Stronger **product breadth** (many room types) than Silver Sand will have.                                                                                                                                                             |

#### Nestle Sahyadri BeachFront Homestay — beachstaymurudeshwar.in

_(the Murudeshwar “Sahyadri beach front” competitor; not sahyadristays.com)_

| Lens                 | Observation                                                                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Category claim       | Repeated “best beachfront homestay”, sea-view rooms, shoreline, temple walk, homemade coastal food, Mangalorean-Goan cottages, beach tents. Address on site: House No. 1, Christain Colony, Tuddalli Bailur, Murudeshwar.                              |
| Pricing transparency | **Partial, messy.** “Balcony Sea View Room — Price Starts from 1500 with Dinner and BreakFast”; “Beachfront Sea View Room — Price Starts from 1500 **per person** with Dinner and Breakfast” — unit (room vs person) is inconsistent on the same page. |
| CTA hierarchy        | **Call now** 9945494973 repeated (“Last-Minute Rooms Available Today”). FAQ targets “homestay near me”. Weak WhatsApp-as-estimator compared to Dandeli Inn.                                                                                            |
| Content depth        | Heavy keyword repetition (“homestay near me in Murudeshwar”). Food + beach + temple story is clearer than Kamath. Room pages exist (e.g. stay-near-murudeshwar-temple).                                                                                |
| Comparison pages     | None. They appear as a **featured stay** on murudeshwar.co.in (4.9, 507 reviews — that rating is the _publisher’s_ claim, not verified here).                                                                                                          |
| On-page quality      | Aggressive local-SEO copy; some uniqueness (food, tents). Spelling issues. Not a clean design peer.                                                                                                                                                    |

#### sahyadristays.com (marketplace — do not treat as a homestay peer)

| Lens                  | Observation                                                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Category claim        | “Homestays & Resorts in Sakleshpur, Chikmagalur & Coorg” plus other destinations including Murudeshwara as a **collection**. Ratings, “best price guaranteed”, onwards ₹ prices per listed stay. |
| Pricing / CTA / depth | Inventory, filters, social proof **at platform scale**. Irrelevant to copy for a one-room homestay. Relevant only as: Google may mix marketplace pages into homestay SERPs.                      |
| Response              | Do not imitate a catalogue. Do not use their Murudeshwar listing as our room content.                                                                                                            |

### Aggregators and publishers

| Player                                       | Role on these SERPs                                                                                   | Implication                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google Travel / Hotels                       | Price comparison, maps, OTA deep links                                                                | GBP + consistent name/address; website booking link = our WhatsApp landing, not another OTA                                                                                                                                                                                                                                                         |
| Agoda (likely what “Agora” referred to)      | OTA cards for Coastal Pearl and others                                                                | We will not out-rank Agoda for generic “rooms in Murudeshwar” with a doorway page                                                                                                                                                                                                                                                                   |
| MakeMyTrip, Goibibo, EaseMyTrip, Booking.com | User: they **own** “rooms in Murudeshwar”                                                             | Content gap: an owned page that is clearly a **homestay room you can WhatsApp**, with occupancy math OTAs bury                                                                                                                                                                                                                                      |
| murudeshwar.co.in                            | Local agency; WhatsApp +91 78290 08264; blog “Homestay in Murudeshwar: 8 Best Family Stays from ₹800” | They rank as **content + middleman**. Silver Sand is **not listed** in the eight. They already occupy “rooms in Murudeshwar” style FAQs (“Where can I find rooms in Murudeshwar?”). Competing by cloning their directory would be thin and adversarial; competing with a better **single-property** page and asking to be listed is the honest play |

On-page quality of that roundup (framework): it is the strongest **commercial content** in the set — comparison tables, price bands, family vs beach vs temple. It is also an **agency lead-gen** page (repeated WhatsApp). Some names/prices may be theirs, not the stays’ tariff pages (Coastal Pearl’s own tariff is higher than the roundup band). Do not scrape their table onto silversandhomestay.com.

### What Silver Sand should adopt **conceptually**

From **Dandeli Inn** (reference flow, different town): occupancy/room control, dates, live estimate, **one** WhatsApp availability CTA, estimate disclaimer. FAQ + how-to-reach **once we have a pin**. Google review count **only if real**.

From **Coastal Pearl:** a public tariff _idea_ (we go further: occupancy-exact numbers from admin, not “starting from”). Amenity honesty (list only what we have). Registered/approved **if** the owner has the certificate.

From **Kamath:** clear phone number in the header (we also have WhatsApp as primary). Do **not** mix a second hotel brand on the homestay domain.

From **Nestle Sahyadri:** if we truly have beach proximity, say it in metres; if we have food, say what is cooked. Specificity beats “luxury experience”.

From **Amani:** “Why book direct” bullets can be adapted **if true** (e.g. occupancy rate on WhatsApp, no OTA fee). Keep the site **up** (their `.com` was down).

From **murudeshwar.co.in:** comparison _thinking_ — travellers choose by **beach vs temple vs quiet hillside vs budget**. Our Home should state which of those we are **as soon as the owner tells us**. Until then, do not guess.

### What **not** to copy

- Superlative titles (“Best Home stay”, “5 STAR”, “Best Luxury Homestays In Uttara Kannada”) without proof
- Lorem, Goethe, or agency-template English
- Fake or mis-attributed reviews; empty stat counters
- Award walls we did not earn
- Multi-room catalogues and “add another room type”
- Hardcoded rack rates in PHP/JS (Coastal Pearl tariff) — our rates live in Postgres
- Doorway “near me” FAQ stuffed with the same sentence
- Mixing Yatri Nivas / other properties into this domain
- `sahyadristays.com` marketplace UX
- Claiming beachfront because the trading name contains “Beach” or because an OTA mirror says “few steps”

### Where Silver Sand can genuinely differentiate

1. **Occupancy-transparent direct price** — none of the local homestay sites cleanly publish **2/3/4/6/8 sharing** as a live, owner-updated table plus an estimate. Kamath hides price; Amani hides price; Coastal Pearl uses “starting from”; Nestle mixes per-room and per-person. If the owner actually uses that ladder, it is a product differentiator, not just an SEO trick.

2. **“Rooms in Murudeshwar” gap** — user’s SERP: OTAs only. A substantial `/rooms-in-murudeshwar` (or a Home section that deserves that query) which explains _this_ Deluxe AC Room, extra bed ₹500/person (once unit of time is confirmed), and WhatsApp confirmation, is a legitimate content gap. It must not pretend to list 229 hotels.

3. **Single WhatsApp estimate CTA** — local peers split across Call, Book Now (CMS), OTA, or “Check Now”. A Dandeli-style estimator that is honest (“subject to availability”) fits a one-owner homestay.

4. **One room type, explained well** — competitors dilute copy across villas, dorms, tents, and hotels. Depth on **one** room (beds, who 6-sharing is for) can beat a thin five-type grid — **only after layout facts exist**.

5. **Uptime and non-template English** — Amani `.com` 500; Coastal Pearl lorem; Kamath mixed brands. A fast, specific site is a low bar and still a gap.

6. **Under-served long tails (only if true later):** extra bed policy in plain INR; 6/8 family occupancy; “homestay with AC in Murudeshwar” if many cheap stays are non-AC. **Not** “best homestay” as a URL.

### Unknowns for a later SEO tool pass

- Actual rank of each domain for the five seed queries (date-stamped SERP screenshots belong in a `/docs/research` folder when the owner adds them)
- Domain rating / backlinks of kamathhomestay.com vs coastalpearlhomestay.com vs beachstaymurudeshwar.in vs murudeshwar.co.in
- GSC once our domain is live: branded vs unbranded, CTR of titles
- Whether Google already clusters a GBP for Silver Sand with the OTA address

Until then, do not quote invented “we will rank in 30 days” claims.
