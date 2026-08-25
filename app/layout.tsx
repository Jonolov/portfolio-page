import type { Metadata } from "next";
import { Archivo, Martian_Mono } from "next/font/google";
import { MotionConfig } from "motion/react";
import { Nav } from "@/components/Nav";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { CommandPaletteProvider } from "@/components/command-palette/useCommandPalette";
import { profile } from "@/content/profile";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

const title = `${profile.name} — Senior Frontend/Fullstack Developer`;
const description = profile.heroHook;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: profile.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.roleLine,
  description: profile.heroHook,
  url: SITE_URL,
  email: profile.contact.email,
  sameAs: [profile.contact.linkedin],
  address: {
    "@type": "PostalAddress",
    addressLocality: profile.contact.location,
    addressCountry: "SE",
  },
  worksFor: {
    "@type": "Organization",
    name: profile.contact.company,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${martianMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <a
          href="#main"
          className="sr-only rounded bg-foreground px-4 py-2 text-background focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to content
        </a>
        <MotionConfig reducedMotion="user">
          <CommandPaletteProvider>
            <Nav />
            <main id="main" className="flex-1">
              {children}
            </main>
            <CommandPalette />
          </CommandPaletteProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
