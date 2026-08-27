import type { Metadata } from "next";

import { ContactCta } from "@/components/marketing/contact-cta";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { AboutSection } from "@/components/sections/about-section";
import { InnerPageHero } from "@/components/sections/inner-page-hero";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { Stack } from "@/components/layout/stack";
import { BUSINESS_NAME } from "@/lib/business";
import { PAGE_SEO } from "@/lib/seo/copy";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata(PAGE_SEO.about);

export default function AboutPage() {
  return (
    <>
      <InnerPageHero
        title={`About ${BUSINESS_NAME}`}
        description="A family-run homestay in Murudeshwar. Book directly on WhatsApp with the host."
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/about", label: "About" },
        ]}
      />
      <AboutSection />
      <Section>
        <Container>
          <Stack gap="md" className="max-w-3xl">
            <ContactCta />
          </Stack>
        </Container>
      </Section>
      <FinalCtaSection />
    </>
  );
}
