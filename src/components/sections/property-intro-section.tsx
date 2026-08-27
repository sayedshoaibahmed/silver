import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Stack } from "@/components/layout/stack";
import { Heading, Text } from "@/components/ui/heading";

export function PropertyIntroSection() {
  return (
    <Section band="canvas" fade={false} className="py-16 text-center">
      <Container>
        <Stack gap="md" className="mx-auto max-w-2xl">
          <Heading as="h2" size="section">
            A simple stay in Murudeshwar
          </Heading>
          <Text tone="muted" className="text-lg">
            Welcome to a quiet, authentic coastal homestay hosted directly by a local family. 
            We offer one spacious, well-equipped room designed to comfortably accommodate couples, 
            small groups, or families of up to eight guests.
          </Text>
        </Stack>
      </Container>
    </Section>
  );
}
