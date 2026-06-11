export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import { ThemeProvider } from "@/lib/theme-context";

export const metadata: Metadata = {
  title: "Mundial 2026 Prode",
  description: "Predice los partidos del Mundial 2026 y compite con amigos",
};

const themeInitScript = `
(function() {
  try {
    var theme = localStorage.getItem('theme');
    if (!theme) {
      var u = localStorage.getItem('user');
      if (u) theme = JSON.parse(u).theme;
    }
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
