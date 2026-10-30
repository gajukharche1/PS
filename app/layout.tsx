import type { Metadata } from "next";
import { SkipLink } from "@/components/ui/skip-link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pimple Saudagar Local Business Directory | Find Top Services Nearby",
  description:
    "Discover verified local businesses, restaurants, healthcare, clinics, and professional services across Pimple Saudagar, PCMC, Pune.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased selection:bg-primary/20">
        <SkipLink />
        <div id="main-content" tabIndex={-1} className="focus:outline-none">
          {children}
        </div>
      </body>
    </html>
  );
}
