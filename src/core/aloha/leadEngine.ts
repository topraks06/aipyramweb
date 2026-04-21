import { adminDb } from '@/lib/firebase-admin';

/**
 * TRTEX SMART LEAD ENGINE
 * 
 * B2B Tekstil Lead Yönetim Sistemi
 * Hem alıcı hem üretici kaydeder, kategorize eder, eşleştirir.
 * 
 * Firestore Koleksiyonları:
 * - trtex_leads: Tüm lead kayıtları
 * - trtex_matches: Üretici-alıcı eşleşmeleri
 */

// ═══════════════════════════════════════
// VERİ YAPILARI
// ═══════════════════════════════════════

export interface Lead {
  id?: string;
  // Kişi bilgileri
  name: string;
  company: string;
  email?: string;
  whatsapp: string;
  country: string;
  
  // İş bilgileri
  role: 'buyer' | 'manufacturer' | 'wholesaler' | 'retailer' | 'agent';
  products: string[];        // perde, havlu, döşemelik, nevresim, vb.
  product_details?: string;  // Serbest açıklama
  
  // Kaynak takip
  source_article_id?: string;   // Hangi haberden geldi
  source_article_title?: string;
  source_country?: string;      // Haberdeki hedef ülke
  source_url?: string;
  utm_source?: string;
  
  // Sistem alanları
  status: 'new' | 'contacted' | 'qualified' | 'matched' | 'converted' | 'cold';
  priority: 'hot' | 'warm' | 'cold';
  score: number;              // 1-100 lead kalite skoru
  tags: string[];
  notes?: string;
  
  // Zaman
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  
  // Premium
  is_premium: boolean;
  daily_lead_count?: number;   // O gün kaç lead aldı (ücretsiz limit kontrolü)
  
  // Auto Match
  match_preferences?: {
    target_countries: string[];
    target_products: string[];
    min_order_qty?: string;
    budget_range?: string;
  };
}

export interface LeadMatch {
  id?: string;
  buyer_lead_id: string;
  manufacturer_lead_id: string;
  match_score: number;       // 0-100 eşleşme kalitesi
  matched_products: string[];
  matched_country: string;
  status: 'suggested' | 'accepted' | 'rejected' | 'contacted';
  message_template?: string;
  createdAt: string;
}

// ═══════════════════════════════════════
// LEAD KAYIT
// ═══════════════════════════════════════

/**
 * Yeni lead kaydet
 */
