/**
 * Static marketing copy — confirmed facts or general Murudeshwar context only.
 * Do not invent property-specific amenities, distances, or reviews.
 */

/**
 * Well-known destination facts about Murudeshwar.
 * These describe the town, not Silver Sand's proximity to anything.
 */
export const murudeshwarContext = {
  intro:
    "Murudeshwar is a coastal town in Uttara Kannada, Karnataka, set on a small peninsula that juts into the Arabian Sea. Most visitors come for the Murudeshwar Temple, the Shiva statue visible from the highway, and the beach that wraps around the promontory.",
  beach:
    "Murudeshwar Beach runs along the eastern and southern edges of the peninsula. It is a working fishing beach as well as a spot for sunrise walks.",
  temple:
    "The Murudeshwar Temple sits on Kanduka Hill, overlooking the sea. The gopura is one of the tallest temple towers in the world and serves as a landmark visible from most parts of town. Pilgrims visit year-round; the beach and temple are within a short distance of each other in the town centre.",
};

/**
 * Attractions visitors commonly pair with a Murudeshwar stay.
 * Notes describe each place, not invented distances from the homestay.
 * The one confirmed landmark is 1 km from Murudeshwar bus stand.
 * Photographs live in `src/lib/attractions/images.ts`.
 */
export const nearbyAttractions = [
  {
    name: "Murudeshwar Temple & Shiva statue",
    note: "The temple complex on Kanduka Hill includes one of the world's tallest Shiva statues. A five-minute walk from the beach.",
  },
  {
    name: "Murudeshwar Beach",
    note: "The beach wraps around the base of the hill. A working fishing beach as well as a spot for sunrise walks.",
  },
  {
    name: "Netrani Island",
    note: "About 19 km offshore, Netrani is one of the best scuba and snorkelling spots on the Karnataka coast. Day trips run from Murdeshwar jetty.",
  },
  {
    name: "Idagunji Ganapati Temple",
    note: "A significant Ganesha shrine about 30 km south of Murudeshwar in Idagunji.",
  },
  {
    name: "Yana rock formations",
    note: "Unusual black crystalline rock formations in the Sahyadri foothills, roughly 50–60 km inland.",
  },
  {
    name: "Murdeshwar jetty & local fish market",
    note: "The fishing jetty near the beach is active in the early morning. A great place to watch the boats return and the catch come in.",
  },
] as const;

export type NearbyAttractionName = (typeof nearbyAttractions)[number]["name"];
