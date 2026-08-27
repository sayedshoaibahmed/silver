import type { Metadata } from "next";

import { ContactCta } from "@/components/marketing/contact-cta";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { InnerPageHero } from "@/components/sections/inner-page-hero";
import { MapSection } from "@/components/sections/map-section";
import { MurudeshwarInfoSection } from "@/components/sections/murudeshwar-info-section";
import { NearbyAttractionsSection } from "@/components/sections/nearby-attractions-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { BUSINESS_NAME, FULL_ADDRESS, LANDMARK_BUS_STAND } from "@/lib/business";
import { PAGE_SEO } from "@/lib/seo/copy";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata(PAGE_SEO.location);

export default function LocationPage() {
  return (
    <>
      <InnerPageHero
        title="Getting to Murudeshwar"
        description={`${BUSINESS_NAME} is at ${FULL_ADDRESS} — ${LANDMARK_BUS_STAND}. Murdeshwar Railway Station is on the Konkan Railway.`}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/location", label: "Location" },
        ]}
      />
      <MapSection showLocationLink={false} />
      <MurudeshwarInfoSection />
      <NearbyAttractionsSection />
      <Section>
        <Container>
          <ContactCta whatsappLabel="Ask for directions on WhatsApp" />
        </Container>
      </Section>
      <FinalCtaSection />
    </>
  );
}
