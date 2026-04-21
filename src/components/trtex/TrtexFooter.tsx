'use client';

import React from 'react';

interface TrtexFooterProps {
  basePath: string;
  brandName?: string;
  lang?: string;
}

// ═══ FOOTER ETİKETLERİ (8 DİL OTONOM) ═══
const footerLabels: Record<string, {
  platforms: string; resources: string; legal: string;
  newsArchive: string; terminal: string; fairCalendar: string; academy: string;
  privacy: string; terms: string;
  desc: string; copyright: string;
}> = {
  TR: {
    platforms: 'PLATFORMLAR', resources: 'KAYNAKLAR', legal: 'YASAL',
    newsArchive: 'Haber Arşivi', terminal: 'Piyasa Terminali', fairCalendar: 'Fuar Takvimi', academy: 'Sektör Akademisi',
    privacy: 'Gizlilik Politikası', terms: 'Kullanım Koşulları',
    desc: 'Küresel ev tekstili sektörü için otonom yapay zeka destekli B2B istihbarat terminali. Perde, döşemelik ve ev tekstili pazarında gerçek zamanlı sinyal takibi, ticari fırsat analizi ve stratejik karar desteği.',
    copyright: 'Tüm hakları saklıdır. TRTEX İSTİHBARAT MOTORU ile güçlendirilmiştir.',
  },
  EN: {
    platforms: 'PLATFORMS', resources: 'RESOURCES', legal: 'LEGAL',
    newsArchive: 'News Archive', terminal: 'Market Terminal', fairCalendar: 'Fair Calendar', academy: 'Industry Academy',
    privacy: 'Privacy Policy', terms: 'Terms of Use',
    desc: 'Autonomous AI-powered B2B intelligence terminal for the global home textile sector. Real-time signal tracking, commercial opportunity analysis, and strategic decision support.',
    copyright: 'All rights reserved. Powered by TRTEX INTELLIGENCE ENGINE.',
  },
  DE: {
    platforms: 'PLATTFORMEN', resources: 'RESSOURCEN', legal: 'RECHTLICHES',
    newsArchive: 'Nachrichtenarchiv', terminal: 'Marktterminal', fairCalendar: 'Messekalender', academy: 'Branchenakademie',
    privacy: 'Datenschutz', terms: 'Nutzungsbedingungen',
    desc: 'Autonomes KI-gestütztes B2B-Intelligenzterminal für die globale Heimtextilbranche. Echtzeit-Signalverfolgung, kommerzielle Chancenanalyse und strategische Entscheidungsunterstützung.',
    copyright: 'Alle Rechte vorbehalten. Powered by TRTEX INTELLIGENCE ENGINE.',
  },
  RU: {
    platforms: 'ПЛАТФОРМЫ', resources: 'РЕСУРСЫ', legal: 'ПРАВОВАЯ',
    newsArchive: 'Архив Новостей', terminal: 'Рыночный Терминал', fairCalendar: 'Календарь Выставок', academy: 'Отраслевая Академия',
    privacy: 'Политика Конфиденциальности', terms: 'Условия Использования',
    desc: 'Автономный B2B-терминал коммерческой разведки для мировой текстильной отрасли на базе ИИ.',
    copyright: 'Все права защищены. Работает на TRTEX INTELLIGENCE ENGINE.',
  },
  ZH: {
    platforms: '平台', resources: '资源', legal: '法律',
    newsArchive: '新闻存档', terminal: '市场终端', fairCalendar: '展会日历', academy: '行业学院',
    privacy: '隐私政策', terms: '使用条款',
    desc: '面向全球家纺行业的自主人工智能B2B情报终端。实时信号追踪、商业机会分析和战略决策支持。',
    copyright: '版权所有。由 TRTEX 智能引擎提供支持。',
  },
  AR: {
    platforms: 'المنصات', resources: 'الموارد', legal: 'قانوني',
    newsArchive: 'أرشيف الأخبار', terminal: 'محطة السوق', fairCalendar: 'تقويم المعارض', academy: 'أكاديمية القطاع',
    privacy: 'سياسة الخصوصية', terms: 'شروط الاستخدام',
    desc: 'محطة استخبارات B2B مستقلة تعمل بالذكاء الاصطناعي لقطاع المنسوجات المنزلية العالمي.',
    copyright: 'جميع الحقوق محفوظة. مدعوم بمحرك TRTEX للاستخبارات.',
  },
  ES: {
    platforms: 'PLATAFORMAS', resources: 'RECURSOS', legal: 'LEGAL',
    newsArchive: 'Archivo de Noticias', terminal: 'Terminal de Mercado', fairCalendar: 'Calendario de Ferias', academy: 'Academia Sectorial',
    privacy: 'Política de Privacidad', terms: 'Términos de Uso',
    desc: 'Terminal de inteligencia B2B autónomo impulsado por IA para el sector textil del hogar global.',
    copyright: 'Todos los derechos reservados. Powered by TRTEX INTELLIGENCE ENGINE.',
  },
  FR: {
    platforms: 'PLATEFORMES', resources: 'RESSOURCES', legal: 'JURIDIQUE',
    newsArchive: 'Archives des Actualités', terminal: 'Terminal de Marché', fairCalendar: 'Calendrier des Salons', academy: 'Académie Sectorielle',
    privacy: 'Politique de Confidentialité', terms: "Conditions d'Utilisation",
    desc: "Terminal d'intelligence B2B autonome alimenté par l'IA pour le secteur mondial du textile de maison.",
    copyright: 'Tous droits réservés. Propulsé par TRTEX INTELLIGENCE ENGINE.',
  },
};

