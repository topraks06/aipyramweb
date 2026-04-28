"use client";

import VorhangNavbar from "./VorhangNavbar";
import VorhangFooter from "./VorhangFooter";

export default function VorhangPrivacy() {
  return (
    <div className="min-h-screen bg-gray-50 text-black flex flex-col font-sans">
      <VorhangNavbar />
      <main className="flex-grow pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="text-5xl font-serif mb-12 text-black">Datenschutzerklärung</h1>
        <div className="prose prose-lg text-gray-600 max-w-none">
          <p className="mb-6 leading-relaxed">
            Wir, die aipyram Technologies GmbH, nehmen den Schutz Ihrer persönlichen Daten sehr ernst. 
            Diese Datenschutzerklärung informiert Sie darüber, wie wir Ihre personenbezogenen Daten erheben, verarbeiten und nutzen.
          </p>
          <h2 className="text-2xl font-serif text-black mt-12 mb-4">1. Datenerhebung auf unserer Website</h2>
          <p className="mb-6 leading-relaxed">
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um Daten handeln, 
            die Sie in ein Kontaktformular eingeben oder bei der Registrierung als Händler (B2B) hinterlegen.
          </p>
          <h2 className="text-2xl font-serif text-black mt-12 mb-4">2. KI-Rendering und Bilddaten</h2>
          <p className="mb-6 leading-relaxed">
            Wenn Sie die Funktion "In Ihrem Raum ansehen" (Try-at-Home) nutzen und Bilder Ihrer Räumlichkeiten hochladen, 
            werden diese Bilder ausschließlich zur Erstellung des KI-Renderings verarbeitet. Nach Abschluss der Sitzung werden 
            die Originalbilder automatisch von unseren Servern gelöscht, sofern Sie diese nicht explizit in Ihrem Konto speichern.
          </p>
          <h2 className="text-2xl font-serif text-black mt-12 mb-4">3. Rechte der Betroffenen</h2>
          <p className="mb-6 leading-relaxed">
            Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten 
            personenbezogenen Daten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen.
          </p>
        </div>
      </main>
      <VorhangFooter />
    </div>
  );
}
