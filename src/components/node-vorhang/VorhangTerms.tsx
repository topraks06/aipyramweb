"use client";

import VorhangNavbar from "./VorhangNavbar";
import VorhangFooter from "./VorhangFooter";

export default function VorhangTerms() {
  return (
    <div className="min-h-screen bg-gray-50 text-black flex flex-col font-sans">
      <VorhangNavbar />
      <main className="flex-grow pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="text-5xl font-serif mb-12 text-black">Allgemeine Geschäftsbedingungen (AGB)</h1>
        <div className="prose prose-lg text-gray-600 max-w-none">
          <p className="mb-6 leading-relaxed">
            Die nachfolgenden Allgemeinen Geschäftsbedingungen gelten für alle Verträge, die zwischen der aipyram Technologies GmbH 
            (Betreiber von Vorhang.ai) und unseren Nutzern (Händlern und Käufern) geschlossen werden.
          </p>
          <h2 className="text-2xl font-serif text-black mt-12 mb-4">1. Geltungsbereich</h2>
          <p className="mb-6 leading-relaxed">
            Unsere Plattform richtet sich ausschließlich an Unternehmer (B2B) im Sinne des § 14 BGB. Ein Verkauf an Verbraucher 
            über die Vorhang.ai Plattform ist ausgeschlossen.
          </p>
          <h2 className="text-2xl font-serif text-black mt-12 mb-4">2. Zustandekommen des Vertrages</h2>
          <p className="mb-6 leading-relaxed">
            Vorhang.ai fungiert als Vermittler zwischen internationalen Herstellern und europäischen Einzelhändlern. 
            Der Kaufvertrag kommt direkt zwischen dem Käufer und dem verifizierten Hersteller zustande.
          </p>
          <h2 className="text-2xl font-serif text-black mt-12 mb-4">3. Zahlungsbedingungen und Treuhandservice</h2>
          <p className="mb-6 leading-relaxed">
            Zahlungen werden über unseren Partner Stripe abgewickelt. Vorhang.ai bietet einen Treuhandservice an, bei dem 
            das Geld erst an den Hersteller ausgezahlt wird, nachdem die Ware versendet und die Qualität geprüft wurde.
          </p>
        </div>
      </main>
      <VorhangFooter />
    </div>
  );
}