export default function TrtexFooter({ basePath, brandName = 'TRTEX', lang = 'tr' }: TrtexFooterProps) {
  const currentYear = new Date().getFullYear();
  const L = footerLabels[lang.toUpperCase()] || footerLabels.TR;

  return (
    <footer className="ft" style={{padding:'4rem 0',background:'#0B0D0F',color:'#888',borderTop:'1px solid #222'}}>
      <div className="tc" style={{maxWidth:'1280px', margin:'0 auto', padding:'0 2rem'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:'3rem',marginBottom:'3rem', fontFamily:"'Inter', sans-serif"}}>
          
          <div>
            <div style={{fontFamily:"'Playfair Display', Georgia, serif",fontSize:'1.6rem',fontWeight:900,color:'#fff',marginBottom:'1rem'}}>
              {brandName === 'TRTEX' ? (
                <>Trtex<span style={{ color: '#CC0000' }}>.</span>com</>
              ) : (
                <>{brandName}<span style={{ color: '#CC0000' }}>.</span>com</>
              )}
            </div>
            <p style={{fontSize:'.85rem',lineHeight:1.6,color:'#999',maxWidth:'95%'}}>
              {L.desc}
            </p>
          </div>
          
          <div>
            <div style={{color:'#fff',marginBottom:'1.2rem',fontSize:'.7rem',letterSpacing:'1.5px',fontWeight:800}}>{L.platforms}</div>
            <div style={{display:'flex',flexDirection:'column',gap:'.8rem',fontSize:'.85rem'}}>
              <a href={`${basePath}/news?lang=${lang}`} style={{color:'#888', textDecoration:'none', transition:'color 0.2s'}} onMouseOver={e => e.currentTarget.style.color='#fff'} onMouseOut={e => e.currentTarget.style.color='#888'}>{L.newsArchive}</a>
              <a href={`${basePath}?lang=${lang}`} style={{color:'#888', textDecoration:'none', transition:'color 0.2s'}} onMouseOver={e => e.currentTarget.style.color='#fff'} onMouseOut={e => e.currentTarget.style.color='#888'}>{L.terminal}</a>
              <a href="https://perde.ai" style={{color:'#888', textDecoration:'none', transition:'color 0.2s'}} onMouseOver={e => e.currentTarget.style.color='#fff'} onMouseOut={e => e.currentTarget.style.color='#888'}>Perde.ai</a>
              <a href="https://hometex.ai" style={{color:'#888', textDecoration:'none', transition:'color 0.2s'}} onMouseOver={e => e.currentTarget.style.color='#fff'} onMouseOut={e => e.currentTarget.style.color='#888'}>Hometex.ai</a>
            </div>
          </div>
          
          <div>
            <div style={{color:'#fff',marginBottom:'1.2rem',fontSize:'.7rem',letterSpacing:'1.5px',fontWeight:800}}>{L.resources}</div>
            <div style={{display:'flex',flexDirection:'column',gap:'.8rem',fontSize:'.85rem'}}>
              <a href={`${basePath}/fairs?lang=${lang}`} style={{color:'#888', textDecoration:'none', transition:'color 0.2s'}} onMouseOver={e => e.currentTarget.style.color='#fff'} onMouseOut={e => e.currentTarget.style.color='#888'}>{L.fairCalendar}</a>
              <a href={`${basePath}/academy?lang=${lang}`} style={{color:'#888', textDecoration:'none', transition:'color 0.2s'}} onMouseOver={e => e.currentTarget.style.color='#fff'} onMouseOut={e => e.currentTarget.style.color='#888'}>{L.academy}</a>
            </div>
          </div>
          
          <div>
            <div style={{color:'#fff',marginBottom:'1.2rem',fontSize:'.7rem',letterSpacing:'1.5px',fontWeight:800}}>{L.legal}</div>
            <div style={{display:'flex',flexDirection:'column',gap:'.8rem',fontSize:'.85rem'}}>
              <a href={`${basePath}/privacy?lang=${lang}`} style={{color:'#888', textDecoration:'none', transition:'color 0.2s'}} onMouseOver={e => e.currentTarget.style.color='#fff'} onMouseOut={e => e.currentTarget.style.color='#888'}>{L.privacy}</a>
              <a href={`${basePath}/terms?lang=${lang}`} style={{color:'#888', textDecoration:'none', transition:'color 0.2s'}} onMouseOver={e => e.currentTarget.style.color='#fff'} onMouseOut={e => e.currentTarget.style.color='#888'}>{L.terms}</a>
              <a href={`${basePath}/kvkk?lang=${lang}`} style={{color:'#888', textDecoration:'none', transition:'color 0.2s'}} onMouseOver={e => e.currentTarget.style.color='#fff'} onMouseOut={e => e.currentTarget.style.color='#888'}>KVKK / GDPR</a>
            </div>
          </div>
          
        </div>
        
        <div style={{borderTop:'1px solid #222',paddingTop:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem', fontFamily:"'Inter', sans-serif"}}>
          <div style={{fontSize:'.75rem',color:'#666',fontWeight:500}}>
            © {currentYear} {brandName}. {L.copyright}
          </div>
          <div style={{fontSize:'.7rem',color:'#444',fontWeight:800,letterSpacing:'1px', textTransform:'uppercase'}}>
            AIPyram Otonom Motor ile Güçlendirilmiştir
          </div>
        </div>
      </div>
    </footer>
  );
}
