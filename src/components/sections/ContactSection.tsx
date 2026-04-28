"use client";

import { useTranslations } from "next-intl";
import { Send, MapPin, Mail } from "lucide-react";

export default function ContactSection() {
  const t = useTranslations("ContactHome");

  return (
    <section className="py-24 bg-white border-t border-neutral-100 relative overflow-hidden text-neutral-900">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Crisp Header - Microsoft Azure Style */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-sm font-semibold text-red-600 tracking-wider uppercase mb-3 text-center w-full block">
            {t("badge")}
          </h2>
          <h3 className="text-4xl font-bold leading-tight mb-6">
            {t("title")}
          </h3>
          <p className="text-xl text-neutral-500 font-medium">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto items-stretch">
          
          {/* Card: Office Address */}
          <div className="bg-neutral-50 border border-neutral-200 p-8 rounded-2xl flex flex-col justify-center">
            <div className="p-4 bg-white border border-neutral-100 rounded-xl inline-block w-fit mb-6">
              <MapPin className="w-8 h-8 text-red-500" />
            </div>
            <h4 className="text-2xl font-bold mb-4">aipyram Merkez</h4>
            <p className="text-lg text-neutral-500 font-medium leading-relaxed mb-8">
              Dietikon, {t("country_ch")}
            </p>
            <a href="mailto:info@aipyram.com" className="inline-flex items-center gap-3 text-red-600 font-bold hover:text-red-700 transition-colors">
              <Mail className="w-5 h-5" /> info@aipyram.com
            </a>
          </div>

          {/* Form UI */}
          <form className="bg-white border border-neutral-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 rounded-2xl space-y-6">
             <h4 className="text-2xl font-bold mb-4">{t("title")}</h4>
             
             <div>
               <label className="block text-sm font-bold text-neutral-700 uppercase tracking-widest mb-2">{t("label_name")}</label>
               <input type="text" placeholder={t("placeholder_name")} className="w-full bg-neutral-50 border border-neutral-200 text-lg px-4 py-3 rounded-lg outline-none focus:border-red-500 transition-colors" />
             </div>
             
             <div>
               <label className="block text-sm font-bold text-neutral-700 uppercase tracking-widest mb-2">{t("label_message")}</label>
               <textarea rows={3} placeholder={t("placeholder_message")} className="w-full bg-neutral-50 border border-neutral-200 text-lg px-4 py-3 rounded-lg outline-none focus:border-red-500 transition-colors resize-none"></textarea>
             </div>

             <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4 rounded-xl flex justify-center items-center gap-3 transition-colors">
                <Send className="w-5 h-5" /> {t("btn_send")}
             </button>
          </form>

        </div>
      </div>
    </section>
  );
}
