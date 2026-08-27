"use client";

import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import { Plus, Trash2 } from "lucide-react";

import { AnimatedInr } from "@/components/booking/animated-inr";
import { QuantityStepper } from "@/components/booking/quantity-stepper";
import { useBookingEnquiry } from "@/components/booking/enquiry-context";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  catalogFromPricing,
  occupancyOptionValue,
  parseOccupancyOptionValue,
  pricingListFromCatalog,
} from "@/lib/booking/catalog";
import {
  clampIsoDateToMin,
  earliestCheckOutIso,
  normalizeCheckOutIso,
  parseIsoDate,
  todayIso,
} from "@/lib/booking/dates";
import { buildWhatsAppEnquiryUrl } from "@/lib/booking/whatsapp-message";
import {
  BUSINESS_PLACE,
  DISPLAY_PHONE,
  MAX_TOTAL_GUESTS,
  OCCUPANCY_TIERS,
  ROOM_SLUG,
  TEL_URL,
} from "@/lib/business";
import {
  estimateEnquiry,
  formatInr,
  nightsBetween,
  priceEnquiryNightly,
  type NightlyEnquiryPrice,
} from "@/lib/pricing/estimate";
import { clampExtraBeds, maxExtraBeds } from "@/lib/pricing/guest-cap";
import type { PublicPricing } from "@/lib/pricing/types";
import type { OccupancyTier } from "@/lib/business";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One row in the multi-room selection UI. */
type RoomLine = {
  id: string;
  occupancy: OccupancyTier;
  /** Number of physical rooms of this type. */
  quantity: number;
};

type BookingWidgetFormProps = {
  initialPricing: PublicPricing | null;
};

// ---------------------------------------------------------------------------
// Stable today helpers (avoids hydration mismatch)
// ---------------------------------------------------------------------------

function subscribeToday(): () => void {
  return () => {};
}
function getTodaySnapshot(): string {
  return todayIso();
}
function getServerTodaySnapshot(): string {
  return "";
}

