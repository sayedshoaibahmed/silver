import { Container } from "@/components/layout/container";
import { Stack } from "@/components/layout/stack";
import { HeroParallax } from "@/components/sections/hero-parallax";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { TokenImage } from "@/components/ui/token-image";
import { BOOKING_HASH } from "@/lib/booking/anchor";
import { BUSINESS_NAME } from "@/lib/business";
import { cn } from "@/lib/utils";

import heroCoast from "../../../public/images/hero-murudeshwar-coast.jpg";

const HERO_ALT =
  "A tranquil sunset over a tropical beach in Murudeshwar, with silhouetted palm trees leaning over a sandy shore, gentle waves, and a golden-orange sky";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-mangrove" data-ss-hero="">
      <div className="hero-media pointer-events-none absolute inset-0">
        <HeroParallax>
          <TokenImage
            src={heroCoast}
            alt={HERO_ALT}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 100vw"
            quality={85}
            slotClassName="h-full w-full"
            className="object-cover object-center"
          />
          {/* Subtle overlay to ensure the white text and buttons are readable, while keeping the image visible */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/40"
          />
        </HeroParallax>
      </div>

      <Container className="relative z-10 flex min-h-[75vh] md:min-h-[85vh] flex-col items-center justify-center py-20 text-center">
        <Stack gap="lg" className="items-center max-w-4xl">
          <div className="hero-copy hero-copy-delay-1">
            <Heading as="h1" size="display" className="text-sand drop-shadow-md">
              {BUSINESS_NAME}
            </Heading>
          </div>

          <div className="hero-copy hero-copy-delay-2 mt-4 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
            <a
              href={BOOKING_HASH}
              className={cn(buttonVariants({ variant: "whatsapp", size: "lg" }), "w-full sm:w-48")}
            >
              Book Now
            </a>
            <a
              href="/rooms"
              className={cn(buttonVariants({ variant: "outline-on-dark", size: "lg" }), "w-full sm:w-48")}
            >
              View Room
            </a>
          </div>
        </Stack>
      </Container>
    </section>
  );
}
