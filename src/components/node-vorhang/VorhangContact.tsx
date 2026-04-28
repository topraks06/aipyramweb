"use client";

import VorhangNavbar from "./VorhangNavbar";
import VorhangFooter from "./VorhangFooter";
import { Mail, MapPin, Phone } from "lucide-react";

export default function VorhangContact() {
  return (
    <div className="min-h-screen bg-gray-50 text-black flex flex-col font-sans">
      <VorhangNavbar />
      <main className="flex-grow pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="text-5xl font-serif mb-12 text-black">Kontakt</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <p className="text-xl text-gray-600 font-light leading-relaxed mb-8">
              Haben Sie Fragen zu unseren KI-Diensten, möchten Sie Händler werden oder benötigen Sie Unterstützung bei einer Bestellung? Wir sind für Sie da.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-[#D4AF37] shrink-0" />
                <div>
                  <h3 className="font-bold uppercase tracking-widest text-xs mb-1">Hauptsitz</h3>
                  <p className="text-gray-500 text-sm">aipyram Technologies GmbH<br/>Friedrichstraße 123<br/>10117 Berlin, Deutschland</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-[#D4AF37] shrink-0" />
                <div>
                  <h3 className="font-bold uppercase tracking-widest text-xs mb-1">E-Mail</h3>
                  <p className="text-gray-500 text-sm">support@vorhang.ai</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-[#D4AF37] shrink-0" />
                <div>
                  <h3 className="font-bold uppercase tracking-widest text-xs mb-1">Telefon</h3>
                  <p className="text-gray-500 text-sm">+49 30 12345678</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 border border-gray-200 shadow-sm">
            <form className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Name</label>
                <input type="text" className="w-full border border-gray-200 p-3 outline-none focus:border-black transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">E-Mail</label>
                <input type="email" className="w-full border border-gray-200 p-3 outline-none focus:border-black transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Ihre Nachricht</label>
                <textarea rows={4} className="w-full border border-gray-200 p-3 outline-none focus:border-black transition-colors"></textarea>
              </div>
              <button type="button" className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-colors">
                Nachricht Senden
              </button>
            </form>
          </div>
        </div>
      </main>
      <VorhangFooter />
    </div>
  );
}
