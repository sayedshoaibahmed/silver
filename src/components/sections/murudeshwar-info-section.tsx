import Image from "next/image";
import Link from "next/link";

import type { SectionBand } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Stack } from "@/components/layout/stack";
import { Heading, Text } from "@/components/ui/heading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import murudeshwarBeach from "../../../public/images/attractions/murudeshwar-beach-sunset.jpg";

export function MurudeshwarInfoSection({ band }: { band?: SectionBand }) {
  return (
    <Section band={band}>
      <Container>
        <Stack gap="lg" className="items-center text-center">
          <div className="max-w-2xl">
            <Heading as="h2" size="section">
              Explore Murudeshwar
            </Heading>
            <Text tone="muted" className="mt-4 text-lg">
              Stay close to the area&apos;s major attractions, including the famous Murudeshwar Temple, 
              the second-tallest Shiva statue in the world, and the beautiful Arabian Sea beach.
            </Text>
            
            <div className="mt-6">
              <Link
                href="/location"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Explore nearby &rarr;
              </Link>
            </div>
          </div>
          
          <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-lg shadow-sm">
            <Image
              src={murudeshwarBeach}
              alt="Murudeshwar Beach at sunset"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        </Stack>
      </Container>
    </Section>
  );
}