// ---------------------------------------------------------------------------
// Line ID generator — module-level counter, SSR-safe because IDs are stable
// per render cycle and never serialised to HTML.
// ---------------------------------------------------------------------------
let _lineIdSeed = 0;
function newLineId(): string {
  return `rl-${++_lineIdSeed}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BookingWidgetForm({ initialPricing }: BookingWidgetFormProps) {
  const formId = useId();

  // --- Pricing state -------------------------------------------------------
  const [pricing, setPricing] = useState<PublicPricing | null>(initialPricing);
  const [pricingStatus, setPricingStatus] = useState<
    "ready" | "loading" | "unavailable"
  >(initialPricing ? "ready" : "loading");

  // --- Form field state ----------------------------------------------------
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  // --- Room lines ----------------------------------------------------------
  const defaultOccupancy: OccupancyTier =
    initialPricing?.occupancyRates[0]?.occupancy ?? 2;
  const [roomLines, setRoomLines] = useState<RoomLine[]>([
    { id: newLineId(), occupancy: defaultOccupancy, quantity: 1 },
  ]);

  // --- Extra beds ----------------------------------------------------------
  const [extraBeds, setExtraBeds] = useState(0);

  // --- Validation ----------------------------------------------------------
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const minCheckIn = useSyncExternalStore(
    subscribeToday,
    getTodaySnapshot,
    getServerTodaySnapshot,
  );

  // Fetch live pricing on mount (keeps form in sync after admin changes)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/pricing", { cache: "no-store" });
        if (!response.ok) {
          if (!cancelled) {
            setPricing(null);
            setPricingStatus("unavailable");
          }
          return;
        }
        const data = (await response.json()) as PublicPricing;
        if (!cancelled) {
          setPricing(data);
          setPricingStatus("ready");
          // Snap the first room line to a valid tier from live data
          const firstTier = data.occupancyRates[0]?.occupancy;
          if (firstTier) {
            setRoomLines((prev) =>
              prev.map((line, idx) =>
                idx === 0 ? { ...line, occupancy: firstTier } : line,
              ),
            );
          }
        }
      } catch {
        if (!cancelled) {
          setPricing(null);
          setPricingStatus("unavailable");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Derived catalog / pricing helpers
  // ---------------------------------------------------------------------------

  const catalog = catalogFromPricing(pricing);
  const pricingList = pricingListFromCatalog(pricing);
  const maxOccupancy = pricing?.room.maxOccupancy ?? MAX_TOTAL_GUESTS;
  const extraBedsOffered = pricing != null && pricing.room.extraBedRateInr > 0;
  const extraBedRateInr = pricing?.room.extraBedRateInr ?? 0;
  const availableTiers = catalog[0]?.occupancyOptions ?? [...OCCUPANCY_TIERS];

  // Extra-bed cap: based on the tightest (lowest) occupancy across all lines
  const minLineOccupancy: number = roomLines.reduce(
    (min: number, line) => Math.min(min, line.occupancy),
    (roomLines[0]?.occupancy ?? 2) as number,
  );
  const extraBedMax = maxExtraBeds(minLineOccupancy, maxOccupancy);
  const clampedExtraBeds = extraBedsOffered
    ? clampExtraBeds(minLineOccupancy, extraBeds, maxOccupancy)
    : 0;

  // Build enquiry lines — extra beds are attached to the first line only,
  // matching the existing API and WhatsApp message format.
  const enquiryLines = useMemo(
    () =>
      roomLines.map((line, idx) => ({
        id: line.id,
        roomSlug: catalog[0]?.slug ?? ROOM_SLUG,
        occupancy: line.occupancy,
        quantity: line.quantity,
        extraBeds: idx === 0 ? clampedExtraBeds : 0,
      })),
    [catalog, roomLines, clampedExtraBeds],
  );

  // ---------------------------------------------------------------------------
  // Date helpers
  // ---------------------------------------------------------------------------

  const checkInDate = parseIsoDate(checkIn);
  const checkOutDate = parseIsoDate(checkOut);
  const datesChosen = Boolean(checkIn && checkOut);
  const checkoutAfterCheckin =
    checkInDate && checkOutDate
      ? nightsBetween(checkInDate, checkOutDate) > 0
      : false;
  const nights =
    checkInDate && checkOutDate && checkoutAfterCheckin
      ? nightsBetween(checkInDate, checkOutDate)
      : null;
  const minCheckOut = checkIn
    ? (earliestCheckOutIso(checkIn) ?? undefined)
    : undefined;

  function onCheckInChange(value: string) {
    if (!value) {
      setCheckIn("");
      return;
    }
    const nextCheckIn = minCheckIn ? clampIsoDateToMin(value, minCheckIn) : value;
    setCheckIn(nextCheckIn);
    setCheckOut(normalizeCheckOutIso(nextCheckIn, checkOut));
  }

  function onCheckOutChange(value: string) {
    if (!checkIn) return;
    if (!value) {
      setCheckOut("");
      return;
    }
    setCheckOut(normalizeCheckOutIso(checkIn, value));
  }

  // ---------------------------------------------------------------------------
  // Estimate calculations
  // ---------------------------------------------------------------------------

  const nightly = useMemo(() => {
    if (pricingList.length === 0) return null;
    return priceEnquiryNightly(pricingList, enquiryLines);
  }, [pricingList, enquiryLines]);

  const estimate = useMemo(() => {
    if (!checkInDate || !checkOutDate || !checkoutAfterCheckin) return null;
    if (pricingList.length === 0) return null;
    return estimateEnquiry(pricingList, checkInDate, checkOutDate, enquiryLines);
  }, [checkInDate, checkOutDate, checkoutAfterCheckin, pricingList, enquiryLines]);

  // Breakdown: extra-bed total is deterministic from rate × count × nights.
  // Room charges = total − extra-bed charges.
  const extraBedChargesInr =
    nights && clampedExtraBeds > 0 && extraBedsOffered
      ? clampedExtraBeds * extraBedRateInr * nights
      : 0;
  const roomChargesInr = estimate
    ? estimate.totalInr - extraBedChargesInr
    : 0;

  // ---------------------------------------------------------------------------
  // Room line management
  // ---------------------------------------------------------------------------

  function addRoomLine() {
    const defaultTier = availableTiers[0] ?? 2;
    setRoomLines((prev) => [
      ...prev,
      { id: newLineId(), occupancy: defaultTier, quantity: 1 },
    ]);
  }

  function removeRoomLine(id: string) {
    setRoomLines((prev) => {
      if (prev.length <= 1) return prev; // always keep at least one line
      return prev.filter((line) => line.id !== id);
    });
  }

  /**
   * When the user changes a room type dropdown:
   * - If another line already uses that tier, merge by incrementing its
   *   quantity by this line's quantity, then remove this line.
   * - Otherwise, just update occupancy.
   */
  function updateRoomOccupancy(id: string, newOccupancy: OccupancyTier) {
    setRoomLines((prev) => {
      const thisLine = prev.find((l) => l.id === id);
      const existingLine = prev.find(
        (l) => l.id !== id && l.occupancy === newOccupancy,
      );

      if (existingLine && thisLine) {
        // Merge: add this line's quantity to the existing one, remove this line
        return prev
          .filter((l) => l.id !== id)
          .map((l) =>
            l.id === existingLine.id
              ? { ...l, quantity: l.quantity + thisLine.quantity }
              : l,
          );
      }

      return prev.map((l) =>
        l.id === id ? { ...l, occupancy: newOccupancy } : l,
      );
    });
  }

  function updateRoomQuantity(id: string, quantity: number) {
    setRoomLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, quantity } : l)),
    );
  }

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};

    if (!checkIn) errs.checkIn = "Check-in date is required.";
    if (!checkOut) errs.checkOut = "Check-out date is required.";
    if (checkIn && checkOut && !checkoutAfterCheckin)
      errs.checkOut = "Check-out must be after check-in.";

    if (roomLines.length === 0)
      errs.rooms = "Please select at least one room type.";

    for (const line of roomLines) {
      if (line.quantity < 1)
        errs[`qty_${line.id}`] = "Quantity must be at least 1.";
    }

    if (extraBeds < 0) errs.extraBeds = "Extra beds cannot be negative.";

    if (phone.trim()) {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 10)
        errs.phone = "Enter a valid phone number (min 10 digits).";
    }

    return errs;
  }

  // ---------------------------------------------------------------------------
  // WhatsApp CTA
  // ---------------------------------------------------------------------------

  const whatsappHref = buildWhatsAppEnquiryUrl({
    guestName,
    phone,
    checkInIso: checkIn,
    checkOutIso: checkOut,
    nights,
    lines: enquiryLines.map((line) => {
      const room =
        catalog.find((item) => item.slug === line.roomSlug) ?? catalog[0]!;
      return {
        roomName: room.name,
        occupancy: line.occupancy,
        quantity: line.quantity,
        extraBeds: line.extraBeds,
      };
    }),
    estimatedTotalLabel: estimate ? formatInr(estimate.totalInr) : null,
  });

  const { setWidgetWhatsAppHref } = useBookingEnquiry();
  useEffect(() => {
    setWidgetWhatsAppHref(whatsappHref);
    return () => setWidgetWhatsAppHref(null);
  }, [whatsappHref, setWidgetWhatsAppHref]);

  function onWhatsAppClick(e: React.MouseEvent<HTMLAnchorElement>) {
    setSubmitAttempted(true);
    const errs = validate();
    setValidationErrors(errs);
    if (Object.keys(errs).length > 0) {
      e.preventDefault();
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-mangrove shadow-xl scheme-dark">
      {/* Header */}
      <div className="px-6 pb-4 pt-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-sand/50">
          Direct booking
        </p>
        <h2 className="mt-1 font-serif text-xl font-semibold text-sand">
          Check availability
        </h2>
        <p className="mt-1 text-sm text-sand/60">
          Choose dates · see estimate · message host
        </p>
      </div>

      <div className="flex flex-col gap-0 divide-y divide-white/10">

        {/* ── Full Name (optional) ────────────────────────────────────────── */}
        <div className="px-6 py-5">
          <Label
            htmlFor={`${formId}-name`}
            className="mb-1.5 block text-sm text-sand/80"
          >
            Full Name{" "}
            <span className="font-normal text-sand/40">(optional)</span>
          </Label>
          <Input
            id={`${formId}-name`}
            surface="dark"
            autoComplete="name"
            placeholder="Enter your name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* ── Room Type Selection ─────────────────────────────────────────── */}
        <div className="px-6 py-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-sand/50">
            Room Type{" "}
            <span className="font-normal normal-case text-danger">*</span>
          </p>

          {submitAttempted && validationErrors.rooms && (
            <p className="mb-2 text-xs text-amber-400">
              {validationErrors.rooms}
            </p>
          )}

          <div className="flex flex-col gap-5">
            {roomLines.map((line, idx) => (
              <RoomLineRow
                key={line.id}
                line={line}
                index={idx}
                canRemove={roomLines.length > 1}
                availableTiers={availableTiers}
                pricing={pricing}
                qtyError={
                  submitAttempted
                    ? validationErrors[`qty_${line.id}`]
                    : undefined
                }
                onOccupancyChange={(occ) => updateRoomOccupancy(line.id, occ)}
                onQuantityChange={(qty) => updateRoomQuantity(line.id, qty)}
                onRemove={() => removeRoomLine(line.id)}
              />
            ))}
          </div>

          {/* Add another room type */}
          <button
            type="button"
            onClick={addRoomLine}
            className="mt-4 flex items-center gap-1.5 text-sm font-medium text-gold transition-colors hover:text-gold-hover"
          >
            <Plus className="size-4" aria-hidden />
            Add another room type
          </button>
        </div>

        {/* ── Check-in Date ───────────────────────────────────────────────── */}
        <div className="px-6 py-5">
          <Label
            htmlFor={`${formId}-in`}
            className="mb-1.5 block text-sm text-sand/80"
          >
            Check-in Date{" "}
            <span className="font-normal text-danger">*</span>
          </Label>
          <Input
            id={`${formId}-in`}
            surface="dark"
            type="date"
            required
            min={minCheckIn || undefined}
            value={checkIn}
            onChange={(e) => onCheckInChange(e.target.value)}
            className="text-sm"
          />
          {submitAttempted && validationErrors.checkIn && (
            <p className="mt-1.5 text-xs text-amber-400">
              {validationErrors.checkIn}
            </p>
          )}
        </div>

        {/* ── Check-out Date ──────────────────────────────────────────────── */}
        <div className="px-6 py-5">
          <Label
            htmlFor={`${formId}-out`}
            className="mb-1.5 block text-sm text-sand/80"
          >
            Check-out Date{" "}
            <span className="font-normal text-danger">*</span>
          </Label>
          <Input
            id={`${formId}-out`}
            surface="dark"
            type="date"
            required
            disabled={!checkIn}
            min={(minCheckOut ?? minCheckIn) || undefined}
            value={checkOut}
            onChange={(e) => onCheckOutChange(e.target.value)}
            className="text-sm"
          />
          {datesChosen && !checkoutAfterCheckin && (
            <p className="mt-1.5 text-xs text-amber-400">
              Check-out must be after check-in.
            </p>
          )}
          {submitAttempted &&
            validationErrors.checkOut &&
            !(datesChosen && !checkoutAfterCheckin) && (
              <p className="mt-1.5 text-xs text-amber-400">
                {validationErrors.checkOut}
              </p>
            )}
          <p className="mt-2 text-xs text-sand/40">
            Check-in &amp; check-out: 11:00 AM
          </p>
        </div>

        {/* ── Phone Number (optional) ─────────────────────────────────────── */}
        <div className="px-6 py-5">
          <Label
            htmlFor={`${formId}-phone`}
            className="mb-1.5 block text-sm text-sand/80"
          >
            Phone Number{" "}
            <span className="font-normal text-sand/40">(optional)</span>
          </Label>
          <Input
            id={`${formId}-phone`}
            surface="dark"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 XXXXX XXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="text-sm"
          />
          {submitAttempted && validationErrors.phone && (
            <p className="mt-1.5 text-xs text-amber-400">
              {validationErrors.phone}
            </p>
          )}
        </div>

        {/* ── Extra Bed ───────────────────────────────────────────────────── */}
        {extraBedsOffered && extraBedMax > 0 && (
          <div className="px-6 py-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-sand/50">
              Extra Bed
            </p>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-sand">
                  Extra bed{" "}
                  <span className="font-normal text-sand/60">
                    · {formatInr(extraBedRateInr)}/person/night
                  </span>
                </p>
                <p className="text-xs text-sand/50">
                  Up to {extraBedMax} available
                </p>
              </div>
              <QuantityStepper
                label="extra beds"
                value={clampedExtraBeds}
                min={0}
                max={extraBedMax}
                onChange={(val) => setExtraBeds(val)}
                surface="dark"
              />
            </div>
          </div>
        )}

        {/* ── Estimated Total ─────────────────────────────────────────────── */}
        <div className="px-6 py-5" aria-live="polite">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-sand/50">
            Estimated Total
          </p>
          <EstimatePanel
            datesChosen={datesChosen}
            checkoutAfterCheckin={checkoutAfterCheckin}
            pricingStatus={pricingStatus}
            nightly={nightly}
            estimate={estimate}
            nights={nights}
            roomChargesInr={roomChargesInr}
            extraBedChargesInr={extraBedChargesInr}
            extraBedsOffered={extraBedsOffered}
            clampedExtraBeds={clampedExtraBeds}
          />
        </div>
      </div>

      {/* ── CTAs ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 px-6 pb-6 pt-4">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          data-ss-booking-cta=""
          onClick={onWhatsAppClick}
          className={cn(buttonVariants({ variant: "whatsapp", size: "full" }))}
        >
          Check availability on WhatsApp
        </a>
        <a
          href={TEL_URL}
          className={cn(
            buttonVariants({ variant: "outline-on-dark", size: "full" }),
          )}
        >
          Call us
        </a>
        <p className="text-center text-xs text-sand/40">
          {DISPLAY_PHONE} · {BUSINESS_PLACE}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: RoomLineRow
// ---------------------------------------------------------------------------

type RoomLineRowProps = {
  line: RoomLine;
  index: number;
  canRemove: boolean;
  availableTiers: OccupancyTier[];
  pricing: PublicPricing | null;
  qtyError?: string;
  onOccupancyChange: (occ: OccupancyTier) => void;
  onQuantityChange: (qty: number) => void;
  onRemove: () => void;
};

function RoomLineRow({
  line,
  index,
  canRemove,
  availableTiers,
  pricing,
  qtyError,
  onOccupancyChange,
  onQuantityChange,
  onRemove,
}: RoomLineRowProps) {
  const roomSlug = pricing?.room.slug ?? ROOM_SLUG;

  return (
    <div>
      {/* Row label + optional remove */}
      <div className="mb-2 flex items-center">
        <p className="text-xs font-medium text-sand/50">Room {index + 1}</p>
        {canRemove && (
          <button
            type="button"
            aria-label={`Remove room ${index + 1}`}
            onClick={onRemove}
            className="ml-auto flex items-center gap-1 text-xs text-sand/40 transition-colors hover:text-danger"
          >
            <Trash2 className="size-3.5" aria-hidden />
            Remove
          </button>
        )}
      </div>

      {/* Select + quantity stepper */}
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <Select
            surface="dark"
            aria-label={`Room type for room ${index + 1}`}
            value={occupancyOptionValue(roomSlug, line.occupancy)}
            onChange={(e) => {
              const parsed = parseOccupancyOptionValue(e.target.value);
              if (parsed) onOccupancyChange(parsed.occupancy);
            }}
          >
            {availableTiers.map((tier) => {
              const rate = pricing?.occupancyRates.find(
                (r) => r.occupancy === tier,
              );
              const label = rate
                ? `${tier} Sharing — ${formatInr(rate.nightlyRateInr)}/night`
                : `${tier} Sharing`;
              return (
                <option
                  key={tier}
                  value={occupancyOptionValue(roomSlug, tier)}
                >
                  {label}
                </option>
              );
            })}
          </Select>
        </div>
        <div className="shrink-0">
          <QuantityStepper
            label={`quantity for room ${index + 1}`}
            value={line.quantity}
            min={1}
            max={10}
            onChange={onQuantityChange}
            surface="dark"
          />
        </div>
      </div>

      {qtyError && (
        <p className="mt-1 text-xs text-amber-400">{qtyError}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: EstimatePanel
// ---------------------------------------------------------------------------

function EstimatePanel({
  datesChosen,
  checkoutAfterCheckin,
  pricingStatus,
  nightly,
  estimate,
  nights,
  roomChargesInr,
  extraBedChargesInr,
  extraBedsOffered,
  clampedExtraBeds,
}: {
  datesChosen: boolean;
  checkoutAfterCheckin: boolean;
  pricingStatus: "ready" | "loading" | "unavailable";
  nightly: NightlyEnquiryPrice | null;
  estimate: ReturnType<typeof estimateEnquiry>;
  nights: number | null;
  roomChargesInr: number;
  extraBedChargesInr: number;
  extraBedsOffered: boolean;
  clampedExtraBeds: number;
}) {
  // Still loading and no cached nightly rate
  if (pricingStatus === "loading" && !nightly) {
    return (
      <p className="text-sm text-sand/60">Loading today&apos;s rates…</p>
    );
  }

  // Dates chosen but range is invalid
  if (datesChosen && !checkoutAfterCheckin) {
    return (
      <p className="text-sm text-amber-400">Please choose valid dates.</p>
    );
  }

  // No pricing from API
  if (!nightly) {
    return (
      <p className="text-sm text-sand/60">
        Pricing temporarily unavailable — message us on WhatsApp for
        today&apos;s rate.
      </p>
    );
  }

  // No dates yet — show nightly rate only
  if (!datesChosen || !checkoutAfterCheckin) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-xs text-sand/50">
          Choose your dates to see a stay total.
        </p>
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-3xl font-semibold tabular-nums text-sand">
            {formatInr(nightly.nightlyTotalInr)}
          </span>
          <span className="text-sm text-sand/60">/night</span>
        </div>
        <p className="text-xs text-sand/40">GST included · estimate only</p>
      </div>
    );
  }

  // Full estimate with dates
  if (estimate && nights) {
    return (
      <div className="flex flex-col gap-3">
        {/* Animated total */}
        <AnimatedInr amount={estimate.totalInr} className="text-3xl" />

        {/* Breakdown card */}
        <div className="rounded-lg bg-white/5 px-4 py-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-sand/60">
                {nights} {nights === 1 ? "night" : "nights"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-sand/70">Room charges</span>
              <span className="tabular-nums text-sand">
                {formatInr(roomChargesInr)}
              </span>
            </div>
            {extraBedsOffered && clampedExtraBeds > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-sand/70">Extra beds</span>
                <span className="tabular-nums text-sand">
                  {formatInr(extraBedChargesInr)}
                </span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-2 text-sm font-semibold">
              <span className="text-sand/80">Total</span>
              <span className="tabular-nums text-sand">
                {formatInr(estimate.totalInr)}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-sand/40">
          * Estimate only, subject to availability. GST included.
        </p>
        <p className="text-xs text-sand/40">
          Final availability and rate confirmed on WhatsApp.
        </p>
      </div>
    );
  }

  // Dates chosen but estimate not available yet
  return (
    <div className="flex items-baseline gap-1">
      <span className="font-serif text-3xl font-semibold tabular-nums text-sand">
        {formatInr(nightly.nightlyTotalInr)}
      </span>
      <span className="text-sm text-sand/60">/night</span>
    </div>
  );
}
