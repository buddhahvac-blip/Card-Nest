import type { Metadata } from "next";
import {searchIndexingApproved,siteDescription,siteName,siteUrl} from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: siteName,
  title: {
    default: "CardNest — A world worth collecting",
    template: "%s · CardNest",
  },
  description: siteDescription,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName,
    title: "CardNest — A world worth collecting",
    description: siteDescription,
    url: "/",
    images: [{url:"/art/great-nest-world.webp",alt:"The Great Nest — CardNest original guardian world"}],
  },
  twitter: {
    card: "summary_large_image",
    title: "CardNest — A world worth collecting",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
