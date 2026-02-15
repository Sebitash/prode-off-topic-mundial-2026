export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "⚽ Mundial 2026 Prode",
  description: "Predice los partidos del Mundial 2026 y compite con amigos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
