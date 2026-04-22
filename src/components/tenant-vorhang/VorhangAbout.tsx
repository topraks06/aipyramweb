"use client";

import VorhangNavbar from "./VorhangNavbar";
import VorhangFooter from "./VorhangFooter";

export default function VorhangAbout() {
  return (
    <div className="min-h-screen bg-gray-50 text-black flex flex-col font-sans">
      <VorhangNavbar />
      <main className="flex-grow pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="text-5xl font-serif mb-8 text-black">Über Uns</h1>
        <div className="prose prose-lg text-gray-600 max-w-none">
          <p className="text-xl mb-8 leading-relaxed">
            Vorhang.ai ist der führende KI-gesteuerte B2B-Marktplatz für Vorhänge und Heimtextilien im deutschsprachigen Raum. 
            Als Teil des globalen AIPyram-Ökosystems revolutionieren wir die Art und Weise, wie Einzelhändler, Architekten und 
            Raumausstatter Textilien beschaffen.
          </p>
          <h2 className="text-2xl font-serif text-black mt-12 mb-4">Unsere Mission</h2>
          <p className="mb-6 leading-relaxed">
            Wir beseitigen die geografischen und visuellen Barrieren im Textilhandel. Durch unsere fortschrittliche KI-Rendering-Technologie 
            können Einkäufer Stoffe in realen Umgebungen visualisieren, bevor sie auch nur ein Muster anfordern. Gleichzeitig bieten wir 
            Herstellern aus aller Welt direkten Zugang zum europäischen B2B-Markt.
          </p>
          <h2 className="text-2xl font-serif text-black mt-12 mb-4">Das AIPyram Ökosystem</h2>
          <p className="mb-6 leading-relaxed">
            Vorhang.ai greift auf die leistungsstarke "Perde.ai Engine" zurück, um fotorealistische Echtzeit-Renderings zu erzeugen. 
            Unsere Plattform ist nahtlos in ein globales Netzwerk aus verifizierten Produzenten und Händlern integriert, was maximale 
            Qualität und Liefersicherheit garantiert.
          </p>
        </div>
      </main>
      <VorhangFooter />
    </div>
  );
}
