import type { Metadata } from "next";

import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { BookingWidget } from "@/components/booking/booking-widget";
import { FaqSection } from "@/components/sections/faq-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { HeroSection } from "@/components/sections/hero-section";
import { MapSection } from "@/components/sections/map-section";
import { MurudeshwarInfoSection } from "@/components/sections/murudeshwar-info-section";
import { PropertyIntroSection } from "@/components/sections/property-intro-section";
import { RoomPricingSection } from "@/components/sections/room-pricing-section";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublicPricing } from "@/lib/pricing/fetch";
import { getAnsweredFaqs } from "@/lib/seo/faqs";
import { PAGE_SEO } from "@/lib/seo/copy";
import { faqPageJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata(PAGE_SEO.home);

export default async function HomePage() {
  const pricing = await getPublicPricing();
  const faqLd = faqPageJsonLd(getAnsweredFaqs(pricing));

  return (
    <>
      <JsonLd data={faqLd} />
      <HeroSection />
      
      <RevealOnScroll>
        <PropertyIntroSection />
      </RevealOnScroll>
      
      <RevealOnScroll>
        <div className="bg-canvas py-8">
          <div className="container mx-auto max-w-xl px-4">
            <BookingWidget />
          </div>
        </div>
      </RevealOnScroll>
      
      <RevealOnScroll>
        <RoomPricingSection />
      </RevealOnScroll>
      
      <RevealOnScroll>
        <MurudeshwarInfoSection band="canvas" />
      </RevealOnScroll>
      
      <RevealOnScroll>
        <FaqSection />
      </RevealOnScroll>
      
      <RevealOnScroll>
        <MapSection band="wash" />
      </RevealOnScroll>
      
      <RevealOnScroll>
        <FinalCtaSection />
      </RevealOnScroll>
    </>
  );
}
