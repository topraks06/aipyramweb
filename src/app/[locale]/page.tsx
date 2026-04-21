
"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import SectorCompetencies from "@/components/sections/SectorCompetencies";
import FlagshipProjects from "@/components/sections/FlagshipProjects";
import DigitalAssets from "@/components/sections/DigitalAssets";
import SoftwarePower from "@/components/sections/SoftwarePower";
import CorporateValues from "@/components/sections/CorporateValues";
import ContactSection from "@/components/sections/ContactSection";
export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection />
        <SectorCompetencies />
        <FlagshipProjects />
        <DigitalAssets />
        <SoftwarePower />
        <CorporateValues />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
