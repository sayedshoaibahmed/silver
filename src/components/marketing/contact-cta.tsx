import { buttonVariants } from "@/components/ui/button";
import { DISPLAY_PHONE, TEL_URL, WHATSAPP_URL } from "@/lib/business";
import { cn } from "@/lib/utils";

type ContactCtaProps = {
  layout?: "row" | "stack";
  whatsappLabel?: string;
  className?: string;
};

export function ContactCta({
  layout = "row",
  whatsappLabel = "Check Availability on WhatsApp",
  className,
}: ContactCtaProps) {
  return (
    <div
      className={cn(
        "flex gap-3",
        layout === "stack" ? "flex-col" : "flex-col sm:flex-row",
        className,
      )}
    >
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({ variant: "whatsapp", size: layout === "stack" ? "full" : "lg" }),
        )}
      >
        {whatsappLabel}
      </a>
      <a
        href={TEL_URL}
        className={cn(buttonVariants({ variant: "outline-on-dark", size: layout === "stack" ? "full" : "lg" }))}
      >
        Call {DISPLAY_PHONE}
      </a>
    </div>
  );
}
