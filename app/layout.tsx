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
    default: "NestRune — A world worth collecting",
    template: "%s · NestRune",
  },
  description: siteDescription,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName,
    title: "NestRune — A world worth collecting",
    description: siteDescription,
    url: "/",
    images: [{url:"/art/great-nest-world.webp",alt:"The Great Nest — NestRune original guardian world"}],
  },
  twitter: {
    card: "summary_large_image",
    title: "NestRune — A world worth collecting",
    description: siteDescription,
    images: ["/art/great-nest-world.webp"],
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
      </head>
      <body className={`${worldSerif.variable} ${worldSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
