import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { About } from "@/components/landing/About";
import { HowItWorks } from "@/components/landing/HowItWorks";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <Navbar />
      <HeroSection />
      <div id="about">
        <About />
      </div>
      <div id="how-it-works">
        <HowItWorks />
      </div>
    </main>
  );
}
