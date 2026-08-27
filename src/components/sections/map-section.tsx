
import type { SectionBand } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Stack } from "@/components/layout/stack";
import { buttonVariants } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/heading";
import {
  FULL_ADDRESS,
  GOOGLE_MAPS_PLACE_URL,
  LANDMARK_BUS_STAND,
  googleMapsEmbedSrc,
} from "@/lib/business";
import { cn } from "@/lib/utils";

type MapSectionProps = {
  showLocationLink?: boolean;
  band?: SectionBand;
};

export function MapSection({ showLocationLink = true, band }: MapSectionProps) {
  const embedSrc = googleMapsEmbedSrc();

  return (
    <Section band={band} className={band ? undefined : "bg-surface"}>
      <Container>
        <Stack gap="md" className="max-w-3xl">
          <Heading as="h2" size="section">
            Getting here
          </Heading>
          <Text tone="muted">
            We&apos;re at {FULL_ADDRESS}, {LANDMARK_BUS_STAND}. Murdeshwar Railway
            Station (MRDW) is the nearest train station.
          </Text>
          <Text size="sm" tone="muted">
            The map shows our location.
          </Text>
          <div className="pt-2">
            <a
              href={GOOGLE_MAPS_PLACE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "default" }), "w-fit")}
            >
              Open in Google Maps
            </a>
          </div>

          {embedSrc ? (
            <div className="overflow-hidden rounded-lg border border-line bg-sand-deep aspect-[16/9]">
              <iframe
                title={`Map of Silver Sand Beach Homestay — ${FULL_ADDRESS}`}
                src={embedSrc}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-[16/9] flex-col items-center justify-center gap-3 rounded-lg border border-line bg-sand-deep px-4 text-center">
              <Text size="sm" tone="muted">
                The map isn&apos;t loading here. Open Google Maps for directions.
              </Text>
              <a
                href={GOOGLE_MAPS_PLACE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
              >
                Open in Google Maps
              </a>
            </div>
          )}

          {showLocationLink ? (
            <a
              href={GOOGLE_MAPS_PLACE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
            >
              Location &amp; directions
            </a>
          ) : null}
        </Stack>
      </Container>
    </Section>
  );
}
