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
      <body className="antialiased">{children}</body>
    </html>
  );
}
