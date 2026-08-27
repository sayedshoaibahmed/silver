import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Stack } from "@/components/layout/stack";
import { Heading, Text } from "@/components/ui/heading";
import { extraBedFaq, STATIC_FAQS } from "@/lib/seo/faqs";
import { getPublicPricing } from "@/lib/pricing/fetch";

export async function FaqSection() {
  const pricing = await getPublicPricing();
  const extra = extraBedFaq(pricing);
  
  const allFaqs = [...STATIC_FAQS];
  if (extra) {
    allFaqs.push(extra);
  } else {
    allFaqs.push({
      q: "Is there an extra bed?",
      a: "Yes. Extra beds can be added up to eight guests in the room. Ask on WhatsApp for the extra-bed charge for your dates."
    });
  }

  return (
    <Section band="canvas">
      <Container>
        <Stack gap="lg" className="mx-auto max-w-3xl">
          <Heading as="h2" size="section" className="text-center">
            Frequently asked questions
          </Heading>
          
          <div className="flex flex-col divide-y divide-line border-y border-line">
            {allFaqs.map((item) => (
              <details key={item.q} name="faq-accordion" className="group">
                <summary className="flex cursor-pointer items-center justify-between py-5 text-lg font-medium text-ink outline-none hover:text-mangrove-fg focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2">
                  <span>{item.q}</span>
                  <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-xl leading-none text-muted transition-transform group-open:rotate-45 group-open:bg-sand-deep group-open:text-ink">
                    +
                  </span>
                </summary>
                <div className="pb-5 pr-10 text-muted">
                  <Text size="sm">{item.a}</Text>
                </div>
              </details>
            ))}
          </div>
        </Stack>
      </Container>
    </Section>
  );
}
