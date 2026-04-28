"use client";
import CurtaindesignNavbar from "./CurtaindesignNavbar";
import CurtaindesignFooter from "./CurtaindesignFooter";
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function CurtaindesignContact({ basePath = '/sites/curtaindesign.ai' }: { basePath?: string }) {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      <CurtaindesignNavbar basePath={basePath} />

      <main className="pt-32 pb-24 max-w-5xl mx-auto px-6 lg:px-8">
        <header className="mb-16 text-center">
          <span className="text-amber-600 text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block">Get In Touch</span>
          <h1 className="text-5xl md:text-6xl font-serif tracking-tight mb-6">
            Contact Us
          </h1>
          <p className="text-zinc-500 text-lg font-light max-w-xl mx-auto">
            Questions about our collections, custom orders, or wholesale partnerships? We&apos;d love to hear from you.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Contact Form */}
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs tracking-widest uppercase font-medium text-zinc-500">Full Name</label>
                <input type="text" className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 px-4 py-3 focus:border-amber-600 focus:outline-none transition-colors rounded-sm" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-xs tracking-widest uppercase font-medium text-zinc-500">Email</label>
                <input type="email" className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 px-4 py-3 focus:border-amber-600 focus:outline-none transition-colors rounded-sm" placeholder="john@example.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase font-medium text-zinc-500">Subject</label>
              <select className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 px-4 py-3 focus:border-amber-600 focus:outline-none transition-colors rounded-sm">
                <option>General Inquiry</option>
                <option>Custom Order</option>
                <option>Wholesale Partnership</option>
                <option>Returns & Refunds</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase font-medium text-zinc-500">Message</label>
              <textarea rows={5} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 px-4 py-3 focus:border-amber-600 focus:outline-none transition-colors rounded-sm resize-none" placeholder="Tell us more about your project..."></textarea>
            </div>

            <button type="button" className="bg-zinc-900 text-white hover:bg-zinc-800 transition-colors px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 rounded-sm">
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>

          {/* Contact Info */}
          <div className="space-y-10 pt-4">
            <div>
              <h3 className="text-xs tracking-widest uppercase font-bold text-zinc-400 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-zinc-900">Email</p>
                    <p className="text-zinc-500 text-sm">hello@curtaindesign.ai</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-zinc-900">Phone</p>
                    <p className="text-zinc-500 text-sm">+90 212 000 00 00</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-zinc-900">Headquarters</p>
                    <p className="text-zinc-500 text-sm">Istanbul, Turkey</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-sm">
              <h4 className="font-serif text-xl mb-3">Wholesale Inquiries</h4>
              <p className="text-zinc-500 text-sm font-light leading-relaxed">
                For bulk orders and B2B partnerships, please email our trade team directly at <strong className="text-zinc-900">trade@curtaindesign.ai</strong> with your requirements.
              </p>
            </div>
          </div>
        </div>
      </main>

      <CurtaindesignFooter basePath={basePath} />
    </div>
  );
}
