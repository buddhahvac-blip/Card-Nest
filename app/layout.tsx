import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import {searchIndexingApproved,siteDescription,siteName,siteUrl} from "@/lib/site";
import "./globals.css";
import "./home-experience.css";

const worldSerif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-world",
  weight: ["500", "600", "700"],
  display: "swap",
});

const worldSans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: siteName,
  title: {
    default: "NestRune — A World Worth Collecting.",
    template: "%s · NestRune",
  },
  description: siteDescription,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName,
    title: "NestRune — A World Worth Collecting.",
    description: siteDescription,
    url: "/",
    images: [{url:"/art/nestrune-pack-hero.webp",alt:"NestRune — four packs in the Garden of Lands"}],
  },
  twitter: {
    card: "summary_large_image",
    title: "NestRune — A World Worth Collecting.",
    description: siteDescription,
    images: ["/art/nestrune-pack-hero.webp"],
  },
  robots: {index:searchIndexingApproved,follow:searchIndexingApproved},
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="impact-site-verification" {...({value:"127ac962-5c21-4273-820a-6d64fb17e00e"} as any)} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
          '@context':'https://schema.org',
          '@type':'VideoGame',
          name:'NestRune',
          url:siteUrl.toString(),
          description:siteDescription,
          genre:['Digital card game','Collectible card game','Fantasy'],
          gamePlatform:'Web browser',
          operatingSystem:'Web',
          applicationCategory:'Game',
          isAccessibleForFree:true,
          inLanguage:'en'
        })}} />
      </head>
      <body className={`${worldSerif.variable} ${worldSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
