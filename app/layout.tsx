import type { Metadata } from "next";
import { Outfit, DM_Sans, Rubik } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Liminal",
  description: "Futuristic prosthetic rehabilitation platform with AR capabilities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      suppressHydrationWarning
      className={`${outfit.variable} ${dmSans.variable} ${rubik.variable}`}
    >
      <body suppressHydrationWarning className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
