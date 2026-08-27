import Link from "next/link";

import type { SectionBand } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Stack } from "@/components/layout/stack";
import { buttonVariants } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/heading";
import { BUSINESS_NAME } from "@/lib/business";
import { cn } from "@/lib/utils";

type AboutSectionProps = {
  compact?: boolean;
  band?: SectionBand;
};

export function AboutSection({ compact = false, band }: AboutSectionProps) {
  return (
    <Section band={band} className={!band && !compact ? "bg-surface" : undefined}>
      <Container>
        <Stack gap="md" className="max-w-3xl">
          <Heading as="h2" size="section">
            A house in Murudeshwar, not a hotel
          </Heading>
          <Text tone="muted">
            {BUSINESS_NAME} is a family-run homestay in Murudeshwar. We offer a quiet,
            comfortable base for your visit, hosted personally by the family.
          </Text>
          {compact ? (
            <Link
              href="/about"
              className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
            >
              More about us
            </Link>
          ) : null}
        </Stack>
      </Container>
    </Section>
  );
}
