"use client";

import VorhangNavbar from "./VorhangNavbar";
import VorhangFooter from "./VorhangFooter";
import { Globe, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function VorhangAbout() {
  return (
    <div className="min-h-screen bg-gray-50 text-black flex flex-col font-sans">
      <VorhangNavbar />

      <main className="flex-grow pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 lg:px-8 mb-24 text-center">
          <span className="text-zinc-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block">Über Uns</span>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-8 leading-tight text-black">
            Der digitale Maßstab für <br/><span className="italic text-gray-500">B2B Heimtextilien</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Vorhang.ai, betrieben von der aipyram GmbH (Dietikon, Schweiz), ist der führende KI-gesteuerte B2B-Marktplatz für Vorhänge und Heimtextilien im deutschsprachigen Raum (DACH). Wir verbinden europäische Einkäufer direkt mit globalen Premium-Herstellern.
          </p>
        </section>

        {/* Core Pillars */}
        <section className="max-w-6xl mx-auto px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 border border-gray-200 shadow-sm rounded-xl">
              <ShieldCheck className="w-8 h-8 text-black mb-6" />
              <h3 className="text-2xl font-serif mb-4">Schweizer Zuverlässigkeit</h3>
              <p className="text-gray-600 leading-relaxed">
                Als in der Schweiz ansässiges Unternehmen (aipyram GmbH) garantieren wir höchste Standards bei Datensicherheit, Treuhandzahlungen (Smart Escrow) und transparenter B2B-Vertragsabwicklung für den gesamten DACH-Markt.
              </p>
            </div>
            <div className="bg-white p-10 border border-gray-200 shadow-sm rounded-xl">
              <TrendingUp className="w-8 h-8 text-black mb-6" />
              <h3 className="text-2xl font-serif mb-4">KI-Rendering Technologie</h3>
              <p className="text-gray-600 leading-relaxed">
                Vorhang.ai nutzt die leistungsstarke "Perde.ai Engine" des aipyram-Ökosystems. Einkäufer können Stoffe in fotorealistischen 3D-Räumen visualisieren, noch bevor ein physisches Muster bestellt wird – das spart Zeit und Ressourcen.
              </p>
            </div>
            <div className="bg-white p-10 border border-gray-200 shadow-sm rounded-xl">
              <Globe className="w-8 h-8 text-black mb-6" />
              <h3 className="text-2xl font-serif mb-4">Globales Sourcing, Lokaler Service</h3>
              <p className="text-gray-600 leading-relaxed">
                Wir beseitigen die Barrieren im internationalen Textilhandel. Vorhang.ai bietet direkten Zugang zu verifizierten Herstellern aus der Türkei, Asien und Europa, während die gesamte Kommunikation und Abwicklung auf Deutsch und nach europäischen Standards erfolgt.
              </p>
            </div>
            <div className="bg-white p-10 border border-gray-200 shadow-sm rounded-xl">
              <Target className="w-8 h-8 text-black mb-6" />
              <h3 className="text-2xl font-serif mb-4">Teil des aipyram Ökosystems</h3>
              <p className="text-gray-600 leading-relaxed">
                Vorhang.ai ist der dedizierte Knotenpunkt für Deutschland, Österreich und die Schweiz innerhalb des aipyram Sovereign OS. Unsere Händler profitieren von Markttrends (Heimtex.ai) und dem Zugang zum globalen Lieferantennetzwerk (TRTex.com).
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="max-w-4xl mx-auto px-6 lg:px-8 text-center bg-gray-100 p-12 rounded-2xl border border-gray-200">
          <h2 className="text-3xl font-serif mb-4 text-black">Bereit für die digitale Textilbeschaffung?</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Registrieren Sie sich als B2B-Einkäufer oder bewerben Sie sich als verifizierter Hersteller auf Vorhang.ai.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors rounded">
              Konto Erstellen
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-white border border-gray-300 text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors rounded">
              Kontakt Aufnehmen
            </Link>
          </div>
        </section>
      </main>

      <VorhangFooter />
    </div>
  );
}
