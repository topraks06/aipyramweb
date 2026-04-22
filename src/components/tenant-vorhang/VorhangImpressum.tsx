"use client";

import VorhangNavbar from "./VorhangNavbar";
import VorhangFooter from "./VorhangFooter";

export default function VorhangImpressum() {
  return (
    <div className="min-h-screen bg-gray-50 text-black flex flex-col font-sans">
      <VorhangNavbar />
      <main className="flex-grow pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="text-5xl font-serif mb-12 text-black">Impressum</h1>
        <div className="prose prose-lg text-gray-600 max-w-none">
          <h2 className="text-2xl font-serif text-black mb-4">Angaben gemäß § 5 TMG</h2>
          <p className="mb-6 leading-relaxed">
            AIPyram Technologies GmbH<br/>
            Friedrichstraße 123<br/>
            10117 Berlin<br/>
            Deutschland
          </p>

          <h2 className="text-2xl font-serif text-black mt-10 mb-4">Vertreten durch</h2>
          <p className="mb-6 leading-relaxed">
            Geschäftsführer: Hakan Yılmaz
          </p>

          <h2 className="text-2xl font-serif text-black mt-10 mb-4">Kontakt</h2>
          <p className="mb-6 leading-relaxed">
            Telefon: +49 (0) 30 12345678<br/>
            E-Mail: kontakt@vorhang.ai
          </p>

          <h2 className="text-2xl font-serif text-black mt-10 mb-4">Umsatzsteuer-ID</h2>
          <p className="mb-6 leading-relaxed">
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br/>
            DE 123456789
          </p>

          <h2 className="text-2xl font-serif text-black mt-10 mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p className="mb-6 leading-relaxed">
            Hakan Yılmaz<br/>
            Friedrichstraße 123<br/>
            10117 Berlin
          </p>

          <p className="text-sm text-gray-400 mt-12">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </div>
      </main>
      <VorhangFooter />
    </div>
  );
}
