import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CardNest — A world worth collecting",
  description: "Discover original guardians, open your first pack, and build your nest.",
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
