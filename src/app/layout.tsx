import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Playfair_Display } from "next/font/google";

import { Providers } from "@/components/providers";
import { BUSINESS_NAME, SITE_URL } from "@/lib/business";
import { PAGE_SEO } from "@/lib/seo/copy";
import { OG_IMAGE } from "@/lib/seo/metadata";
import { MOTION_INIT_SCRIPT } from "@/lib/motion";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

import "./globals.css";

const sourceSans = Inter({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const sourceSerif = Playfair_Display({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: PAGE_SEO.home.absoluteTitle,
    template: `%s | ${BUSINESS_NAME}`,
  },
  description: PAGE_SEO.home.description,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: BUSINESS_NAME,
    title: PAGE_SEO.home.absoluteTitle,
    description: PAGE_SEO.home.description,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_SEO.home.absoluteTitle,
    description: PAGE_SEO.home.description,
    images: [OG_IMAGE.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      suppressHydrationWarning
      className={`${sourceSans.variable} ${sourceSerif.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased bg-background text-ink">
        <Script id="silversand-boot" strategy="beforeInteractive">
          {`${THEME_INIT_SCRIPT}${MOTION_INIT_SCRIPT}`}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
