import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mizanee — votre équilibre financier",
  description: "Gérez les finances de votre foyer simplement",
  icons: {
    icon: "/logo/mizanee-favicon.svg",
    apple: "/logo/mizanee-favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--mz-surface)] text-[var(--mz-ink)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
