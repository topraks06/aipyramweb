'use client';

import { motion } from 'motion/react';
import { ArrowRight, Globe, Cpu, BarChart3, Shield, Zap, Users } from 'lucide-react';
import Link from 'next/link';
import TrtexNavbar from './TrtexNavbar';
import TrtexFooter from './TrtexFooter';

const ecosystemLinks = [
  { name: 'PERDE.AI', desc: 'Yapay Zeka Destekli Perde Tasarım Stüdyosu', href: 'https://perde.ai' },
  { name: 'HOMETEX.AI', desc: '365 Gün Açık Sanal Ev Tekstili Fuarı', href: 'https://hometex.ai' },
  { name: 'VORHANG.AI', desc: 'B2B Perde Pazaryeri (Almanya)', href: 'https://vorhang.ai' },
];

const stats = [
  { value: '24/7', label: 'Otonom İstihbarat', icon: Zap },
  { value: '8', label: 'Dil Desteği', icon: Globe },
  { value: '50+', label: 'Ülke Kapsamı', icon: Users },
  { value: '∞', label: 'AI Analiz Kapasitesi', icon: Cpu },
];

interface TrtexAboutProps {
  lang?: string;
  basePath?: string;
}

export default function TrtexAbout({ lang = 'tr', basePath = '' }: TrtexAboutProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900">
      <TrtexNavbar lang={lang} basePath={basePath} theme="light" />
      
      {/* Hero */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-zinc-200 text-[9px] uppercase tracking-[0.3em] mb-10 text-zinc-500 bg-white">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              Sovereign B2B Intelligence
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-[0.9] mb-8 uppercase">
              Hakkımızda
            </h1>
            <p className="text-xl sm:text-2xl text-zinc-600 font-light leading-relaxed max-w-3xl">
              TRTEX, Türkiye ve dünya ev tekstili sektörünün yapay zeka destekli otonom istihbarat platformudur.
              Aipyram GmbH tarafından geliştirilmektedir.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vizyon */}
      <section className="py-20 lg:py-32 border-b border-zinc-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-4xl sm:text-5xl font-serif font-medium tracking-tight mb-8 uppercase">
                Vizyonumuz
              </h2>
              <p className="text-zinc-600 text-lg font-light leading-relaxed mb-6">
                Ev tekstili sektöründe veri odaklı karar almanın standartını belirlemek. 
                TRTEX, günde 24 saat otonom çalışan yapay zeka motoruyla pazar sinyallerini analiz eder, 
                iş fırsatlarını tespit eder ve sektör profesyonellerine gerçek zamanlı istihbarat sunar.
              </p>
              <p className="text-zinc-600 text-lg font-light leading-relaxed">
                Geleneksel haber portallarının ötesine geçerek, her haberi ticari fırsat perspektifinden değerlendiren, 
                tedarik zinciri risklerini önceden tespit eden ve ihale fırsatlarını otomatik eşleştiren 
                bir &ldquo;Ticari Zeka Terminali&rdquo; inşa ediyoruz.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h2 className="text-4xl sm:text-5xl font-serif font-medium tracking-tight mb-8 uppercase">
                Teknoloji
              </h2>
              <div className="space-y-6">
                {[
                  { icon: Cpu, title: 'ALOHA Motor', desc: 'Gemini 2.0 Flash tabanlı otonom haber üretim ve analiz motoru. 7/24 kesintisiz çalışır.' },
                  { icon: BarChart3, title: 'TRTEX IQ™', desc: 'Firma bazlı ticari zeka skoru. İhracat kapasitesi, sertifikasyon ve pazar erişimi analizi.' },
                  { icon: Shield, title: 'Sovereign Güvenlik', desc: 'Google Cloud altyapısı, Firebase Auth, rate limiting ve tam veri şifreleme.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 p-6 border border-zinc-200 hover:border-zinc-300 bg-[#FAFAFA] transition-colors rounded-lg">
                    <item.icon className="w-6 h-6 text-red-600 shrink-0 mt-1 stroke-[1.5]" />
                    <div>
                      <h3 className="text-zinc-900 font-medium mb-2 uppercase tracking-wider text-sm">{item.title}</h3>
                      <p className="text-zinc-600 text-sm font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rakamlar */}
      <section className="py-20 lg:py-28 border-b border-zinc-200 bg-[#F9FAFB]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-6 h-6 text-red-600 mx-auto mb-4 stroke-[1.5]" />
                <div className="text-4xl sm:text-5xl font-serif font-medium text-zinc-900 mb-2">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ekosistem */}
      <section className="py-20 lg:py-32 border-b border-zinc-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-serif font-medium tracking-tight mb-6 uppercase">
              aipyram Ekosistemi
            </h2>
            <p className="text-zinc-600 text-lg font-light max-w-2xl">
              TRTEX, aipyram GmbH&apos;nin dört bağımsız ama birbirine bağlı platformundan biridir.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ecosystemLinks.map((item, i) => (
              <motion.a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="group p-8 border border-zinc-200 bg-[#FAFAFA] hover:border-zinc-300 hover:shadow-sm transition-all rounded-xl"
              >
                <h3 className="text-2xl font-serif font-medium text-zinc-900 mb-3 group-hover:text-red-600 transition-colors">
                  {item.name}
                </h3>
                <p className="text-zinc-600 text-sm font-light mb-6">{item.desc}</p>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-zinc-500 group-hover:text-zinc-900 transition-colors">
                  <span>Keşfet</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Kurucu */}
      <section className="py-20 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="max-w-3xl"
          >
            <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-6 font-medium">Kurucu</div>
            <h3 className="text-3xl sm:text-4xl font-serif font-medium text-zinc-900 mb-4">
              aipyram GmbH
            </h3>
            <p className="text-zinc-600 text-lg font-light leading-relaxed mb-8">
              Almanya merkezli, yapay zeka destekli endüstriyel ticaret çözümleri geliştiren teknoloji şirketi.
              Ev tekstili, perde ve iç mimari sektörlerinde B2B dijital dönüşümün öncüsü.
            </p>
            <Link
              href={`${basePath}/contact?lang=${lang}`}
              className="inline-flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-zinc-900 font-medium hover:text-red-600 transition-colors"
            >
              <span>İletişime Geç</span>
              <span className="w-12 h-px bg-zinc-900" />
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <TrtexFooter basePath={basePath} lang={lang} />
    </div>
  );
}