export async function createLead(data: Partial<Lead>): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!adminDb) return { success: false, error: 'Firebase bağlantısı yok' };
  
  // Validasyon
  if (!data.name?.trim()) return { success: false, error: 'İsim zorunlu' };
  if (!data.company?.trim()) return { success: false, error: 'Firma zorunlu' };
  if (!data.whatsapp?.trim() && !data.email?.trim()) return { success: false, error: 'WhatsApp veya email zorunlu' };
  if (!data.role) return { success: false, error: 'Rol zorunlu (buyer/manufacturer/wholesaler/retailer/agent)' };
  
  // Ücretsiz limit kontrolü (IP/WhatsApp bazlı)
  const today = new Date().toISOString().split('T')[0];
  const existingToday = await adminDb.collection('trtex_leads')
    .where('whatsapp', '==', data.whatsapp)
    .where('createdAt', '>=', `${today}T00:00:00`)
    .limit(5)
    .get();
  
  if (existingToday.size >= 3 && !data.is_premium) {
    return { success: false, error: 'Günlük ücretsiz limit (3 lead) doldu. Premium hesaba geçin.' };
  }
  
  // Lead skorlama
  const score = calculateLeadScore(data);
  
  const now = new Date().toISOString();
  const lead: Lead = {
    name: data.name!.trim(),
    company: data.company!.trim(),
    email: data.email?.trim() || '',
    whatsapp: data.whatsapp!.trim(),
    country: data.country?.trim() || 'Turkey',
    role: data.role!,
    products: data.products || [],
    product_details: data.product_details || '',
    source_article_id: data.source_article_id || '',
    source_article_title: data.source_article_title || '',
    source_country: data.source_country || '',
    source_url: data.source_url || '',
    utm_source: data.utm_source || 'organic',
    status: 'new',
    priority: score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold',
    score,
    tags: generateLeadTags(data),
    notes: '',
    createdAt: now,
    updatedAt: now,
    is_premium: data.is_premium || false,
    match_preferences: data.match_preferences || {
      target_countries: [],
      target_products: data.products || [],
    },
  };
  
  try {
    const ref = await adminDb.collection('trtex_leads').add(lead);
    
    // Otomatik eşleştirme dene
    const matchCount = await tryAutoMatch(ref.id, lead);
    
    console.log(`[LEAD ENGINE] ✅ Lead kaydedildi: ${lead.name} (${lead.company}) — ${lead.role} — Skor: ${score} — Eşleşme: ${matchCount}`);
    
    return { success: true, id: ref.id };
  } catch (err: any) {
    console.error(`[LEAD ENGINE] ❌ Lead kayıt hatası: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// ═══════════════════════════════════════
// LEAD SKORLAMA
// ═══════════════════════════════════════

function calculateLeadScore(data: Partial<Lead>): number {
  let score = 30; // Baz puan
  
  // Rol puanı
  if (data.role === 'buyer') score += 25;       // En değerli
  if (data.role === 'wholesaler') score += 20;
  if (data.role === 'manufacturer') score += 15;
  if (data.role === 'agent') score += 10;
  
  // Ürün puanı (perde öncelik!)
  const perdeKeywords = ['perde', 'curtain', 'blackout', 'tül', 'drapery', 'stor', 'window'];
  const hasPerde = (data.products || []).some(p => 
    perdeKeywords.some(k => p.toLowerCase().includes(k))
  );
  if (hasPerde) score += 15; // PERDE ALTIN KURAL
  
  // Ülke puanı (hedef pazarlar)
  const premiumCountries = ['germany', 'saudi arabia', 'poland', 'united states', 'uae', 'united kingdom'];
  if (premiumCountries.some(c => (data.country || '').toLowerCase().includes(c))) {
    score += 10;
  }
  
  // İletişim bilgisi zenginliği
  if (data.whatsapp) score += 5;
  if (data.email) score += 5;
  if (data.product_details && data.product_details.length > 20) score += 5;
  
  // Kaynak haberi varsa (bağlamsal lead)
  if (data.source_article_id) score += 5;
  
  return Math.min(score, 100);
}

// ═══════════════════════════════════════
// TAG ÜRETİMİ
// ═══════════════════════════════════════

function generateLeadTags(data: Partial<Lead>): string[] {
  const tags: string[] = [];
  
  if (data.role) tags.push(`role:${data.role}`);
  if (data.country) tags.push(`country:${data.country.toLowerCase()}`);
  
  for (const product of (data.products || [])) {
    tags.push(`product:${product.toLowerCase()}`);
  }
  
  // Perde leads özel tag
  const perdeKeywords = ['perde', 'curtain', 'blackout', 'tül', 'drapery'];
  if ((data.products || []).some(p => perdeKeywords.some(k => p.toLowerCase().includes(k)))) {
    tags.push('segment:curtain');
    tags.push('priority:high');
  }
  
  if (data.source_article_id) tags.push('source:article');
  
  return tags;
}

// ═══════════════════════════════════════
// OTOMATİK EŞLEŞTİRME (AUTO MATCH)
// ═══════════════════════════════════════

async function tryAutoMatch(leadId: string, lead: Lead): Promise<number> {
  if (!adminDb) return 0;
  
  try {
    // Karşı tarafi bul (buyer ise manufacturer ara, manufacturer ise buyer ara)
    const oppositeRole = lead.role === 'buyer' ? ['manufacturer', 'wholesaler'] : ['buyer'];
    
    let matchCount = 0;
    
    for (const role of oppositeRole) {
      const candidates = await adminDb.collection('trtex_leads')
        .where('role', '==', role)
        .where('status', 'in', ['new', 'qualified'])
        .limit(20)
        .get();
      
      for (const doc of candidates.docs) {
        if (doc.id === leadId) continue;
        const candidate = doc.data() as Lead;
        
        // Ürün eşleşmesi kontrol
        const productOverlap = lead.products.filter(p => 
          candidate.products.some(cp => 
            cp.toLowerCase().includes(p.toLowerCase()) || 
            p.toLowerCase().includes(cp.toLowerCase())
          )
        );
        
        if (productOverlap.length === 0) continue;
        
        // Match skoru hesapla
        let matchScore = productOverlap.length * 20;
        
        // Ülke uyumu
        if (lead.country.toLowerCase() !== candidate.country.toLowerCase()) {
          matchScore += 10; // Farklı ülke = ticaret potansiyeli
        }
        
        if (matchScore >= 30) {
          const match: LeadMatch = {
            buyer_lead_id: lead.role === 'buyer' ? leadId : doc.id,
            manufacturer_lead_id: lead.role === 'buyer' ? doc.id : leadId,
            match_score: Math.min(matchScore, 100),
            matched_products: productOverlap,
            matched_country: `${lead.country} ↔ ${candidate.country}`,
            status: 'suggested',
            message_template: generateMessageTemplate(lead, candidate, productOverlap),
            createdAt: new Date().toISOString(),
          };
          
          await adminDb.collection('trtex_matches').add(match);
          matchCount++;
        }
      }
    }
    
    return matchCount;
  } catch (err: any) {
    console.warn(`[AUTO MATCH] ⚠️ ${err.message}`);
    return 0;
  }
}

// ═══════════════════════════════════════
// MESAJ ŞABLONU
// ═══════════════════════════════════════

function generateMessageTemplate(lead: Lead, candidate: Lead, products: string[]): string {
  const productList = products.join(', ');
  
  if (lead.role === 'buyer') {
    return `Hello ${candidate.name},

We are ${lead.company} from ${lead.country}, looking for ${productList} suppliers.

We found your company through TRTEX Intelligence Platform and would like to discuss potential business opportunities.

Could we schedule a brief call to explore collaboration?

Best regards,
${lead.name}
${lead.company}`;
  }
  
  return `Hello ${candidate.name},

We are ${lead.company}, a ${productList} manufacturer from ${lead.country}.

Based on TRTEX market intelligence, we see growing demand in ${candidate.country} for our product range.

We would like to introduce our collection and discuss potential partnership.

Best regards,
${lead.name}
${lead.company}`;
}

// ═══════════════════════════════════════
// LEAD SORGULAMA (Aloha Tool Desteği)
// ═══════════════════════════════════════

export async function getLeadStats(): Promise<string> {
  if (!adminDb) return '[HATA] Firebase yok';
  
  const allLeads = await adminDb.collection('trtex_leads').limit(200).get();
  const allMatches = await adminDb.collection('trtex_matches').limit(100).get();
  
  let buyers = 0, manufacturers = 0, wholesalers = 0, others = 0;
  let hot = 0, warm = 0, cold = 0;
  let today = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const countryCounts: Record<string, number> = {};
  const productCounts: Record<string, number> = {};
  
  for (const doc of allLeads.docs) {
    const d = doc.data();
    if (d.role === 'buyer') buyers++;
    else if (d.role === 'manufacturer') manufacturers++;
    else if (d.role === 'wholesaler') wholesalers++;
    else others++;
    
    if (d.priority === 'hot') hot++;
    else if (d.priority === 'warm') warm++;
    else cold++;
    
    if (d.createdAt?.startsWith(todayStr)) today++;
    
    const country = d.country || 'Unknown';
    countryCounts[country] = (countryCounts[country] || 0) + 1;
    
    for (const p of (d.products || [])) {
      productCounts[p] = (productCounts[p] || 0) + 1;
    }
  }
  
  const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  
  return `TRTEX LEAD RAPORU
Toplam: ${allLeads.size} lead | Bugun: ${today}
Alici: ${buyers} | Uretici: ${manufacturers} | Toptanci: ${wholesalers} | Diger: ${others}
Hot: ${hot} | Warm: ${warm} | Cold: ${cold}
Eslesme: ${allMatches.size}
Top Ulkeler: ${topCountries.map(([c, n]) => `${c}(${n})`).join(', ')}
Top Urunler: ${topProducts.map(([p, n]) => `${p}(${n})`).join(', ')}`;
}

export async function getLeadsByFilter(filter: {
  role?: string;
  country?: string;
  product?: string;
  status?: string;
  limit?: number;
}): Promise<string> {
  if (!adminDb) return '[HATA] Firebase yok';
  
  let query: FirebaseFirestore.Query = adminDb.collection('trtex_leads');
  
  if (filter.role) query = query.where('role', '==', filter.role);
  if (filter.status) query = query.where('status', '==', filter.status);
  
  const snap = await query.limit(filter.limit || 20).get();
  
  const results = snap.docs.map(doc => {
    const d = doc.data();
    return `[${d.priority?.toUpperCase()}] ${d.name} (${d.company}) — ${d.role} — ${d.country} — ${(d.products || []).join(',')} — Skor: ${d.score}`;
  });
  
  return results.length > 0 
    ? `${results.length} lead bulundu:\n${results.join('\n')}`
    : 'Kriterlere uyan lead bulunamadi';
}

export async function findMatches(leadId: string): Promise<string> {
  if (!adminDb) return '[HATA] Firebase yok';
  
  const buyerMatches = await adminDb.collection('trtex_matches')
    .where('buyer_lead_id', '==', leadId)
    .limit(10)
    .get();
    
  const mfgMatches = await adminDb.collection('trtex_matches')
    .where('manufacturer_lead_id', '==', leadId)
    .limit(10)
    .get();
  
  const all = [...buyerMatches.docs, ...mfgMatches.docs];
  
  if (all.length === 0) return 'Bu lead icin eslesme bulunamadi';
  
  const results = all.map(doc => {
    const m = doc.data();
    return `Skor: ${m.match_score}/100 | Urunler: ${(m.matched_products || []).join(',')} | ${m.matched_country} | Durum: ${m.status}`;
  });
  
  return `${all.length} eslesme bulundu:\n${results.join('\n')}`;
}
