import Image from "next/image";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Stack } from "@/components/layout/stack";
import { Card, CardContent } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/heading";
import { buttonVariants } from "@/components/ui/button";
import { BOOKING_HASH } from "@/lib/booking/anchor";
import { getPublicPricing } from "@/lib/pricing/fetch";
import { formatInr } from "@/lib/pricing/estimate";
import { OCCUPANCY_TIERS, MAX_TOTAL_GUESTS } from "@/lib/business";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

import roomMainPhoto from "../../../public/images/rooms/occupancy-4-d2.jpg";

export async function RoomPricingSection() {
  const pricing = await getPublicPricing();

  return (
    <Section id="room" band="wash">
      <Container>
        <Stack gap="xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-md">
              <Image
                src={roomMainPhoto}
                alt="Deluxe AC Room at Silver Sand Beach Homestay"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            
            <Stack gap="md">
              <Heading as="h2" size="section">
                Deluxe AC Room
              </Heading>
              
              <Text tone="muted" className="text-lg">
                We offer one physical room designed for comfort and simplicity. 
                Whether you are a couple or a family of eight, you book the entire room.
              </Text>
              
              <ul className="mt-4 flex flex-col gap-3">
                {[
                  "One private room",
                  "Air-conditioned",
                  "Attached bathroom",
                  "Free Wi-Fi + parking",
                  "Direct host booking",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-ink">
                    <Check className="h-5 w-5 text-whatsapp" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                <a
                  href={BOOKING_HASH}
                  className={cn(buttonVariants({ variant: "whatsapp" }))}
                >
                  Check availability
                </a>
              </div>
            </Stack>
          </div>

          <div className="mx-auto w-full max-w-2xl mt-8">
            <Card>
              <CardContent className="p-8">
                <Heading as="h3" size="section" className="mb-6 text-center">
                  Pricing
                </Heading>
                
                {pricing ? (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4 border-b border-line pb-2 font-medium text-muted">
                      <span>Guests</span>
                      <span className="text-right">Nightly rate</span>
                    </div>
                    {OCCUPANCY_TIERS.map((tier) => {
                      const row = pricing.occupancyRates.find((r) => r.occupancy === tier);
                      const amount = row?.nightlyRateInr ?? 0;
                      if (amount === 0) return null;
                      return (
                        <div key={tier} className="grid grid-cols-2 gap-4 border-b border-line pb-4 pt-2">
                          <span className="text-ink">{tier} sharing</span>
                          <span className="text-right font-medium text-ink tabular-nums">{formatInr(amount)}</span>
                        </div>
                      );
                    })}
                    <div className="mt-2 flex flex-col gap-1 text-sm text-muted">
                      <div className="flex justify-between">
                        <span>Extra bed:</span>
                        <span className="font-medium text-ink tabular-nums">
                          {pricing.room.extraBedRateInr > 0 ? `${formatInr(pricing.room.extraBedRateInr)} /person/night` : "Not offered"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maximum occupancy:</span>
                        <span className="font-medium text-ink">{MAX_TOTAL_GUESTS} total guests</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Text className="text-center text-muted">
                    Pricing is currently unavailable. Please message us on WhatsApp.
                  </Text>
                )}
              </CardContent>
            </Card>
          </div>
        </Stack>
      </Container>
    </Section>
  );
}
